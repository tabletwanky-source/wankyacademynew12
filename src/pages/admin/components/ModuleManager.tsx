import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  GripVertical, 
  Loader2, 
  Trash2, 
  Edit, 
  ChevronDown, 
  ChevronUp,
  FileText,
  Video,
  ExternalLink,
  BookOpen,
  Layout,
  LayoutList
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Curriculum, Module, Lesson } from '../../../types';
import { curriculumService } from '../../../services/curriculumService';
import { toast } from 'sonner';
import LessonForm from './LessonForm';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ModuleManagerProps {
  curriculum: Curriculum;
  onClose: () => void;
}

export default function ModuleManager({ curriculum, onClose }: ModuleManagerProps) {
  const [modules, setModules] = useState<Module[]>(curriculum.modules || []);
  const [loading, setLoading] = useState(false);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [isLessonFormOpen, setIsLessonFormOpen] = useState<{ moduleId: string, lesson: Lesson | null } | null>(null);

  const toggleModule = (id: string) => {
    setExpandedModules(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const addModule = () => {
    const newModule: Module = {
      id: Date.now().toString(),
      title: 'New Module',
      order: modules.length + 1,
      lessons: []
    };
    setModules([...modules, newModule]);
  };

  const removeModule = (id: string) => {
    if (!confirm('Eliminate this entire module?')) return;
    setModules(modules.filter(m => m.id !== id));
  };

  const updateModuleTitle = (id: string, title: string) => {
    setModules(modules.map(m => m.id === id ? { ...m, title } : m));
  };

  const saveAll = async () => {
    setLoading(true);
    try {
      await curriculumService.saveModules(curriculum.id, modules);
      toast.success('Modules & Lessons sync successful');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Sync failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLesson = (moduleId: string, lesson: Lesson) => {
    setModules(prev => prev.map(m => {
      if (m.id !== moduleId) return m;
      
      const existingLessonIndex = m.lessons.findIndex(l => l.id === lesson.id);
      let newLessons = [...m.lessons];
      
      if (existingLessonIndex > -1) {
        newLessons[existingLessonIndex] = lesson;
      } else {
        newLessons.push(lesson);
      }
      
      return { ...m, lessons: newLessons.sort((a, b) => a.order - b.order) };
    }));
    setIsLessonFormOpen(null);
  };

  const removeLesson = (moduleId: string, lessonId: string) => {
    if (!confirm('Eliminate this lesson?')) return;
    setModules(prev => prev.map(m => {
      if (m.id !== moduleId) return m;
      return { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) };
    }));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden font-sans border-4 border-slate-100 h-[90vh] flex flex-col"
      >
        <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-white shrink-0">
           <div>
              <div className="flex items-center gap-3 mb-1">
                 <div className="p-2 bg-indigo-600 rounded-lg text-white">
                    <LayoutList className="w-5 h-5" />
                 </div>
                 <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">
                   Curriculum Builder
                 </h2>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-11">
                {curriculum.title} • {curriculum.department}
              </p>
           </div>
           <button onClick={onClose} className="p-4 hover:bg-slate-50 rounded-2xl transition-all"><X className="w-6 h-6" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-6 custom-scrollbar bg-slate-50/30">
           {modules.map((m, mIdx) => (
             <div key={m.id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                <div className="p-5 flex items-center justify-between gap-4 border-b border-slate-50">
                   <div className="flex items-center gap-4 flex-1">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                         {mIdx + 1}
                      </div>
                      <input 
                        value={m.title}
                        onChange={e => updateModuleTitle(m.id, e.target.value)}
                        placeholder="Module Title..."
                        className="bg-transparent text-sm font-black uppercase tracking-tight outline-none w-full focus:text-indigo-600 transition-colors"
                      />
                   </div>
                   <div className="flex items-center gap-2">
                      <button 
                         onClick={() => toggleModule(m.id)}
                         className="p-2 hover:bg-slate-50 rounded-lg transition-all"
                      >
                         {expandedModules.includes(m.id) ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                      <button 
                         onClick={() => removeModule(m.id)}
                         className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                         <Trash2 className="w-5 h-5" />
                      </button>
                   </div>
                </div>

                <AnimatePresence>
                   {expandedModules.includes(m.id) && (
                     <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                     >
                        <div className="p-6 space-y-3 bg-slate-50/50">
                           {m.lessons.map((lesson) => (
                             <div key={lesson.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                   <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                      {lesson.videoUrl ? <Video className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                   </div>
                                   <div>
                                      <p className="text-xs font-bold text-slate-900">{lesson.title}</p>
                                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Lesson {lesson.order}</p>
                                   </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <button 
                                     onClick={() => setIsLessonFormOpen({ moduleId: m.id, lesson })}
                                     className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg"
                                   >
                                      <Edit className="w-4 h-4" />
                                   </button>
                                   <button 
                                     onClick={() => removeLesson(m.id, lesson.id)}
                                     className="p-2 text-slate-300 hover:text-red-500 rounded-lg"
                                   >
                                      <Trash2 className="w-4 h-4" />
                                   </button>
                                </div>
                             </div>
                           ))}
                           <button 
                             onClick={() => setIsLessonFormOpen({ moduleId: m.id, lesson: null })}
                             className="w-full py-4 bg-white border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center justify-center gap-3"
                           >
                              <Plus className="w-4 h-4" />
                              Add Lesson to this Module
                           </button>
                        </div>
                     </motion.div>
                   )}
                </AnimatePresence>
             </div>
           ))}

           <button 
             onClick={addModule}
             className="w-full py-6 bg-slate-900 text-white rounded-3xl text-sm font-black uppercase tracking-[0.2em] italic flex items-center justify-center gap-4 hover:scale-[1.01] active:scale-100 transition-all shadow-xl shadow-slate-200"
           >
              <Layout className="w-6 h-6" />
              Add New Syllabus Module
           </button>
        </div>

        <div className="p-8 border-t border-slate-50 bg-white shrink-0">
           <button 
             onClick={saveAll}
             disabled={loading}
             className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-xl shadow-indigo-100"
           >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <BookOpen className="w-6 h-6" />}
              Synchronize Curriculum Assets
           </button>
        </div>

        {isLessonFormOpen && (
          <LessonForm 
            onClose={() => setIsLessonFormOpen(null)}
            onSave={(lesson) => handleSaveLesson(isLessonFormOpen.moduleId, lesson)}
            initialLesson={isLessonFormOpen.lesson}
            order={isLessonFormOpen.lesson?.order || (modules.find(m => m.id === isLessonFormOpen.moduleId)?.lessons.length || 0) + 1}
          />
        )}
      </motion.div>
    </div>
  );
}
