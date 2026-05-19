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
import { CourseType, Video, Homework, HomeworkSubmission } from '../types';
import { handleFirestoreError, OperationType } from '../utils/firebaseErrors';

export const learningService = {
  // Video Lessons
  subscribeVideosByDepartment(department: CourseType, callback: (videos: Video[]) => void) {
    if (!auth.currentUser) return () => {};
    
    const q = query(
      collection(db, 'videos'), 
      where('department', '==', department),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snap) => {
      const videos = snap.docs.map(d => ({ ...d.data(), id: d.id })) as Video[];
      callback(videos);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'videos');
    });
  },

  async getVideosByDepartment(department: CourseType) {
    try {
      const q = query(
        collection(db, 'videos'), 
        where('department', '==', department),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ ...d.data(), id: d.id })) as Video[];
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'videos');
      throw error;
    }
  },

  async addVideo(data: Omit<Video, 'id' | 'createdAt'>) {
    try {
      return await addDoc(collection(db, 'videos'), {
        ...data,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'videos');
      throw error;
    }
  },

  async updateVideo(id: string, data: Partial<Video>) {
    try {
      const ref = doc(db, 'videos', id);
      await updateDoc(ref, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `videos/${id}`);
      throw error;
    }
  },

  async deleteVideo(id: string) {
    try {
      await deleteDoc(doc(db, 'videos', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `videos/${id}`);
      throw error;
    }
  },

  // Video Comments
  subscribeVideoComments(videoId: string, callback: (comments: any[]) => void) {
    if (!auth.currentUser) return () => {};

    const q = query(
      collection(db, 'videoComments'),
      where('videoId', '==', videoId),
      orderBy('createdAt', 'asc')
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'videoComments');
    });
  },

  async addVideoComment(data: any) {
    try {
      return await addDoc(collection(db, 'videoComments'), {
        ...data,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'videoComments');
      throw error;
    }
  },

  // Video Progress
  subscribeVideoProgress(studentUid: string, callback: (progress: any[]) => void) {
    if (!auth.currentUser) return () => {};

    const q = query(
      collection(db, 'videoProgress'),
      where('studentUid', '==', studentUid)
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'videoProgress');
    });
  },

  async updateVideoProgress(studentUid: string, videoId: string, progress: number, completed: boolean) {
    try {
      const q = query(
        collection(db, 'videoProgress'),
        where('studentUid', '==', studentUid),
        where('videoId', '==', videoId)
      );
      const snap = await getDocs(q);
      
      if (snap.empty) {
        await addDoc(collection(db, 'videoProgress'), {
          studentUid,
          videoId,
          progress,
          completed,
          lastUpdated: serverTimestamp()
        });
      } else {
        const docRef = doc(db, 'videoProgress', snap.docs[0].id);
        await updateDoc(docRef, {
          progress,
          completed,
          lastUpdated: serverTimestamp()
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'videoProgress');
      throw error;
    }
  },

  // Homework Assignments
  subscribeHomeworkByDepartment(department: CourseType, callback: (homework: Homework[]) => void) {
    if (!auth.currentUser) return () => {};

    const q = query(
      collection(db, 'homework'), 
      where('department', '==', department),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snap) => {
      const homework = snap.docs.map(d => ({ ...d.data(), id: d.id })) as Homework[];
      callback(homework);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'homework');
    });
  },

  async getHomeworkByDepartment(department: CourseType) {
    try {
      const q = query(
        collection(db, 'homework'), 
        where('department', '==', department),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ ...d.data(), id: d.id })) as Homework[];
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'homework');
      throw error;
    }
  },

  async addHomework(data: Omit<Homework, 'id' | 'createdAt'>) {
    try {
      return await addDoc(collection(db, 'homework'), {
        ...data,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'homework');
      throw error;
    }
  },

  async deleteHomework(id: string) {
    try {
      await deleteDoc(doc(db, 'homework', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `homework/${id}`);
      throw error;
    }
  },

  // Homework Submissions
  subscribeSubmissionsByHomework(homeworkId: string, callback: (submissions: HomeworkSubmission[]) => void) {
    if (!auth.currentUser) return () => {};

    const q = query(
      collection(db, 'homeworkSubmissions'),
      where('homeworkId', '==', homeworkId),
      orderBy('submittedAt', 'desc')
    );
    return onSnapshot(q, (snap) => {
      const submissions = snap.docs.map(d => ({ ...d.data(), id: d.id })) as HomeworkSubmission[];
      callback(submissions);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'homeworkSubmissions');
    });
  },

  subscribeAllSubmissionsByDepartment(department: CourseType, callback: (submissions: HomeworkSubmission[]) => void) {
    if (!auth.currentUser) return () => {};

    const q = query(
      collection(db, 'homeworkSubmissions'),
      where('department', '==', department),
      orderBy('submittedAt', 'desc')
    );
    return onSnapshot(q, (snap) => {
      const submissions = snap.docs.map(d => ({ ...d.data(), id: d.id })) as HomeworkSubmission[];
      callback(submissions);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'homeworkSubmissions');
    });
  },

  subscribeStudentSubmissions(studentUid: string, callback: (submissions: HomeworkSubmission[]) => void) {
    if (!auth.currentUser) return () => {};

    const q = query(
      collection(db, 'homeworkSubmissions'),
      where('studentUid', '==', studentUid),
      orderBy('submittedAt', 'desc')
    );
    return onSnapshot(q, (snap) => {
      const submissions = snap.docs.map(d => ({ ...d.data(), id: d.id })) as HomeworkSubmission[];
      callback(submissions);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'homeworkSubmissions');
    });
  },

  async gradeSubmission(submissionId: string, data: { grade: number; feedback: string; status: 'graded' }) {
    try {
      const ref = doc(db, 'homeworkSubmissions', submissionId);
      await updateDoc(ref, {
        ...data,
        gradedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `homeworkSubmissions/${submissionId}`);
      throw error;
    }
  },

  async submitHomework(data: Omit<HomeworkSubmission, 'id' | 'submittedAt' | 'gradedAt'>) {
    try {
      return await addDoc(collection(db, 'homeworkSubmissions'), {
        ...data,
        submittedAt: serverTimestamp(),
        status: data.status || 'submitted'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'homeworkSubmissions');
      throw error;
    }
  }
};
