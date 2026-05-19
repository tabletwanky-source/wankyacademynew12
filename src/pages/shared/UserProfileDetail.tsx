import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Calendar, Shield, CreditCard, GraduationCap, FileText, CircleCheck as CheckCircle2, CircleAlert as AlertCircle, ArrowLeft, ChevronRight, MessageCircle, ExternalLink, Award } from 'lucide-react';
import { AppUser, Student, AttendanceStatus, ExamResult, Payment, Homework } from '../../types';
import { supabase } from '../../lib/supabase';
import { mapProfileToAppUser } from '../../lib/supabaseHelpers';
import { motion } from 'motion/react';

export default function UserProfileDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Data for sections
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      try {
        const { data: profileData } = await supabase.from('profiles').select('*').eq('uid', id).maybeSingle();
        if (profileData) {
          const userData = mapProfileToAppUser(profileData) as AppUser;
          setUser(userData);

          const [examsRes, paymentsRes, attendanceRes] = await Promise.all([
            supabase.from('exam_results').select('*').eq('student_id', id).order('submitted_at', { ascending: false }),
            supabase.from('payments').select('*').eq('student_uid', id).order('created_at', { ascending: false }),
            supabase.from('attendance').select('*').eq('student_uid', id).order('date', { ascending: false })
          ]);

          setExamResults((examsRes.data || []).map(r => ({
            id: r.id, studentId: r.student_id, studentCode: r.student_code,
            examId: r.exam_id, score: r.score, totalPoints: r.total_points,
            percentage: r.percentage, passed: r.passed, submittedAt: r.submitted_at,
            answers: r.answers, attempt: r.attempt
          })) as ExamResult[]);

          setPayments((paymentsRes.data || []).map(p => ({
            id: p.id, studentId: p.student_uid, studentCode: p.student_id,
            amount: p.amount, paymentType: p.payment_type, paymentDate: p.created_at,
            paymentStatus: 'Paid', remainingBalance: 0
          })) as Payment[]);

          setAttendance((attendanceRes.data || []).map(a => ({
            id: a.id, studentUid: a.student_uid, professorUid: a.professor_uid,
            department: a.department, status: a.status, date: a.date, createdAt: a.created_at
          })));
        }
      } catch (error) {
        console.error("Error fetching user detail:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
       <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!user) return (
    <div className="text-center py-24 bg-white rounded-3xl border border-slate-200">
       <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
       <h3 className="text-xl font-black text-slate-900 uppercase italic">Utilisateur introuvable</h3>
       <button onClick={() => navigate(-1)} className="mt-4 text-indigo-600 font-bold hover:underline">Retourner</button>
    </div>
  );

  const isStudent = user.role === 'student';

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Top Navigation */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold uppercase tracking-widest text-[10px] transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Retour à la gestion
      </button>

      {/* Profile Header */}
      <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
           <div className="w-32 h-32 rounded-[2.5rem] bg-indigo-50 border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden shrink-0">
              {user.profileImageUrl ? (
                <img src={user.profileImageUrl} alt={user.fullName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-16 h-16 text-slate-200" />
              )}
           </div>
           
           <div className="text-center md:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                 <h2 className="text-3xl font-black text-slate-900 italic tracking-tight uppercase">{user.fullName}</h2>
                 <span className={cn(
                    "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                    user.role === 'admin' ? "bg-purple-100 text-purple-700" :
                    user.role === 'professor' ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                  )}>
                    {user.role}
                 </span>
                 <div className={cn(
                    "w-2.5 h-2.5 rounded-full",
                    user.status === 'active' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" :
                    user.status === 'suspended' ? "bg-rose-500" : "bg-slate-300"
                  )}></div>
              </div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs flex items-center justify-center md:justify-start gap-2">
                 <Mail className="w-3.5 h-3.5" /> {user.email}
              </p>
              {isStudent && (u => (
                 <div className="mt-4 flex flex-wrap gap-4 justify-center md:justify-start">
                    <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Code Étudiant</p>
                       <p className="text-sm font-black text-indigo-600 font-mono">{(u as any).studentId}</p>
                    </div>
                    <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Département</p>
                       <p className="text-sm font-black text-slate-900">{u.department}</p>
                    </div>
                 </div>
              ))(user as Student)}
           </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full blur-[100px] opacity-40 -translate-y-1/2 translate-x-1/2"></div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
         {/* Sidebar stats/info */}
         <div className="space-y-6">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-6 shadow-2xl relative overflow-hidden">
               <div className="relative z-10 space-y-6">
                  <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest italic">Aperçu rapide</h3>
                  <div className="space-y-4">
                     <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                        <span className="text-[10px] font-black uppercase text-white/40">Évaluations</span>
                        <span className="text-lg font-black italic">{examResults.length}</span>
                     </div>
                     <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                        <span className="text-[10px] font-black uppercase text-white/40">Présence</span>
                        <span className="text-lg font-black italic">
                          {attendance.length > 0 ? Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100) : 0}%
                        </span>
                     </div>
                  </div>
                  <button className="w-full py-4 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest italic hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 group">
                     <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" /> Contacter l'étudiant
                  </button>
               </div>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm space-y-4">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest italic px-2">Détails Système</h3>
               <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 px-2 border-b border-slate-50">
                     <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">ID Unique</span>
                     <span className="text-[10px] font-mono text-slate-400 font-medium truncate max-w-[120px]">{user.uid}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-2 border-b border-slate-50">
                     <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Créé le</span>
                     <span className="text-[10px] font-black text-slate-900">
                        {user.createdAt?.seconds ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 'Initial system'}
                     </span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-2 border-b border-slate-50">
                     <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Dernière Connexion</span>
                     <span className="text-[10px] font-black text-slate-900 italic">
                        {user.lastLogin?.seconds ? new Date(user.lastLogin.seconds * 1000).toLocaleDateString() : 'Jamais'}
                     </span>
                  </div>
               </div>
            </div>
         </div>

         {/* Main content sections */}
         <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
               <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest italic flex items-center gap-2">
                     <GraduationCap className="w-5 h-5 text-indigo-600" /> Historique des Examens
                  </h4>
                  <LinkIcon href={`/admin-dashboard/exams?studentId=${user.uid}`} />
               </div>
               <div className="p-2">
                  {examResults.length > 0 ? (
                    <div className="space-y-1">
                       {examResults.map(res => (
                         <div key={res.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-all rounded-3xl group">
                            <div className="flex items-center gap-4">
                               <div className={cn(
                                 "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm italic shadow-sm",
                                 res.passed ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                               )}>
                                 {res.percentage}%
                               </div>
                               <div>
                                  <p className="text-xs font-black text-slate-900 italic uppercase">Examen {res.examId.substring(0, 8)}</p>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                    {new Date(res.submittedAt?.seconds * 1000).toLocaleDateString()} • {res.passed ? 'Admis' : 'Échec'}
                                  </p>
                               </div>
                            </div>
                            <button className="p-2 text-slate-300 group-hover:text-indigo-600 transition-all">
                               <ChevronRight className="w-5 h-5" />
                            </button>
                         </div>
                       ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest italic">
                       Aucun examen passé
                    </div>
                  )}
               </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
               <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest italic flex items-center gap-2">
                     <CreditCard className="w-5 h-5 text-indigo-600" /> Statut Financier
                  </h4>
               </div>
               <div className="p-2">
                  {payments.length > 0 ? (
                    <div className="space-y-1">
                       {payments.map(pay => (
                         <div key={pay.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-all rounded-3xl">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center shadow-sm">
                                  <CreditCard className="w-5 h-5 text-slate-400" />
                               </div>
                               <div>
                                  <p className="text-xs font-black text-slate-900 italic uppercase">{pay.paymentType}</p>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                    {new Date(pay.paymentDate?.seconds * 1000).toLocaleDateString()}
                                  </p>
                               </div>
                            </div>
                            <div className="text-right">
                               <p className="text-sm font-black text-slate-900 italic">{pay.amount} DOP</p>
                               <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Validé</span>
                            </div>
                         </div>
                       ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest italic">
                       Aucun paiement enregistré
                    </div>
                  )}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

const LinkIcon = ({ href }: { href: string }) => (
  <a href={href} className="p-2 text-slate-300 hover:text-indigo-600 transition-all">
     <ExternalLink className="w-4 h-4" />
  </a>
);

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
