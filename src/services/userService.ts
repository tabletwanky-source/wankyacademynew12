import { supabase } from '../lib/supabase';
import { getAuthHeaders } from '../lib/supabaseHelpers';
import { mapProfileToAppUser, mapAppUserToProfile } from '../lib/supabaseHelpers';
import { AppUser, Student, CourseType } from '../types';

const API_BASE = '/api/admin';

export const userService = {
  subscribeAllUsers(callback: (users: AppUser[]) => void) {
    const channel = supabase
      .channel('profiles-all')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, async () => {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
        callback((data || []).map(mapProfileToAppUser) as AppUser[]);
      })
      .subscribe();

    supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => callback((data || []).map(mapProfileToAppUser) as AppUser[]));

    return () => supabase.removeChannel(channel);
  },

  subscribeDepartmentStudents(department: CourseType, callback: (students: Student[]) => void) {
    const channel = supabase
      .channel(`profiles-dept-${department}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, async () => {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'student')
          .eq('department', department)
          .order('created_at', { ascending: false });
        callback((data || []).map(mapProfileToAppUser) as Student[]);
      })
      .subscribe();

    supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .eq('department', department)
      .order('created_at', { ascending: false })
      .then(({ data }) => callback((data || []).map(mapProfileToAppUser) as Student[]));

    return () => supabase.removeChannel(channel);
  },

  async getUsersByRole(role: string): Promise<AppUser[]> {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', role);
    return (data || []).map(mapProfileToAppUser) as AppUser[];
  },

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

  async generateNextStudentId(department: CourseType): Promise<string> {
    const prefixes: Record<string, string> = {
      'Informatique': 'INFO',
      'Technique Informatique': 'TECH',
      'Auto École': 'AUTO'
    };
    const prefix = prefixes[department] || 'GEN';
    const year = new Date().getFullYear();

    const { data } = await supabase
      .from('profiles')
      .select('student_id')
      .eq('role', 'student')
      .eq('department', department)
      .order('student_id', { ascending: false })
      .limit(1);

    let seq = 1;
    if (data && data.length > 0) {
      const lastId = data[0].student_id as string;
      const parts = (lastId || '').split('-');
      if (parts.length === 4) {
        const lastSeq = parseInt(parts[3]);
        if (!isNaN(lastSeq)) seq = lastSeq + 1;
      }
    }

    return `WA-${prefix}-${year}-${seq.toString().padStart(4, '0')}`;
  }
};
