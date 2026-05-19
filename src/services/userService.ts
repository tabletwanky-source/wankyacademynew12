import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy,
  doc,
  getDoc,
  getDocs,
  limit
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { AppUser, Student, CourseType, UserStatus } from '../types';

const API_BASE = '/api/admin';

async function getAuthHeaders() {
  const user = auth.currentUser;
  if (!user) return {};
  const token = await user.getIdToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

export const userService = {
  // Real-time subscriptions
  subscribeAllUsers(callback: (users: AppUser[]) => void) {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      const users = snap.docs.map(d => ({ ...d.data(), uid: d.id })) as AppUser[];
      callback(users);
    });
  },

  subscribeDepartmentStudents(department: CourseType, callback: (students: Student[]) => void) {
    const q = query(
      collection(db, 'users'), 
      where('role', '==', 'student'),
      where('department', '==', department),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snap) => {
      const students = snap.docs.map(d => ({ ...d.data(), uid: d.id })) as unknown as Student[];
      callback(students);
    });
  },

  async getUsersByRole(role: string): Promise<AppUser[]> {
    const q = query(collection(db, 'users'), where('role', '==', role));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ ...d.data(), uid: d.id })) as AppUser[];
  },

  // Backend API calls for Admin
  async adminCreateUser(data: any) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create user');
    }
    return response.json();
  },

  async adminUpdateUser(uid: string, data: any) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/users/${uid}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update user');
    }
    return response.json();
  },

  async adminDeleteUser(uid: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/users/${uid}`, {
      method: 'DELETE',
      headers
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete user');
    }
    return response.json();
  },

  async adminResetPassword(uid: string, newPassword: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/users/${uid}/reset-password`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ newPassword })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to reset password');
    }
    return response.json();
  },

  // Utilities
  async generateNextStudentId(department: CourseType): Promise<string> {
    const prefixes: Record<string, string> = {
      'Informatique': 'INFO',
      'Technique Informatique': 'TECH',
      'Auto École': 'AUTO'
    };
    
    const prefix = prefixes[department] || 'GEN';
    const year = new Date().getFullYear();
    
    // Find highest sequence for this department and year
    // Note: This is an approximation. In high concurrency, use a counter collection or server-side atomic op.
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'student'),
      where('department', '==', department),
      orderBy('studentId', 'desc'),
      limit(1)
    );
    
    const snap = await getDocs(q);
    let seq = 1;
    
    if (!snap.empty) {
      const lastId = snap.docs[0].data().studentId as string;
      // Format: WA-INFO-2026-0001
      const parts = lastId.split('-');
      if (parts.length === 4) {
        const lastSeq = parseInt(parts[3]);
        if (!isNaN(lastSeq)) seq = lastSeq + 1;
      }
    }
    
    return `WA-${prefix}-${year}-${seq.toString().padStart(4, '0')}`;
  }
};
