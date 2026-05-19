import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  PlayCircle, 
  FileText, 
  CheckCircle, 
  ChevronRight, 
  ChevronDown,
  Loader2,
  Video,
  Download,
  ExternalLink,
  BookOpen,
  Layout,
  Clock,
  Award
} from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { curriculumService } from '../../services/curriculumService';
import { Curriculum, Module, Lesson } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import ReactMarkdown from 'react-markdown';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function CurriculumViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  useEffect(() => {
    if (!id) return;
    
    const fetchCurriculum = async () => {
      const data = await curriculumService.getCurriculum(id);
      if (data) {
        setCurriculum(data);
        // Expand first module by default
        if (data.modules && data.modules.length > 0) {
          setExpandedModules([data.modules[0].id]);
          if (data.modules[0].lessons.length > 0) {
            setActiveLesson(data.modules[0].lessons[0]);
          }
        }
      }
      setLoading(false);
    };

    fetchCurriculum();
  }, [id]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) ? prev.filter(m => m !== moduleId) : [...prev, moduleId]
    );
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
    </div>
  );

  if (!curriculum) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-4">
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500">
         <ArrowLeft className="w-10 h-10" />
      </div>
      <h2 className="text-xl font-black text-slate-900 uppercase italic">Curriculum Not Found</h2>
      <button onClick={() => navigate(-1)} className="text-indigo-600 font-bold uppercase tracking-widest text-[10px]">Return to Dashboard</button>
    </div>
  );

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar - Navigation */}
      <div className="lg:w-96 bg-white border-r border-slate-200 flex flex-col h-full lg:h-screen shrink-0">
         <div className="p-8 border-b border-slate-50 shrink-0">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors mb-6 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Syllabus
            </button>
            <h1 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-tight">{curriculum.title}</h1>
            <div className="flex items-center gap-4 mt-3">
               <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 px-2 py-0.5 bg-indigo-50 rounded-md">
                 {curriculum.department}
               </span>
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                 {curriculum.totalLessons} Lessons
               </span>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
            {curriculum.modules?.map((module, mIdx) => (
              <div key={module.id} className="space-y-2">
                 <button 
                   onClick={() => toggleModule(module.id)}
                   className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl group transition-all"
                 >
                    <div className="flex items-center gap-4">
                       <span className="text-[10px] font-black text-slate-300">{(mIdx + 1).toString().padStart(2, '0')}</span>
                       <span className="text-xs font-black text-slate-900 uppercase tracking-tight text-left group-hover:text-indigo-600">{module.title}</span>
                    </div>
                    {expandedModules.includes(module.id) ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                 </button>

                 <AnimatePresence>
                    {expandedModules.includes(module.id) && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden space-y-1 pl-12"
                      >
                         {module.lessons.map((lesson) => (
                           <button
                             key={lesson.id}
                             onClick={() => setActiveLesson(lesson)}
                             className={cn(
                               "w-full text-left p-3 rounded-xl transition-all flex items-center justify-between group",
                               activeLesson?.id === lesson.id 
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                                : "text-slate-500 hover:bg-white hover:text-indigo-600"
                             )}
                           >
                              <div className="flex items-center gap-3">
                                 {lesson.videoUrl ? <PlayCircle className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                 <span className="text-[11px] font-bold">{lesson.title}</span>
                              </div>
                              {activeLesson?.id === lesson.id && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>}
                           </button>
                         ))}
                      </motion.div>
                    )}
                 </AnimatePresence>
              </div>
            ))}
         </div>
      </div>

      {/* Main Content Viewer */}
      <div className="flex-1 overflow-y-auto bg-white min-h-0 flex flex-col">
         {activeLesson ? (
           <>
              {/* Media Part */}
              {activeLesson.videoUrl && (
                <div className="aspect-video bg-slate-900 shrink-0">
                  {/* Simple embed logic */}
                  <iframe 
                    className="w-full h-full"
                    src={(() => {
                      if (!activeLesson.videoUrl) return null;
                      if (activeLesson.videoType === 'youtube' || activeLesson.videoUrl.includes('youtube.com')) {
                        const id = activeLesson.videoUrl.split('v=')[1]?.split('&')[0] || activeLesson.videoUrl.split('/').pop();
                        return `https://www.youtube.com/embed/${id}`;
                      }
                      if (activeLesson.videoType === 'vimeo' || activeLesson.videoUrl.includes('vimeo.com')) {
                        const id = activeLesson.videoUrl.split('/').pop();
                        return `https://player.vimeo.com/video/${id}`;
                      }
                      return activeLesson.videoUrl;
                    })()}
                    title={activeLesson.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}

              {/* Content Part */}
              <div className="p-8 lg:p-16 max-w-4xl">
                 <div className="flex items-center gap-4 mb-8">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 border-b-2 border-indigo-600 pb-1 italic">
                      Lesson {activeLesson.order}
                    </span>
                    <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">{activeLesson.title}</h2>
                 </div>

                 <div className="prose prose-slate max-w-none prose-sm lg:prose-base font-sans leading-relaxed text-slate-600 italic font-medium">
                    <ReactMarkdown>{activeLesson.content || 'Select a topic to start learning...'}</ReactMarkdown>
                 </div>

                 {/* Resources / Links */}
                 {(activeLesson.resources?.length || 0) > 0 && (
                   <div className="mt-12 pt-12 border-t border-slate-100">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Learning Assets</h4>
                      <div className="grid sm:grid-cols-2 gap-4">
                         {activeLesson.resources?.map((res, i) => (
                           <a 
                             key={i}
                             href={res.url}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between group hover:bg-indigo-600 hover:border-indigo-600 transition-all"
                           >
                              <div className="flex items-center gap-3">
                                 <FileText className="w-5 h-5 text-slate-400 group-hover:text-white" />
                                 <span className="text-xs font-bold text-slate-700 group-hover:text-white">{res.name}</span>
                              </div>
                              <Download className="w-4 h-4 text-slate-300 group-hover:text-white" />
                           </a>
                         ))}
                      </div>
                   </div>
                 )}

                 {/* Homework/Exams integration placeholders */}
                 <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activeLesson.homeworkId && (
                       <Link to="/dashboard/homework" className="p-6 bg-amber-50 border border-amber-100 rounded-3xl flex flex-col gap-4 group">
                          <Clock className="w-8 h-8 text-amber-500" />
                          <div>
                            <h4 className="text-sm font-black text-slate-900 uppercase italic">Homework Due</h4>
                            <p className="text-[10px] text-amber-700 font-bold uppercase tracking-widest">Linked to this lesson</p>
                          </div>
                       </Link>
                    )}
                    {activeLesson.examId && (
                       <Link to="/dashboard/exams" className="p-6 bg-emerald-50 border border-emerald-100 rounded-3xl flex flex-col gap-4 group">
                          <Award className="w-8 h-8 text-emerald-500" />
                          <div>
                            <h4 className="text-sm font-black text-slate-900 uppercase italic">Evaluation Ready</h4>
                            <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-widest">Linked to this module</p>
                          </div>
                       </Link>
                    )}
                 </div>
              </div>
           </>
         ) : (
           <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
              <div className="w-32 h-32 bg-slate-50 rounded-[3rem] flex items-center justify-center text-slate-200">
                 <Layout className="w-16 h-16" />
              </div>
              <h3 className="text-xl font-black text-slate-300 uppercase tracking-widest italic animate-pulse">Select a Lesson to Begin</h3>
              <p className="text-xs text-slate-400 max-w-xs font-medium italic">Navigate through the syllabus on the left to start your training session.</p>
           </div>
         )}
      </div>
    </div>
  );
}
