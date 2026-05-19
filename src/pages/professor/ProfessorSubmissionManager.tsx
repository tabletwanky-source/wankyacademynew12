import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  Loader2, 
  User, 
  Search, 
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Trophy,
  Filter,
  ArrowLeft
} from 'lucide-react';
import { learningService } from '../../services/learningService';
import { notificationService } from '../../services/notificationService';
import { Homework, HomeworkSubmission } from '../../types';
import { toast } from 'sonner';
import Modal from '../../components/common/Modal';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';

interface ProfessorSubmissionManagerProps {
  homework: Homework;
  onBack: () => void;
}

export default function ProfessorSubmissionManager({ homework, onBack }: ProfessorSubmissionManagerProps) {
  const { userData } = useAuth();
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const [selectedSubmission, setSelectedSubmission] = useState<HomeworkSubmission | null>(null);
  const [gradingModalOpen, setGradingModalOpen] = useState(false);
  const [gradingData, setGradingData] = useState({
    grade: 0,
    feedback: ''
  });
  const [isGrading, setIsGrading] = useState(false);

  useEffect(() => {
    const unsub = learningService.subscribeSubmissionsByHomework(homework.id, (data) => {
      setSubmissions(data);
      setLoading(false);
    });
    return () => unsub();
  }, [homework.id]);

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;
    
    setIsGrading(true);
    try {
      await learningService.gradeSubmission(selectedSubmission.id, {
        grade: gradingData.grade,
        feedback: gradingData.feedback,
        status: 'graded'
      });

      // Send notification to student
      await notificationService.sendNotification({
        userId: selectedSubmission.studentUid,
        title: 'Devoir Noté',
        message: `Votre travail "${homework.title}" a été corrigé. Note: ${gradingData.grade}/${homework.maxPoints || 100}. Feedback: ${gradingData.feedback.substring(0, 50)}...`,
        type: 'homework'
      });

      toast.success('Note enregistrée avec succès !');
      setGradingModalOpen(false);
      setSelectedSubmission(null);
    } catch (err) {
      toast.error('Erreur lors de la notation');
    } finally {
      setIsGrading(false);
    }
  };

   const isLate = (submittedAt: any) => {
     if (!submittedAt || !homework.dueDate) return false;
     const subDate = submittedAt.toDate ? submittedAt.toDate() : new Date(submittedAt);
     const dueDate = new Date(homework.dueDate);
     // Set due date to end of day
     dueDate.setHours(23, 59, 59, 999);
     return subDate > dueDate;
   };

   const filteredSubmissions = submissions.filter(s => {
    const matchesSearch = s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         s.studentCode?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status !== 'graded').length,
    average: submissions.length > 0 ? 
      Math.round(submissions.reduce((acc, s) => acc + (s.grade || 0), 0) / (submissions.filter(s => s.status === 'graded').length || 1)) : 0
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
           <button 
             onClick={onBack}
             className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"
           >
             <ArrowLeft className="w-5 h-5" />
           </button>
           <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight italic uppercase">{homework.title}</h1>
              <p className="text-slate-500 mt-1 uppercase text-[10px] font-black tracking-widest flex items-center gap-2">
                <FileText className="w-3 h-3" /> Management des Soumissions
              </p>
           </div>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
             <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-black italic">{stats.total}</div>
             <div className="text-[9px] uppercase font-black text-slate-400 tracking-widest leading-tight">Total<br/>Submiss.</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
             <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 font-black italic">{stats.pending}</div>
             <div className="text-[9px] uppercase font-black text-slate-400 tracking-widest leading-tight">En Attente<br/>Corr.</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
             <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 font-black italic">{stats.average}%</div>
             <div className="text-[9px] uppercase font-black text-slate-400 tracking-widest leading-tight">Moyenne<br/>Générale</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center border-b border-slate-50 pb-6">
          <div className="relative group w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Chercher étudiant ou code..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-slate-50 border border-slate-200 pl-11 pr-4 py-3.5 rounded-xl text-sm w-full outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
             <div className="relative w-full md:w-48">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select 
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="bg-slate-50 border border-slate-200 pl-11 pr-4 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest w-full outline-none focus:ring-2 focus:ring-indigo-500/10"
                >
                  <option value="all">Tous Statuts</option>
                  <option value="submitted">Soumis</option>
                  <option value="graded">Notés</option>
                  <option value="late">En Retard</option>
                </select>
             </div>
          </div>
        </div>

        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-6">
             <div className="relative">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                </div>
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Traitement des Soumissions...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatePresence>
              {filteredSubmissions.map((s, i) => (
                <motion.div 
                  key={s.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group bg-white rounded-[2rem] border border-slate-100 p-8 hover:shadow-2xl transition-all hover:bg-slate-50/50 flex flex-col gap-6 relative overflow-hidden"
                >
                   <div className="flex justify-between items-start relative z-10">
                      <div className="flex items-center gap-4">
                         <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shrink-0 group-hover:rotate-6 transition-transform shadow-xl shadow-slate-200">
                            <User className="w-7 h-7" />
                         </div>
                         <div>
                            <h3 className="font-black text-slate-900 italic uppercase tracking-tight group-hover:text-indigo-600 transition-colors text-lg">{s.studentName}</h3>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{s.studentCode || 'WA-STUDENT-ID'}</p>
                         </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                         {isLate(s.submittedAt) && (
                           <span className="text-[8px] font-black px-2 py-0.5 bg-red-100 text-red-600 rounded-md uppercase tracking-tighter animate-pulse">LATE / RETARD</span>
                         )}
                         <span className={`text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest italic border ${
                            s.status === 'graded' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                            'bg-amber-50 text-amber-600 border-amber-100'
                         }`}>
                           {s.status === 'graded' ? `Noté: ${s.grade}/${homework.maxPoints || 100}` : 'En Attente de Correction'}
                         </span>
                         <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tight flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-200" /> {s.submittedAt?.toDate ? s.submittedAt.toDate().toLocaleDateString() : 'Date inconnue'}
                         </span>
                      </div>
                   </div>

                   <div className="bg-slate-100/50 p-6 rounded-2xl border border-slate-200/30 flex flex-col gap-3 relative z-10">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic mb-1">Rendu de l'étudiant</p>
                      {s.submissionText && (
                        <p className="text-xs text-slate-700 italic leading-relaxed line-clamp-3">"{s.submissionText}"</p>
                      )}
                      {(s.fileUrl || s.attachmentUrl) && (
                        <a 
                          href={s.fileUrl || s.attachmentUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl text-indigo-600 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                        >
                           <ExternalLink className="w-4 h-4" />
                           <span className="text-[10px] font-black uppercase tracking-widest">Voir le document source</span>
                        </a>
                      )}
                   </div>

                   <div className="pt-4 border-t border-slate-100 flex justify-between items-center relative z-10">
                      <button 
                        onClick={() => {
                          setSelectedSubmission(s);
                          setGradingData({
                            grade: s.grade || 0,
                            feedback: s.feedback || ''
                          });
                          setGradingModalOpen(true);
                        }}
                        className="flex-1 max-w-[200px] py-4 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                      >
                         <Trophy className="w-4 h-4" />
                         {s.status === 'graded' ? 'Modifier la Note' : 'Noter le Travail'}
                      </button>

                      {s.feedback && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg border border-slate-100">
                           <MessageSquare className="w-3 h-3 text-slate-400" />
                           <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Commentaire ajouté</span>
                        </div>
                      )}
                   </div>

                   <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform"></div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredSubmissions.length === 0 && (
              <div className="col-span-full py-32 text-center border-2 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center gap-6">
                <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-100">
                  <FileText className="w-12 h-12" />
                </div>
                <div className="space-y-1">
                   <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-300 italic">📭 Aucune soumission trouvée</p>
                   <p className="text-[9px] font-bold text-slate-200 uppercase">En attente des premiers envois étudiants...</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal
        isOpen={gradingModalOpen}
        onClose={() => setGradingModalOpen(false)}
        title="Notation & Feedback"
      >
        <form onSubmit={handleGrade} className="space-y-8 p-2">
           <div className="bg-[#0f172a] p-8 rounded-3xl text-white relative overflow-hidden">
              <div className="relative z-10">
                 <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 italic">Étudiant</p>
                 <h3 className="text-2xl font-black italic tracking-tighter uppercase">{selectedSubmission?.studentName}</h3>
                 <p className="text-[10px] font-bold text-slate-400 mt-1">{selectedSubmission?.studentCode}</p>
              </div>
              <Trophy className="absolute -bottom-4 -right-4 w-32 h-32 text-white opacity-[0.03]" />
           </div>

           <div className="space-y-6">
              <label className="block space-y-3">
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Note sur {homework.maxPoints || 100}</span>
                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{gradingData.grade}%</span>
                 </div>
                 <div className="relative">
                    <Trophy className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      required
                      type="number" 
                      min="0"
                      max={homework.maxPoints || 100}
                      value={gradingData.grade}
                      onChange={e => setGradingData({...gradingData, grade: parseInt(e.target.value)})}
                      className="w-full p-5 pl-12 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-black italic focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                    />
                 </div>
              </label>

              <label className="block space-y-3">
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Commentaires & Recommandations</span>
                 <textarea 
                    rows={6}
                    value={gradingData.feedback}
                    onChange={e => setGradingData({...gradingData, feedback: e.target.value})}
                    placeholder="Détaillez vos remarques pour aider l'étudiant à progresser..."
                    className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2rem] text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none italic leading-relaxed"
                 ></textarea>
              </label>
           </div>

           <div className="flex flex-col sm:flex-row gap-4">
              <button 
                 type="button" 
                 onClick={() => setGradingModalOpen(false)}
                 className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all italic"
              >
                 Annuler
              </button>
              <button
                type="submit"
                disabled={isGrading}
                className="flex-[2] py-5 bg-[#0f172a] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-3 italic"
              >
                {isGrading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                SAUVEGARDER LA NOTE
              </button>
           </div>
        </form>
      </Modal>
    </div>
  );
}
