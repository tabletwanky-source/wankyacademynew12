import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  getDoc,
  query, 
  where, 
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Exam, Question, ExamResult, CourseType, AssignedExam } from '../types';
import { handleFirestoreError, OperationType } from '../utils/firebaseErrors';

export const examService = {
  // Exam Management
  subscribeExamsByDepartment(department: CourseType, callback: (exams: Exam[]) => void) {
    if (!auth.currentUser) return () => {};

    const q = query(
      collection(db, 'exams'), 
      where('department', '==', department),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snap) => {
      const exams = snap.docs.map(d => ({ ...d.data(), id: d.id })) as Exam[];
      callback(exams);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'exams');
    });
  },

  subscribeAllExams(callback: (exams: Exam[]) => void) {
    if (!auth.currentUser) return () => {};

    const q = query(collection(db, 'exams'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      const exams = snap.docs.map(d => ({ ...d.data(), id: d.id })) as Exam[];
      callback(exams);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'exams');
    });
  },

  async getExamsByDepartment(department: CourseType) {
    try {
      const q = query(
        collection(db, 'exams'), 
        where('department', '==', department),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ ...d.data(), id: d.id })) as Exam[];
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'exams');
      throw error;
    }
  },

  async getAllExams() {
    const q = query(collection(db, 'exams'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ ...d.data(), id: d.id })) as Exam[];
  },

  async getExam(examId: string) {
    const snap = await getDoc(doc(db, 'exams', examId));
    if (snap.exists()) return { ...snap.data(), id: snap.id } as Exam;
    return null;
  },

  async createExam(data: Omit<Exam, 'id' | 'createdAt'>) {
    return await addDoc(collection(db, 'exams'), {
      ...data,
      active: data.active ?? true,
      status: data.status || 'active',
      published: data.published ?? false,
      createdAt: serverTimestamp()
    });
  },

  async updateExam(examId: string, data: Partial<Exam>) {
    return await updateDoc(doc(db, 'exams', examId), data);
  },

  async deleteExam(examId: string) {
    // Also delete associated questions in a real app (batch delete)
    return await deleteDoc(doc(db, 'exams', examId));
  },

  // Question Management
  async getExamQuestions(examId: string) {
    const q = query(
      collection(db, 'questions'), 
      where('examId', '==', examId)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ ...d.data(), id: d.id })) as Question[];
  },

  async addQuestion(data: Omit<Question, 'id'>) {
    const res = await addDoc(collection(db, 'questions'), data);
    // Update question count in exam
    const examRef = doc(db, 'exams', data.examId);
    const examSnap = await getDoc(examRef);
    if (examSnap.exists()) {
      const examData = examSnap.data();
      await updateDoc(examRef, { 
        totalQuestions: (examData.totalQuestions || 0) + 1 
      });
    }
    return res;
  },

  async updateQuestion(questionId: string, data: Partial<Question>) {
    return await updateDoc(doc(db, 'questions', questionId), data);
  },

  async deleteQuestion(questionId: string, examId: string) {
    await deleteDoc(doc(db, 'questions', questionId));
    const examRef = doc(db, 'exams', examId);
    const examSnap = await getDoc(examRef);
    if (examSnap.exists()) {
      const examData = examSnap.data();
      await updateDoc(examRef, { 
        totalQuestions: Math.max(0, (examData.totalQuestions || 0) - 1) 
      });
    }
  },

  // Exam Attempt & Results
  async submitExam(
    studentId: string, 
    studentCode: string, 
    examId: string, 
    answers: Record<string, string>
  ) {
    // 1. Fetch correct answers
    const questions = await this.getExamQuestions(examId);
    const exam = await this.getExam(examId);
    if (!exam) throw new Error("Exam not found");

    // 2. Grade
    let score = 0;
    let totalPoints = 0;
    const correctedAnswers: Record<string, boolean> = {};

    // Get current attempt number
    const previousAttempts = await this.getAttempts(studentId, examId);
    const attemptCount = previousAttempts.length + 1;

    questions.forEach(q => {
      totalPoints += q.points;
      
      let isCorrect = false;
      const studentAns = (answers[q.id] || '').toLowerCase().trim();
      const correctAns = (q.correctAnswer || '').toLowerCase().trim();

      if (q.type === 'checkbox') {
        const studentOpts = studentAns.split(',').map(s => s.trim()).filter(Boolean).sort();
        const correctOpts = correctAns.split(',').map(s => s.trim()).filter(Boolean).sort();
        isCorrect = studentOpts.length > 0 && 
                    studentOpts.length === correctOpts.length && 
                    studentOpts.every((val, index) => val === correctOpts[index]);
      } else {
        isCorrect = studentAns === correctAns;
      }

      if (isCorrect) score += q.points;
      correctedAnswers[q.id] = isCorrect;
    });

    const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
    const passed = percentage >= exam.passingScore;

    // 3. Save result
    const result: Omit<ExamResult, 'id'> = {
      studentId,
      studentCode,
      examId,
      score,
      totalPoints,
      percentage,
      passed,
      submittedAt: serverTimestamp(),
      answers,
      attempt: attemptCount
    };

    const docRef = await addDoc(collection(db, 'examResults'), result);
    return { id: docRef.id, ...result };
  },

  async getStudentResults(studentId: string) {
    try {
      const q = query(
        collection(db, 'examResults'),
        where('studentId', '==', studentId),
        orderBy('submittedAt', 'desc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ ...d.data(), id: d.id })) as ExamResult[];
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'examResults');
      throw error;
    }
  },

  async getExamResults(examId: string) {
    const q = query(
      collection(db, 'examResults'),
      where('examId', '==', examId),
      orderBy('submittedAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ ...d.data(), id: d.id })) as ExamResult[];
  },

  async getAttempts(studentId: string, examId: string) {
    const q = query(
      collection(db, 'examResults'),
      where('studentId', '==', studentId),
      where('examId', '==', examId),
      orderBy('submittedAt', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ ...d.data(), id: d.id })) as ExamResult[];
  },
  
  async hasStudentAttempted(studentId: string, examId: string) {
    const attempts = await this.getAttempts(studentId, examId);
    return attempts.length > 0;
  },

  async canStudentTakeExam(studentId: string, examId: string, department: CourseType) {
    const [attempts, exam] = await Promise.all([
      this.getAttempts(studentId, examId),
      this.getExam(examId)
    ]);
    
    // Check if any attempt passed
    if (attempts.some(r => r.passed)) return false;

    // Find assignment to check max allowed attempts
    const q = query(
      collection(db, 'assignedExams'),
      where('examId', '==', examId),
      where('active', '==', true)
    );
    const snap = await getDocs(q);
    const assignments = snap.docs.map(d => ({ ...d.data(), id: d.id })) as AssignedExam[];
    const assignment = assignments.find(a => 
      a.assignedTo === studentId || 
      (Array.isArray(a.assignedTo) && a.assignedTo.includes(studentId)) ||
      a.department === department || 
      a.assignedTo === 'all'
    );
    
    const maxAttempts = exam?.attemptsAllowed || assignment?.attemptsAllowed || 2;
    return attempts.length < maxAttempts;
  },

  // Progress Saving
  async saveProgress(studentId: string, examId: string, answers: Record<string, string>, currentQuestionIndex?: number) {
    const attemptId = `${studentId}_${examId}`;
    return await setDoc(doc(db, 'examAttempts', attemptId), {
      studentId,
      examId,
      answers,
      currentQuestionIndex: currentQuestionIndex || 0,
      lastUpdated: serverTimestamp()
    });
  },

  async getProgress(studentId: string, examId: string) {
    const attemptId = `${studentId}_${examId}`;
    const snap = await getDoc(doc(db, 'examAttempts', attemptId));
    if (snap.exists()) return snap.data() as { answers: Record<string, string>, currentQuestionIndex: number };
    return null;
  },

  async clearProgress(studentId: string, examId: string) {
    const attemptId = `${studentId}_${examId}`;
    return await deleteDoc(doc(db, 'examAttempts', attemptId));
  },

  // Assignment Management
  async assignExam(data: Omit<AssignedExam, 'id' | 'createdAt'>) {
    return await addDoc(collection(db, 'assignedExams'), {
      ...data,
      createdAt: serverTimestamp()
    });
  },

  subscribeAssignedExams(studentUid: string, department: CourseType, callback: (assignments: AssignedExam[]) => void) {
    if (!auth.currentUser) return () => {};

    const q = query(
      collection(db, 'assignedExams'),
      where('active', '==', true),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snap) => {
      const all = snap.docs.map(d => ({ ...d.data(), id: d.id })) as AssignedExam[];
      const filtered = all.filter(a => {
        const matchesTarget = a.assignedTo === studentUid || 
                             (Array.isArray(a.assignedTo) && a.assignedTo.includes(studentUid)) ||
                             a.department === department || 
                             a.assignedTo === 'all';
        
        if (!matchesTarget) return false;

        // Check if assignment is active by status too if it exists
        if ((a as any).status && (a as any).status !== 'active') return false;

        // Check if assignment is expired
        if (a.dueDate) {
          try {
            const due = a.dueDate.toDate ? a.dueDate.toDate() : new Date(a.dueDate);
            if (new Date() > due) return false;
          } catch (e) {
            console.error("Invalid due date for assignment", a.id);
          }
        }

        return true;
      });
      callback(filtered);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'assignedExams');
    });
  },

  subscribePublishedExamsByDepartment(department: CourseType, callback: (exams: Exam[]) => void) {
    if (!auth.currentUser) return () => {};

    const q = query(
      collection(db, 'exams'),
      where('department', '==', department),
      where('published', '==', true),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snap) => {
      const exams = snap.docs.map(d => ({ ...d.data(), id: d.id })) as Exam[];
      const activeExams = exams.filter(e => e.active === true || e.status === 'active');
      callback(activeExams);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'exams');
    });
  },

  async getMultipleExams(examIds: string[]) {
    if (examIds.length === 0) return [];
    try {
      const promises = examIds.map(id => this.getExam(id));
      const exams = await Promise.all(promises);
      return exams.filter((e): e is Exam => 
        e !== null && 
        e.published === true && 
        (e.active === true || e.status === 'active')
      );
    } catch (error) {
      console.error("Error fetching multiple exams:", error);
      return [];
    }
  }
};
