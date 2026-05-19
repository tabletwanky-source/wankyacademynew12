import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft, Loader as Loader2, Lock, ShieldCheck } from 'lucide-react';
import { useAuth, ADMIN_EMAILS } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/language/LanguageSwitcher';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Auth failed');

      const userEmail = user.email?.toLowerCase().trim() || '';
      const isHardcodedAdmin = ADMIN_EMAILS.includes(userEmail);

      const { data: profile } = await supabase.from('profiles').select('role').eq('uid', user.id).maybeSingle();
      const isRoleAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';

      if (!isHardcodedAdmin && !isRoleAdmin) {
        await supabase.auth.signOut();
        throw new Error('Access Denied: Administrative privileges required.');
      }

      navigate('/admin-dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Verification failed. Please check admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
        <div className="p-10 text-center bg-indigo-600 text-white relative">
          <Link to="/" className="absolute left-8 top-12 -translate-y-1/2 hover:text-indigo-200 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="absolute right-8 top-6">
            <LanguageSwitcher />
          </div>
          <div className="inline-flex p-4 bg-white/20 rounded-xl mb-6 backdrop-blur-sm">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter uppercase mb-2">Admin Login</h1>
          <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest opacity-80">Wanky Academy Administrative Portal</p>
        </div>

        <div className="p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="p-4 bg-red-950/40 border border-red-500/50 text-red-400 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-3 italic">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                {error}
              </div>
            )}

            <label className="block space-y-2">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('auth.email')}</span>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@wanky.ac"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all outline-none text-white text-sm"
                />
              </div>
            </label>

            <label className="block space-y-2">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('auth.password')}</span>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all outline-none text-white"
                />
              </div>
            </label>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-[0.3em] text-sm rounded-lg shadow-xl shadow-indigo-900/40 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('common.loading')}
                  </>
                ) : (
                  'Login to Panel'
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Administrative Staff Only
          </div>
        </div>
      </div>
    </div>
  );
}
