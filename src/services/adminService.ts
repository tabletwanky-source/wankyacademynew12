import { supabase } from '../lib/supabase';
import { mapProfileToAppUser, mapAppUserToProfile } from '../lib/supabaseHelpers';
import { Student, Professor, Payment, CourseType, AppUser } from '../types';

export const adminService = {
  async getDashboardStats() {
    try {
      const { data: users } = await supabase.from('profiles').select('role, department');
      const { data: payments } = await supabase.from('payments').select('amount');

      const allUsers = users || [];
      const students = allUsers.filter(u => u.role === 'student');
      const professors = allUsers.filter(u => u.role === 'professor');
      const totalPayments = (payments || []).reduce((acc, p) => acc + (p.amount || 0), 0);

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
      return { totalStudents: 0, totalProfessors: 0, totalCourses: 3, totalPayments: 0, perCourse: {} };
    }
  },

  async getAllStudents() {
    const { data, error } = await supabase.from('profiles').select('*').eq('role', 'student');
    if (error) throw error;
    return (data || []).map(mapProfileToAppUser) as Student[];
  },

  async getAllProfessors() {
    const { data, error } = await supabase.from('profiles').select('*').eq('role', 'professor');
    if (error) throw error;
    return (data || []).map(mapProfileToAppUser) as Professor[];
  },

  async createProfessor(data: { fullName: string, email: string, department: CourseType, password: string, whatsapp?: string }) {
    // Create via admin API endpoint to avoid signing out current user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const response = await fetch('/api/admin/users', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        role: 'professor',
        department: data.department,
        whatsapp: data.whatsapp || '',
        mustChangePassword: true,
        temporaryPassword: true
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to create professor');
    }

    return response.json();
  },

  async updateUser(uid: string, data: Partial<AppUser>) {
    const { error } = await supabase.from('profiles').update(mapAppUserToProfile(data)).eq('uid', uid);
    if (error) throw error;
  },

  async deleteUser(uid: string) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const response = await fetch(`/api/admin/users/${uid}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${session.access_token}` }
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to delete user');
    }
  },

  async getStudentPayments(studentId: string) {
    const { data, error } = await supabase.from('payments').select('*').eq('student_id', studentId);
    if (error) throw error;
    return (data || []).map(p => ({
      id: p.id,
      studentId: p.student_id,
      studentCode: p.receipt_code || '',
      amount: p.amount,
      paymentType: p.payment_type as any,
      paymentDate: p.created_at,
      paymentStatus: 'Paid' as any,
      remainingBalance: 0
    })) as Payment[];
  },

  async addPayment(paymentData: Omit<Payment, 'id' | 'paymentDate'>) {
    const { error } = await supabase.from('payments').insert({
      student_uid: paymentData.studentId,
      student_id: paymentData.studentCode || '',
      amount: paymentData.amount,
      payment_type: paymentData.paymentType,
      status: 'paid'
    });
    if (error) throw error;
  },

  async getPaymentSummary() {
    const { data, error } = await supabase.from('payments').select('*');
    if (error) throw error;
    return (data || []).map(p => ({
      id: p.id,
      studentId: p.student_uid,
      studentCode: p.student_id || '',
      amount: p.amount,
      paymentType: p.payment_type as any,
      paymentDate: p.created_at,
      paymentStatus: 'Paid' as any,
      remainingBalance: 0
    })) as Payment[];
  },

  async getAllStudentCodes() {
    const { data, error } = await supabase.from('student_codes').select('*');
    if (error) throw error;
    return (data || []).map(r => ({
      code: r.code,
      email: r.email,
      linkedUid: r.linked_uid,
      department: r.department,
      prefix: r.prefix,
      year: r.year,
      used: r.used,
      createdAt: r.created_at
    }));
  }
};
