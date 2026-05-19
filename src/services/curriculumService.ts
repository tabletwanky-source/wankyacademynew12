import { db } from '../lib/firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { Curriculum, Module, Lesson, CourseType } from '../types';

export const curriculumService = {
  // Curriculum CRUD
  async createCurriculum(data: Omit<Curriculum, 'id' | 'createdAt' | 'updatedAt' | 'totalLessons'>) {
    const docRef = await addDoc(collection(db, 'curriculums'), {
      ...data,
      totalLessons: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  async updateCurriculum(id: string, data: Partial<Curriculum>) {
    const docRef = doc(db, 'curriculums', id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  },

  async deleteCurriculum(id: string) {
    await deleteDoc(doc(db, 'curriculums', id));
  },

  async getCurriculum(id: string) {
    const docRef = doc(db, 'curriculums', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Curriculum;
    }
    return null;
  },

  // Realtime Listeners
  subscribeAllCurriculums(callback: (curriculums: Curriculum[]) => void) {
    const q = query(collection(db, 'curriculums'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Curriculum[]);
    });
  },

  subscribePublishedCurriculums(department: CourseType, callback: (curriculums: Curriculum[]) => void) {
    const q = query(
      collection(db, 'curriculums'), 
      where('department', '==', department),
      where('published', '==', true),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Curriculum[]);
    });
  },

  subscribeProfessorCurriculums(professorUid: string, callback: (curriculums: Curriculum[]) => void) {
    const q = query(
      collection(db, 'curriculums'), 
      where('assignedProfessor', '==', professorUid),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Curriculum[]);
    });
  },

  // Modules CRUD (Nested in Curriculum doc for now to keep it simple, or as a subcollection)
  // Let's use a nested array 'modules' in the curriculum document for better realtime sync of the whole structure
  // but if it gets too large, we should switch. For this app, nested is likely fine.
  
  async saveModules(curriculumId: string, modules: Module[]) {
    const docRef = doc(db, 'curriculums', curriculumId);
    let totalLessons = 0;
    modules.forEach(m => totalLessons += m.lessons?.length || 0);
    
    await updateDoc(docRef, {
      modules,
      totalLessons,
      updatedAt: serverTimestamp()
    });
  }
};
