import { supabase } from '../lib/supabase';
import { mapBadge } from '../lib/supabaseHelpers';
import { Badge } from '../types';
import { studentService } from './studentService';

export const badgeService = {
  subscribeStudentBadge(studentUid: string, callback: (badge: Badge | null) => void) {
    const load = async () => {
      const { data } = await supabase
        .from('badges')
        .select('*')
        .eq('student_uid', studentUid)
        .eq('active', true)
        .limit(1);

      if (data && data.length > 0) {
        callback(mapBadge(data[0]) as Badge);
      } else {
        callback(null);
      }
    };

    const channel = supabase
      .channel(`badge-${studentUid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'badges', filter: `student_uid=eq.${studentUid}` }, load)
      .subscribe();

    load();
    return () => supabase.removeChannel(channel);
  },

  async generateBadge(studentUid: string) {
    const { data: existing } = await supabase
      .from('badges')
      .select('id')
      .eq('student_uid', studentUid)
      .eq('active', true)
      .maybeSingle();

    if (existing) return existing.id;

    const { data: userData } = await supabase.from('profiles').select('*').eq('uid', studentUid).maybeSingle();
    if (!userData) throw new Error('User profile not found in identification registry.');

    let studentId = userData.student_id;
    if (!studentId) {
      studentId = await studentService.generateStudentCode(userData.department || 'Informatique');
      await supabase.from('profiles').update({ student_id: studentId }).eq('uid', studentUid);
    }

    if (!userData.full_name) throw new Error('Incomplete profile: Full Name is required for badge issuance.');

    const year = 2026;
    const badgeCode = `WA-BADGE-${year}-${Date.now().toString().slice(-6)}`;

    const { data: result, error } = await supabase.from('badges').insert({
      badge_code: badgeCode,
      student_uid: studentUid,
      student_id: studentId,
      student_name: userData.full_name,
      department: userData.department || 'Informatique',
      active: true,
      verification_url: `/verify-badge/${badgeCode}`
    }).select().single();

    if (error) throw error;
    return result.id;
  },

  async verifyBadge(badgeCode: string) {
    const { data } = await supabase
      .from('badges')
      .select('*')
      .eq('badge_code', badgeCode)
      .eq('active', true)
      .maybeSingle();
    return data ? mapBadge(data) : null;
  }
};
