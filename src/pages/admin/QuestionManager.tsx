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
  Info
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { examService } from '../../services/examService';
import { Question, Exam } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function QuestionManager() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  
  const [formData, setFormData] = useState<Omit<Question, 'id'>>({
    examId: examId || '',
    text: '',
    type: 'mcq',
    options: ['', '', '', ''],
    correctAnswer: '',
    points: 10,
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
      explanation: q.explanation || ''
    });
    setEditingId(q.id);
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
    if (!confirm('Delete this question?')) return;
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
       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Loading Questions...</p>
     </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Question <span className="text-indigo-600">Editor</span></h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Design questions for {exam?.title}</p>
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
              explanation: ''
            });
            setEditingId('new');
          }}
          className="px-8 py-4 bg-indigo-600 text-white rounded-2xl flex items-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
        >
          <Plus className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Add Question</span>
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8 space-y-4">
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
                         <Settings2 className="w-4 h-4 text-indigo-600" /> Component Designer
                       </h3>
                       <button onClick={() => setEditingId(null)} className="p-2 text-slate-300 hover:text-slate-900"><X className="w-5 h-5" /></button>
                    </div>

                    <form onSubmit={handleSave} className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question Text</label>
                          <textarea 
                            required
                            value={formData.text}
                            onChange={e => setFormData({ ...formData, text: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                            rows={3}
                          />
                       </div>

                       <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</label>
                             <select 
                               value={formData.type}
                               onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                               className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none appearance-none"
                             >
                                <option value="mcq">Multiple Choice</option>
                                <option value="boolean">True / False</option>
                                <option value="short">Short Answer</option>
                             </select>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Points</label>
                             <input 
                               type="number" 
                               value={formData.points}
                               onChange={e => setFormData({ ...formData, points: parseInt(e.target.value) })}
                               className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none"
                             />
                          </div>
                       </div>

                       <div className="grid md:grid-cols-2 gap-6 pb-6 border-b border-slate-50">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Image URL (Optional)</label>
                             <input 
                               type="url" 
                               value={(formData as any).imageUrl || ''}
                               onChange={e => setFormData({ ...formData, imageUrl: e.target.value } as any)}
                               placeholder="Media component..."
                               className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none"
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Video URL (Optional)</label>
                             <input 
                               type="url" 
                               value={(formData as any).videoUrl || ''}
                               onChange={e => setFormData({ ...formData, videoUrl: e.target.value } as any)}
                               placeholder="Youtube URL..."
                               className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none"
                             />
                          </div>
                       </div>

                       {formData.type === 'mcq' && (
                         <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Options</label>
                            <div className="grid md:grid-cols-2 gap-4">
                               {formData.options.map((opt, i) => (
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
                                      className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none"
                                    />
                                    <button 
                                      type="button"
                                      onClick={() => setFormData({ ...formData, correctAnswer: opt })}
                                      className={cn(
                                        "w-11 h-11 rounded-xl border flex items-center justify-center transition-all",
                                        formData.correctAnswer === opt && opt !== '' ? "bg-emerald-500 text-white border-emerald-500" : "bg-slate-50 text-slate-300 border-slate-100"
                                      )}
                                    >
                                      <CheckCircle className="w-5 h-5" />
                                    </button>
                                 </div>
                               ))}
                            </div>
                         </div>
                       )}

                       {formData.type === 'boolean' && (
                         <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Correct Truth Value</label>
                            <div className="flex gap-4">
                               {['True', 'False'].map(val => (
                                 <button
                                   key={val}
                                   type="button"
                                   onClick={() => setFormData({ ...formData, correctAnswer: val })}
                                   className={cn(
                                     "flex-1 py-4 rounded-xl border-2 font-black uppercase tracking-widest text-[10px] transition-all",
                                     formData.correctAnswer === val ? "bg-emerald-50 border-emerald-500 text-emerald-600" : "bg-white border-slate-100 text-slate-300"
                                   )}
                                 >
                                   {val}
                                 </button>
                               ))}
                            </div>
                         </div>
                       )}

                       {formData.type === 'checkbox' && (
                         <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Multiple Options (Select Correct)</label>
                            <div className="grid md:grid-cols-2 gap-4">
                               {formData.options.map((opt, i) => (
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
                                      className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none"
                                    />
                                    <button 
                                      type="button"
                                      onClick={() => {
                                        const current = formData.correctAnswer.split(',').map(s => s.trim()).filter(Boolean);
                                        let next;
                                        if (current.includes(opt)) {
                                          next = current.filter(s => s !== opt).sort().join(',');
                                        } else {
                                          next = [...current, opt].sort().join(',');
                                        }
                                        setFormData({ ...formData, correctAnswer: next });
                                      }}
                                      className={cn(
                                        "w-11 h-11 rounded-xl border flex items-center justify-center transition-all",
                                        formData.correctAnswer.split(',').includes(opt) && opt !== '' ? "bg-indigo-600 text-white border-indigo-600" : "bg-slate-50 text-slate-300 border-slate-100"
                                      )}
                                    >
                                      <CheckCircle className="w-5 h-5" />
                                    </button>
                                 </div>
                               ))}
                            </div>
                         </div>
                       )}

                       {formData.type === 'identification' && (
                         <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Correct Identification Match</label>
                            <input 
                              required
                              type="text" 
                              value={formData.correctAnswer}
                              onChange={e => setFormData({ ...formData, correctAnswer: e.target.value })}
                              placeholder="Expected term..."
                              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 text-sm font-bold outline-none"
                            />
                         </div>
                       )}

                       {formData.type === 'short' && (
                         <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expected Exact Match Answer</label>
                            <input 
                              required
                              type="text" 
                              value={formData.correctAnswer}
                              onChange={e => setFormData({ ...formData, correctAnswer: e.target.value })}
                              placeholder="Required string sequence..."
                              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 text-sm font-bold outline-none"
                            />
                         </div>
                       )}

                       <button 
                         type="submit"
                         className="w-full py-4 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-100 flex items-center justify-center gap-3"
                       >
                          <Save className="w-4 h-4" /> Save Question
                       </button>
                    </form>
                 </motion.div>
               )}
            </AnimatePresence>

            <div className="space-y-4">
               {questions.map((q, i) => (
                 <div key={q.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                       <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-xs font-black text-indigo-600 border border-slate-100">
                             {i + 1}
                          </span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{q.type} shell</span>
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
                    
                    <div className="flex flex-wrap gap-2">
                       {q.options?.map((opt, oi) => (
                         <span key={oi} className={cn(
                           "px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest border",
                           opt === q.correctAnswer ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
                         )}>
                            {opt}
                         </span>
                       ))}
                       {q.type === 'short' && (
                         <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest">
                           Key: {q.correctAnswer}
                         </span>
                       )}
                    </div>
                 </div>
               ))}

               {questions.length === 0 && !editingId && (
                 <div className="py-20 text-center text-slate-300 italic font-medium uppercase tracking-widest text-[10px] border-2 border-dashed border-slate-50 rounded-3xl">
                   No assessing components assigned to this protocol.
                 </div>
               )}
            </div>
         </div>

         <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#0f172a] rounded-3xl p-8 text-white relative overflow-hidden">
               <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6 italic">Assessment Summary</h3>
               <div className="space-y-4 relative z-10">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest border-b border-white/5 pb-3">
                     <span className="text-slate-500">Frequency Rate</span>
                     <span>{questions.length} Units</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest border-b border-white/5 pb-3">
                     <span className="text-slate-500">Total Points</span>
                     <span className="text-indigo-400">{questions.reduce((acc, q) => acc + q.points, 0)} Pts</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest pt-3">
                     <span className="text-slate-500">Status</span>
                     <span className={cn(
                       "flex items-center gap-2",
                       exam?.published ? "text-emerald-400" : "text-amber-400"
                     )}>
                       {exam?.published ? 'Operational' : 'Simulated'}
                     </span>
                  </div>
               </div>
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-6">
               <div className="flex items-center gap-3 text-slate-900">
                  <Info className="w-5 h-5" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Designer Tip</h3>
               </div>
               <p className="text-xs text-slate-500 leading-relaxed italic">
                 Ensure each question has exactly one correct answer defined. MCQ options should be unique and distinct to avoid verification overlap.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}
