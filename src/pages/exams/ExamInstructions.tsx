import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  PlayCircle, 
  Info, 
  AlertTriangle, 
  Clock, 
  Target, 
  ShieldCheck,
  Loader2,
  Lock
} from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { examService } from '../../services/examService';
import { useAuth } from '../../context/AuthContext';
import { Exam } from '../../types';

export default function ExamInstructions() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { studentData } = useAuth();
  const [exam, setExam] = useState<Exam | null>(null);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!examId || !studentData) return;
    
    const fetchData = async () => {
      try {
        const [examData, attemptData] = await Promise.all([
          examService.getExam(examId),
          examService.getAttempts(studentData.uid, examId)
        ]);
        setExam(examData);
        setAttempts(attemptData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [examId, studentData]);

  if (loading) return (
     <div className="py-20 flex flex-col items-center justify-center gap-4">
       <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Initializing Protocol Handler...</p>
     </div>
  );

  if (!exam) return <div className="p-20 text-center">Protocol Not Found.</div>;

  const hasPassed = attempts.some(a => a.passed);
  const maxAttempts = exam.attemptsAllowed || 2;
  const attemptsLeft = maxAttempts - attempts.length;
  const isLocked = hasPassed || attemptsLeft <= 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors text-xs font-bold uppercase tracking-widest italic"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden focus-outline-none">
        <div className="bg-[#0f172a] p-12 text-white relative">
           <h1 className="text-4xl font-black tracking-tighter uppercase italic mb-2">{exam.title}</h1>
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Exam ID: {exam.id.toUpperCase()}</p>
           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        </div>

        <div className="p-12 space-y-12">
           <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Clock, label: 'Duration', value: `${exam.duration} Minutes` },
                { icon: Target, label: 'Passing Score', value: `${exam.passingScore}%` },
                { icon: ShieldCheck, label: 'Verification', value: 'Required' },
              ].map((item, i) => (
                <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 italic">
                   <div className="flex items-center gap-3 text-indigo-600 mb-2 not-italic">
                      <item.icon className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                   </div>
                   <p className="text-sm font-black text-slate-900 not-italic">{item.value}</p>
                </div>
              ))}
           </div>

           <div className="space-y-6">
              <div className="flex items-center gap-3 text-amber-500">
                 <AlertTriangle className="w-5 h-5" />
                 <h2 className="text-xs font-black uppercase tracking-[0.2em] italic">Exam Rules</h2>
              </div>
              <ul className="grid gap-4">
                 {[
                   'Ensure you have a stable internet connection.',
                   'Manual navigation or refresh will reset your current progress.',
                   'The exam will automatically submit when the timer reaches 00:00.',
                   'Copying and pasting is disabled during the exam.',
                   'Attempting the exam on multiple devices simultaneously is prohibited.'
                 ].map((text, i) => (
                   <li key={i} className="flex items-start gap-4 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                      <span className="w-5 h-5 rounded bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400">{i+1}</span>
                      <p className="text-xs text-slate-600 font-medium italic">{text}</p>
                   </li>
                 ))}
              </ul>
           </div>

           <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row gap-6 items-center">
              {isLocked ? (
                 <div className="flex-1 w-full p-6 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4">
                    <Lock className="w-6 h-6 text-red-500" />
                    <div>
                       <p className="text-xs font-black text-red-600 uppercase tracking-widest italic">Terminal Access Locked</p>
                       <p className="text-[10px] font-medium text-red-400 italic">
                          {hasPassed 
                             ? "Protocol successfully completed with a passing score. No further attempts required." 
                             : "Maximum execution limit reached (2 attempts). Access to this assessment is now permanently restricted."}
                       </p>
                    </div>
                 </div>
              ) : (
                <>
                   <div className="flex-1 italic">
                      <p className="text-xs font-bold text-slate-900 mb-1 uppercase tracking-tight">Ready to begin attempt {attempts.length + 1}?</p>
                      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest leading-relaxed">You have {attemptsLeft} attempts remaining for this evaluation.</p>
                   </div>
                   <Link 
                     to={`/dashboard/exams/${exam.id}/terminal`}
                     className="w-full md:w-auto px-10 py-5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-indigo-100 hover:scale-105 transition-all text-center"
                   >
                     Start Assessment
                   </Link>
                </>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
