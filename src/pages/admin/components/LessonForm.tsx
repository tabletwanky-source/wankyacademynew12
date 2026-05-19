import React, { useState } from 'react';
import { X, Loader2, Video, FileText, Link as LinkIcon, Type, Hash } from 'lucide-react';
import { motion } from 'motion/react';
import { Lesson } from '../../../types';
import { toast } from 'sonner';

interface LessonFormProps {
  onClose: () => void;
  onSave: (lesson: Lesson) => void;
  initialLesson: Lesson | null;
  order: number;
}

export default function LessonForm({ onClose, onSave, initialLesson, order }: LessonFormProps) {
  const [formData, setFormData] = useState<Lesson>({
    id: initialLesson?.id || Date.now().toString(),
    title: initialLesson?.title || '',
    content: initialLesson?.content || '',
    videoUrl: initialLesson?.videoUrl || '',
    videoType: initialLesson?.videoType || 'youtube',
    order: initialLesson?.order || order,
    resources: initialLesson?.resources || []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return toast.error('Le titre est requis');
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[70] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden font-sans border-t-8 border-indigo-600"
      >
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
           <div>
              <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">
                {initialLesson ? 'Edit Lesson' : 'Add New Lesson'}
              </h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-0.5">Content Configuration</p>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-all"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar bg-white">
           <div className="grid grid-cols-4 gap-4">
              <div className="col-span-3 space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                   <Type className="w-3 h-3" /> Lesson Title
                 </label>
                 <input 
                   value={formData.title}
                   onChange={e => setFormData({...formData, title: e.target.value})}
                   className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                   placeholder="Basic Introduction"
                   required
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Hash className="w-3 h-3" /> Order
                 </label>
                 <input 
                   type="number"
                   value={formData.order}
                   onChange={e => setFormData({...formData, order: parseInt(e.target.value)})}
                   className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                 />
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <FileText className="w-3 h-3" /> Lesson Content (Markdown compatible)
              </label>
              <textarea 
                value={formData.content}
                onChange={e => setFormData({...formData, content: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 min-h-[150px] font-mono"
                placeholder="Write your lesson content here..."
              />
           </div>

           <div className="space-y-4 pt-4 border-t border-slate-50">
              <div className="flex items-center justify-between">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Video className="w-3 h-3" /> Video Content
                 </label>
                 <select 
                   value={formData.videoType}
                   onChange={e => setFormData({...formData, videoType: e.target.value as any})}
                   className="bg-transparent text-[10px] font-black uppercase tracking-widest text-indigo-600 outline-none"
                 >
                    <option value="youtube">YouTube</option>
                    <option value="vimeo">Vimeo</option>
                    <option value="storage">Direct Link</option>
                 </select>
              </div>
              <div className="relative">
                 <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                 <input 
                   value={formData.videoUrl}
                   onChange={e => setFormData({...formData, videoUrl: e.target.value})}
                   className="w-full bg-slate-50 border border-slate-100 pl-11 pr-4 py-3 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                   placeholder="Enter video URL..."
                 />
              </div>
           </div>

           <div className="pt-6">
              <button 
                type="submit"
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-900 transition-all font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-100 hover:shadow-slate-200"
              >
                {initialLesson ? 'Update Lesson Config' : 'Activate Lesson'}
              </button>
           </div>
        </form>
      </motion.div>
    </div>
  );
}
