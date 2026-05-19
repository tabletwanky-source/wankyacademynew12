import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  getDocs,
  limit,
  orderBy,
  doc,
  getDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Badge, Student } from '../types';
import { studentService } from './studentService';

export const badgeService = {
  subscribeStudentBadge(studentUid: string, callback: (badge: Badge | null) => void) {
    const q = query(
      collection(db, 'badges'),
      where('studentUid', '==', studentUid),
      where('active', '==', true)
    );
    return onSnapshot(q, (snap) => {
      if (!snap.empty) {
        // Return the first active badge
        callback({ ...snap.docs[0].data(), id: snap.docs[0].id } as Badge);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error("Badge Subscription Error:", error);
      callback(null);
    });
  },

  async generateBadge(studentUid: string) {
    try {
      // 1. Check if badge already exists
      const qCheck = query(
        collection(db, 'badges'), 
        where('studentUid', '==', studentUid), 
        where('active', '==', true)
      );
      const snapCheck = await getDocs(qCheck);
      if (!snapCheck.empty) {
        return snapCheck.docs[0].id;
      }

      // 2. Load Firestore user profile
      const userRef = doc(db, 'users', studentUid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        throw new Error('User profile not found in identification registry.');
      }

      const userData = userSnap.data() as Student;

      // 3. Validate required fields & Auto-generate studentId if missing
      let studentId = userData.studentId;
      if (!studentId) {
        console.log("Student ID missing, auto-generating...");
        studentId = await studentService.generateStudentCode(userData.department || 'Informatique');
        await updateDoc(userRef, { studentId });
      }

      if (!userData.fullName) {
        throw new Error('Incomplete profile: Full Name is required for badge issuance.');
      }

      // 4. Generate unique badge code
      // We use the requested format: WA-BADGE-2026-TIMESTAMP
      const year = 2026;
      const badgeCode = `WA-BADGE-${year}-${Date.now().toString().slice(-6)}`;

      // 5. Create badge document
      const badgeData = {
        badgeCode,
        studentUid,
        studentId: studentId,
        studentName: userData.fullName,
        department: userData.department || 'Informatique',
        active: true,
        createdAt: serverTimestamp(),
        // Add verification URL as requested
        verificationUrl: `/verify-badge/${badgeCode}`
      };

      const docRef = await addDoc(collection(db, 'badges'), badgeData);
      return docRef.id;
    } catch (error: any) {
      console.error("Badge Generation Error:", error);
      throw error;
    }
  },

  async verifyBadge(badgeCode: string) {
    const q = query(
      collection(db, 'badges'), 
      where('badgeCode', '==', badgeCode),
      where('active', '==', true)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return { ...snap.docs[0].data(), id: snap.docs[0].id };
    }
    return null;
  }
};
