import { supabase } from '../lib/supabase';
import { mapProfileToAppUser, mapAppUserToProfile } from '../lib/supabaseHelpers';
import { CourseType, Student } from '../types';

const COURSE_PREFIXES: Record<CourseType, string> = {
  'Auto École': 'AUTO',
  'Informatique': 'INFO',
  'Technique Informatique': 'TECH'
};

export const studentService = {
  subscribeStudentData(uid: string, callback: (student: Student | null) => void) {
    const channel = supabase
      .channel(`profile-${uid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `uid=eq.${uid}` }, async () => {
        const { data } = await supabase.from('profiles').select('*').eq('uid', uid).maybeSingle();
        if (data && data.role === 'student') {
          callback(mapProfileToAppUser(data) as Student);
        } else {
          callback(null);
        }
      })
      .subscribe();

    supabase.from('profiles').select('*').eq('uid', uid).maybeSingle().then(({ data }) => {
      if (data && data.role === 'student') {
        callback(mapProfileToAppUser(data) as Student);
      } else {
        callback(null);
      }
    });

    return () => supabase.removeChannel(channel);
  },

  async updateStudentProfile(uid: string, data: Partial<Student>, newPassword?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== uid) throw new Error('Unauthorized');

    const forbiddenFields = ['studentId', 'role', 'department', 'uid', 'studentCode', 'active', 'status'];
    const filteredData = { ...data };
    forbiddenFields.forEach(f => delete (filteredData as any)[f]);

    const dbData = mapAppUserToProfile(filteredData);
    const { error } = await supabase.from('profiles').update(dbData).eq('uid', uid);
    if (error) throw error;

    if (newPassword) {
      const { error: pwError } = await supabase.auth.updateUser({ password: newPassword });
      if (pwError) throw pwError;
    }

    return true;
  },

  async generateStudentCode(course: CourseType): Promise<string> {
    const prefix = COURSE_PREFIXES[course];
    const year = 2026;

    // Atomic counter increment
    const { data: counter } = await supabase
      .from('counters')
      .select('count')
      .eq('id', prefix)
      .maybeSingle();

    const currentCount = counter?.count || 0;
    const newCount = currentCount + 1;

    if (newCount > 1000) {
      throw new Error('Maximum student capacity reached for this course (1000 limit).');
    }

    const { error } = await supabase
      .from('counters')
      .update({ count: newCount, updated_at: new Date().toISOString() })
      .eq('id', prefix);

    if (error) throw error;

    return `WA-${prefix}-${year}-${newCount.toString().padStart(4, '0')}`;
  },

  async registerStudent(data: Omit<Student, 'uid' | 'studentId' | 'createdAt' | 'photoURL' | 'role' | 'status'> & { password: string, photoURL: string }): Promise<Student> {
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.fullName }
      }
    });

    if (signUpError) throw signUpError;
    const uid = authData.user!.id;

    const studentCode = await this.generateStudentCode(data.department);
    const photoURL = data.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.fullName)}&background=random`;

    const profileData = {
      uid,
      email: data.email,
      full_name: data.fullName,
      phone: data.phone || '',
      address: data.address || '',
      date_of_birth: data.dateOfBirth || '',
      photo_url: photoURL,
      department: data.department,
      role: 'student',
      active: true,
      status: 'active',
      student_id: studentCode
    };

    const { error: profileError } = await supabase.from('profiles').insert(profileData);
    if (profileError) throw profileError;

    await supabase.from('student_codes').insert({
      code: studentCode,
      email: data.email,
      linked_uid: uid,
      department: data.department,
      prefix: COURSE_PREFIXES[data.department],
      year: 2026,
      used: true
    });

    return mapProfileToAppUser({ ...profileData, created_at: new Date().toISOString() }) as Student;
  },

  async registerWithGoogle(selectedCourse: CourseType): Promise<Student> {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error('Not authenticated');

    const existing = await this.getStudentData(user.id);
    if (existing) return existing;

    const studentCode = await this.generateStudentCode(selectedCourse);
    const photoURL = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_metadata?.full_name || 'G')}&background=random`;

    const profileData = {
      uid: user.id,
      email: user.email || '',
      full_name: user.user_metadata?.full_name || 'Google Student',
      phone: '',
      address: 'Google Sign-In',
      date_of_birth: '',
      photo_url: photoURL,
      department: selectedCourse,
      role: 'student',
      active: true,
      status: 'active',
      student_id: studentCode
    };

    const { error: profileError } = await supabase.from('profiles').insert(profileData);
    if (profileError) throw profileError;

    await supabase.from('student_codes').insert({
      code: studentCode,
      email: profileData.email,
      linked_uid: user.id,
      department: selectedCourse,
      prefix: COURSE_PREFIXES[selectedCourse],
      year: 2026,
      used: true
    });

    return mapProfileToAppUser({ ...profileData, created_at: new Date().toISOString() }) as Student;
  },

  async loginWithGoogle(): Promise<Student | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return this.getStudentData(user.id);
  },

  async getStudentData(uid: string): Promise<Student | null> {
    const { data } = await supabase.from('profiles').select('*').eq('uid', uid).maybeSingle();
    if (data && data.role === 'student') return mapProfileToAppUser(data) as Student;
    return null;
  },

  async getProfessorData(uid: string): Promise<any | null> {
    const { data } = await supabase.from('profiles').select('*').eq('uid', uid).maybeSingle();
    return data ? mapProfileToAppUser(data) : null;
  },

  async getStudentsByDepartment(department: CourseType): Promise<Student[]> {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .eq('department', department);
    return (data || []).map(mapProfileToAppUser) as Student[];
  },

  subscribeStudentsByDepartment(department: CourseType, callback: (students: Student[]) => void) {
    const channel = supabase
      .channel(`students-dept-${department}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, async () => {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'student')
          .eq('department', department);
        callback((data || []).map(mapProfileToAppUser) as Student[]);
      })
      .subscribe();

    supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .eq('department', department)
      .then(({ data }) => callback((data || []).map(mapProfileToAppUser) as Student[]));

    return () => supabase.removeChannel(channel);
  },

  async getAllStudents(): Promise<Student[]> {
    const { data } = await supabase.from('profiles').select('*').eq('role', 'student');
    return (data || []).map(mapProfileToAppUser) as Student[];
  }
};
