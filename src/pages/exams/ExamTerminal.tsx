import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  Loader2, 
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Maximize2,
  Lock,
  Flag
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { examService } from '../../services/examService';
import { certificateService } from '../../services/certificateService';
import { notificationService } from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';
import { Exam, Question } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export default function ExamTerminal() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { studentData } = useAuth();
  
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!examId || !studentData) return;

    const fetchData = async () => {
      try {
        const [examData, qData, progressObj] = await Promise.all([
          examService.getExam(examId),
          examService.getExamQuestions(examId),
          examService.getProgress(studentData.uid, examId)
        ]);

        if (examData) {
          setExam(examData);
          // Randomize questions
          setQuestions(shuffleArray(qData));
          setTimeLeft(examData.duration * 60);
          
          if (progressObj) {
            setAnswers(progressObj.answers);
            if (progressObj.currentQuestionIndex !== undefined) {
              setCurrentIndex(progressObj.currentQuestionIndex);
            }
          }
          
          // Check if student can still take this exam
          const canTake = await examService.canStudentTakeExam(studentData.uid, examId, studentData.department);
          if (!canTake) {
             const attempts = await examService.getAttempts(studentData.uid, examId);
             if (attempts.some(r => r.passed)) {
                alert("You have already passed this evaluation.");
             } else {
                alert("You have reached the maximum number of attempts for this evaluation.");
             }
             navigate('/dashboard/exams');
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [examId, studentData]);

  // Auto-save logic
  useEffect(() => {
    if (Object.keys(answers).length === 0 || !studentData || !examId || submitting) return;

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    
    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        await examService.saveProgress(studentData.uid, examId, answers, currentIndex);
      } catch (err) {
        console.error("Auto-save failed:", err);
      }
    }, 5000); // Save after 5 seconds of inactivity

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [answers, currentIndex, studentData, examId, submitting]);

  // Timer logic
  useEffect(() => {
    if (timeLeft <= 0 || loading || submitting) {
      if (timeLeft === 0 && !loading && !submitting) handleAutoSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === 300) { // 5 minutes
           alert("Protocol Warning: 05:00 minutes remaining. Ensure all critical data is finalized.");
        }
        if (prev === 60) { // 1 minute
           alert("CRITICAL WARNING: 01:00 minute remaining. Initializing pre-submission sequence.");
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, loading, submitting]);

  // Prevent Navigation/Copy logic
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
       e.preventDefault();
       e.returnValue = '';
    };

    const handleCopy = (e: ClipboardEvent) => e.preventDefault();
    const handlePaste = (e: ClipboardEvent) => e.preventDefault();
    const handleContext = (e: MouseEvent) => e.preventDefault();

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('contextmenu', handleContext);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('contextmenu', handleContext);
    };
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    const q = questions.find(q => q.id === questionId);
    if (q?.type === 'checkbox') {
      const currentAnswers = answers[questionId] ? answers[questionId].split(',').map(a => a.trim()).filter(Boolean) : [];
      if (currentAnswers.includes(answer)) {
        const newAnswers = currentAnswers.filter(a => a !== answer).sort().join(',');
        setAnswers(prev => ({ ...prev, [questionId]: newAnswers }));
      } else {
        const newAnswers = [...currentAnswers, answer].sort().join(',');
        setAnswers(prev => ({ ...prev, [questionId]: newAnswers }));
      }
    } else {
      setAnswers(prev => ({ ...prev, [questionId]: answer }));
    }
  };

  const handleAutoSubmit = () => {
    console.log("Time expired. Initializing auto-submission protocol.");
    handleSubmit();
  };

  const handleSubmit = async () => {
    if (!examId || !studentData || submitting) return;
    
    setSubmitting(true);
    try {
      // 1. Submit exam
      const res = await examService.submitExam(
        studentData.uid, 
        studentData.studentCode, 
        examId, 
        answers
      );
      
      // 2. Clear progress
      await examService.clearProgress(studentData.uid, examId);
      
      // 3. New: Check and generate certificate if 70% or more
      if ((res as any).percentage >= 70) {
        await certificateService.generateCertificate({
          studentUid: studentData.uid,
          studentName: studentData.fullName,
          studentId: studentData.studentId,
          department: studentData.department,
          examId: examId,
          examTitle: exam.title,
          score: (res as any).percentage,
          issuedBy: 'System'
        });

        await notificationService.sendNotification({
          userId: studentData.uid,
          title: 'Certificate Earned!',
          message: `Congratulations! You scored ${(res as any).percentage.toFixed(0)}% on ${exam.title} and earned a certificate.`,
          type: 'certificate'
        });
      }
      
      // 4. Exit fullscreen if active
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }

      navigate(`/dashboard/exams/results/${res.id}`);
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  if (loading) return (
     <div className="fixed inset-0 bg-[#0f172a] flex flex-col items-center justify-center gap-4 text-white p-10 text-center">
       <Loader2 className="w-12 h-12 animate-spin text-indigo-400" />
       <p className="text-[12px] font-black uppercase tracking-[0.4em] italic">Loading Assessment Content...</p>
     </div>
  );

  if (!exam || questions.length === 0) return <div className="p-20 text-center">Unable to load questions. Please contact support.</div>;

  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const progress = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div ref={containerRef} className="fixed inset-0 bg-slate-50 z-[9999] flex flex-col overflow-hidden select-none">
       {/* Terminal Header */}
       <header className="bg-[#0f172a] text-white p-6 md:px-12 flex justify-between items-center border-b border-white/5 relative h-24">
          <div className="flex items-center gap-8">
             <div className="hidden md:block">
                <h1 className="text-xl font-black italic tracking-tighter uppercase">{exam.title}</h1>
                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-0.5">Wanky Academy Online Examination System</p>
             </div>
             <div className="w-[1px] h-10 bg-white/10 hidden md:block"></div>
             <div className="flex flex-col items-start">
               <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Time Remaining</span>
               <div className={cn(
                 "flex items-center gap-3 font-mono text-2xl font-black",
                 timeLeft < 60 ? "text-red-500 animate-pulse" : "text-white"
               )}>
                  <Clock className="w-5 h-5" />
                  {formatTime(timeLeft)}
               </div>
             </div>
          </div>

          <div className="flex items-center gap-6">
             <button 
               onClick={toggleFullScreen}
               className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-colors"
               title="Toggle Fullscreen"
             >
                <Maximize2 className="w-5 h-5" />
             </button>
             <div className="hidden lg:flex flex-col items-end">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Connection Status</span>
                <span className="text-xs font-black text-emerald-400 font-mono italic">SECURE_CONNECTION_OK</span>
             </div>
             <button 
               onClick={handleSubmit}
               disabled={submitting}
               className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
             >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {submitting ? 'Submitting...' : 'Submit Exam'}
             </button>
          </div>
          
          <div className="absolute bottom-0 left-0 h-1 bg-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
       </header>

       <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Main Question Area */}
          <main className="flex-1 overflow-y-auto p-6 md:p-12 lg:p-20 relative">
             <div className="max-w-3xl mx-auto space-y-12">
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-3">
                      <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest italic">Question {currentIndex + 1}</span>
                      <span className="text-slate-400 font-mono text-[10px]">/ {questions.length}</span>
                   </div>
                   <div className="flex items-center gap-2 text-indigo-600">
                      <Flag className="w-4 h-4" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Flag for Review</span>
                   </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div 
                    key={currentQuestion.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-12"
                  >
                     <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter italic leading-tight">
                        {currentQuestion.text}
                     </h2>

                     {currentQuestion.imageUrl && currentQuestion.imageUrl !== "" && (
                       <div className="relative w-full max-h-[400px] rounded-3xl overflow-hidden border-4 border-white shadow-2xl bg-white group">
                          <img 
                            src={currentQuestion.imageUrl} 
                            alt="Question" 
                            className="w-full h-full object-contain bg-slate-100"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                       </div>
                     )}

                     {currentQuestion.videoUrl && (
                        <div className="relative w-full aspect-video rounded-3xl overflow-hidden border-4 border-white shadow-2xl bg-black">
                           <iframe 
                             src={(() => {
                               if (!currentQuestion.videoUrl) return null;
                               if (currentQuestion.videoUrl.includes('youtube.com')) {
                                 const id = currentQuestion.videoUrl.split('v=')[1]?.split('&')[0] || currentQuestion.videoUrl.split('/').pop();
                                 return `https://www.youtube.com/embed/${id}`;
                               }
                               return currentQuestion.videoUrl;
                             })()}
                             className="w-full h-full"
                             allowFullScreen
                           ></iframe>
                        </div>
                     )}

                     <div className="grid gap-6">
                         {currentQuestion.type === 'mcq' && currentQuestion.options?.map((opt, i) => (
                           <button 
                             key={i}
                             onClick={() => handleAnswerSelect(currentQuestion.id, opt)}
                             className={cn(
                               "group relative p-6 rounded-2xl border-2 transition-all text-left flex items-center justify-between overflow-hidden italic",
                               answers[currentQuestion.id] === opt 
                                 ? "bg-white border-indigo-600 shadow-xl shadow-indigo-100/50" 
                                 : "bg-white border-slate-100 hover:border-slate-300 shadow-sm"
                             )}
                           >
                              <div className="flex items-center gap-6 relative z-10">
                                 <span className={cn(
                                   "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm not-italic transition-colors",
                                   answers[currentQuestion.id] === opt ? "bg-indigo-600 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-slate-100"
                                 )}>
                                    {String.fromCharCode(65 + i)}
                                 </span>
                                 <span className={cn(
                                   "font-bold transition-colors",
                                   answers[currentQuestion.id] === opt ? "text-slate-900" : "text-slate-600"
                                 )}>{opt}</span>
                              </div>
                              {answers[currentQuestion.id] === opt && (
                                <motion.div 
                                  layoutId="check"
                                  className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500"
                                >
                                   <CheckCircle2 className="w-6 h-6" />
                                </motion.div>
                              )}
                              <div className={cn(
                                "absolute left-0 top-0 h-full w-1 transition-all",
                                answers[currentQuestion.id] === opt ? "bg-indigo-600" : "bg-transparent"
                              )}></div>
                           </button>
                        ))}

                        {currentQuestion.type === 'checkbox' && currentQuestion.options?.map((opt, i) => (
                           <button 
                             key={i}
                             onClick={() => handleAnswerSelect(currentQuestion.id, opt)}
                             className={cn(
                               "group relative p-6 rounded-2xl border-2 transition-all text-left flex items-center justify-between overflow-hidden italic",
                               answers[currentQuestion.id]?.split(',').includes(opt)
                                 ? "bg-white border-indigo-600 shadow-xl shadow-indigo-100/50" 
                                 : "bg-white border-slate-100 hover:border-slate-300 shadow-sm"
                             )}
                           >
                              <div className="flex items-center gap-6 relative z-10">
                                 <div className={cn(
                                   "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors",
                                   answers[currentQuestion.id]?.split(',').includes(opt) ? "bg-indigo-600 border-indigo-600 text-white" : "bg-slate-50 border-slate-200"
                                 )}>
                                    {answers[currentQuestion.id]?.split(',').includes(opt) && <CheckCircle2 className="w-4 h-4" />}
                                 </div>
                                 <span className={cn(
                                   "font-bold transition-colors",
                                   answers[currentQuestion.id]?.split(',').includes(opt) ? "text-slate-900" : "text-slate-600"
                                 )}>{opt}</span>
                              </div>
                              <div className={cn(
                                "absolute left-0 top-0 h-full w-1 transition-all",
                                answers[currentQuestion.id]?.split(',').includes(opt) ? "bg-indigo-600" : "bg-transparent"
                              )}></div>
                           </button>
                        ))}

                        {currentQuestion.type === 'boolean' && (
                          <div className="grid grid-cols-2 gap-8">
                             {['True', 'False'].map(val => (
                               <button 
                                 key={val}
                                 onClick={() => handleAnswerSelect(currentQuestion.id, val)}
                                 className={cn(
                                   "py-12 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-4 italic",
                                   answers[currentQuestion.id] === val 
                                     ? "bg-white border-indigo-600 shadow-xl" 
                                     : "bg-white border-slate-100 hover:border-slate-300"
                                 )}
                               >
                                  <div className={cn(
                                    "w-16 h-16 rounded-2xl flex items-center justify-center transition-colors",
                                    answers[currentQuestion.id] === val ? "bg-indigo-600 text-white" : "bg-slate-50 text-slate-300"
                                  )}>
                                     <HelpCircle className="w-8 h-8" />
                                  </div>
                                  <span className="text-lg font-black uppercase tracking-widest">{val}</span>
                               </button>
                             ))}
                          </div>
                        )}

                        {currentQuestion.type === 'short' && (
                          <div className="space-y-4">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 italic">Input Data Sequence</label>
                             <input 
                               type="text" 
                               value={answers[currentQuestion.id] || ''}
                               onChange={e => handleAnswerSelect(currentQuestion.id, e.target.value)}
                               placeholder="Type your answer accurately..."
                               className="w-full bg-white border-2 border-slate-100 rounded-2xl px-8 py-8 text-xl font-bold italic outline-none focus:border-indigo-600 shadow-sm transition-all"
                             />
                          </div>
                        )}

                        {currentQuestion.type === 'identification' && (
                          <div className="space-y-4">
                             <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest px-1 italic tracking-[0.2em]">Identification Required</label>
                             <input 
                               type="text" 
                               value={answers[currentQuestion.id] || ''}
                               onChange={e => handleAnswerSelect(currentQuestion.id, e.target.value)}
                               placeholder="IDENTIFY_OBJECT_HERE..."
                               className="w-full bg-white border-2 border-indigo-100 rounded-2xl px-8 py-8 text-2xl font-black italic outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 shadow-lg transition-all placeholder:text-slate-200"
                               autoComplete="off"
                               autoFocus
                             />
                          </div>
                        )}
                     </div>
                  </motion.div>
                </AnimatePresence>
             </div>

             {/* Navigation Footer */}
             <div className="fixed bottom-0 left-0 w-full p-8 md:px-12 bg-white/80 backdrop-blur-xl border-t border-slate-100 flex justify-between items-center max-w-[100vw]">
                <button 
                  onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="px-8 py-4 bg-slate-50 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-100 disabled:opacity-50 transition-all border border-slate-100"
                >
                   <ChevronLeft className="w-4 h-4" /> Previous Question
                </button>
                <div className="hidden lg:flex items-center gap-3">
                   {questions.map((_, i) => (
                     <div 
                       key={i} 
                       onClick={() => setCurrentIndex(i)}
                       className={cn(
                         "w-10 h-2 rounded-full cursor-pointer transition-all",
                         i === currentIndex ? "bg-indigo-600 w-16" : 
                         answers[questions[i].id] ? "bg-emerald-200" : "bg-slate-100"
                       )}
                     ></div>
                   ))}
                </div>
                {isLast ? (
                   <button 
                     onClick={handleSubmit}
                     disabled={submitting}
                     className="px-12 py-4 bg-[#0f172a] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 shadow-xl shadow-slate-200"
                   >
                     Finish Exam
                   </button>
                ) : (
                  <button 
                    onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                    className="px-10 py-5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-indigo-100"
                  >
                     Next Question <ChevronRight className="w-5 h-5" />
                  </button>
                )}
             </div>
          </main>

          {/* Sidebar Protocol Info */}
          <aside className="hidden xl:block w-96 bg-white border-l border-slate-100 overflow-y-auto p-12 space-y-12">
              <div className="space-y-6">
                 <div className="flex items-center gap-3 text-slate-900 mb-2">
                    <Maximize2 className="w-5 h-5" />
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] italic">Exam Navigation</h3>
                 </div>
                 <div className="grid grid-cols-5 gap-3">
                    {questions.map((q, i) => (
                      <button 
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center font-black text-xs transition-all border-2",
                          currentIndex === i ? "bg-indigo-600 text-white border-indigo-600" : 
                          answers[q.id] ? "bg-emerald-50 text-emerald-500 border-emerald-100" : "bg-white text-slate-300 border-slate-100 hover:border-slate-300"
                        )}
                      >
                         {i + 1}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden italic">
                 <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Exam Guidelines</h4>
                 <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                    Your progress is automatically saved. Please do not refresh the page or exit the assessment until you have submitted your answers.
                 </p>
                 <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    STATUS: READY
                 </div>
                 <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
              </div>
          </aside>
       </div>
    </div>
  );
}
