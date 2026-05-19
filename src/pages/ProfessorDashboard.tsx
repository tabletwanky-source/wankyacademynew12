import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, Video, ClipboardCheck, FileText, Settings, LogOut, Menu, X, CirclePlus as PlusCircle, Clock, CircleCheck as CheckCircle, CircleAlert as AlertCircle, ChevronRight, Bell, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from '../lib/supabase';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const AnimatedValue = ({ value }: { value: string }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const target = parseInt(value) || 0;

  useEffect(() => {
    let start = displayValue;
    const duration = 1000;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const current = Math.floor(start + (target - start) * easeProgress);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [target]);

  return <>{displayValue}</>;
};

import ProfessorExamManager from './professor/ProfessorExamManager';
import ProfessorCreateExam from './professor/ProfessorCreateExam';
import ProfessorQuestionManager from './professor/ProfessorQuestionManager';
import ProfessorExamAnalytics from './professor/ProfessorExamAnalytics';
import ProfessorAttendance from './professor/ProfessorAttendance';
import ProfessorVideos from './professor/ProfessorVideos';
import ProfessorArticles from './professor/ProfessorArticles';
import ProfessorHomework from './professor/ProfessorHomework';
import ProfessorSettings from './professor/ProfessorSettings';
import ProfessorStudentManagement from './professor/StudentManagement';
import CurriculumTerminal from './admin/CurriculumTerminal';
import UserProfileDetail from './shared/UserProfileDetail';

// Sub-components (Drafts)
const ProfessorHome = () => {
  const { userData } = useAuth();
  const [counts, setCounts] = useState({
    students: 0,
    exams: 0,
    videos: 0,
    homeworks: 0
  });
  const [recentExams, setRecentExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userData) return;

    const loadStats = async () => {
      try {
        const [studentsRes, examsRes, videosRes, homeworkRes, recentRes] = await Promise.all([
          supabase.from('profiles').select('uid', { count: 'exact' }).eq('role', 'student').eq('department', userData.department),
          supabase.from('exams').select('id', { count: 'exact' }).eq('created_by', userData.uid).eq('published', true).eq('active', true),
          supabase.from('videos').select('id', { count: 'exact' }).eq('created_by', userData.uid),
          supabase.from('homework').select('id', { count: 'exact' }).eq('professor_uid', userData.uid),
          supabase.from('exams').select('*').eq('created_by', userData.uid).order('created_at', { ascending: false }).limit(5)
        ]);

        setCounts({
          students: studentsRes.count || 0,
          exams: examsRes.count || 0,
          videos: videosRes.count || 0,
          homeworks: homeworkRes.count || 0
        });

        if (recentRes.data) {
          setRecentExams(recentRes.data.map((e: any) => ({
            id: e.id, title: e.title, department: e.department,
            createdAt: e.created_at, active: e.active, published: e.published
          })));
        }
      } catch (error) {
        console.error('Professor dashboard load error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [userData]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-1 italic">Vue d'ensemble</p>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">Bonjour, Prof. {userData?.fullName.split(' ')[0]}</h2>
          <p className="text-slate-500 mt-1 font-medium">Gérez vos cours, examens et étudiants pour le département <span className="text-indigo-600 font-bold uppercase tracking-widest text-xs underline underline-offset-4 decoration-indigo-200">{userData?.department}</span>.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Users className="w-5 h-5" />} 
          label="Etudiants" 
          value={counts.students.toString()} 
          color="bg-blue-50 text-blue-600" 
          isLoading={loading}
        />
        <StatCard 
          icon={<BookOpen className="w-5 h-5" />} 
          label="Examens Actifs" 
          value={counts.exams.toString()} 
          color="bg-emerald-50 text-emerald-600" 
          isLoading={loading}
        />
        <StatCard 
          icon={<Video className="w-5 h-5" />} 
          label="Vidéos" 
          value={counts.videos.toString()} 
          color="bg-indigo-50 text-indigo-600" 
          isLoading={loading}
        />
        <StatCard 
          icon={<AlertCircle className="w-5 h-5" />} 
          label="Devoirs" 
          value={counts.homeworks.toString()} 
          color="bg-amber-50 text-amber-600" 
          isLoading={loading}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="font-black text-slate-900 mb-6 uppercase tracking-widest text-xs italic flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-indigo-600" /> Actions Rapides
              </h3>
              <div className="flex flex-wrap gap-4">
                <Link to="exams" className="flex items-center gap-3 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 italic group">
                  <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform" /> Nouvel Examen
                </Link>
                <Link to="attendance" className="flex items-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 italic">
                  <ClipboardCheck className="w-5 h-5" /> Marquer Présence
                </Link>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
             <h3 className="font-black text-slate-900 mb-6 uppercase tracking-widest text-xs italic">Activité Récente</h3>
             <div className="space-y-4">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-pulse">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-100 rounded-xl"></div>
                          <div className="space-y-2">
                             <div className="h-3 w-32 bg-slate-100 rounded"></div>
                             <div className="h-2 w-20 bg-slate-200 rounded"></div>
                          </div>
                       </div>
                    </div>
                  ))
                ) : recentExams.length > 0 ? (
                  recentExams.map((exam) => (
                    <Link key={exam.id} to={`exams/${exam.id}/analytics`} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-indigo-50/50 hover:border-indigo-100 transition-all group">
                       <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm transition-transform group-hover:scale-110",
                            exam.published ? "text-emerald-500" : "text-amber-500"
                          )}>
                             <BookOpen className="w-5 h-5" />
                          </div>
                          <div>
                             <p className="text-xs font-bold text-slate-900 italic uppercase tracking-tight">{exam.title}</p>
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 whitespace-nowrap">
                               {exam.published ? 'Publié' : 'Brouillon'} • {exam.createdAt?.seconds ? new Date(exam.createdAt.seconds * 1000).toLocaleDateString() : 'Date inconnue'}
                             </p>
                          </div>
                       </div>
                       <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  ))
                ) : (
                  <div className="py-12 text-center space-y-3">
                     <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-100">
                        <FileText className="w-8 h-8 text-slate-200" />
                     </div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aucune activité récente</p>
                  </div>
                )}
             </div>
          </div>
        </div>

        <div className="lg:col-span-1">
           <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl h-full">
              <div className="relative z-10 space-y-6">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest">
                    <Clock className="w-3 h-3 text-indigo-400" /> Session Active
                 </div>
                 <h4 className="text-2xl font-black italic tracking-tight leading-tight uppercase">Optimisez vos performances.</h4>
                 <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    Suivez la progression de vos étudiants en temps réel et ajustez vos examens pour un meilleur taux de réussite.
                 </p>
                 <button className="w-full py-4 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all italic">
                    Consulter les Rapports
                 </button>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none"></div>
           </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color, isLoading }: { icon: React.ReactNode, label: string, value: string, color: string, isLoading?: boolean }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all animate-in fade-in slide-in-from-bottom-4 duration-500 group border-b-8 border-b-slate-50">
    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform", color)}>
      {icon}
    </div>
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic mb-1">{label}</p>
    {isLoading ? (
      <div className="h-8 w-12 bg-slate-100 animate-pulse rounded-lg"></div>
    ) : (
      <p className="text-3xl font-black text-slate-900 italic tracking-tight">
        <AnimatedValue value={value} />
      </p>
    )}
  </div>
);

