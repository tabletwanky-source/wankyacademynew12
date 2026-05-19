import React, { useState, useEffect } from 'react';
import { 
  PlayCircle, 
  FileText, 
  CheckCircle, 
  Clock,
  Loader2,
  Calendar,
  Film,
  Download,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  BookOpen,
  Send,
  MessageSquare,
  Link as LinkIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { learningService } from '../../services/learningService';
import { notificationService } from '../../services/notificationService';
import { Video, Homework, HomeworkSubmission } from '../../types';
import ProfessorContact from '../../components/common/ProfessorContact';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { toast } from 'sonner';
import Modal from '../../components/common/Modal';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function LearningHub() {
  const { studentData } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'lessons' | 'assignments'>('lessons');
  
  // Submission State
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionData, setSubmissionData] = useState({
    attachmentUrl: '',
    comment: ''
  });

  useEffect(() => {
    if (!studentData) return;
    
    const unsubVideos = learningService.subscribeVideosByDepartment(studentData.department, (data) => {
      setVideos(data);
      if (loading && activeTab === 'lessons') setLoading(false);
    });

    const unsubHomework = learningService.subscribeHomeworkByDepartment(studentData.department, (data) => {
      setHomework(data);
    });

    const unsubSubmissions = learningService.subscribeStudentSubmissions(studentData.uid, (data) => {
      setSubmissions(data);
      setLoading(false);
    });

    return () => {
      unsubVideos();
      unsubHomework();
      unsubSubmissions();
    };
  }, [studentData]);

  const handleSubmitHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentData || !selectedHomework) return;
    
    setSubmitting(true);
    try {
      await learningService.submitHomework({
        homeworkId: selectedHomework.id,
        studentUid: studentData.uid,
        studentName: studentData.fullName,
        studentCode: studentData.studentCode || studentData.studentId,
        department: studentData.department,
        submissionText: submissionData.comment,
        fileUrl: submissionData.attachmentUrl,
        status: 'submitted'
      });

      // Notify the professor
      if (selectedHomework.professorUid) {
        await notificationService.sendNotification({
          userId: selectedHomework.professorUid,
          title: 'Nouvelle Soumission',
          message: `${studentData.fullName} a soumis son travail pour "${selectedHomework.title}".`,
          type: 'homework'
        });
      }

      toast.success('Travail soumis avec succès !');
      setIsSubmitModalOpen(false);
      setSubmissionData({ attachmentUrl: '', comment: '' });
      setSelectedHomework(null);
    } catch (err) {
      toast.error('Erreur lors de la soumission');
    } finally {
      setSubmitting(false);
    }
  };

  const getSubmission = (hwId: string) => submissions.find(s => s.homeworkId === hwId);
  
  const isLate = (submittedAt: any, dueDateStr: string) => {
    if (!submittedAt || !dueDateStr) return false;
    const subDate = submittedAt.toDate ? submittedAt.toDate() : new Date(submittedAt);
    const dueDate = new Date(dueDateStr);
    dueDate.setHours(23, 59, 59, 999);
    return subDate > dueDate;
  };

  if (loading) return (
    <div className="py-20 flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Synchronisation du programme...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="bg-[#0f172a] rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
             <span className="px-3 py-1 bg-indigo-600/30 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/20 italic">
               Espace Étudiant
             </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight italic uppercase">{studentData?.department}</h1>
          <p className="text-slate-400 mt-2 text-sm italic font-medium">Contenu pédagogique et exercices pratiques.</p>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
      </div>

      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 w-fit shadow-sm">
         <button 
          onClick={() => setActiveTab('lessons')}
          className={cn(
            "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
            activeTab === 'lessons' ? "bg-[#0f172a] text-white shadow-lg shadow-slate-200" : "text-slate-400 hover:text-slate-900"
          )}
         >
           Leçons Vidéo
         </button>
         <button 
          onClick={() => setActiveTab('assignments')}
          className={cn(
            "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
            activeTab === 'assignments' ? "bg-[#0f172a] text-white shadow-lg shadow-slate-200" : "text-slate-400 hover:text-slate-900"
          )}
         >
           Travaux & Devoirs
         </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'lessons' ? (
          <motion.div 
            key="lessons"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {videos.map((v) => (
              <div key={v.id} className="group bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-2xl transition-all h-full flex flex-col">
                <div className="aspect-video bg-slate-100 relative overflow-hidden">
                   {v.thumbnail && v.thumbnail !== "" ? (
                     <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Film className="w-12 h-12" />
                     </div>
                   )}
                   <Link 
                    to={`/dashboard/video/${v.id}`}
                    className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-[2px]"
                   >
                      <PlayCircle className="w-16 h-16 fill-white/20" />
                   </Link>
                   <div className="absolute top-4 left-4 px-2 py-1 bg-white/90 rounded text-[9px] font-black uppercase tracking-widest text-[#0f172a] backdrop-blur-sm">
                      Vidéo
                   </div>
                   <div className="absolute bottom-4 right-4 px-2 py-1 bg-slate-900/80 rounded text-[10px] font-bold text-white backdrop-blur-sm">
                      {v.duration}
                   </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-bold text-slate-900 mb-2 italic group-hover:text-indigo-600 transition-colors uppercase tracking-tight line-clamp-1">{v.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4 flex-1 italic">{v.description || "Consultez cette leçon vidéo pour approfondir vos connaissances sur le module."}</p>
                  
                  {v.createdBy && (
                    <div className="mb-4">
                       <ProfessorContact professorUid={v.createdBy} variant="compact" />
                    </div>
                  )}

                  <Link 
                    to={`/dashboard/video/${v.id}`}
                    className="flex items-center justify-between py-4 border-t border-slate-50 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:tracking-[0.2em] transition-all"
                  >
                    Suivre le cours <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
            {videos.length === 0 && (
              <div className="col-span-full py-24 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                 <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest italic">Aucune leçon vidéo disponible pour le moment.</p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="assignments"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {homework.map((h) => {
              const submission = getSubmission(h.id);
              return (
                <div key={h.id} className="space-y-4">
                  <div className="group bg-white rounded-3xl border border-slate-200 p-8 hover:shadow-2xl transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative overflow-hidden">
                    <div className="flex items-center gap-6 flex-1 min-w-0 relative z-10">
                      <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white shrink-0 group-hover:rotate-6 transition-transform shadow-xl shadow-slate-200">
                        <FileText className="w-8 h-8" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors italic uppercase tracking-tighter text-xl">{h.title}</h3>
                          {submission && (
                            <div className="flex flex-col gap-1">
                              <span className={cn(
                                "text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border italic",
                                submission.status === 'graded' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                              )}>
                                {submission.status === 'graded' ? `Noté: ${submission.grade}/${h.maxPoints || 100}` : 'En Attente'}
                              </span>
                              {isLate(submission.submittedAt, h.dueDate) && (
                                <span className="text-[7px] font-black text-red-500 uppercase tracking-widest text-center italic">Soumis en retard</span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 italic font-mono">
                            <Clock className="w-4 h-4 text-red-500" /> Échéance: {h.dueDate}
                          </span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 italic font-mono">
                            <BookOpen className="w-4 h-4 text-emerald-500" /> Score Max: {h.maxPoints} pts
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto relative z-10">
                      {h.fileUrl && (
                        <a 
                          href={h.fileUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-4 bg-slate-100 text-slate-600 hover:text-white hover:bg-slate-900 rounded-2xl transition-all shadow-sm"
                          title="Télécharger l'énoncé"
                        >
                          <Download className="w-5 h-5" />
                        </a>
                      )}
                      <button 
                        disabled={!!submission && submission.status === 'graded'}
                        onClick={() => {
                          setSelectedHomework(h);
                          setIsSubmitModalOpen(true);
                          if (submission) {
                            setSubmissionData({
                              attachmentUrl: submission.fileUrl || submission.attachmentUrl || '',
                              comment: submission.submissionText || ''
                            });
                          }
                        }}
                        className={cn(
                          "flex-1 md:flex-none px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 italic shadow-xl shadow-slate-200",
                          submission ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-[#0f172a] text-white hover:bg-slate-800"
                        )}
                      >
                        {submission ? (
                          <><CheckCircle className="w-4 h-4 text-emerald-500" /> Travail Soumis</>
                        ) : (
                          <>Soumettre <ChevronRight className="w-3 h-3" /></>
                        )}
                      </button>
                    </div>
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform"></div>
                  </div>
                  
                  {submission && submission.feedback && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="ml-8 md:ml-16 bg-white border-l-4 border-indigo-500 p-6 rounded-r-3xl shadow-sm space-y-3"
                    >
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-indigo-500" />
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest italic">Commentaire du Professeur</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed italic">"{submission.feedback}"</p>
                    </motion.div>
                  )}
                </div>
              );
            })}
            {homework.length === 0 && (
              <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                 <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest italic">Aucun travail personnel assigné pour le moment.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Soumettre mon travail"
      >
        <form onSubmit={handleSubmitHomework} className="space-y-6">
           <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-6">
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1 italic">Devoir sélectionné</p>
              <h3 className="font-bold text-slate-900">{selectedHomework?.title}</h3>
           </div>

           <div className="space-y-4">
              <label className="block space-y-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Lien de mon travail (Google Drive, Dropbox, etc.)</span>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    required
                    type="url" 
                    value={submissionData.attachmentUrl}
                    onChange={e => setSubmissionData({...submissionData, attachmentUrl: e.target.value})}
                    className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-xl text-sm italic focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                    placeholder="https://drive.google.com/..."
                  />
                </div>
              </label>

              <label className="block space-y-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Commentaire (Facultatif)</span>
                <textarea 
                  rows={4}
                  value={submissionData.comment}
                  onChange={e => setSubmissionData({...submissionData, comment: e.target.value})}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                  placeholder="Notes supplémentaires pour le professeur..."
                ></textarea>
              </label>
           </div>

           <button
             type="submit"
             disabled={submitting}
             className="w-full py-5 bg-[#0f172a] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
           >
             {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
             ENVOYER MA SOUMISSION
           </button>
        </form>
      </Modal>
    </div>
  );
}
