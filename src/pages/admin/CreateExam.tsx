import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Settings, 
  Clock, 
  Target, 
  BookOpen,
  Calendar
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { examService } from '../../services/examService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
import { Exam, CourseType } from '../../types';

const COURSES: CourseType[] = ['Auto École', 'Informatique', 'Technique Informatique'];

export default function CreateExam() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!examId);
  const [formData, setFormData] = useState({
    title: '',
    courseId: COURSES[0],
    duration: 60,
    passingScore: 70,
    published: false,
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    if (examId) {
      examService.getExam(examId).then(data => {
        if (data) {
          setFormData({
            title: data.title,
            courseId: (data.courseId as CourseType) || data.department,
            duration: data.duration,
            passingScore: data.passingScore,
            published: data.published || false,
            startDate: data.startDate?.toDate?.().toISOString().substring(0, 16) || '',
            endDate: data.endDate?.toDate?.().toISOString().substring(0, 16) || ''
          });
        }
        setFetching(false);
      });
    }
  }, [examId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const examData = {
        title: formData.title,
        department: formData.courseId as CourseType,
        courseId: formData.courseId,
        duration: formData.duration,
        passingScore: formData.passingScore,
        published: formData.published,
        startDate: formData.startDate ? new Date(formData.startDate) : null,
        endDate: formData.endDate ? new Date(formData.endDate) : null,
        active: true,
        status: formData.published ? 'active' : 'draft',
        createdBy: user.uid,
        creatorRole: (userData?.role as 'admin' | 'professor') || 'admin'
      };

      if (examId) {
        await examService.updateExam(examId, examData);
      } else {
        await examService.createExam({
          ...examData,
          totalQuestions: 0
        });
      }
      navigate('/admin/dashboard/exams');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="py-20 flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Preparing Form...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors text-xs font-bold uppercase tracking-widest"
      >
        <ArrowLeft className="w-4 h-4" /> Cancel
      </button>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        <div className="bg-[#0f172a] p-10 text-white relative">
          <h1 className="text-3xl font-black tracking-tighter uppercase italic">{examId ? 'Edit' : 'Create'} Exam</h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 italic">Standardized Examination Setup</p>
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-10">
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-indigo-600 mb-2">
               <Settings className="w-5 h-5" />
               <h3 className="text-xs font-black uppercase tracking-[0.2em]">Exam Details</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Exam Title</label>
                 <input 
                   required
                   type="text" 
                   value={formData.title}
                   onChange={e => setFormData({ ...formData, title: e.target.value })}
                   placeholder="e.g. Final Exam"
                   className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 text-sm font-bold placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500/20"
                 />
               </div>

               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Course Assignment</label>
                 <select 
                   value={formData.courseId}
                   onChange={e => setFormData({ ...formData, courseId: e.target.value as CourseType })}
                   className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none"
                 >
                   {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
               </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
             <div className="space-y-6">
                <div className="flex items-center gap-3 text-indigo-600 mb-2">
                   <Clock className="w-5 h-5" />
                   <h3 className="text-xs font-black uppercase tracking-[0.2em]">Temporal Constraints</h3>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Duration (Minutes)</label>
                   <input 
                     required
                     type="number" 
                     value={formData.duration}
                     onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                     className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                   />
                </div>
             </div>

             <div className="space-y-6">
                <div className="flex items-center gap-3 text-indigo-600 mb-2">
                   <Target className="w-5 h-5" />
                   <h3 className="text-xs font-black uppercase tracking-[0.2em]">Grading Matrix</h3>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Passing Threshold (%)</label>
                   <input 
                     required
                     type="number" 
                     value={formData.passingScore}
                     onChange={e => setFormData({ ...formData, passingScore: parseInt(e.target.value) })}
                     className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                   />
                </div>
             </div>
          </div>

          <div className="p-8 bg-slate-50 rounded-3xl space-y-6 border border-slate-100">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-slate-900">
                   <BookOpen className="w-5 h-5" />
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Publication Status</h3>
                </div>
                <button 
                  type="button"
                  onClick={() => setFormData({ ...formData, published: !formData.published })}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all relative",
                    formData.published ? "bg-emerald-500" : "bg-slate-300"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                    formData.published ? "left-7" : "left-1"
                  )}></div>
                </button>
             </div>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
               Note: Publishing makes this exam visible to all enrolled students within the selected course.
             </p>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-indigo-600 text-white rounded-2xl flex items-center justify-center gap-4 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 group"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6 group-hover:scale-110 transition-transform" />}
            <span className="text-xs font-black uppercase tracking-[0.3em] font-mono">Save Exam</span>
          </button>
        </form>
      </div>
    </div>
  );
}
