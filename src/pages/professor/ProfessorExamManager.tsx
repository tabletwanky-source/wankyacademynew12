import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Settings, 
  Trash2, 
  Eye, 
  BarChart2, 
  CheckCircle, 
  XCircle, 
  Clock,
  ChevronRight,
  Loader2,
  MoreVertical,
  Search,
  Filter,
  Calendar
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { examService } from '../../services/examService';
import { studentService } from '../../services/studentService';
import { notificationService } from '../../services/notificationService';
import { Exam, CourseType, Student } from '../../types';
import Modal from '../../components/common/Modal';
import { UserPlus, Send, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function ProfessorExamManager() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Assignment State
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [selectedStudentUid, setSelectedStudentUid] = useState<string>('');
  const [dueDate, setDueDate] = useState('');
  const [attemptsAllowed, setAttemptsAllowed] = useState(2);
  const [assignmentType, setAssignmentType] = useState<'individual' | 'department'>('individual');

  useEffect(() => {
    if (userData?.department) {
      const unsubscribe = studentService.subscribeStudentsByDepartment(userData.department, setStudents);
      return unsubscribe;
    }
  }, [userData]);

  useEffect(() => {
    if (userData?.department) {
      const unsubscribe = examService.subscribeExamsByDepartment(userData.department, (data) => {
        setExams(data);
        setLoading(false);
      });
      return unsubscribe;
    }
  }, [userData]);

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet examen ?')) return;
    try {
      await examService.deleteExam(id);
      setExams(exams.filter(e => e.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const togglePublish = async (exam: Exam) => {
    try {
      await examService.updateExam(exam.id, { published: !exam.published });
      setExams(exams.map(e => e.id === exam.id ? { ...e, published: !e.published } : e));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDuplicate = async (exam: Exam) => {
    try {
      setLoading(true);
      const { id, createdAt, ...data } = exam;
      await examService.createExam({
        ...data,
        title: `${exam.title} (Copie)`,
        published: false
      });
      toast.success('Examen dupliqué avec succès');
    } catch (err) {
      toast.error('Erreur lors de la duplication');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedExam || !userData) return;
    if (assignmentType === 'individual' && !selectedStudentUid) return;
    
    setAssigning(true);
    try {
      const assignmentData = {
        examId: selectedExam.id,
        assignedTo: assignmentType === 'individual' ? selectedStudentUid : 'all',
        department: userData.department,
        assignedBy: userData.uid,
        active: true,
        dueDate: dueDate ? new Date(dueDate) : null,
        attemptsAllowed: attemptsAllowed
      };

      await examService.assignExam(assignmentData);

      // Send notifications if individual
      if (assignmentType === 'individual') {
        await notificationService.sendNotification({
          userId: selectedStudentUid,
          title: 'New Exam Assigned',
          message: `Professor assigned you: ${selectedExam.title}`,
          type: 'exam'
        });
      }

      toast.success('Examen assigné avec succès !');
      setIsAssignModalOpen(false);
      setSelectedStudentUid('');
      setDueDate('');
      setAttemptsAllowed(2);
    } catch (err) {
      toast.error('Erreur lors de l\'assignation');
    } finally {
      setAssigning(false);
    }
  };

  const filteredExams = exams.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Gestion des Examens</h1>
          <p className="text-slate-500 mt-1">Département: <span className="font-bold text-indigo-600 uppercase tracking-widest text-[10px]">{userData?.department}</span></p>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            to="create"
            className="px-6 py-3.5 bg-indigo-600 text-white rounded-xl flex items-center gap-3 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            <Plus className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Nouvel Examen</span>
          </Link>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
           <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest italic bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
             <Filter className="w-3.5 h-3.5" />
             Filtre Actif: {userData?.department}
           </div>
          <div className="relative group w-full md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Rechercher un examen..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-slate-50 border border-slate-200 pl-11 pr-4 py-3 rounded-xl text-sm w-full outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chargement des examens...</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredExams.map((exam) => (
              <motion.div 
                layout
                key={exam.id}
                className="group relative bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase italic">{exam.title}</h3>
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                          exam.published ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
                        )}>
                          {exam.published ? 'Publié' : 'Brouillon'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> {exam.duration}m
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5" /> Seuil: {exam.passingScore}%
                        </span>
                        <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                        <span className="text-[9px] font-mono text-indigo-400 font-bold uppercase">{exam.totalQuestions || 0} Questions</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => togglePublish(exam)}
                      className={cn(
                        "p-2 rounded-lg transition-colors border",
                        exam.published ? "text-emerald-500 bg-emerald-50 border-emerald-100" : "text-slate-300 bg-slate-50 border-slate-100"
                      )}
                      title={exam.published ? 'Dépublier' : 'Publier'}
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <Link 
                      to={`${exam.id}/questions`}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg border border-transparent hover:border-indigo-100 transition-all"
                      title="Gérer les questions"
                    >
                      <Settings className="w-5 h-5" />
                    </Link>
                    <button 
                      onClick={() => handleDuplicate(exam)}
                      className="p-2 text-slate-300 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all border border-transparent hover:border-amber-100"
                      title="Dupliquer"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(exam.id)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100"
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedExam(exam);
                        setIsAssignModalOpen(true);
                      }}
                      className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg border border-transparent hover:border-indigo-100 transition-all"
                      title="Assigner à un étudiant"
                    >
                      <UserPlus className="w-5 h-5" />
                    </button>
                    <div className="w-[1px] h-4 bg-slate-100 mx-2"></div>
                    <Link 
                      to={`${exam.id}/analytics`}
                      className="flex items-center gap-2 px-4 py-2 bg-[#0f172a] text-white rounded-xl hover:bg-slate-800 transition-all"
                    >
                      <BarChart2 className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Résultats</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredExams.length === 0 && (
              <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Aucun examen trouvé pour ce département.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assigner l'Examen"
      >
        <div className="space-y-6">
           <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                 <FileText className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-0.5 italic">Examen à assigner</p>
                 <h3 className="font-bold text-slate-900 uppercase tracking-tight">{selectedExam?.title}</h3>
              </div>
           </div>

           <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-2">
              <button 
                onClick={() => setAssignmentType('individual')}
                className={cn(
                  "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                  assignmentType === 'individual' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                Individuel
              </button>
              <button 
                onClick={() => setAssignmentType('department')}
                className={cn(
                  "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                  assignmentType === 'department' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                Départemental
              </button>
           </div>

           {assignmentType === 'individual' ? (
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Sélectionner un Étudiant</label>
                 <select 
                   value={selectedStudentUid}
                   onChange={e => setSelectedStudentUid(e.target.value)}
                   className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                 >
                   <option value="">-- Choisir un étudiant --</option>
                   {students.map(s => (
                     <option key={s.uid} value={s.uid}>{s.fullName} ({s.studentId})</option>
                   ))}
                 </select>
              </div>
           ) : (
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                 <p className="text-[10px] font-bold text-indigo-600 leading-relaxed italic">
                   Cet examen sera assigné à TOUS les étudiants inscrits au département <span className="font-black uppercase">{userData?.department}</span>.
                 </p>
              </div>
           )}

           <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Date Limite (Facultatif)</label>
                 <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      type="datetime-local"
                      value={dueDate}
                      onChange={e => setDueDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nombre de Tentatives</label>
                 <div className="relative">
                    <Plus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      type="number"
                      value={attemptsAllowed}
                      onChange={e => setAttemptsAllowed(parseInt(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                 </div>
              </div>
           </div>

           <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
              <p className="text-[10px] font-bold text-amber-600 leading-relaxed italic">
                {assignmentType === 'individual' 
                  ? "L'étudiant recevra une notification instantanée et l'examen apparaîtra dans son tableau de bord."
                  : "Une assignation globale sera créée pour tout le groupe."}
              </p>
           </div>

           <button
             onClick={handleAssign}
             disabled={assigning || (assignmentType === 'individual' && !selectedStudentUid)}
             className="w-full py-5 bg-[#0f172a] text-white rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] shadow-xl shadow-indigo-100 hover:bg-slate-900 transition-all disabled:opacity-50 flex items-center justify-center gap-3 italic group"
           >
             {assigning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
             INITIALISER L'ASSIGNATION
           </button>
        </div>
      </Modal>
    </div>
  );
}
