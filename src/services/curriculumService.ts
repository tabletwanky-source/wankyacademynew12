import { supabase } from '../lib/supabase';
import { mapCurriculum, mapCurriculumToDb } from '../lib/supabaseHelpers';
import { Curriculum, Module, CourseType } from '../types';

export const curriculumService = {
  async createCurriculum(data: Omit<Curriculum, 'id' | 'createdAt' | 'updatedAt' | 'totalLessons'>) {
    const dbData = {
      ...mapCurriculumToDb(data),
      total_lessons: 0
    };
    const { data: result, error } = await supabase.from('curriculums').insert(dbData).select().single();
    if (error) throw error;
    return result.id;
  },

  async updateCurriculum(id: string, data: Partial<Curriculum>) {
    const { error } = await supabase.from('curriculums').update({
      ...mapCurriculumToDb(data),
      updated_at: new Date().toISOString()
    }).eq('id', id);
    if (error) throw error;
  },

  async deleteCurriculum(id: string) {
    const { error } = await supabase.from('curriculums').delete().eq('id', id);
    if (error) throw error;
  },

  async getCurriculum(id: string) {
    const { data } = await supabase.from('curriculums').select('*').eq('id', id).maybeSingle();
    return data ? mapCurriculum(data) as Curriculum : null;
  },

  subscribeAllCurriculums(callback: (curriculums: Curriculum[]) => void) {
    const load = async () => {
      const { data } = await supabase.from('curriculums').select('*').order('created_at', { ascending: false });
      callback((data || []).map(mapCurriculum) as Curriculum[]);
    };

    const channel = supabase
      .channel('curriculums-all')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'curriculums' }, load)
      .subscribe();

    load();
    return () => supabase.removeChannel(channel);
  },

  subscribePublishedCurriculums(department: CourseType, callback: (curriculums: Curriculum[]) => void) {
    const load = async () => {
      const { data } = await supabase
        .from('curriculums')
        .select('*')
        .eq('department', department)
        .eq('published', true)
        .order('created_at', { ascending: false });
      callback((data || []).map(mapCurriculum) as Curriculum[]);
    };

    const channel = supabase
      .channel(`curriculums-${department}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'curriculums' }, load)
      .subscribe();

    load();
    return () => supabase.removeChannel(channel);
  },

  subscribeProfessorCurriculums(professorUid: string, callback: (curriculums: Curriculum[]) => void) {
    const load = async () => {
      const { data } = await supabase
        .from('curriculums')
        .select('*')
        .eq('assigned_professor', professorUid)
        .order('created_at', { ascending: false });
      callback((data || []).map(mapCurriculum) as Curriculum[]);
    };

    const channel = supabase
      .channel(`curriculums-prof-${professorUid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'curriculums' }, load)
      .subscribe();

    load();
    return () => supabase.removeChannel(channel);
  },

  async saveModules(curriculumId: string, modules: Module[]) {
    let totalLessons = 0;
    modules.forEach(m => totalLessons += m.lessons?.length || 0);

    const { error } = await supabase.from('curriculums').update({
      modules,
      total_lessons: totalLessons,
      updated_at: new Date().toISOString()
    }).eq('id', curriculumId);
    if (error) throw error;
  }
};
