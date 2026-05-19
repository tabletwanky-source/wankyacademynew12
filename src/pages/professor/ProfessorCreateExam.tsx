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
import { examService } from '../../services/examService';
import { Exam, CourseType } from '../../types';
import { useAuth } from '../../context/AuthContext';

export default function ProfessorCreateExam() {
  const { examId } = useParams();
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!examId);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 60,
    passingScore: 70,
    attemptsAllowed: 2,
    instructions: '',
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
            description: data.description || '',
            duration: data.duration,
            passingScore: data.passingScore,
            attemptsAllowed: data.attemptsAllowed || 2,
            instructions: data.instructions || '',
            published: data.published || false,
            startDate: data.startDate?.toDate ? data.startDate.toDate().toISOString().substring(0, 16) : (data.startDate?.substring(0, 16) || ''),
            endDate: data.endDate?.toDate ? data.endDate.toDate().toISOString().substring(0, 16) : (data.endDate?.substring(0, 16) || '')
          });
        }
        setFetching(false);
      });
    }
  }, [examId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.department) return;
    setLoading(true);

    try {
      const examData: any = {
        title: formData.title,
        description: formData.description,
        duration: formData.duration,
        passingScore: formData.passingScore,
        attemptsAllowed: formData.attemptsAllowed,
        instructions: formData.instructions,
        published: formData.published,
        department: userData.department,
        createdBy: userData.uid,
        creatorRole: userData.role as 'admin' | 'professor'
      };

      if (examId) {
        await examService.updateExam(examId, examData);
      } else {
        await examService.createExam({
          ...examData,
          totalQuestions: 0,
          active: true
        });
      }
      navigate('/professor/dashboard/exams');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="py-20 flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Chargement...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors text-xs font-bold uppercase tracking-widest"
      >
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="bg-[#0f172a] p-10 text-white relative">
          <h1 className="text-3xl font-bold tracking-tight uppercase italic">{examId ? 'Édition' : 'Création'} d'Examen</h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 italic">Département: {userData?.department}</p>
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-10">
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-indigo-600 mb-2">
               <Settings className="w-5 h-5" />
               <h3 className="text-xs font-black uppercase tracking-[0.2em]">Détails de l'Examen</h3>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Titre de l'Examen</label>
              <input 
                required
                type="text" 
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Examen Final - Module 1"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 text-sm font-bold placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Description</label>
              <textarea 
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brève description de l'examen..."
                rows={2}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 text-sm font-bold placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Instructions pour l'étudiant</label>
              <textarea 
                value={formData.instructions}
                onChange={e => setFormData({ ...formData, instructions: e.target.value })}
                placeholder="Instructions que l'étudiant verra avant de commencer..."
                rows={3}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 text-sm font-bold placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
             <div className="space-y-6">
                <div className="flex items-center gap-3 text-indigo-600 mb-2">
                   <Clock className="w-5 h-5" />
                   <h3 className="text-xs font-black uppercase tracking-[0.2em]">Temps Alloué</h3>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Durée (Minutes)</label>
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
                   <h3 className="text-xs font-black uppercase tracking-[0.2em]">Notation</h3>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Seuil de passage (%)</label>
                   <input 
                     required
                     type="number" 
                     value={formData.passingScore}
                     onChange={e => setFormData({ ...formData, passingScore: parseInt(e.target.value) })}
                     className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                   />
                </div>
             </div>

             <div className="space-y-6">
                <div className="flex items-center gap-3 text-indigo-600 mb-2">
                   <Settings className="w-5 h-5" />
                   <h3 className="text-xs font-black uppercase tracking-[0.2em]">Tentatives</h3>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nombre de tentatives</label>
                   <input 
                     required
                     type="number" 
                     value={formData.attemptsAllowed}
                     onChange={e => setFormData({ ...formData, attemptsAllowed: parseInt(e.target.value) })}
                     className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                   />
                </div>
             </div>
          </div>

          <div className="p-8 bg-slate-50 rounded-3xl space-y-4 border border-slate-100">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-slate-900">
                   <BookOpen className="w-5 h-5" />
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Statut de Publication</h3>
                </div>
                <button 
                  type="button"
                  onClick={() => setFormData({ ...formData, published: !formData.published })}
                  className={`w-14 h-7 rounded-full transition-all relative ${formData.published ? "bg-emerald-500" : "bg-slate-300"}`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${formData.published ? "left-8" : "left-1"}`}></div>
                </button>
             </div>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
               Note: La publication rend l'examen visible pour tous les étudiants du département {userData?.department}.
             </p>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-[#0f172a] text-white rounded-2xl flex items-center justify-center gap-4 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
            <span className="text-xs font-black uppercase tracking-[0.3em]">Enregistrer l'Examen</span>
          </button>
        </form>
      </div>
    </div>
  );
}
