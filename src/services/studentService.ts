import { 
  collection,
  query,
  where,
  getDocs,
  doc, 
  runTransaction, 
  serverTimestamp, 
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  updatePassword
} from 'firebase/auth';
import { auth, db, googleProvider } from '../lib/firebase';
import { CourseType, Student } from '../types';
import { handleFirestoreError, OperationType } from '../utils/firebaseErrors';

const COURSE_PREFIXES: Record<CourseType, string> = {
  'Auto École': 'AUTO',
  'Informatique': 'INFO',
  'Technique Informatique': 'TECH'
};

export const studentService = {
  subscribeStudentData(uid: string, callback: (student: Student | null) => void) {
    const docRef = doc(db, 'users', uid);
    return onSnapshot(docRef, (snap) => {
      if (snap.exists() && snap.data().role === 'student') {
        callback({ ...snap.data(), uid: snap.id } as Student);
      } else {
        callback(null);
      }
    });
  },

  async updateStudentProfile(uid: string, data: Partial<Student>, newPassword?: string) {
    const user = auth.currentUser;
    if (!user || user.uid !== uid) throw new Error('Unauthorized');

    // Forbidden fields as per request
    const forbiddenFields = ['studentId', 'role', 'department', 'uid', 'studentCode', 'active', 'status'];
    const filteredData = { ...data };
    forbiddenFields.forEach(f => delete (filteredData as any)[f]);

    try {
      await updateDoc(doc(db, 'users', uid), filteredData);
      
      if (data.fullName || data.photoURL) {
        await updateProfile(user, {
          displayName: data.fullName || user.displayName,
          photoURL: data.photoURL || user.photoURL
        });
      }

      if (newPassword) {
        await updatePassword(user, newPassword);
      }

      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
      throw error;
    }
  },

  async generateStudentCode(course: CourseType): Promise<string> {
    const prefix = COURSE_PREFIXES[course];
    const year = 2026; // System target year as per request
    const path = `counters/${prefix}`;

    try {
      return await runTransaction(db, async (transaction) => {
        const counterDocRef = doc(db, 'counters', prefix);
        const counterDoc = await transaction.get(counterDocRef);
        let newCount = 1;

        if (counterDoc.exists()) {
          newCount = (counterDoc.data()?.count || 0) + 1;
        }

        if (newCount > 1000) {
          throw new Error('Maximum student capacity reached for this course (1000 limit).');
        }

        transaction.set(counterDocRef, { count: newCount });

        return `WA-${prefix}-${year}-${newCount.toString().padStart(4, '0')}`;
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      throw error;
    }
  },

  async registerStudent(data: Omit<Student, 'uid' | 'studentId' | 'createdAt' | 'photoURL' | 'role' | 'status'> & { password: string, photoURL: string }): Promise<Student> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const uid = userCredential.user.uid;

      const studentCode = await this.generateStudentCode(data.department);

      let finalPhotoURL = data.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(data.fullName) + '&background=random';

      await updateProfile(userCredential.user, {
        displayName: data.fullName,
        photoURL: finalPhotoURL
      });

      const studentData: Student = {
        uid,
        studentId: studentCode,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        dateOfBirth: data.dateOfBirth,
        photoURL: finalPhotoURL,
        department: data.department,
        role: 'student',
        active: true,
        status: 'active',
        createdAt: serverTimestamp()
      };

      // Save student data to unified users collection
      await setDoc(doc(db, 'users', uid), studentData);
      
      // Save mapping for identity lookup
      await setDoc(doc(db, 'studentCodes', studentCode), {
        code: studentCode,
        email: data.email,
        linkedUid: uid,
        department: data.department,
        prefix: COURSE_PREFIXES[data.department],
        year: 2026,
        used: true,
        createdAt: serverTimestamp()
      });

      return studentData;
    } catch (error: any) {
      handleFirestoreError(error, OperationType.CREATE, 'students');
      throw error;
    }
  },

  async registerWithGoogle(selectedCourse: CourseType): Promise<Student> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const existingStudent = await this.getStudentData(user.uid);
      if (existingStudent) {
        return existingStudent;
      }

      const studentCode = await this.generateStudentCode(selectedCourse);

      const studentData: Student = {
        uid: user.uid,
        studentId: studentCode,
        fullName: user.displayName || 'Google Student',
        email: user.email || '',
        phone: user.phoneNumber || '',
        address: 'Google Sign-In',
        dateOfBirth: '',
        photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'G')}&background=random`,
        department: selectedCourse,
        role: 'student',
        active: true,
        status: 'active',
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, 'users', user.uid), studentData);
      
      // Save mapping for identity lookup
      await setDoc(doc(db, 'studentCodes', studentCode), {
        code: studentCode,
        email: studentData.email,
        linkedUid: user.uid,
        department: selectedCourse,
        prefix: COURSE_PREFIXES[selectedCourse],
        year: 2026,
        used: true,
        createdAt: serverTimestamp()
      });

      return studentData;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'students');
      throw error;
    }
  },

  async loginWithGoogle(): Promise<Student | null> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return await this.getStudentData(result.user.uid);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'students');
      throw error;
    }
  },

  async getStudentData(uid: string): Promise<Student | null> {
    const docRef = doc(db, 'users', uid);
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.role === 'student') {
          return data as Student;
        }
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${uid}`);
      return null;
    }
  },

  async getProfessorData(uid: string): Promise<any | null> {
    const docRef = doc(db, 'users', uid);
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { ...docSnap.data(), uid: docSnap.id };
      }
      return null;
    } catch (error) {
      return null;
    }
  },

  async getStudentsByDepartment(department: CourseType): Promise<Student[]> {
    try {
      const q = query(
        collection(db, 'users'), 
        where('role', '==', 'student'),
        where('department', '==', department)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ ...d.data(), uid: d.id })) as Student[];
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'users');
      throw error;
    }
  },

  subscribeStudentsByDepartment(department: CourseType, callback: (students: Student[]) => void) {
    const q = query(
      collection(db, 'users'), 
      where('role', '==', 'student'),
      where('department', '==', department)
    );
    return onSnapshot(q, (snap) => {
      const students = snap.docs.map(d => ({ ...d.data(), uid: d.id })) as Student[];
      callback(students);
    });
  },

  async getAllStudents(): Promise<Student[]> {
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'student'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ ...d.data(), uid: d.id })) as Student[];
    } catch (error) {
      throw error;
    }
  }
};
