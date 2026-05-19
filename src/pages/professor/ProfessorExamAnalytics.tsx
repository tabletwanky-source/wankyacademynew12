import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  Loader2, 
  ArrowLeft,
  Calendar,
  Zap,
  Target
} from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { examService } from '../../services/examService';
import { Exam, ExamResult, Question } from '../../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function ProfessorExamAnalytics() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!examId) return;
    fetchData();
  }, [examId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [examData, resultData, qData] = await Promise.all([
        examService.getExam(examId!),
        examService.getExamResults(examId!),
        examService.getExamQuestions(examId!)
      ]);
      setExam(examData);
      setResults(resultData);
      setQuestions(qData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
     <div className="py-20 flex flex-col items-center justify-center gap-4">
       <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Analyse des performances en cours...</p>
     </div>
  );

  if (!exam) return <div className="p-20 text-center">Examen introuvable.</div>;

  const stats = results.reduce((acc, curr) => {
    if (curr.passed) acc.passed += 1;
    else acc.failed += 1;
    acc.totalScore += curr.percentage;
    return acc;
  }, { passed: 0, failed: 0, totalScore: 0 });

  const avgScore = results.length > 0 ? Math.round(stats.totalScore / results.length) : 0;
  const passRate = results.length > 0 ? Math.round((stats.passed / results.length) * 100) : 0;

  const chartData = [
    { name: 'Réussite', value: stats.passed, color: '#10b981' },
    { name: 'Échec', value: stats.failed, color: '#ef4444' }
  ];

  const questionAnalytics = questions.map(q => {
     let correct = 0;
     results.forEach(r => {
        if (r.answers[q.id]?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()) correct++;
     });
     return {
        text: q.text,
        correctRate: results.length > 0 ? Math.round((correct / results.length) * 100) : 0
     };
  }).sort((a, b) => a.correctRate - b.correctRate);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
         <button 
           onClick={() => navigate(-1)}
           className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors text-xs font-bold uppercase tracking-widest"
         >
           <ArrowLeft className="w-4 h-4" /> Retour aux Examens
         </button>
         <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-500 shadow-sm">
               {results.length} Tentatives Enregistrées
            </div>
         </div>
      </div>

      <div className="bg-[#0f172a] rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl">
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div>
               <h1 className="text-4xl font-bold tracking-tight uppercase italic mb-2">{exam.title} <span className="text-indigo-400/50">/ Rapport</span></h1>
               <div className="flex items-center gap-4">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">ID: {exam.id}</span>
                  <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{exam.courseId}</span>
               </div>
            </div>
            <div className="flex gap-12">
               <div className="text-center md:text-right">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Moyenne</p>
                  <p className="text-5xl font-bold tracking-tight italic">{avgScore}%</p>
               </div>
               <div className="text-center md:text-right">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Taux de Réussite</p>
                  <p className={cn(
                    "text-5xl font-bold tracking-tight italic",
                    passRate >= 70 ? "text-emerald-400" : "text-amber-400"
                  )}>{passRate}%</p>
               </div>
            </div>
         </div>
         <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
         <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm h-fit">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-8 flex items-center gap-3 text-slate-900 border-b border-slate-50 pb-4">
               <TrendingUp className="w-4 h-4 text-indigo-600" /> Distribution des Résultats
            </h3>
            <div className="h-64 relative">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                        data={chartData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                     >
                        {chartData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                     </Pie>
                     <Tooltip />
                  </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-bold text-slate-900">{results.length}</span>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Tentatives</span>
               </div>
            </div>
            <div className="space-y-4 pt-8">
               {chartData.map((item, i) => (
                 <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                       <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{item.value}</span>
                 </div>
               ))}
            </div>
         </div>

         <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
               <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-8 flex items-center gap-3 text-slate-900 border-b border-slate-50 pb-4">
                  <Zap className="w-4 h-4 text-indigo-600" /> Analyse des Questions (Complexité)
               </h3>
               <div className="space-y-8">
                  {questionAnalytics.map((q, i) => (
                    <div key={i} className="space-y-3">
                       <div className="flex justify-between items-start gap-8">
                          <p className="text-xs font-bold text-slate-900 leading-tight italic flex-1">{q.text}</p>
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest italic shrink-0",
                            q.correctRate < 50 ? "text-red-500" : "text-emerald-500"
                          )}>{q.correctRate}% Correct</span>
                       </div>
                       <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className={cn(
                            "h-full rounded-full transition-all duration-1000",
                            q.correctRate < 50 ? "bg-red-500" : "bg-emerald-500"
                          )} style={{ width: `${q.correctRate}%` }}></div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="p-8 border-b border-slate-100 flex items-center gap-3">
                 <Target className="w-5 h-5 text-indigo-600" />
                 <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-900">Meilleures Performances</h3>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                           <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Étudiant</th>
                           <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Score</th>
                           <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Statut</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {results.sort((a,b) => b.percentage - a.percentage).slice(0, 5).map((r) => (
                           <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-8 py-5">
                                 <span className="text-xs font-bold text-slate-900 italic uppercase">{r.studentCode}</span>
                              </td>
                              <td className="px-8 py-5">
                                 <span className="text-sm font-bold text-slate-900">{Math.round(r.percentage)}%</span>
                              </td>
                              <td className="px-8 py-5 text-right">
                                 <span className={cn(
                                   "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all",
                                   r.passed ? "bg-emerald-50 text-emerald-600 border-emerald-500" : "bg-red-50 text-red-600 border-red-500"
                                 )}>
                                    {r.passed ? 'ADMIS' : 'ÉCHEC'}
                                 </span>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
               {results.length === 0 && (
                 <div className="p-12 text-center text-slate-300 uppercase tracking-widest text-[10px] font-bold">Aucune donnée disponible</div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
