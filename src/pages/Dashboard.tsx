import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink, Routes, Route } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  CreditCard, 
  FileText, 
  User, 
  Settings, 
  Video,
  LogOut, 
  Menu, 
  X, 
  Bell,
  Search,
  GraduationCap,
  Calendar,
  Loader2,
  CheckCircle2,
  Clock,
  ClipboardList,
  History,
  ChevronRight,
  Video as VideoIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LearningHub from './learning/LearningHub';
import AttendanceHistory from './learning/AttendanceHistory';
import StudentExams from './exams/StudentExams';
import CurriculumBrowser from './learning/CurriculumBrowser';
import CurriculumViewer from './learning/CurriculumViewer';
import StudentCertificates from './student/StudentCertificates';
import StudentBadge from './student/StudentBadge';
import StudentVideos from './student/StudentVideos';
import ExamInstructions from './exams/ExamInstructions';
import ExamTerminal from './exams/ExamTerminal';
import ExamResultPage from './exams/ExamResult';
import StudentProfile from './student/StudentProfile';
import StudentSettings from './student/StudentSettings';
import StudentPayments from './student/StudentPayments';
import ExamHistory from './exams/ExamHistory';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import LanguageSwitcher from '../components/language/LanguageSwitcher';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SidebarItem = ({ icon: Icon, label, to, end = false }: { icon: any, label: string, to: string, end?: boolean }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) => cn(
      "flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all group",
      isActive 
        ? "bg-indigo-600/10 text-indigo-400 border-r-4 border-indigo-600" 
        : "text-slate-400 hover:bg-slate-800 hover:text-white"
    )}
  >
    <Icon className={cn("w-5 h-5", "transition-colors")} />
    <span>{label}</span>
  </NavLink>
);

import { notificationService } from '../services/notificationService';
import { learningService } from '../services/learningService';
import { examService } from '../services/examService';
import { certificateService } from '../services/certificateService';
import { Exam, Homework, ExamResult, Certificate, HomeworkSubmission } from '../types';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

