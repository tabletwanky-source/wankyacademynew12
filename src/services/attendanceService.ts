import { supabase } from '../lib/supabase';
import { mapAttendance, mapAttendanceToDb } from '../lib/supabaseHelpers';
import { Attendance } from '../types';

export const attendanceService = {
  subscribeStudentAttendance(studentUid: string, callback: (attendance: Attendance[]) => void) {
    const load = async () => {
      const { data } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_uid', studentUid)
        .order('date', { ascending: false });
      callback((data || []).map(mapAttendance) as Attendance[]);
    };

    const channel = supabase
      .channel(`attendance-${studentUid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance', filter: `student_uid=eq.${studentUid}` }, load)
      .subscribe();

    load();
    return () => supabase.removeChannel(channel);
  },

  async getStudentAttendance(studentUid: string) {
    const { data } = await supabase
      .from('attendance')
      .select('*')
      .eq('student_uid', studentUid)
      .order('date', { ascending: false });
    return (data || []).map(mapAttendance) as Attendance[];
  },

  async markAttendance(data: Omit<Attendance, 'id' | 'createdAt'> | Omit<Attendance, 'id' | 'createdAt'>[]) {
    const records = Array.isArray(data) ? data : [data];
    const dbRecords = records.map(mapAttendanceToDb);
    const { error } = await supabase.from('attendance').insert(dbRecords);
    if (error) throw error;
  },

  async getDailyAttendance(department: string, date: any) {
    const dateStr = typeof date === 'string' ? date : date?.toDate?.()?.toISOString?.()?.split('T')[0] || String(date);
    const { data } = await supabase
      .from('attendance')
      .select('*')
      .eq('department', department)
      .eq('date', dateStr);
    return (data || []).map(mapAttendance) as Attendance[];
  }
};
