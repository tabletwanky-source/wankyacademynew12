import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Calendar, 
  Loader2, 
  Search, 
  BookOpen, 
  PlusCircle,
  Save,
  Clock,
  ExternalLink,
  ClipboardList,
  ChevronRight
} from 'lucide-react';
import { learningService } from '../../services/learningService';
import { Homework as HomeworkType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import Modal from '../../components/common/Modal';
import { motion, AnimatePresence } from 'motion/react';
import ProfessorSubmissionManager from './ProfessorSubmissionManager';

export default function ProfessorHomework() {
  const { userData } = useAuth();
  const [homework, setHomework] = useState<HomeworkType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHomeworkForSubmissions, setSelectedHomeworkForSubmissions] = useState<HomeworkType | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    maxPoints: 100,
    fileUrl: ''
  });

  useEffect(() => {
    if (userData?.department) {
      loadHomework();
    }
  }, [userData]);

  const loadHomework = async () => {
    setLoading(true);
    try {
      const data = await learningService.getHomeworkByDepartment(userData!.department);
      setHomework(data);
    } catch (err) {
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.department) return;
    setSubmitting(true);
    try {
      await learningService.addHomework({
        ...formData,
        department: userData.department,
        professorUid: userData.uid
      });
      toast.success('Devoir assigné avec succès !');
      setIsModalOpen(false);
      setFormData({ title: '', description: '', dueDate: '', maxPoints: 100, fileUrl: '' });
      loadHomework();
    } catch (err) {
      toast.error('Erreur lors de l\'assignation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce devoir ?')) return;
    try {
      await learningService.deleteHomework(id);
      setHomework(homework.filter(h => h.id !== id));
      toast.success('Devoir supprimé');
    } catch (err) {
      toast.error('Erreur de suppression');
    }
  };

  const filteredHomework = homework.filter(h => 
    h.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedHomeworkForSubmissions) {
    return (
      <ProfessorSubmissionManager 
        homework={selectedHomeworkForSubmissions}
        onBack={() => setSelectedHomeworkForSubmissions(null)}
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Travaux Pratiques & Devoirs</h1>
          <p className="text-slate-500 mt-1">Assignez des travaux et projets aux étudiants de {userData?.department}.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-auto px-6 py-3.5 bg-[#0f172a] text-white rounded-xl flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
        >
          <PlusCircle className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-widest text-[#cbd5e1] font-mono">Assigner un Devoir</span>
        </button>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center border-b border-slate-50 pb-6">
          <div className="relative group w-full md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Rechercher un devoir..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-slate-50 border border-slate-200 pl-11 pr-4 py-3 rounded-xl text-sm w-full outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100">
            <ClipboardList className="w-3.5 h-3.5" />
            {homework.length} Travaux Assignés
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Récupération des travaux...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredHomework.map((h) => (
                <motion.div 
                  layout
                  key={h.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="group bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg transition-all hover:bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
                >
                  <div className="flex items-center gap-5 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-slate-200">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-slate-900 truncate italic uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{h.title}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                          <Clock className="w-3 h-3 text-red-500" /> Date Limite: {h.dueDate}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                          <BookOpen className="w-3 h-3 text-emerald-500" /> Max: {h.maxPoints} pts
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end sm:justify-start">
                    {h.fileUrl && (
                      <a 
                        href={h.fileUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                        title="Document Source"
                      >
                         <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button 
                      onClick={() => handleDelete(h.id)}
                      className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="w-[1px] h-6 bg-slate-100 mx-1 hidden sm:block"></div>
                    <button 
                      onClick={() => setSelectedHomeworkForSubmissions(h)}
                      className="px-5 py-3 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm flex items-center gap-2"
                    >
                       Soumissions <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredHomework.length === 0 && (
              <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center gap-4">
                <FileText className="w-12 h-12 text-slate-200" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Aucun devoir enregistré pour ce département</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nouvelle Assignation"
      >
        <form onSubmit={handleCreate} className="space-y-6">
           <div className="space-y-4">
              <label className="block space-y-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Intitulé du travail</span>
                <input 
                  required
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-300"
                  placeholder="Ex: TP1 - Algorithmique de base"
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block space-y-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Date d'échéance</span>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      required
                      type="date" 
                      value={formData.dueDate}
                      onChange={e => setFormData({...formData, dueDate: e.target.value})}
                      className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </div>
                </label>
                <label className="block space-y-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Points Maximum</span>
                  <input 
                    required
                    type="number" 
                    value={formData.maxPoints}
                    onChange={e => setFormData({...formData, maxPoints: parseInt(e.target.value)})}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                  />
                </label>
              </div>

              <label className="block space-y-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">URL du document (Facultatif)</span>
                <input 
                  type="url" 
                  value={formData.fileUrl}
                  onChange={e => setFormData({...formData, fileUrl: e.target.value})}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm italic focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                  placeholder="Lien vers le PDF ou énoncé..."
                />
              </label>

              <label className="block space-y-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Instructions</span>
                <textarea 
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                  placeholder="Détaillez les consignes pour ce travail..."
                ></textarea>
              </label>
           </div>

           <button
             type="submit"
             disabled={submitting}
             className="w-full py-5 bg-[#0f172a] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
           >
             {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
             ASSIGNER LE TRAVAIL
           </button>
        </form>
      </Modal>
    </div>
  );
}
