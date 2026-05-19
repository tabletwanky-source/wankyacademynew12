import { supabase } from '../lib/supabase';
import { mapExam, mapExamToDb, mapQuestion, mapQuestionToDb } from '../lib/supabaseHelpers';
import { Exam, Question, ExamResult, CourseType, AssignedExam } from '../types';

export const examService = {
  subscribeExamsByDepartment(department: CourseType, callback: (exams: Exam[]) => void) {
    const load = async () => {
      const { data } = await supabase
        .from('exams')
        .select('*')
        .eq('department', department)
        .order('created_at', { ascending: false });
      callback((data || []).map(mapExam) as Exam[]);
    };

    const channel = supabase
      .channel(`exams-dept-${department}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'exams' }, load)
      .subscribe();

    load();
    return () => supabase.removeChannel(channel);
  },

  subscribeAllExams(callback: (exams: Exam[]) => void) {
    const load = async () => {
      const { data } = await supabase.from('exams').select('*').order('created_at', { ascending: false });
      callback((data || []).map(mapExam) as Exam[]);
    };

    const channel = supabase
      .channel('exams-all')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'exams' }, load)
      .subscribe();

    load();
    return () => supabase.removeChannel(channel);
  },

  async getExamsByDepartment(department: CourseType) {
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .eq('department', department)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapExam) as Exam[];
  },

  async getAllExams() {
    const { data } = await supabase.from('exams').select('*').order('created_at', { ascending: false });
    return (data || []).map(mapExam) as Exam[];
  },

  async getExam(examId: string) {
    const { data } = await supabase.from('exams').select('*').eq('id', examId).maybeSingle();
    return data ? mapExam(data) as Exam : null;
  },

  async createExam(data: Omit<Exam, 'id' | 'createdAt'>) {
    const dbData = {
      ...mapExamToDb(data),
      active: data.active ?? true,
      status: data.status || 'active',
      published: data.published ?? false
    };
    const { data: result, error } = await supabase.from('exams').insert(dbData).select().single();
    if (error) throw error;
    return result;
  },

  async updateExam(examId: string, data: Partial<Exam>) {
    const { error } = await supabase.from('exams').update(mapExamToDb(data)).eq('id', examId);
    if (error) throw error;
  },

  async deleteExam(examId: string) {
    const { error } = await supabase.from('exams').delete().eq('id', examId);
    if (error) throw error;
  },

  async getExamQuestions(examId: string) {
    const { data } = await supabase.from('questions').select('*').eq('exam_id', examId);
    return (data || []).map(mapQuestion) as Question[];
  },

  async addQuestion(data: Omit<Question, 'id'>) {
    const dbData = mapQuestionToDb(data);
    const { data: result, error } = await supabase.from('questions').insert(dbData).select().single();
    if (error) throw error;

    // Update question count
    const { data: examData } = await supabase.from('exams').select('total_questions').eq('id', data.examId).single();
    if (examData) {
      await supabase.from('exams').update({ total_questions: (examData.total_questions || 0) + 1 }).eq('id', data.examId);
    }
    return result;
  },

  async updateQuestion(questionId: string, data: Partial<Question>) {
    const { error } = await supabase.from('questions').update(mapQuestionToDb(data)).eq('id', questionId);
    if (error) throw error;
  },

  async deleteQuestion(questionId: string, examId: string) {
    await supabase.from('questions').delete().eq('id', questionId);
    const { data: examData } = await supabase.from('exams').select('total_questions').eq('id', examId).single();
    if (examData) {
      await supabase.from('exams').update({ total_questions: Math.max(0, (examData.total_questions || 0) - 1) }).eq('id', examId);
    }
  },

  async submitExam(
    studentId: string,
    studentCode: string,
    examId: string,
    answers: Record<string, string>
  ) {
    const [questions, exam] = await Promise.all([
      this.getExamQuestions(examId),
      this.getExam(examId)
    ]);
    if (!exam) throw new Error('Exam not found');

    let score = 0;
    let totalPoints = 0;
    const previousAttempts = await this.getAttempts(studentId, examId);
    const attemptCount = previousAttempts.length + 1;

    questions.forEach(q => {
      totalPoints += q.points;
      const studentAns = (answers[q.id] || '').toLowerCase().trim();
      const correctAns = (q.correctAnswer || '').toLowerCase().trim();
      let isCorrect = false;

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
    });

    const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
    const passed = percentage >= exam.passingScore;

    const { data: result, error } = await supabase.from('exam_results').insert({
      student_id: studentId,
      student_code: studentCode,
      exam_id: examId,
      score,
      total_points: totalPoints,
      percentage,
      passed,
      answers,
      attempt: attemptCount
    }).select().single();

    if (error) throw error;
    return {
      id: result.id,
      studentId,
      studentCode,
      examId,
      score,
      totalPoints,
      percentage,
      passed,
      submittedAt: result.submitted_at,
      answers,
      attempt: attemptCount
    };
  },

  async getStudentResults(studentId: string) {
    const { data, error } = await supabase
      .from('exam_results')
      .select('*')
      .eq('student_id', studentId)
      .order('submitted_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(r => ({
      id: r.id,
      studentId: r.student_id,
      studentCode: r.student_code,
      examId: r.exam_id,
      score: r.score,
      totalPoints: r.total_points,
      percentage: r.percentage,
      passed: r.passed,
      submittedAt: r.submitted_at,
      answers: r.answers,
      attempt: r.attempt,
      teacherComments: r.teacher_comments || ''
    })) as ExamResult[];
  },

  async getExamResults(examId: string) {
    const { data } = await supabase
      .from('exam_results')
      .select('*')
      .eq('exam_id', examId)
      .order('submitted_at', { ascending: false });
    return (data || []).map(r => ({
      id: r.id,
      studentId: r.student_id,
      studentCode: r.student_code,
      examId: r.exam_id,
      score: r.score,
      totalPoints: r.total_points,
      percentage: r.percentage,
      passed: r.passed,
      submittedAt: r.submitted_at,
      answers: r.answers,
      attempt: r.attempt,
      teacherComments: r.teacher_comments || ''
    })) as ExamResult[];
  },

  async getAttempts(studentId: string, examId: string) {
    const { data } = await supabase
      .from('exam_results')
      .select('*')
      .eq('student_id', studentId)
      .eq('exam_id', examId)
      .order('submitted_at', { ascending: true });
    return (data || []).map(r => ({
      id: r.id,
      studentId: r.student_id,
      studentCode: r.student_code,
      examId: r.exam_id,
      score: r.score,
      totalPoints: r.total_points,
      percentage: r.percentage,
      passed: r.passed,
      submittedAt: r.submitted_at,
      answers: r.answers,
      attempt: r.attempt
    })) as ExamResult[];
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

    if (attempts.some(r => r.passed)) return false;

    const { data: assignments } = await supabase
      .from('assigned_exams')
      .select('*')
      .eq('exam_id', examId)
      .eq('active', true);

    const allAssignments = (assignments || []).map(a => ({
      id: a.id,
      examId: a.exam_id,
      assignedTo: a.assigned_to,
      department: a.department,
      assignedBy: a.assigned_by,
      active: a.active,
      dueDate: a.due_date,
      attemptsAllowed: a.attempts_allowed,
      createdAt: a.created_at
    })) as AssignedExam[];

    const assignment = allAssignments.find(a =>
      a.assignedTo === studentId ||
      (Array.isArray(a.assignedTo) && a.assignedTo.includes(studentId)) ||
      a.department === department ||
      a.assignedTo === 'all'
    );

    const maxAttempts = exam?.attemptsAllowed || assignment?.attemptsAllowed || 2;
    return attempts.length < maxAttempts;
  },

  async saveProgress(studentId: string, examId: string, answers: Record<string, string>, currentQuestionIndex?: number) {
    const attemptId = `${studentId}_${examId}`;
    const { error } = await supabase.from('exam_attempts').upsert({
      id: attemptId,
      student_id: studentId,
      exam_id: examId,
      answers,
      current_question_index: currentQuestionIndex || 0,
      last_updated: new Date().toISOString()
    });
    if (error) throw error;
  },

  async getProgress(studentId: string, examId: string) {
    const attemptId = `${studentId}_${examId}`;
    const { data } = await supabase.from('exam_attempts').select('*').eq('id', attemptId).maybeSingle();
    if (data) return { answers: data.answers as Record<string, string>, currentQuestionIndex: data.current_question_index };
    return null;
  },

  async clearProgress(studentId: string, examId: string) {
    const attemptId = `${studentId}_${examId}`;
    await supabase.from('exam_attempts').delete().eq('id', attemptId);
  },

  async assignExam(data: Omit<AssignedExam, 'id' | 'createdAt'>) {
    const dbData = {
      exam_id: data.examId,
      assigned_to: Array.isArray(data.assignedTo) ? JSON.stringify(data.assignedTo) : data.assignedTo,
      department: data.department,
      assigned_by: data.assignedBy,
      active: data.active,
      due_date: data.dueDate,
      attempts_allowed: data.attemptsAllowed
    };
    const { error } = await supabase.from('assigned_exams').insert(dbData);
    if (error) throw error;
  },

  subscribeAssignedExams(studentUid: string, department: CourseType, callback: (assignments: AssignedExam[]) => void) {
    const load = async () => {
      const { data } = await supabase
        .from('assigned_exams')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      const now = new Date();
      const all = (data || []).map(a => ({
        id: a.id,
        examId: a.exam_id,
        assignedTo: a.assigned_to,
        department: a.department,
        assignedBy: a.assigned_by,
        active: a.active,
        dueDate: a.due_date,
        attemptsAllowed: a.attempts_allowed,
        createdAt: a.created_at
      })) as AssignedExam[];

      const filtered = all.filter(a => {
        const matchesTarget =
          a.assignedTo === studentUid ||
          (Array.isArray(a.assignedTo) && a.assignedTo.includes(studentUid)) ||
          a.department === department ||
          a.assignedTo === 'all';

        if (!matchesTarget) return false;

        if (a.dueDate) {
          try {
            const due = new Date(a.dueDate);
            if (now > due) return false;
          } catch { /* ignore */ }
        }
        return true;
      });
      callback(filtered);
    };

    const channel = supabase
      .channel(`assigned-exams-${studentUid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assigned_exams' }, load)
      .subscribe();

    load();
    return () => supabase.removeChannel(channel);
  },

  subscribePublishedExamsByDepartment(department: CourseType, callback: (exams: Exam[]) => void) {
    const load = async () => {
      const { data } = await supabase
        .from('exams')
        .select('*')
        .eq('department', department)
        .eq('published', true)
        .eq('active', true)
        .order('created_at', { ascending: false });
      callback((data || []).map(mapExam) as Exam[]);
    };

    const channel = supabase
      .channel(`published-exams-${department}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'exams' }, load)
      .subscribe();

    load();
    return () => supabase.removeChannel(channel);
  },

  async getMultipleExams(examIds: string[]) {
    if (examIds.length === 0) return [];
    const { data } = await supabase
      .from('exams')
      .select('*')
      .in('id', examIds)
      .eq('published', true)
      .eq('active', true);
    return (data || []).map(mapExam) as Exam[];
  }
};
