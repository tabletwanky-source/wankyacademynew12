import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink, Routes, Route, Link, Navigate } from 'react-router-dom';
import { ChartBar as BarChart3, Users, UserPlus, CreditCard, GraduationCap, Settings, LogOut, Search, Bell, MoveVertical as MoreVertical, ChevronRight, ListFilter as Filter, Plus, Trash2, CreditCard as Edit, CircleCheck as CheckCircle2, CircleAlert as AlertCircle, UserCheck, BookOpen, FileText, Menu, X, Briefcase, Award, FlaskConical, Film, Video } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/adminService';
import { Student, Professor, Payment, CourseType, AppUser } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import AttendanceManager from './admin/AttendanceManager';
import ExamManager from './admin/ExamManager';
import CreateExam from './admin/CreateExam';
import QuestionManager from './admin/QuestionManager';
import ExamAnalytics from './admin/ExamAnalytics';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import LanguageSwitcher from '../components/language/LanguageSwitcher';

import IdentityManagement from './admin/IdentityManagement';
import StudentsManagement from './admin/StudentsManagement';
import ProfessorManagement from './admin/ProfessorManagement';
import AdminStudentPayments from './admin/StudentPayments';
import AdminFinancialSettings from './admin/FinancialSettings';
import ServiceRequestManager from './admin/ServiceRequestManager';
import AdminCertificateManager from './admin/AdminCertificateManager';
import CurriculumTerminal from './admin/CurriculumTerminal';
import ProfessorVideos from './professor/ProfessorVideos';
import ProfessorArticles from './professor/ProfessorArticles';
import ExperimentalModules from './admin/ExperimentalModules';
import SystemSettings from './admin/SystemSettings';
import UserManagement from './admin/UserManagement';
import UserProfileDetail from './shared/UserProfileDetail';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const AdminSidebarItem = ({ icon: Icon, label, to, end = false }: { icon: any, label: string, to: string, end?: boolean }) => (
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
    <Icon className={cn("w-5 h-5")} />
    <span>{label}</span>
  </NavLink>
);

