import React, { useState, useEffect } from 'react';
import { 
  History, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  Award, 
  FileText, 
  ChevronRight,
  TrendingUp,
  Target,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { examService } from '../../services/examService';
import { ExamResult, Exam } from '../../types';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function ExamHistory() {
  const { studentData } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState<ExamResult[]>([]);
  const [exams, setExams] = useState<Record<string, Exam>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentData) return;

    const fetchHistory = async () => {
      try {
        const studentResults = await examService.getStudentResults(studentData.uid);
        setResults(studentResults);

        // Fetch exam titles for the results
        const examIds = Array.from(new Set(studentResults.map(r => r.examId)));
        const examsData = await Promise.all(examIds.map(id => examService.getExam(id)));
        const examMap: Record<string, Exam> = {};
        examsData.forEach(e => {
          if (e) examMap[e.id] = e;
        });
        setExams(examMap);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [studentData]);

  if (loading) return (
     <div className="py-20 flex flex-col items-center justify-center gap-4">
       <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing History...</p>
     </div>
  );

  const stats = {
    total: results.length,
    passed: results.filter(r => r.passed).length,
    avg: results.length > 0 ? Math.round(results.reduce((acc, r) => acc + r.percentage, 0) / results.length) : 0,
    best: results.length > 0 ? Math.round(Math.max(...results.map(r => r.percentage))) : 0
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="flex items-center justify-between px-2">
         <div className="space-y-1">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors text-[10px] font-black uppercase tracking-widest italic mb-4"
            >
              <ArrowLeft className="w-3 h-3" /> Back
            </button>
            <h1 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">Historial Académico</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Complete Examination Records</p>
         </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
         {[
           { label: 'Total Attempts', value: stats.total, icon: History, color: 'text-indigo-600', bg: 'bg-indigo-50' },
           { label: 'Exams Passed', value: stats.passed, icon: Award, color: 'text-emerald-600', bg: 'bg-emerald-50' },
           { label: 'Average Score', value: `${stats.avg}%`, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
           { label: 'Highest Score', value: `${stats.best}%`, icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
         ].map((s, i) => (
           <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col gap-4 italic relative overflow-hidden group">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", s.bg, s.color)}>
                 <s.icon className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                 <p className="text-2xl font-black text-slate-900">{s.value}</p>
              </div>
           </div>
         ))}
      </div>

      {/* Results List */}
      <div className="space-y-6">
         {results.map((result) => {
           const exam = exams[result.examId];
           return (
             <motion.div 
               key={result.id}
               initial={{ opacity: 0, x: -20 }}
               whileInView={{ opacity: 1, x: 0 }}
               className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all flex flex-col md:flex-row items-center cursor-pointer"
               onClick={() => navigate(`/dashboard/exams/results/${result.id}`)}
             >
                <div className={cn(
                  "w-full md:w-24 self-stretch flex items-center justify-center py-6 md:py-0",
                  result.passed ? "bg-emerald-50" : "bg-red-50"
                )}>
                   {result.passed ? <CheckCircle className="w-8 h-8 text-emerald-500" /> : <XCircle className="w-8 h-8 text-red-500" />}
                </div>
                
                <div className="flex-1 p-8 grid md:grid-cols-4 gap-8 items-center italic">
                   <div className="md:col-span-1">
                      <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">{exam?.department || 'Assessment'}</p>
                      <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight line-clamp-1">{exam?.title || 'Loading...'}</h3>
                   </div>

                   <div className="flex flex-col">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Submission Date</p>
                      <div className="flex items-center gap-2 text-slate-700">
                         <Calendar className="w-3.5 h-3.5 text-slate-300" />
                         <span className="text-xs font-bold">{result.submittedAt?.toDate ? result.submittedAt.toDate().toLocaleDateString() : 'N/A'}</span>
                      </div>
                   </div>

                   <div className="flex flex-col">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Attempt Results</p>
                      <div className="flex items-center gap-4">
                         <span className="text-xl font-black text-slate-900">{Math.round(result.percentage)}%</span>
                         <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">Attempt #{result.attempt || 1}</span>
                      </div>
                   </div>

                   <div className="flex justify-end gap-4">
                      <Link 
                        to={`/dashboard/exams/results/${result.id}`}
                        className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all"
                        onClick={(e) => e.stopPropagation()}
                      >
                         Full Report
                      </Link>
                      <div className="w-10 h-10 rounded-xl border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-indigo-600 transition-colors">
                         <ChevronRight className="w-5 h-5" />
                      </div>
                   </div>
                </div>
             </motion.div>
           );
         })}

         {results.length === 0 && (
           <div className="py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 italic">
              <History className="w-12 h-12 text-slate-100 mx-auto mb-6" />
              <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No evaluation history available.</p>
           </div>
         )}
      </div>
    </div>
  );
}
