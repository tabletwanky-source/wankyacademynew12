import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function ChangePassword() {
  const { user, userData } = useAuth();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      const { error: pwError } = await supabase.auth.updateUser({ password: newPassword });
      if (pwError) throw pwError;
      await supabase.from('profiles').update({
        must_change_password: false,
        temporary_password: false
      }).eq('uid', user.id);
      toast.success('Password changed successfully');
      
      // Redirect based on role
      if (userData?.role === 'admin') navigate('/admin-dashboard');
      else if (userData?.role === 'professor') navigate('/professor/dashboard');
      else navigate('/dashboard');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
      >
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
              <ShieldCheck className="w-8 h-8" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">Change Password</h2>
          <p className="text-slate-500 text-center text-sm mb-8">
            You are using a temporary password. Please set a new secure password to continue.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">New Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="block w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-sm placeholder:text-slate-400"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Confirm New Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPass ? 'text' : 'password'}
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="block w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-sm placeholder:text-slate-400"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#0f172a] text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait"
            >
              {loading ? 'Changing...' : 'Update Password'}
            </button>
          </form>
        </div>
        
        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
          <ShieldCheck className="w-3 h-3" />
          Secure Encryption Enabled
        </div>
      </motion.div>
    </div>
  );
}