const StatsCard = ({ label, value, icon: Icon, growth }: { label: string, value: string | number, icon: any, growth?: string }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-slate-50 rounded-lg">
        <Icon className="w-5 h-5 text-indigo-600" />
      </div>
      {growth && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">+{growth}</span>}
    </div>
    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">{label}</p>
    <h3 className="text-2xl font-black text-slate-900">{value}</h3>
  </div>
);

const AdminDashboardHome = () => {
  const [stats, setStats] = useState<any>({
    totalStudents: 0,
    totalProfessors: 0,
    totalCourses: 0,
    totalPayments: 0,
    perCourse: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      adminService.getDashboardStats().then(s => {
        setStats((prev: any) => ({ ...prev, ...s }));
        setLoading(false);
      }).catch(() => setLoading(false));
    };
    load();
  }, []);

  if (loading) return (
    <div className="grid md:grid-cols-4 gap-6 animate-pulse">
      {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white rounded-xl border border-slate-200 shadow-sm"></div>)}
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-4 gap-6">
        <StatsCard label="Total Students" value={stats.totalStudents} icon={Users} growth="12%" />
        <StatsCard label="Professors" value={stats.totalProfessors} icon={UserPlus} />
        <StatsCard label="Total Programs" value={stats.totalCourses} icon={GraduationCap} />
        <StatsCard label="Revenue Transacted" value={`${stats.totalPayments} DOP`} icon={CreditCard} />
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Enrollment Distribution</h3>
          <div className="space-y-6">
            {Object.entries(stats.perCourse).map(([course, count]: [any, any]) => (
              <div key={course} className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase text-slate-600">
                  <span>{course}</span>
                  <span>{count} Students</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 rounded-full" 
                    style={{ width: `${(count / stats.totalStudents) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 bg-[#0f172a] rounded-2xl p-8 text-white relative overflow-hidden">
           <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6">System Health</h3>
           <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                   <p className="text-xs font-bold">Firebase Core</p>
                   <p className="text-[10px] text-slate-400">Status: Operational</p>
                </div>
              </div>
               <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                   <p className="text-xs font-bold">API Latency</p>
                   <p className="text-[10px] text-slate-400">Response: 142ms</p>
                </div>
              </div>
           </div>
           <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { logout, userData, role } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Admin session ended');
      navigate('/admin/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  if (!userData) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="text-slate-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">
        Verifying Administrative Access...
      </div>
    </div>
  );

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
              <p className="text-[9px] uppercase font-bold tracking-widest opacity-60">Administration Panel</p>
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
          <div className="px-6 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Management</div>
          <AdminSidebarItem icon={BarChart3} label={t('common.dashboard')} to="/admin-dashboard" end />
          <AdminSidebarItem icon={Users} label="Utilisateurs" to="/admin-dashboard/users" />
          <AdminSidebarItem icon={GraduationCap} label="Students (Legacy)" to="/admin-dashboard/students" />
          <AdminSidebarItem icon={UserPlus} label="Professors (Legacy)" to="/admin-dashboard/professors" />
          <AdminSidebarItem icon={BookOpen} label="Curriculum" to="/admin-dashboard/curriculum" />
          <AdminSidebarItem icon={UserCheck} label="Attendance" to="/admin-dashboard/attendance" />
          <AdminSidebarItem icon={Award} label="Certificates" to="/admin-dashboard/certificates" />
          <AdminSidebarItem icon={FileText} label="Exams" to="/admin-dashboard/exams" />
          <AdminSidebarItem icon={Film} label="Vidéos" to="/admin-dashboard/videos" />
          <AdminSidebarItem icon={FileText} label="Articles Blog" to="/admin-dashboard/articles" />
          <AdminSidebarItem icon={UserCheck} label="Identity" to="/admin-dashboard/identity" />
          <AdminSidebarItem icon={CreditCard} label="Finance" to="/admin-dashboard/finance" />
          <AdminSidebarItem icon={Settings} label="Tarifs Admin" to="/admin-dashboard/settings/finance" />
          <AdminSidebarItem icon={Briefcase} label="WA Services" to="/admin-dashboard/services" />
          <AdminSidebarItem icon={FlaskConical} label="Experimental" to="/admin-dashboard/experimental" />
          
          <div className="px-6 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-6 mb-2">System</div>
          <AdminSidebarItem icon={Settings} label="Settings" to="/admin-dashboard/settings" />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 mb-4 overflow-hidden">
             <div className="w-8 h-8 shrink-0 rounded-lg bg-indigo-600 flex items-center justify-center text-xs font-black text-white shadow-lg shadow-indigo-600/20">
               {role === 'super_admin' ? 'SA' : 'AD'}
             </div>
             <div className="overflow-hidden">
               <p className="text-[11px] font-black text-white truncate uppercase tracking-tight">{userData.email}</p>
               <p className="text-[9px] opacity-50 font-black uppercase tracking-widest">{role?.replace('_', ' ')}</p>
             </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-400 transition-colors w-full group"
            id="admin-logout-btn"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
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
              <span>Admin:</span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              <span className="text-slate-900 border-b border-indigo-100 pb-0.5 whitespace-nowrap">{userData.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <LanguageSwitcher />
            <button className="relative p-1 text-slate-400 hover:text-indigo-600 transition-colors" id="admin-notifications-btn">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50/50">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route index element={<AdminDashboardHome />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="users/:id" element={<UserProfileDetail />} />
              <Route path="students" element={<StudentsManagement />} />
              <Route path="professors" element={<ProfessorManagement />} />
              <Route path="curriculum" element={<CurriculumTerminal />} />
              <Route path="identity" element={<IdentityManagement />} />
              <Route path="attendance" element={<AttendanceManager />} />
              <Route path="videos" element={<ProfessorVideos />} />
              <Route path="articles" element={<ProfessorArticles />} />
              <Route path="exams" element={<ExamManager />} />
              <Route path="exams/create" element={<CreateExam />} />
              <Route path="exams/:examId/edit" element={<CreateExam />} />
              <Route path="exams/:examId/questions" element={<QuestionManager />} />
              <Route path="exams/:examId/analytics" element={<ExamAnalytics />} />
              <Route path="finance" element={<AdminStudentPayments />} />
              <Route path="payments" element={<AdminStudentPayments />} /> {/* Alias for compatibility */}
              <Route path="settings/finance" element={<AdminFinancialSettings />} />
              <Route path="services" element={<ServiceRequestManager />} />
              <Route path="certificates" element={<AdminCertificateManager />} />
              <Route path="experimental" element={<ExperimentalModules />} />
              <Route path="settings" element={<SystemSettings />} />
              <Route path="*" element={<Navigate to="/admin-dashboard" />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
}
