import React, { useState, useEffect } from 'react';
import { FileText, Clock, ChevronRight, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Loader as Loader2, Calendar, Lock, Play } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { examService } from '../../services/examService';
import { Exam, ExamResult, AssignedExam } from '../../types';
import ProfessorContact from '../../components/common/ProfessorContact';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { useTranslation } from 'react-i18next';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function StudentExams() {
  const { studentData } = useAuth();
  const { t } = useTranslation();
  const [exams, setExams] = useState<(Exam & { assignment?: AssignedExam })[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentData) return;
    
    let currentAssignments: AssignedExam[] = [];
    let currentDeptExams: Exam[] = [];

    const updateExams = async () => {
      const assignedIds = currentAssignments.map(a => a.examId);
      const assignedExamsData = await examService.getMultipleExams(assignedIds);
      
      const assignedList = assignedExamsData.map(e => {
        const assignment = currentAssignments.find(a => a.examId === e.id);
        return { ...e, assignment };
      });

      // Merge with department-wide exams
      const combined: (Exam & { assignment?: AssignedExam })[] = [...assignedList];
      currentDeptExams.forEach(de => {
        if (!combined.some(oe => oe.id === de.id)) {
          combined.push(de);
        }
      });

      setExams(combined);
      setLoading(false);
    };

    // Subscribe to assignments
    const unsubAssignments = examService.subscribeAssignedExams(
      studentData.uid, 
      studentData.department, 
      async (assignments) => {
        currentAssignments = assignments;
        await updateExams();
      }
    );

    // Subscribe to department published exams
    const unsubDeptExams = examService.subscribePublishedExamsByDepartment(
      studentData.department,
      async (deptExams) => {
        currentDeptExams = deptExams;
        await updateExams();
      }
    );

    // Subscribe to results via examService
    const loadResults = async () => {
      try {
        const resultData = await examService.getStudentResults(studentData.uid);
        setResults(resultData);
      } catch (error) {
        console.error("Student exams results error:", error);
      }
    };
    loadResults();
    const unsubResults = () => {};

    return () => {
      unsubAssignments();
      unsubDeptExams();
      unsubResults();
    };
  }, [studentData]);

  if (loading) return (
     <div className="py-20 flex flex-col items-center justify-center gap-4">
       <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic font-mono animate-pulse">Syncing Evaluation Protocols...</p>
     </div>
  );

  const getBestResult = (examId: string) => {
    const examResults = results.filter(r => r.examId === examId);
    if (examResults.length === 0) return null;
    return examResults.reduce((prev, current) => (prev.percentage > current.percentage) ? prev : current);
  };

  const getExamStatus = (exam: Exam & { assignment?: AssignedExam }) => {
    const res = results.filter(r => r.examId === exam.id);
    const hasPassed = res.some(r => r.passed);
    const maxAttempts = exam.attemptsAllowed || exam.assignment?.attemptsAllowed || 2;
    
    if (hasPassed) return { label: '✅ Completed', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
    if (res.length >= maxAttempts) return { label: '🔴 Closed', color: 'bg-red-50 text-red-600 border-red-100' };
    if (res.length > 0) return { label: '🟡 In Progress', color: 'bg-amber-50 text-amber-600 border-amber-100' };
    
    // Check if due date passed
    if (exam.assignment?.dueDate) {
      const due = exam.assignment.dueDate.toDate ? exam.assignment.dueDate.toDate() : new Date(exam.assignment.dueDate);
      if (new Date() > due) return { label: '🔴 Overdue', color: 'bg-slate-200 text-slate-500 border-slate-300' };
    }
    
    return { label: '🟢 Available', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' };
  };

  return (
    <div className="space-y-12 pb-32">
      <header className="bg-slate-900 rounded-[2.5rem] p-10 md:p-16 text-white relative overflow-hidden shadow-2xl border border-white/5">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-indigo-600/20 rounded-2xl backdrop-blur-md border border-indigo-500/30">
               <FileText className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-1 italic">Academic Portal</p>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">Evaluaciones Disponibles</h1>
            </div>
          </div>
          <p className="text-slate-400 text-lg italic font-medium max-w-2xl leading-relaxed">
            Access exams assigned to your current course. Results will be saved to your academic record. Complete all pending evaluations to advance your level.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-12 border-t border-white/5">
            <div className="space-y-1">
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Assigned</p>
               <p className="text-2xl font-black italic">{exams.length}</p>
            </div>
            <div className="space-y-1">
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Completed</p>
               <p className="text-2xl font-black italic text-emerald-400">{results.filter(r => r.passed).length}</p>
            </div>
            <div className="space-y-1">
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Pending</p>
               <p className="text-2xl font-black italic text-amber-400">{exams.filter(e => !results.some(r => r.examId === e.id && r.passed)).length}</p>
            </div>
            <div className="space-y-1 text-indigo-400">
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Success Rate</p>
               <p className="text-2xl font-black italic font-mono">{exams.length > 0 ? Math.round((results.filter(r => r.passed).length / exams.length) * 100) : 0}%</p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-20">
           <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
           <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-600 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
        </div>
      </header>

      {/* Exam Grid */}
      <section className="space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 px-2">
           <div className="space-y-2">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-3 italic">
                 <Play className="w-4 h-4 text-indigo-600 animate-pulse" /> Active Evaluations
              </h2>
              <div className="w-24 h-1 bg-indigo-600 rounded-full"></div>
           </div>
           <div className="flex gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 text-[10px] font-black uppercase italic shadow-sm hover:border-indigo-200 transition-all">
                 <div className="w-2 h-2 rounded-full bg-indigo-500"></div> All Exams
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {exams.map((exam) => {
            const status = getExamStatus(exam);
            const examResults = results.filter(r => r.examId === exam.id);
            const maxAttempts = exam.attemptsAllowed || exam.assignment?.attemptsAllowed || 2;
            const remainingAttempts = Math.max(0, maxAttempts - examResults.length);
            const hasPassed = examResults.some(r => r.passed);
            const bestResult = getBestResult(exam.id);
            const isClosed = status.label.includes('Closed') || status.label.includes('Overdue');

            return (
              <motion.div 
                key={exam.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group relative"
              >
                  <div className="absolute inset-0 bg-indigo-600 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
                  <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-2xl hover:border-indigo-200 transition-all duration-500 flex flex-col h-full relative z-10 border-b-8 border-b-slate-100 hover:border-b-indigo-600">
                    <div className="p-8 pb-4 space-y-6 flex-1">
                        <div className="flex justify-between items-start">
                          <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xl shadow-slate-200 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                             <FileText className="w-8 h-8" />
                          </div>
                          <div className="flex flex-col items-end gap-3">
                             <span className={cn(
                               "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-500",
                               status.color
                             )}>
                               {status.label}
                             </span>
                             <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 border border-slate-100 px-2 py-1 rounded-lg uppercase tracking-tight font-mono">
                                <Lock className="w-3 h-3" /> ATTEMPT_{examResults.length + 1}
                             </div>
                          </div>
                        </div>

                        <div>
                           <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">{exam.department}</p>
                           <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic leading-none group-hover:text-indigo-600 transition-colors">{exam.title}</h3>
                           <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wide italic">Assigned by: WA Faculty</p>
                        </div>

                        <div className="grid grid-cols-2 gap-6 p-6 bg-slate-50/50 rounded-2xl border border-slate-100/50 relative overflow-hidden group-hover:bg-white transition-colors">
                           <div className="space-y-1">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Duration</p>
                              <div className="flex items-center gap-2 text-slate-900">
                                 <Clock className="w-3.5 h-3.5 text-indigo-500" />
                                 <span className="text-sm font-black italic">{exam.duration} Min</span>
                              </div>
                           </div>
                           <div className="space-y-1">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Passing</p>
                              <div className="flex items-center gap-2 text-slate-900">
                                 <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                 <span className="text-sm font-black italic">{exam.passingScore}%</span>
                              </div>
                           </div>
                           <div className="absolute right-0 bottom-0 opacity-[0.03] pointer-events-none group-hover:opacity-[0.07] transition-opacity">
                              <FileText className="w-20 h-20 rotate-12" />
                           </div>
                        </div>

                        <div className="space-y-2">
                           <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              <span>Remaining Attempts</span>
                              <span className={cn(remainingAttempts === 0 ? "text-red-500" : "text-emerald-500")}>
                                 {remainingAttempts} / {maxAttempts}
                              </span>
                           </div>
                           <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={cn("h-full transition-all duration-1000", remainingAttempts === 0 ? "bg-red-500" : "bg-emerald-500")}
                                style={{ width: `${(remainingAttempts / maxAttempts) * 100}%` }}
                              ></div>
                           </div>
                        </div>

                        {exam.assignment?.dueDate && (
                           <div className="flex items-center justify-between py-4 border-t border-slate-50">
                              <div className="flex items-center gap-2">
                                 <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                 <p className="text-[9px] font-black text-slate-400 uppercase">Deadline Protocol</p>
                              </div>
                              <p className="text-[10px] font-black text-slate-900 italic font-mono uppercase">
                                 {exam.assignment.dueDate.toDate ? exam.assignment.dueDate.toDate().toLocaleDateString() : new Date(exam.assignment.dueDate).toLocaleDateString()}
                              </p>
                           </div>
                        )}
                    </div>

                    <div className="p-6 bg-slate-50 border-t border-slate-100 group-hover:bg-white transition-colors duration-500">
                      {hasPassed ? (
                        <Link 
                          to={`/dashboard/exams/results/${examResults.find(r => r.passed)?.id}`}
                          className="w-full py-4 bg-emerald-500 text-white rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-100 hover:bg-slate-900 transition-all hover:scale-105"
                        >
                           View Final Outcome <ChevronRight className="w-4 h-4" />
                        </Link>
                      ) : isClosed ? (
                        <div className="w-full py-4 bg-slate-200 text-slate-400 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] cursor-not-allowed">
                           Evaluation Terminated <Lock className="w-4 h-4" />
                        </div>
                      ) : (
                        <Link 
                          to={`/dashboard/exams/${exam.id}/instructions`}
                          className="w-full py-4 bg-indigo-600 text-white rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-slate-900 transition-all hover:scale-105 active:scale-95 group/btn"
                        >
                           {examResults.length > 0 ? `Resume Next Attempt (${examResults.length + 1})` : 'Initialize Assessment'}
                           <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                      )}
                    </div>
                  </div>
              </motion.div>
            );
          })}

          {exams.length === 0 && (
            <div className="col-span-full py-40 flex flex-col items-center justify-center text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
               <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-8 border border-slate-100">
                  <FileText className="w-10 h-10 opacity-20" />
               </div>
               <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest italic mb-3 leading-none">Record_Clean</h3>
               <p className="text-slate-300 font-medium italic max-w-[320px] uppercase text-[10px] tracking-widest">No evaluation protocols have been synchronized with your academic profile at this moment.</p>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-10">
        <div className="flex items-center justify-between px-2">
           <div className="space-y-2">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-3 italic">
                 <CheckCircle className="w-4 h-4 text-emerald-500" /> Historial de Evaluaciones
              </h2>
              <div className="w-16 h-1 bg-emerald-500 rounded-full"></div>
           </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden border-b-8 border-b-slate-100">
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                 <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Assessment</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Attempt</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Submitted At</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Score</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Result</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50 italic">
                    {results.length === 0 ? (
                       <tr>
                          <td colSpan={6} className="px-8 py-20 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">No evaluation records found in academic database</td>
                       </tr>
                    ) : results.map((result) => {
                       const exam = exams.find(e => e.id === result.examId);
                       return (
                          <tr key={result.id} className="hover:bg-slate-50/50 transition-colors group">
                             <td className="px-8 py-6">
                                <div>
                                   <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase leading-none">{exam?.title || 'Unknown Exam'}</p>
                                   <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{exam?.department}</p>
                                </div>
                             </td>
                             <td className="px-8 py-6">
                                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-black font-mono">#{result.attempt || 1}</span>
                             </td>
                             <td className="px-8 py-6">
                                <div className="flex items-center gap-2 text-slate-500">
                                   <Calendar className="w-3.5 h-3.5" />
                                   <span className="text-xs font-bold">{result.submittedAt?.toDate ? result.submittedAt.toDate().toLocaleString() : 'N/A'}</span>
                                </div>
                             </td>
                             <td className="px-8 py-6 text-indigo-600 font-black font-mono">
                                {Math.round(result.percentage)}%
                             </td>
                             <td className="px-8 py-6">
                                <span className={cn(
                                  "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border",
                                  result.passed ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"
                                )}>
                                   {result.passed ? '✅ Passed' : '❌ Failed'}
                                </span>
                             </td>
                             <td className="px-8 py-6 text-right">
                                <Link 
                                  to={`/dashboard/exams/results/${result.id}`}
                                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg active:scale-95"
                                >
                                   Details <ChevronRight className="w-3 h-3" />
                                </Link>
                             </td>
                          </tr>
                       );
                    })}
                 </tbody>
              </table>
           </div>
        </div>
      </section>

      {/* Bottom Profile Info */}
      <div className="grid md:grid-cols-3 gap-8">
         <div className="md:col-span-2">
            <ProfessorContact professorUid={studentData?.department === 'Auto École' ? 'admin' : 'professor'} />
         </div>
         <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm flex flex-col justify-between italic">
            <div>
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Academic Integrity</h4>
               <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  All assessments are monitored by the System Control Unit. Attempting to bypass security protocols or duplicating content will result in immediate profile suspension.
               </p>
            </div>
            <div className="mt-8 pt-8 border-t border-slate-50 flex items-center gap-4">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">System_Online_Secure</span>
            </div>
         </div>
      </div>
    </div>
  );
}
