import React, { useState } from 'react';
import { X, Loader2, Camera, Info, Type, Users, Briefcase, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { Curriculum, CourseType, Professor } from '../../../types';
import { curriculumService } from '../../../services/curriculumService';
import { toast } from 'sonner';
import { useAuth } from '../../../context/AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CurriculumFormProps {
  curriculum: Curriculum | null;
  professors: Professor[];
  onClose: () => void;
}

export default function CurriculumForm({ curriculum, professors, onClose }: CurriculumFormProps) {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: curriculum?.title || '',
    description: curriculum?.description || '',
    department: curriculum?.department || 'Informatique' as CourseType,
    thumbnail: curriculum?.thumbnail || '',
    difficulty: curriculum?.difficulty || 'Beginner',
    duration: curriculum?.duration || '',
    assignedProfessor: curriculum?.assignedProfessor || '',
    status: curriculum?.status || 'draft' as any,
    published: curriculum?.published || false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return toast.error('Le titre est requis');
    
    setLoading(true);
    try {
      const selectedProf = professors.find(p => p.uid === formData.assignedProfessor);
      const payload = {
        ...formData,
        professorName: selectedProf?.fullName || '',
        published: formData.status === 'published'
      };

      if (curriculum) {
        await curriculumService.updateCurriculum(curriculum.id, payload as any);
        toast.success('Curriculum mis à jour');
      } else {
        await curriculumService.createCurriculum({
          ...payload,
          createdBy: userData?.uid || '',
          creatorRole: 'admin',
          modules: []
        } as any);
        toast.success('Curriculum créé');
      }
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden font-sans"
      >
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
           <div>
              <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">
                {curriculum ? 'Modify Curriculum' : 'New Curriculum'}
              </h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">General Program Settings</p>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-all"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
           {/* Basic Info */}
           <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                   <Type className="w-3 h-3" /> Title
                 </label>
                 <input 
                   name="title"
                   value={formData.title}
                   onChange={e => setFormData({...formData, title: e.target.value})}
                   className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                   placeholder="e.g., Intro to Web Dev"
                   required
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                   <Briefcase className="w-3 h-3" /> Department
                 </label>
                 <select 
                   value={formData.department}
                   onChange={e => setFormData({...formData, department: e.target.value as CourseType})}
                   className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                 >
                   <option value="Informatique">Informatique</option>
                   <option value="Technique Informatique">Technique Informatique</option>
                   <option value="Auto École">Auto École</option>
                 </select>
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Info className="w-3 h-3" /> Description
              </label>
              <textarea 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 min-h-[100px]"
                placeholder="Briefly describe what students will learn..."
              />
           </div>

           <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                   <Users className="w-3 h-3" /> Assigned Professor
                 </label>
                 <select 
                   value={formData.assignedProfessor}
                   onChange={e => setFormData({...formData, assignedProfessor: e.target.value})}
                   className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                 >
                   <option value="">Select a Professor</option>
                   {professors.map(p => (
                     <option key={p.uid} value={p.uid}>{p.fullName}</option>
                   ))}
                 </select>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                   <Clock className="w-3 h-3" /> Duration / Difficulty
                 </label>
                 <div className="grid grid-cols-2 gap-2">
                    <input 
                      value={formData.duration}
                      onChange={e => setFormData({...formData, duration: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="e.g., 4 Weeks"
                    />
                    <select 
                      value={formData.difficulty}
                      onChange={e => setFormData({...formData, difficulty: e.target.value as any})}
                      className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                 </div>
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Camera className="w-3 h-3" /> Thumbnail URL
              </label>
              <input 
                value={formData.thumbnail}
                onChange={e => setFormData({...formData, thumbnail: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="https://images.unsplash.com/..."
              />
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</label>
              <div className="flex gap-4">
                 {['draft', 'published', 'archived'].map(s => (
                   <button
                     key={s}
                     type="button"
                     onClick={() => setFormData({...formData, status: s as any})}
                     className={cn(
                       "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                       formData.status === s 
                        ? "bg-indigo-600 text-white border-indigo-600" 
                        : "bg-white text-slate-400 border-slate-100 hover:bg-slate-50"
                     )}
                   >
                     {s}
                   </button>
                 ))}
              </div>
           </div>

           <div className="pt-6">
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#0f172a] text-white rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-100 transition-all font-black uppercase tracking-widest shadow-xl shadow-slate-200 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Info className="w-5 h-5" />}
                {curriculum ? 'Update Curriculum' : 'Initialize Curriculum'}
              </button>
           </div>
        </form>
      </motion.div>
    </div>
  );
}
