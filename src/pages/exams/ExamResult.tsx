import React, { useState, useEffect } from 'react';
import { CircleCheck as CheckCircle2, Circle as XCircle, ArrowLeft, ChartBar as BarChart3, Clock, User, Target, ChevronRight, Loader as Loader2, FileText, RotateCcw, Zap, Info, Award } from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { examService } from '../../services/examService';
import { useAuth } from '../../context/AuthContext';
import { ExamResult, Exam, Question } from '../../types';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { useTranslation } from 'react-i18next';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function ExamResultView() {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const { studentData } = useAuth();
  const { t } = useTranslation();
  
  const [result, setResult] = useState<ExamResult | null>(null);
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!resultId) return;

    const fetchData = async () => {
      try {
        // Find the result in results (in a real app we'd fetch directly)
        // I'll grab it from the student results list
        if (studentData) {
           const allResults = await examService.getStudentResults(studentData.uid);
           const found = allResults.find(r => r.id === resultId);
           if (found) {
              setResult(found);
              const [examData, qData] = await Promise.all([
                 examService.getExam(found.examId),
                 examService.getExamQuestions(found.examId)
              ]);
              setExam(examData);
              setQuestions(qData);
           }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [resultId, studentData]);

  if (loading) return (
     <div className="py-20 flex flex-col items-center justify-center gap-4">
       <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">{t('common.loading')}</p>
     </div>
  );

  if (!result || !exam) return <div className="p-20 text-center">{t('common.error')}</div>;

  return (
    <div className="space-y-8 pb-20 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
         <Link 
           to="/dashboard/exams"
           className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors text-xs font-bold uppercase tracking-widest italic"
         >
           <ArrowLeft className="w-4 h-4" /> {t('common.back')}
         </Link>
         <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{t('common.verified')}</span>
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
         </div>
      </div>

      {/* Result Hero */}
      <div className={cn(
        "rounded-3xl p-12 text-white relative overflow-hidden shadow-2xl italic transition-colors duration-500",
        result.passed ? "bg-emerald-600" : "bg-red-600"
      )}>
        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
           <div className="space-y-6">
              <div className="flex items-center gap-3">
                 <span className="bg-white/20 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
                   {exam.courseId}
                 </span>
                 <span className="text-white/60 font-mono text-[10px] uppercase">{result.studentCode}</span>
              </div>
              <h1 className="text-5xl font-black tracking-tighter uppercase">{exam.title}</h1>
              <p className="text-white/80 text-sm font-medium leading-relaxed max-w-md">
                 {result.passed 
                   ? t('exams.success') 
                   : t('exams.failure')}
              </p>
           </div>

           <div className="flex flex-col items-center md:items-end gap-4">
              <div className="text-center md:text-right">
                 <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">{t('exams.score')}</p>
                 <span className="text-8xl font-black tracking-tighter flex items-start">
                   {Math.round(result.percentage)}<span className="text-3xl mt-4 opacity-50">%</span>
                 </span>
              </div>
              <div className={cn(
                "px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3 border shadow-lg",
                result.passed ? "bg-white text-emerald-600 border-white" : "bg-white text-red-600 border-white"
              )}>
                 {result.passed ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                 {result.passed ? t('exams.passedLabel') : t('exams.failedLabel')}
              </div>
           </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/4 -translate-y-1/2"></div>
      </div>

      {/* Certificate eligibility banner */}
      {result.percentage >= 70 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-amber-50 border border-amber-200 rounded-2xl p-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
              <Award className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-black text-amber-900 uppercase italic">Certificate Earned</p>
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mt-0.5">
                Your certificate has been automatically generated. Visit your certificates page to download it.
              </p>
            </div>
          </div>
          <Link
            to="/dashboard/certificates"
            className="shrink-0 px-6 py-3 bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-700 transition-all shadow-lg shadow-amber-200 whitespace-nowrap"
          >
            View Certificate
          </Link>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
         <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-8">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <BarChart3 className="w-4 h-4" /> {t('exams.performance')}
               </h3>
               
               <div className="space-y-6">
                  <div className="space-y-2">
                     <div className="flex justify-between items-end">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{t('exams.pointsScored')}</span>
                        <span className="text-lg font-black text-slate-900">{result.score} <span className="text-xs text-slate-400">/ {result.totalPoints}</span></span>
                     </div>
                     <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={cn(
                          "h-full rounded-full transition-all duration-1000",
                          result.passed ? "bg-emerald-500" : "bg-red-500"
                        )} style={{ width: `${result.percentage}%` }}></div>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 bg-slate-50 rounded-2xl italic text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('exams.passingScore')}</p>
                        <p className="text-sm font-black text-slate-900">{exam.passingScore}%</p>
                     </div>
                     <div className="p-4 bg-slate-50 rounded-2xl italic text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('exams.timeUsed')}</p>
                        <p className="text-sm font-black text-slate-900">Terminated</p>
                     </div>
                  </div>
               </div>
            </div>

             <div className="bg-[#0f172a] rounded-3xl p-8 text-white space-y-6 relative overflow-hidden italic shadow-2xl">
                <div className="relative z-10">
                   <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Academic Validation</h4>
                   <div className="space-y-4 text-[10px] font-bold uppercase tracking-widest font-mono">
                      <div className="flex justify-between pb-3 border-b border-white/5">
                         <span className="text-slate-500">Attempt Sequence</span>
                         <span className="text-indigo-400">#{result.attempt || 1} / 2</span>
                      </div>
                      <div className="flex justify-between pb-3 border-b border-white/5">
                         <span className="text-slate-500">Student Code</span>
                         <span className="text-white">{result.studentCode}</span>
                      </div>
                      <div className="flex justify-between pb-3 border-b border-white/5">
                         <span className="text-slate-500">Submission Time</span>
                         <span className="text-white">{new Date(result.submittedAt?.toDate ? result.submittedAt.toDate() : result.submittedAt).toLocaleTimeString()}</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-slate-500">Status</span>
                         <span className="text-emerald-400">RECORDED_SECURE_OK</span>
                      </div>
                   </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
             </div>

             {result.teacherComments && (
               <div className="bg-white rounded-3xl border-2 border-indigo-100 p-8 shadow-lg italic">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                        <User className="w-5 h-5" />
                     </div>
                     <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Teacher Observation</h4>
                  </div>
                  <p className="text-sm font-black text-slate-700 leading-relaxed">
                     "{result.teacherComments}"
                  </p>
               </div>
             )}
         </div>

         <div className="lg:col-span-2 space-y-8">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2 italic px-1">
              <Zap className="w-4 h-4" /> {t('exams.detailedResults')}
            </h2>

            <div className="space-y-6">
                {questions.map((q, i) => {
                  const studentAnswer = result.answers[q.id] || '';
                  let isCorrect = false;

                  if (q.type === 'checkbox') {
                    const studentOpts = studentAnswer.toLowerCase().split(',').map(s => s.trim()).filter(Boolean).sort();
                    const correctOpts = q.correctAnswer.toLowerCase().split(',').map(s => s.trim()).filter(Boolean).sort();
                    isCorrect = studentOpts.length > 0 && 
                                studentOpts.length === correctOpts.length && 
                                studentOpts.every((val, idx) => val === correctOpts[idx]);
                  } else {
                    isCorrect = studentAnswer.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
                  }

                 return (
                   <div key={q.id} className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm group">
                      <div className="flex justify-between items-start mb-6">
                         <div className="flex items-center gap-4">
                            <span className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-xs font-black text-slate-400 border border-slate-100 group-hover:text-indigo-600 transition-colors">
                               {i + 1}
                            </span>
                            <span className={cn(
                              "text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border italic",
                              isCorrect ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"
                            )}>
                               {isCorrect ? t('exams.correct') : t('exams.incorrect')}
                            </span>
                         </div>
                         <span className="text-[10px] font-bold text-slate-400 italic">{q.points} Pts</span>
                      </div>

                      <p className="text-lg font-black text-slate-900 italic mb-8 leading-tight">{q.text}</p>
                      {q.imageUrl && q.imageUrl !== "" && (
                        <div className="mb-6 aspect-video rounded-2xl overflow-hidden border border-slate-100 bg-slate-50">
                           <img src={q.imageUrl} alt="Question" className="w-full h-full object-cover" />
                        </div>
                      )}

                      <div className="grid md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1 italic">{t('exams.yourAnswer')}</span>
                            <div className={cn(
                              "p-4 rounded-xl border-2 italic font-bold text-sm",
                              isCorrect ? "bg-emerald-50/30 border-emerald-500/20 text-emerald-900" : "bg-red-50/30 border-red-500/20 text-red-900"
                            )}>
                               {studentAnswer || 'No answer provided'}
                            </div>
                         </div>
                         <div className="space-y-2">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1 italic">{t('exams.expectedAnswer')}</span>
                            <div className="p-4 rounded-xl border-2 border-slate-100 bg-slate-50/50 italic font-bold text-sm text-slate-900">
                               {q.correctAnswer}
                            </div>
                         </div>
                      </div>

                      {q.explanation && (
                        <div className="mt-8 p-6 bg-indigo-50/30 border border-indigo-100/50 rounded-2xl flex items-start gap-4">
                           <Info className="w-5 h-5 text-indigo-400 mt-1 shrink-0" />
                           <div>
                              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">{t('exams.explanation')}</p>
                              <p className="text-xs text-slate-600 leading-relaxed font-medium italic">{q.explanation}</p>
                           </div>
                        </div>
                      )}
                   </div>
                 );
               })}
            </div>
         </div>
      </div>
    </div>
  );
}
