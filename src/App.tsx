import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useTranslation } from 'react-i18next';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserRole } from './types';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProfessorDashboard from './pages/ProfessorDashboard';
import ChangePassword from './pages/ChangePassword';
import VerifyCertificate from './pages/VerifyCertificate';
import VerifyBadge from './pages/VerifyBadge';
import WAMultiservices from './pages/WAMultiservices';
import BlogHome from './pages/public/BlogHome';
import ArticleDetail from './pages/public/ArticleDetail';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Cookies from './pages/Cookies';
import FAQ from './pages/FAQ';
import CopyrightPolicy from './pages/CopyrightPolicy';

const PrivateRoute = ({ children, roleRequired }: { children: React.ReactNode, roleRequired?: UserRole }) => {
  const { user, userData, role, loading } = useAuth();
  const { t } = useTranslation();
  
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="text-indigo-600 font-black flex items-center gap-3 italic">
        <span className="w-2 h-2 bg-indigo-600 rounded-full animate-ping"></span>
        {t('common.loading')}
      </div>
    </div>
  );
  
  if (!user) {
    const isAdminPath = window.location.pathname.startsWith('/admin');
    return <Navigate to={isAdminPath ? "/admin/login" : "/login"} />;
  }

  // Force password change if required
  // and we are not already on the change-password page
  if (userData && 'mustChangePassword' in userData && userData.mustChangePassword) {
    if (window.location.pathname !== '/change-password') {
      return <Navigate to="/change-password" />;
    }
  }

  if (roleRequired) {
    console.log(`Checking role: current=${role}, required=${roleRequired}`);
    if (role !== roleRequired) {
      if (role === 'student') return <Navigate to="/dashboard" />;
      if (role === 'admin') return <Navigate to="/admin-dashboard" />;
      if (role === 'professor') return <Navigate to="/professor/dashboard" />;
      return <Navigate to="/" />;
    }
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-certificate/:code" element={<VerifyCertificate />} />
        <Route path="/verify" element={<VerifyCertificate />} />
        <Route path="/verify-badge/:code" element={<VerifyBadge />} />
        <Route path="/verify-badge" element={<VerifyBadge />} />
        <Route path="/wa-multiservices" element={<WAMultiservices />} />
        <Route path="/blog" element={<BlogHome />} />
        <Route path="/blog/:articleId" element={<ArticleDetail />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/cookies" element={<Cookies />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/copyright-policy" element={<CopyrightPolicy />} />
        <Route path="/change-password" element={
          <PrivateRoute>
            <ChangePassword />
          </PrivateRoute>
        } />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route 
          path="/admin-dashboard/*" 
          element={
            <PrivateRoute roleRequired="admin">
              <AdminDashboard />
            </PrivateRoute>
          } 
        />

        {/* Professor Routes */}
        <Route 
          path="/professor/dashboard/*" 
          element={
            <PrivateRoute roleRequired="professor">
              <ProfessorDashboard />
            </PrivateRoute>
          } 
        />

        {/* Student Routes */}
        <Route 
          path="/dashboard/*" 
          element={
            <PrivateRoute roleRequired="student">
              <Dashboard />
            </PrivateRoute>
          } 
        />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors />
      <AppRoutes />
    </AuthProvider>
  );
}
