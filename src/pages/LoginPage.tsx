import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft, Loader as Loader2, Lock, Terminal } from 'lucide-react';
import { useAuth, ADMIN_EMAILS } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/language/LanguageSwitcher';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const emailToLogin = identifier.trim().toLowerCase();
      console.log('Login attempt started for:', emailToLogin);

      await login(emailToLogin, password);

      const { data: { user: loggedUser } } = await supabase.auth.getUser();
      if (!loggedUser) throw new Error('Auth failed');

      const { data: profile } = await supabase.from('profiles').select('role, must_change_password').eq('uid', loggedUser.id).maybeSingle();

      const email = loggedUser.email?.toLowerCase().trim() || '';
      const isAdmin = ADMIN_EMAILS.includes(email);

      if (!profile) {
        if (isAdmin) {
          navigate('/admin-dashboard');
          return;
        }
        throw new Error('User profile not found. Please contact support.');
      }

      if (profile.must_change_password) {
        navigate('/change-password');
        return;
      }

      const userRole = profile.role || (isAdmin ? 'admin' : 'student');

      if (userRole === 'admin') {
        navigate('/admin-dashboard');
      } else if (userRole === 'professor') {
        navigate('/professor/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Login Process Error:', err);
      let displayError = err.message || 'Authentication failed. Please verify credentials.';
      
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        displayError = 'Incorrect email or password. Please verify and try again.';
      } else if (err.code === 'auth/user-not-found') {
        displayError = 'No account found with this email address.';
      } else if (err.code === 'auth/invalid-email') {
        displayError = 'Please enter a valid email address.';
      } else if (err.code === 'auth/network-request-failed') {
        displayError = 'Network error. Please check your connection.';
      } else if (err.code === 'permission-denied') {
        displayError = 'System Permission Denied. Contact admin.';
      }
      
      setError(displayError);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      const { data: { user: loggedUser } } = await supabase.auth.getUser();
      if (!loggedUser) throw new Error('Google Auth connection lost');

      const email = loggedUser.email?.toLowerCase().trim() || '';
      const isAdmin = ADMIN_EMAILS.includes(email);

      const { data: profile } = await supabase.from('profiles').select('role').eq('uid', loggedUser.id).maybeSingle();

      if (!profile) {
        navigate(isAdmin ? '/admin-dashboard' : '/');
        return;
      }

      const userRole = profile.role || (isAdmin ? 'admin' : 'student');
      if (userRole === 'admin') navigate('/admin-dashboard');
      else if (userRole === 'professor') navigate('/professor/dashboard');
      else navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="p-10 text-center bg-[#0f172a] text-white relative">
          <Link to="/" className="absolute left-8 top-12 -translate-y-1/2 hover:text-indigo-400 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="absolute right-8 top-6">
            <LanguageSwitcher />
          </div>
          <div className="inline-flex mb-6 drop-shadow-2xl">
            <img src="https://i.postimg.cc/wTr99qNp/d-modern-logo-icon-for-Wanky-Academy-WA-1.png" alt="Wanky Academy Logo" className="w-20 h-20 object-contain" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter uppercase mb-2">{t('auth.login')}</h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Wanky Academy Student Portal</p>
        </div>

        <div className="p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-3 italic">
                <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                {error}
              </div>
            )}

            <label className="block space-y-2">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('auth.email')}</span>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  placeholder="student@wankyacademy.com"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-mono text-sm tracking-tight"
                />
              </div>
            </label>

            <label className="block space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('auth.password')}</span>
                <a href="#" className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest hover:underline">Reset?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                />
              </div>
            </label>

            <div className="pt-4 space-y-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#0f172a] hover:bg-slate-800 text-white font-black uppercase tracking-[0.3em] text-sm rounded-lg shadow-xl shadow-slate-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('common.loading')}
                  </>
                ) : (
                  t('auth.login')
                )}
              </button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-[9px] uppercase font-bold tracking-widest">
                  <span className="px-4 bg-white text-slate-400">Or Access with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-4 bg-white border border-slate-200 text-slate-700 font-bold uppercase tracking-[0.2em] text-[11px] rounded-lg shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                {t('auth.googleContinue')}
              </button>
            </div>
          </form>

          <div className="mt-12 text-center border-t border-slate-100 pt-8">
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">
              {t('auth.noAccount')} <Link to="/register" className="text-indigo-600 font-black border-b border-indigo-100 hover:border-indigo-600 transition-all ml-1">{t('auth.register')}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