export default function ProfessorDashboard() {
  const { userData, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Professor session ended');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const menuItems = [
    { icon: <LayoutDashboard />, label: 'Tableau de bord', path: '/professor/dashboard' },
    { icon: <Users />, label: 'Étudiants', path: '/professor/dashboard/students' },
    { icon: <BookOpen />, label: 'Curriculum', path: '/professor/dashboard/curriculum' },
    { icon: <BookOpen />, label: 'Examens', path: '/professor/dashboard/exams' },
    { icon: <ClipboardCheck />, label: 'Présence', path: '/professor/dashboard/attendance' },
    { icon: <Video />, label: 'Vidéos', path: '/professor/dashboard/videos' },
    { icon: <FileText />, label: 'Articles', path: '/professor/dashboard/articles' },
    { icon: <FileText />, label: 'Devoirs', path: '/professor/dashboard/homework' },
    { icon: <Settings />, label: 'Paramètres', path: '/professor/dashboard/settings' },
  ];

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-[#0f172a] text-slate-300 border-r border-slate-800 flex flex-col transition-transform lg:translate-x-0 lg:static",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://i.postimg.cc/wTr99qNp/d-modern-logo-icon-for-Wanky-Academy-WA-1.png" alt="Wanky logo" className="w-10 h-10 object-contain drop-shadow-md border border-slate-700/50 rounded-lg p-1 bg-slate-800/50" />
            <div className="leading-none">
              <h1 className="text-white font-bold tracking-tight text-lg uppercase tracking-widest">WANKY</h1>
              <p className="text-[9px] uppercase font-bold tracking-widest opacity-60">Professor Panel</p>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-500 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-4 flex-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/professor/dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-6 py-3.5 transition-all text-sm font-bold uppercase tracking-widest",
                  isActive 
                    ? "bg-indigo-600/10 text-indigo-400 border-l-4 border-indigo-600" 
                    : "text-slate-500 hover:bg-slate-800/50 hover:text-slate-300 border-l-4 border-transparent"
                )}
              >
                {React.cloneElement(item.icon as React.ReactElement<any>, { className: "w-4 h-4" })}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all text-sm font-bold uppercase tracking-widest"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:flex items-center gap-3 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              <span>Professeur:</span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              <span className="text-slate-900 border-b border-indigo-100 pb-0.5 whitespace-nowrap">{userData?.fullName}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-6">
            <button className="relative p-2 text-slate-400 hover:text-indigo-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border-2 border-white shadow-sm"></span>
            </button>
            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden">
               <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.fullName || 'P')}&background=random`} alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50/50">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route index element={<ProfessorHome />} />
              <Route path="students" element={<ProfessorStudentManagement />} />
              <Route path="students/:id" element={<UserProfileDetail />} />
              <Route path="curriculum" element={<CurriculumTerminal />} />
              <Route path="exams" element={<ProfessorExamManager />} />
              <Route path="exams/create" element={<ProfessorCreateExam />} />
              <Route path="exams/:examId" element={<ProfessorCreateExam />} />
              <Route path="exams/:examId/questions" element={<ProfessorQuestionManager />} />
              <Route path="exams/:examId/analytics" element={<ProfessorExamAnalytics />} />
              <Route path="attendance" element={<ProfessorAttendance />} />
              <Route path="videos" element={<ProfessorVideos />} />
              <Route path="articles" element={<ProfessorArticles />} />
              <Route path="homework" element={<ProfessorHomework />} />
              <Route path="settings" element={<ProfessorSettings />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
}
