import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  CheckCircle, 
  Type, 
  List, 
  MoreVertical,
  Loader2,
  Settings2,
  ChevronDown,
  Info,
  ArrowLeft,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  Video as VideoIcon
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { examService } from '../../services/examService';
import { uploadImage } from '../../utils/upload';
import { Question, Exam } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function ProfessorQuestionManager() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState<Omit<Question, 'id'>>({
    examId: examId || '',
    text: '',
    type: 'mcq',
    options: ['', '', '', ''],
    correctAnswer: '',
    points: 10,
    imageUrl: '',
    videoUrl: '',
    explanation: ''
  });

  useEffect(() => {
    if (!examId) return;
    fetchData();
  }, [examId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [examData, qData] = await Promise.all([
        examService.getExam(examId!),
        examService.getExamQuestions(examId!)
      ]);
      setExam(examData);
      setQuestions(qData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (q: Question) => {
    setFormData({
      examId: q.examId,
      text: q.text,
      type: q.type,
      options: q.options || ['', '', '', ''],
      correctAnswer: q.correctAnswer,
      points: q.points,
      imageUrl: q.imageUrl || '',
      videoUrl: q.videoUrl || '',
      explanation: q.explanation || ''
    });
    setEditingId(q.id);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !examId) return;

    setUploading(true);
    try {
      const path = `exams/${examId}/questions/${Date.now()}_${file.name}`;
      const url = await uploadImage(file, path);
      setFormData(prev => ({ ...prev, imageUrl: url }));
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Échec du téléchargement de l\'image');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examId) return;

    try {
      if (editingId === 'new') {
        await examService.addQuestion(formData);
      } else if (editingId) {
        await examService.updateQuestion(editingId, formData);
      }
      
      setEditingId(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette question ?')) return;
    try {
      await examService.deleteQuestion(id, examId!);
      setQuestions(questions.filter(q => q.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
     <div className="py-20 flex flex-col items-center justify-center gap-4">
       <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chargement des questions...</p>
     </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <button 
            onClick={() => navigate('/professor/dashboard/exams')}
            className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors text-xs font-bold uppercase tracking-widest mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Retour aux Examens
          </button>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Espace <span className="text-indigo-600 italic">Questions</span></h1>
          <p className="text-slate-500 mt-1">Conception des épreuves pour: <span className="font-bold text-slate-700 italic">{exam?.title}</span></p>
        </div>
        <button 
          onClick={() => {
            setFormData({
              examId: examId!,
              text: '',
              type: 'mcq',
              options: ['', '', '', ''],
              correctAnswer: '',
              points: 10,
              explanation: '',
              imageUrl: '',
              videoUrl: ''
            });
            setEditingId('new');
          }}
          className="px-6 py-3.5 bg-[#0f172a] text-white rounded-xl flex items-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
        >
          <Plus className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-widest">Ajouter Question</span>
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
         <div className="lg:col-span-12 space-y-4">
            <AnimatePresence>
               {editingId && (
                 <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: 20 }}
                   className="bg-white rounded-3xl border-2 border-indigo-500 shadow-2xl p-8 mb-8 space-y-6"
                 >
                    <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                       <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                         <Settings2 className="w-4 h-4 text-indigo-600" /> ÉDITEUR DE COMPOSANT
                       </h3>
                       <button onClick={() => setEditingId(null)} className="p-2 text-slate-300 hover:text-slate-900"><X className="w-5 h-5" /></button>
                    </div>

                    <form onSubmit={handleSave} className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Texte de la Question</label>
                          <textarea 
                            required
                            value={formData.text}
                            onChange={e => setFormData({ ...formData, text: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            rows={3}
                          />
                       </div>

                       <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Type de Réponse</label>
                             <select 
                               value={formData.type}
                               onChange={e => setFormData({ ...formData, type: e.target.value as any, correctAnswer: '' })}
                               className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm font-bold outline-none appearance-none"
                             >
                                <option value="mcq">Choix Multiple (QCM)</option>
                                <option value="boolean">Vrai / Faux</option>
                                <option value="short">Réponse Courte</option>
                                <option value="identification">Identification (Image)</option>
                                <option value="checkbox">Cases à Cocher (Multi-réponses)</option>
                             </select>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Points</label>
                             <input 
                               type="number" 
                               value={formData.points}
                               onChange={e => setFormData({ ...formData, points: parseInt(e.target.value) })}
                               className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                             />
                          </div>
                       </div>

                       <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Image de la Question</label>
                             <div className="grid grid-cols-1 gap-4">
                                <div className="relative">
                                   <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                   <input 
                                     type="text"
                                     value={formData.imageUrl}
                                     onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                     placeholder="URL de l'image..."
                                     className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                                   />
                                </div>
                                <div className="relative">
                                   <input 
                                     type="file"
                                     id="q-image-upload"
                                     className="hidden"
                                     accept="image/*"
                                     onChange={handleImageUpload}
                                   />
                                   <label 
                                     htmlFor="q-image-upload"
                                     className={cn(
                                       "w-full flex items-center justify-center gap-3 px-4 py-4 rounded-xl border-2 border-dashed cursor-pointer transition-all h-[54px]",
                                       uploading ? "bg-slate-50 border-slate-200" : "bg-indigo-50/30 border-indigo-200 hover:border-indigo-400 text-indigo-600"
                                     )}
                                   >
                                      {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Upload className="w-5 h-5" /><span className="text-xs font-bold uppercase tracking-widest">Upload Image</span></>}
                                   </label>
                                </div>
                             </div>
                          </div>

                          <div className="space-y-4">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Vidéo (YouTube/URL)</label>
                             <div className="relative">
                                <VideoIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                  type="text"
                                  value={formData.videoUrl}
                                  onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
                                  placeholder="URL Vidéo (YouTube, etc.)..."
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                                />
                             </div>
                          </div>
                       </div>

                       {(formData.imageUrl || formData.videoUrl) && (
                          <div className="grid md:grid-cols-2 gap-4">
                             {formData.imageUrl && (
                                <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                                   <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                   <button 
                                     type="button" 
                                     onClick={() => setFormData({ ...formData, imageUrl: '' })}
                                     className="absolute top-4 right-4 p-2 bg-white/90 rounded-lg text-red-500"
                                   >
                                      <X className="w-4 h-4" />
                                   </button>
                                </div>
                             )}
                             {formData.videoUrl && (
                                <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 flex items-center justify-center p-4">
                                   <div className="text-center text-white">
                                      <VideoIcon className="w-8 h-8 mx-auto mb-2 text-indigo-400" />
                                      <p className="text-[8px] font-black uppercase tracking-widest truncate max-w-full px-4">{formData.videoUrl}</p>
                                   </div>
                                   <button 
                                     type="button" 
                                     onClick={() => setFormData({ ...formData, videoUrl: '' })}
                                     className="absolute top-4 right-4 p-2 bg-white/90 rounded-lg text-red-500"
                                   >
                                      <X className="w-4 h-4" />
                                   </button>
                                </div>
                             )}
                          </div>
                       )}

                       {(formData.type === 'mcq' || formData.type === 'checkbox') && (
                          <div className="space-y-4">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                                {formData.type === 'mcq' ? 'Options de Réponse (Unique)' : 'Options de Réponse (Multiples)'}
                             </label>
                             <div className="grid md:grid-cols-2 gap-4">
                                {formData.options.map((opt, i) => {
                                  const isSelected = formData.type === 'mcq' 
                                    ? formData.correctAnswer === opt && opt !== ''
                                    : formData.correctAnswer.split(',').includes(opt) && opt !== '';

                                  const handleToggle = () => {
                                    if (formData.type === 'mcq') {
                                      setFormData({ ...formData, correctAnswer: opt });
                                    } else {
                                      const current = formData.correctAnswer.split(',').filter(Boolean);
                                      if (current.includes(opt)) {
                                        setFormData({ ...formData, correctAnswer: current.filter(x => x !== opt).join(',') });
                                      } else {
                                        setFormData({ ...formData, correctAnswer: [...current, opt].join(',') });
                                      }
                                    }
                                  };

                                  return (
                                    <div key={i} className="flex gap-2">
                                       <input 
                                         required
                                         type="text" 
                                         value={opt}
                                         onChange={e => {
                                           const newOpts = [...formData.options];
                                           newOpts[i] = e.target.value;
                                           setFormData({ ...formData, options: newOpts });
                                         }}
                                         placeholder={`Option ${i+1}`}
                                         className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none"
                                       />
                                       <button 
                                         type="button"
                                         onClick={handleToggle}
                                         className={cn(
                                           "w-12 h-12 rounded-xl border flex items-center justify-center transition-all",
                                           isSelected ? "bg-emerald-500 text-white border-emerald-500" : "bg-slate-50 text-slate-300 border-slate-200"
                                         )}
                                       >
                                         <CheckCircle className="w-5 h-5" />
                                       </button>
                                    </div>
                                  );
                                })}
                             </div>
                          </div>
                       )}

                       {formData.type === 'boolean' && (
                          <div className="space-y-4">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Réponse Correcte</label>
                             <div className="flex gap-4">
                                {['True', 'False'].map(val => (
                                  <button
                                    key={val}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, correctAnswer: val })}
                                    className={cn(
                                      "flex-1 py-4 rounded-xl border-2 font-bold uppercase tracking-widest text-xs transition-all",
                                      formData.correctAnswer === val ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-white border-slate-200 text-slate-300"
                                    )}
                                  >
                                    {val === 'True' ? 'VRAI' : 'FAUX'}
                                  </button>
                                ))}
                             </div>
                          </div>
                       )}

                       {(formData.type === 'short' || formData.type === 'identification') && (
                          <div className="space-y-4">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Réponse Attendue (Exacte)</label>
                             <input 
                               required
                               type="text" 
                               value={formData.correctAnswer}
                               onChange={e => setFormData({ ...formData, correctAnswer: e.target.value })}
                               placeholder="Entrez la réponse textuelle..."
                               className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                             />
                          </div>
                       )}

                       <button 
                         type="submit"
                         className="w-full py-5 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-indigo-100 flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all font-black italic"
                       >
                          <Save className="w-5 h-5" /> ENREGISTRER LA QUESTION
                       </button>
                    </form>
                 </motion.div>
               )}
            </AnimatePresence>

            <div className="space-y-4">
               {questions.map((q, i) => (
                 <div key={q.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                       <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-xs font-black text-white">
                             {i + 1}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{q.type}</span>
                       </div>
                       <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEdit(q)}
                            className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                          >
                             <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(q.id)}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                          >
                             <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                    <p className="text-sm font-bold text-slate-900 mb-6 italic">{q.text}</p>
                    
                    <div className="flex gap-4 mb-4">
                       {q.imageUrl && (
                         <div className="flex-1 aspect-video rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
                           <img src={q.imageUrl} alt="Question" className="w-full h-full object-cover" />
                         </div>
                       )}
                       {q.videoUrl && (
                         <div className="flex-1 aspect-video rounded-xl overflow-hidden border border-slate-100 bg-slate-900 flex flex-col items-center justify-center">
                            <VideoIcon className="w-8 h-8 text-indigo-400 mb-2" />
                            <p className="text-[8px] text-white font-bold opacity-50 px-4 text-center truncate w-full">{q.videoUrl}</p>
                         </div>
                       )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                       {q.options?.map((opt, oi) => {
                         const isCorrect = q.type === 'checkbox' 
                           ? q.correctAnswer.split(',').includes(opt)
                           : opt === q.correctAnswer;

                         return (
                           <span key={oi} className={cn(
                             "px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest border",
                             isCorrect && opt !== '' ? "bg-emerald-50 text-emerald-600 border-emerald-500" : "bg-slate-50 text-slate-400 border-slate-200"
                           )}>
                              {opt}
                           </span>
                         );
                       })}
                       {(q.type === 'short' || q.type === 'identification' || q.type === 'boolean') && (
                         <span className="bg-emerald-50 text-emerald-600 border border-emerald-500 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest">
                           Réponse: {q.correctAnswer}
                         </span>
                       )}
                    </div>
                 </div>
               ))}

               {questions.length === 0 && !editingId && (
                 <div className="py-20 text-center text-slate-300 italic font-medium uppercase tracking-widest text-[10px] border-2 border-dashed border-slate-200 rounded-3xl">
                   Aucune question n'a encore été ajoutée à cet examen.
                 </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
