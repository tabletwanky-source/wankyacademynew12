import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  setDoc,
  query, 
  where,
  serverTimestamp,
  increment,
  writeBatch
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import { Student, Professor, Payment, CourseType, COURSE_PRICING, AppUser } from '../types';
import { handleFirestoreError, OperationType } from '../utils/firebaseErrors';

export const adminService = {
  // Stats
  async getDashboardStats() {
    if (!auth.currentUser) {
      return {
        totalStudents: 0,
        totalProfessors: 0,
        totalCourses: 3,
        totalPayments: 0,
        perCourse: {}
      };
    }
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const paymentsSnap = await getDocs(collection(db, 'payments'));
      
      const allUsers = usersSnap.docs.map(d => d.data() as AppUser);
      const students = allUsers.filter(u => u.role === 'student') as Student[];
      const professors = allUsers.filter(u => u.role === 'professor') as Professor[];
      const payments = paymentsSnap.docs.map(d => d.data() as Payment);
      
      const totalPayments = payments.reduce((acc, curr) => acc + curr.amount, 0);
      
      const perCourse = students.reduce((acc, curr) => {
        if (curr.department) {
          acc[curr.department] = (acc[curr.department] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      return {
        totalStudents: students.length,
        totalProfessors: professors.length,
        totalCourses: 3,
        totalPayments,
        perCourse
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'multiple');
      throw error;
    }
  },

  // User Management
  async getAllStudents() {
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'student'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ ...d.data(), id: d.id })) as any as Student[];
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'users');
      throw error;
    }
  },

  async getAllProfessors() {
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'professor'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ ...d.data(), uid: d.id })) as unknown as Professor[];
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'users');
      throw error;
    }
  },

  async createProfessor(data: { fullName: string, email: string, department: CourseType, password: string, whatsapp?: string }) {
    try {
      // NOTE: Creating user via Firebase Client SDK signs the current user out.
      // In a real app, this should be done via Firebase Admin SDK in a Cloud Function.
      // For this applet, we will create the Firestore record and assume Auth is handled by admin or recruitment flow.
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const uid = userCredential.user.uid;

      const profData: Professor = {
        uid,
        fullName: data.fullName,
        email: data.email,
        role: 'professor',
        department: data.department,
        active: true,
        status: 'active',
        mustChangePassword: true,
        temporaryPassword: true,
        whatsapp: data.whatsapp,
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, 'users', uid), profData);
      return profData;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'users');
      throw error;
    }
  },

  async updateUser(uid: string, data: Partial<AppUser>) {
    try {
      await updateDoc(doc(db, 'users', uid), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
      throw error;
    }
  },

  async deleteUser(uid: string) {
    try {
      await deleteDoc(doc(db, 'users', uid));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${uid}`);
      throw error;
    }
  },

  // Payment Management
  async getStudentPayments(studentId: string) {
    try {
      const q = query(collection(db, 'payments'), where('studentId', '==', studentId));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ ...d.data(), id: d.id })) as Payment[];
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'payments');
      throw error;
    }
  },

  async addPayment(paymentData: Omit<Payment, 'id' | 'paymentDate'>) {
    try {
      await addDoc(collection(db, 'payments'), {
        ...paymentData,
        paymentDate: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'payments');
      throw error;
    }
  },

  async getPaymentSummary() {
    try {
      const snap = await getDocs(collection(db, 'payments'));
      return snap.docs.map(d => ({ ...d.data(), id: d.id })) as Payment[];
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'payments');
      throw error;
    }
  },

  // Identity Code Management
  async getAllStudentCodes() {
    try {
      const snap = await getDocs(collection(db, 'studentCodes'));
      return snap.docs.map(d => ({ ...d.data() })) as any[];
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'studentCodes');
      throw error;
    }
  }
};
