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
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Attendance } from '../types';
import { handleFirestoreError, OperationType } from '../utils/firebaseErrors';

export const attendanceService = {
  // Attendance
  subscribeStudentAttendance(studentUid: string, callback: (attendance: Attendance[]) => void) {
    if (!auth.currentUser) return () => {};

    const q = query(
      collection(db, 'attendance'), 
      where('studentUid', '==', studentUid),
      orderBy('date', 'desc')
    );
    return onSnapshot(q, (snap) => {
      const attendance = snap.docs.map(d => ({ ...d.data(), id: d.id })) as Attendance[];
      callback(attendance);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'attendance');
    });
  },

  async getStudentAttendance(studentUid: string) {
    const q = query(
      collection(db, 'attendance'), 
      where('studentUid', '==', studentUid),
      orderBy('date', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ ...d.data(), id: d.id })) as Attendance[];
  },

  async markAttendance(data: Omit<Attendance, 'id' | 'createdAt'> | Omit<Attendance, 'id' | 'createdAt'>[]) {
    const records = Array.isArray(data) ? data : [data];
    const promises = records.map(record => 
      addDoc(collection(db, 'attendance'), {
        ...record,
        createdAt: serverTimestamp()
      })
    );
    return await Promise.all(promises);
  },

  async getDailyAttendance(department: string, date: any) {
    const q = query(
      collection(db, 'attendance'), 
      where('department', '==', department),
      where('date', '==', date)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ ...d.data(), id: d.id })) as Attendance[];
  }
};