const DashboardHome = () => {
  const { studentData } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [upcomingTasks, setUpcomingTasks] = useState<any[]>([]);
  const [stats, setStats] = useState({
    avgScore: 0,
    examsPassed: 0,
    completedHomework: 0,
    certificatesCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentData) return;

    let exams: Exam[] = [];
    let homeworkArr: Homework[] = [];
    let videoArr: any[] = [];
    let results: ExamResult[] = [];
    let certs: Certificate[] = [];
    let studentSubmissions: HomeworkSubmission[] = [];

    const updateDashboard = () => {
      // 1. Calculate Stats
      const passedExams = results.filter(r => r.passed).length;
      const gradedHomework = studentSubmissions.filter(s => s.status === 'graded').length;
      const avg = results.length > 0 
        ? Math.round(results.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / results.length) 
        : 0;

      setStats({
        avgScore: avg,
        examsPassed: passedExams,
        completedHomework: gradedHomework, 
        certificatesCount: certs.length
      });

      // 2. Build Tasks
      const tasks: any[] = [];

      // Add Exams to tasks
      exams.forEach(e => {
        const hasResult = results.some(r => r.examId === e.id && r.passed);
        if (!hasResult) {
          let status = 'Available';
          const now = new Date();
          const start = e.startDate?.toDate ? e.startDate.toDate() : (e.startDate ? new Date(e.startDate) : null);
          
          if (start && now < start) {
            status = 'Upcoming';
          } else if (e.status !== 'active' || !isVerified) {
            status = 'Locked';
          }

          tasks.push({
            id: e.id,
            title: e.title,
            type: 'exam',
            date: e.endDate,
            status,
            icon: ClipboardList,
            onClick: () => {
              if (status === 'Available') {
                navigate(`/dashboard/exams/${e.id}/instructions`);
              }
            }
          });
        }
      });

      // Add Homework to tasks
      homeworkArr.forEach(h => {
        const submission = studentSubmissions.find(s => s.homeworkId === h.id);
        let status = submission ? (submission.status === 'graded' ? 'Graded' : 'Submitted') : 'Pending';
        if (!isVerified) status = 'Locked';

        tasks.push({
          id: h.id,
          title: h.title,
          type: 'homework',
          date: h.dueDate,
          status,
          icon: BookOpen,
          onClick: () => {
            if (status !== 'Locked') {
              navigate('/dashboard/learning');
            }
          }
        });
      });

      // Add Videos
      videoArr.forEach(v => {
        tasks.push({
          id: v.id,
          title: v.title,
          type: 'lesson',
          date: v.uploadedAt,
          status: isVerified ? 'Available' : 'Locked',
          icon: VideoIcon,
          onClick: () => navigate('/dashboard/learning')
        });
      });

      // Sort by date (handle Firestore timestamps or strings)
      const sorted = tasks.sort((a, b) => {
        const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date || 0);
        const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date || 0);
        return dateB.getTime() - dateA.getTime();
      });

      setUpcomingTasks(sorted.slice(0, 5));
      setLoading(false);
    };

    const unsubExams = examService.subscribePublishedExamsByDepartment(studentData.department, (data) => {
      exams = data;
      updateDashboard();
    });

    const unsubHomework = learningService.subscribeHomeworkByDepartment(studentData.department, (data) => {
      homeworkArr = data;
      updateDashboard();
    });

    const unsubSubmissions = learningService.subscribeStudentSubmissions(studentData.uid, (data) => {
      studentSubmissions = data;
      updateDashboard();
    });

    const unsubVideos = learningService.subscribeVideosByDepartment(studentData.department, (data) => {
      videoArr = data;
      updateDashboard();
    });

    const unsubCerts = certificateService.subscribeStudentCertificates(studentData.uid, (data) => {
      certs = data;
      updateDashboard();
    });

    const qResults = query(
      collection(db, 'examResults'),
      where('studentId', '==', studentData.uid)
    );
    const unsubResults = onSnapshot(qResults, (snap) => {
      results = snap.docs.map(d => ({ ...d.data(), id: d.id })) as ExamResult[];
      updateDashboard();
    }, (error) => {
      console.error("Dashboard results snapshot error:", error);
    });

    return () => {
      unsubExams();
      unsubHomework();
      unsubSubmissions();
      unsubVideos();
      unsubCerts();
      unsubResults();
    };
  }, [studentData, navigate]);

  if (!studentData) return null;

  const isVerified = studentData.status === 'active';

  return (
    <div className="space-y-8 pb-12">
      {/* Verification Warning */}
      {!isVerified && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="bg-amber-50 border border-amber-200 p-6 rounded-2xl flex items-center gap-4 italic"
        >
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 shrink-0">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">Verificación Pendiente</h4>
            <p className="text-xs text-amber-700 font-medium">Votre compte est en cours de révision. L'accès complet aux examens et aux certificats sera activé après validation administrative.</p>
          </div>
        </motion.div>
      )}

      {/* Stats/Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        {[
          { label: t('dashboard.stats.activeCourse'), value: studentData.department, icon: BookOpen, color: 'text-indigo-600' },
          { label: 'Exams Passed', value: stats.examsPassed, icon: CheckCircle2, color: 'text-emerald-500' },
          { label: 'Average Score', value: `${stats.avgScore}%`, icon: History, color: 'text-amber-500' },
          { label: 'Certificates', value: stats.certificatesCount, icon: FileText, color: 'text-indigo-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm transition-all hover:shadow-xl hover:border-indigo-100 group">
            <div className="flex justify-between items-start mb-4">
              <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest">{stat.label}</p>
              <div className={cn("p-2 rounded-xl transition-colors", "bg-slate-50 group-hover:bg-indigo-50 group-hover:text-indigo-600")}>
                <stat.icon className={cn("w-4 h-4")} />
              </div>
            </div>
            <h3 className="text-2xl font-black text-slate-900 italic tracking-tighter">
              {stat.value}
            </h3>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Profile Card - Featured */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-[#0f172a] text-white p-8 rounded-[3rem] shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
            <div className="w-28 h-28 rounded-[2rem] border-4 border-indigo-500/20 p-1.5 mb-6 relative z-10 overflow-hidden rotate-3 hover:rotate-0 transition-transform duration-500">
                {studentData.photoURL && studentData.photoURL !== "" ? (
                  <img 
                    src={studentData.photoURL} 
                    alt={studentData.fullName} 
                    className="w-full h-full rounded-[1.5rem] object-cover bg-slate-700" 
                  />
                ) : (
                  <div className="w-full h-full rounded-[1.5rem] bg-slate-800 flex items-center justify-center">
                    <User className="w-12 h-12 text-slate-600" />
                  </div>
                )}
            </div>
            <p className="text-xl font-black relative z-10 uppercase italic tracking-tighter">{studentData.fullName}</p>
            <p className="text-indigo-400 font-black text-[10px] tracking-[0.3em] mb-8 relative z-10 uppercase">{studentData.studentId}</p>
            
            <div className="w-full space-y-4 pt-8 border-t border-slate-800 relative z-10 italic">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500 font-black uppercase tracking-widest leading-none">Curriculum</span>
                <span className="font-bold text-white uppercase">{studentData.department}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500 font-black uppercase tracking-widest leading-none">ID Account</span>
                <span className={cn(
                  "font-black uppercase tracking-widest px-2 py-0.5 rounded-md text-[9px]",
                  isVerified ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                )}>
                  {isVerified ? t('common.active') : 'Pending'}
                </span>
              </div>
            </div>

            {/* Background design circle */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-indigo-600/5 rounded-full blur-3xl"></div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
             <div className="relative z-10">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <div className="w-1 h-3 bg-indigo-600 rounded-full"></div>
                   {t('dashboard.requirements.title')}
                </h3>
                <p className="text-xs font-medium text-slate-600 leading-relaxed italic">
                  {t('dashboard.requirements.description')}
                </p>
             </div>
             <GraduationCap className="absolute -bottom-4 -right-4 w-24 h-24 text-slate-50 opacity-[0.03] group-hover:scale-110 transition-transform" />
          </div>
        </div>

        {/* Content Tabs area */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter flex items-center gap-3">
                  <LayoutDashboard className="w-5 h-5 text-indigo-600" />
                  Academic Portal
                </h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">LMS Interactive Workspace</p>
              </div>
              <div className="flex items-center gap-4">
                 <span className={cn(
                   "text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest italic",
                   isVerified ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                 )}>
                    {isVerified ? t('common.verified') : 'Under Review'}
                 </span>
              </div>
            </div>
            
            <div className="p-10">
              <div className="mb-10">
                <h3 className="font-black text-slate-900 mb-6 text-[10px] uppercase tracking-[0.3em] flex items-center gap-2">
                  <div className="w-6 h-0.5 bg-slate-200"></div>
                  Registry Details
                </h3>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="p-6 rounded-3xl bg-slate-50/50 border border-slate-100 group hover:bg-white hover:border-indigo-100 transition-all">
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">{t('dashboard.enrolled.registered')}</p>
                    <p className="text-sm font-black text-slate-900 italic">
                      {studentData.createdAt?.toDate ? studentData.createdAt.toDate().toLocaleDateString('fr-FR', { month: 'long', day: 'numeric', year: 'numeric'}) : t('common.loading')}
                    </p>
                  </div>
                  <div className="p-6 rounded-3xl bg-slate-50/50 border border-slate-100 group hover:bg-white hover:border-indigo-100 transition-all">
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Current Cycle</p>
                    <p className="text-sm font-black text-slate-900 italic">Session 2024 - 2025</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-black text-slate-900 mb-6 text-[10px] uppercase tracking-[0.3em] flex items-center gap-2">
                  <div className="w-6 h-0.5 bg-slate-200"></div>
                  Academic Agenda
                </h3>
                
                {loading ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Parsing Agenda...</p>
                  </div>
                ) : upcomingTasks.length > 0 ? (
                  upcomingTasks.map((task, i) => (
                    <motion.div 
                      key={task.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={task.onClick}
                      className="group p-6 bg-white border border-slate-100 rounded-[2rem] flex items-center gap-6 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:rotate-6 transition-all duration-500">
                        <task.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-1">{task.type}</p>
                        <p className="text-lg font-black text-slate-900 uppercase italic tracking-tighter leading-tight">{task.title}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                           {task.date?.toDate ? `DUE: ${task.date.toDate().toLocaleDateString()}` : 'No Deadline'}
                        </p>
                      </div>
                      <div className="hidden sm:flex flex-col items-end gap-2">
                        <span className={cn(
                          "text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border transition-colors",
                          task.status === 'Available' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                          task.status === 'Locked' ? "bg-slate-50 text-slate-300 border-slate-100" :
                          "bg-amber-50 text-amber-600 border-amber-100"
                        )}>
                          {task.status}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-indigo-600 group-hover:translate-x-2 transition-all" />
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-20 text-center space-y-6">
                    <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto text-slate-100">
                       <ClipboardList className="w-10 h-10" />
                    </div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-300 italic italic">📭 No academic tasks assigned yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { t } = useTranslation();
  const { logout, studentData, user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  React.useEffect(() => {
    if (!user) return;
    const unsubscribe = notificationService.subscribeToNotifications(user.uid, (notes) => {
      const unread = notes.filter(n => !n.read);
      if (unread.length > 0) {
        unread.forEach(n => {
          toast(n.title, {
            description: n.message,
            action: {
              label: 'Mark read',
              onClick: () => notificationService.markAsRead(n.id)
            }
          });
        });
      }
    });
    return unsubscribe;
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Successfully logged out');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  if (!studentData) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />
        <p className="text-slate-500 font-bold tracking-tight text-lg italic">{t('common.loading')}</p>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
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

      {/* Sidebar - Geometric Balance Dark Theme */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-[#0f172a] text-slate-300 border-r border-slate-800 flex flex-col transition-transform lg:translate-x-0 lg:static",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center gap-3">
          <img src="https://i.postimg.cc/wTr99qNp/d-modern-logo-icon-for-Wanky-Academy-WA-1.png" alt="Wanky logo" className="w-10 h-10 object-contain drop-shadow-md" />
          <div className="leading-none">
            <h1 className="text-white font-bold tracking-tight text-lg">WANKY</h1>
            <p className="text-[10px] uppercase font-bold tracking-widest opacity-60">{t('common.portal')}</p>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden ml-auto text-slate-500 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-4 flex-1">
          <div className="px-6 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Academic Main</div>
          <SidebarItem icon={LayoutDashboard} label={t('common.dashboard')} to="/dashboard" end />
          <SidebarItem icon={Video} label="Vidéos" to="/dashboard/videos" />
          <SidebarItem icon={BookOpen} label="Curriculum" to="/dashboard/curriculum" />
          <SidebarItem icon={BookOpen} label={t('common.learning')} to="/dashboard/learning" />
          <SidebarItem icon={ClipboardList} label={t('common.exams')} to="/dashboard/exams" />
          <SidebarItem icon={History} label="Exam History" to="/dashboard/exam-history" />
          <SidebarItem icon={FileText} label="Certificates" to="/dashboard/certificates" />
          <SidebarItem icon={GraduationCap} label="Badge ID" to="/dashboard/badge" />
          <SidebarItem icon={Calendar} label={t('common.attendance')} to="/dashboard/attendance" />
          <SidebarItem icon={CreditCard} label={t('common.finance')} to="/dashboard/payments" />
          
          <div className="px-6 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-6 mb-2">Personal</div>
          <SidebarItem icon={User} label={t('common.profile')} to="/dashboard/profile" />
          <SidebarItem icon={Settings} label={t('common.settings')} to="/dashboard/settings" />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 mb-4">
             <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden ring-2 ring-slate-700 flex items-center justify-center">
               {studentData.photoURL && studentData.photoURL !== "" ? (
                 <img src={studentData.photoURL} alt="p" className="w-full h-full object-cover" />
               ) : (
                 <User className="w-4 h-4 text-slate-500" />
               )}
             </div>
             <div className="overflow-hidden">
               <p className="text-xs font-bold text-white truncate">{studentData.fullName.split(' ')[0]}</p>
               <p className="text-[10px] opacity-50 font-bold uppercase tracking-wider">Student Active</p>
             </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-400 hover:text-red-400 transition-colors w-full group"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('common.logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:flex items-center gap-3 text-slate-500 text-sm italic">
              <span className="hidden md:inline">Portal Status:</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse"></span>
              <span className="text-emerald-600 not-italic font-bold text-[10px] uppercase tracking-widest">Secure connection</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-6">
            <div className="flex-shrink-0">
               <LanguageSwitcher />
            </div>
            
            <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg group focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
              <Search className="w-3.5 h-3.5 text-slate-400 group-focus-within:text-indigo-600" />
              <input type="text" placeholder="Quick Search..." className="bg-transparent border-none focus:ring-0 text-xs w-24 xl:w-32 outline-none text-slate-600 placeholder:text-slate-400" />
            </div>

            <button className="relative p-2 text-slate-400 hover:text-indigo-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full border-2 border-white shadow-sm"></span>
            </button>

            <div className="flex items-center gap-3 pl-2 sm:pl-0">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-slate-800 leading-none truncate max-w-[100px]">{studentData.fullName}</p>
                <p className="text-[10px] font-mono text-indigo-500 mt-1 uppercase tracking-tight">{studentData.studentId}</p>
              </div>
              <div 
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-slate-100 border border-slate-200 shadow-sm transition-transform active:scale-90 overflow-hidden flex items-center justify-center cursor-pointer"
                onClick={() => navigate('/dashboard/profile')}
              >
                {studentData.photoURL && studentData.photoURL !== "" ? (
                  <img src={studentData.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-slate-300" />
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50/50">
          <div className="max-w-6xl mx-auto">
            <Routes>
              <Route index element={<DashboardHome />} />
              <Route path="videos" element={<StudentVideos />} />
              <Route path="learning" element={<LearningHub />} />
              <Route path="curriculum" element={<CurriculumBrowser />} />
              <Route path="curriculum/:id" element={<CurriculumViewer />} />
              <Route path="attendance" element={<AttendanceHistory />} />
              <Route path="exams" element={<StudentExams />} />
              <Route path="exam-history" element={<ExamHistory />} />
              <Route path="exams/:examId/instructions" element={<ExamInstructions />} />
              <Route path="exams/:examId/terminal" element={<ExamTerminal />} />
              <Route path="exams/results/:resultId" element={<ExamResultPage />} />
              <Route path="certificates" element={<StudentCertificates />} />
              <Route path="badge" element={<StudentBadge />} />
              <Route path="profile" element={<StudentProfile />} />
              <Route path="settings" element={<StudentSettings />} />
              <Route path="payments" element={<StudentPayments />} />
              <Route path="*" element={<div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 shadow-sm font-bold uppercase tracking-widest text-xs italic">Experimental Module - Under Secure Development</div>} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
}
