import { supabase } from '../lib/supabase';
import { mapVideo, mapVideoToDb, mapHomework, mapHomeworkToDb, mapSubmission, mapSubmissionToDb } from '../lib/supabaseHelpers';
import { CourseType, Video, Homework, HomeworkSubmission } from '../types';

export const learningService = {
  async getVideo(id: string) {
    const { data } = await supabase.from('videos').select('*').eq('id', id).maybeSingle();
    return data ? mapVideo(data) as Video : null;
  },

  getEmbedUrl(video: Video) {
    if (video.videoType === 'youtube' || (video.videoUrl && video.videoUrl.includes('youtube.com'))) {
      const id = video.videoUrl.split('v=')[1]?.split('&')[0] || video.videoUrl.split('/').pop();
      return `https://www.youtube.com/embed/${id}`;
    }
    if (video.videoType === 'vimeo' || (video.videoUrl && video.videoUrl.includes('vimeo.com'))) {
      const id = video.videoUrl.split('/').pop();
      return `https://player.vimeo.com/video/${id}`;
    }
    return video.videoUrl || video.url || null;
  },

  subscribeVideosByDepartment(department: CourseType, callback: (videos: Video[]) => void) {
    const load = async () => {
      const { data } = await supabase
        .from('videos')
        .select('*')
        .eq('department', department)
        .order('created_at', { ascending: false });
      callback((data || []).map(mapVideo) as Video[]);
    };

    const channel = supabase
      .channel(`videos-${department}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'videos' }, load)
      .subscribe();

    load();
    return () => supabase.removeChannel(channel);
  },

  async getVideosByDepartment(department: CourseType) {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('department', department)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapVideo) as Video[];
  },

  async addVideo(data: Omit<Video, 'id' | 'createdAt'>) {
    const { data: result, error } = await supabase.from('videos').insert(mapVideoToDb(data)).select().single();
    if (error) throw error;
    return result;
  },

  async updateVideo(id: string, data: Partial<Video>) {
    const { error } = await supabase.from('videos').update(mapVideoToDb(data)).eq('id', id);
    if (error) throw error;
  },

  async deleteVideo(id: string) {
    const { error } = await supabase.from('videos').delete().eq('id', id);
    if (error) throw error;
  },

  subscribeVideoComments(videoId: string, callback: (comments: any[]) => void) {
    const load = async () => {
      const { data } = await supabase
        .from('video_comments')
        .select('*')
        .eq('video_id', videoId)
        .order('created_at', { ascending: true });
      callback((data || []).map(r => ({
        id: r.id,
        videoId: r.video_id,
        userId: r.user_id,
        userName: r.user_name,
        userRole: r.user_role,
        content: r.content,
        createdAt: r.created_at
      })));
    };

    const channel = supabase
      .channel(`video-comments-${videoId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'video_comments', filter: `video_id=eq.${videoId}` }, load)
      .subscribe();

    load();
    return () => supabase.removeChannel(channel);
  },

  async addVideoComment(data: any) {
    const { error } = await supabase.from('video_comments').insert({
      video_id: data.videoId,
      user_id: data.userId,
      user_name: data.userName,
      user_role: data.userRole || 'student',
      content: data.content
    });
    if (error) throw error;
  },

  subscribeVideoProgress(studentUid: string, callback: (progress: any[]) => void) {
    const load = async () => {
      const { data } = await supabase
        .from('video_progress')
        .select('*')
        .eq('student_uid', studentUid);
      callback((data || []).map(r => ({
        id: r.id,
        studentUid: r.student_uid,
        videoId: r.video_id,
        progress: r.progress,
        completed: r.completed,
        lastUpdated: r.last_updated
      })));
    };

    const channel = supabase
      .channel(`video-progress-${studentUid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'video_progress', filter: `student_uid=eq.${studentUid}` }, load)
      .subscribe();

    load();
    return () => supabase.removeChannel(channel);
  },

  async updateVideoProgress(studentUid: string, videoId: string, progress: number, completed: boolean) {
    const { error } = await supabase.from('video_progress').upsert({
      student_uid: studentUid,
      video_id: videoId,
      progress,
      completed,
      last_updated: new Date().toISOString()
    }, { onConflict: 'student_uid,video_id' });
    if (error) throw error;
  },

  subscribeHomeworkByDepartment(department: CourseType, callback: (homework: Homework[]) => void) {
    const load = async () => {
      const { data } = await supabase
        .from('homework')
        .select('*')
        .eq('department', department)
        .order('created_at', { ascending: false });
      callback((data || []).map(mapHomework) as Homework[]);
    };

    const channel = supabase
      .channel(`homework-${department}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'homework' }, load)
      .subscribe();

    load();
    return () => supabase.removeChannel(channel);
  },

  async getHomeworkByDepartment(department: CourseType) {
    const { data, error } = await supabase
      .from('homework')
      .select('*')
      .eq('department', department)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapHomework) as Homework[];
  },

  async addHomework(data: Omit<Homework, 'id' | 'createdAt'>) {
    const { data: result, error } = await supabase.from('homework').insert(mapHomeworkToDb(data)).select().single();
    if (error) throw error;
    return result;
  },

  async deleteHomework(id: string) {
    const { error } = await supabase.from('homework').delete().eq('id', id);
    if (error) throw error;
  },

  subscribeSubmissionsByHomework(homeworkId: string, callback: (submissions: HomeworkSubmission[]) => void) {
    const load = async () => {
      const { data } = await supabase
        .from('homework_submissions')
        .select('*')
        .eq('homework_id', homeworkId)
        .order('submitted_at', { ascending: false });
      callback((data || []).map(mapSubmission) as HomeworkSubmission[]);
    };

    const channel = supabase
      .channel(`submissions-hw-${homeworkId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'homework_submissions', filter: `homework_id=eq.${homeworkId}` }, load)
      .subscribe();

    load();
    return () => supabase.removeChannel(channel);
  },

  subscribeAllSubmissionsByDepartment(department: CourseType, callback: (submissions: HomeworkSubmission[]) => void) {
    const load = async () => {
      const { data } = await supabase
        .from('homework_submissions')
        .select('*')
        .eq('department', department)
        .order('submitted_at', { ascending: false });
      callback((data || []).map(mapSubmission) as HomeworkSubmission[]);
    };

    const channel = supabase
      .channel(`submissions-dept-${department}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'homework_submissions' }, load)
      .subscribe();

    load();
    return () => supabase.removeChannel(channel);
  },

  subscribeStudentSubmissions(studentUid: string, callback: (submissions: HomeworkSubmission[]) => void) {
    const load = async () => {
      const { data } = await supabase
        .from('homework_submissions')
        .select('*')
        .eq('student_uid', studentUid)
        .order('submitted_at', { ascending: false });
      callback((data || []).map(mapSubmission) as HomeworkSubmission[]);
    };

    const channel = supabase
      .channel(`submissions-student-${studentUid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'homework_submissions', filter: `student_uid=eq.${studentUid}` }, load)
      .subscribe();

    load();
    return () => supabase.removeChannel(channel);
  },

  async gradeSubmission(submissionId: string, data: { grade: number; feedback: string; status: 'graded' }) {
    const { error } = await supabase.from('homework_submissions').update({
      grade: data.grade,
      feedback: data.feedback,
      status: data.status,
      graded_at: new Date().toISOString()
    }).eq('id', submissionId);
    if (error) throw error;
  },

  async submitHomework(data: Omit<HomeworkSubmission, 'id' | 'submittedAt' | 'gradedAt'>) {
    const dbData = {
      ...mapSubmissionToDb(data),
      status: data.status || 'submitted'
    };
    const { data: result, error } = await supabase.from('homework_submissions').insert(dbData).select().single();
    if (error) throw error;
    return result;
  }
};
