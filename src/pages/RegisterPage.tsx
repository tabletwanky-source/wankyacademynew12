import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  GraduationCap, 
  ArrowLeft, 
  Loader2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Lock, 
  CheckCircle2, 
  Download, 
  LayoutDashboard, 
  LogIn 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { studentService } from '../services/studentService';
import { CourseType, Student } from '../types';
import { useAuth } from '../context/AuthContext';

import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/language/LanguageSwitcher';

import ImageInput from '../components/common/ImageInput';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<Student | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    password: '',
    confirmPassword: '',
    photoURL: '',
    department: '' as CourseType | '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.department) {
      setError('Please select a course');
      return;
    }

    setLoading(true);
    try {
      const student = await studentService.registerStudent({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        dateOfBirth: formData.dateOfBirth,
        department: formData.department as CourseType,
        active: true,
        password: formData.password,
        photoURL: formData.photoURL
      });
      setSuccessData(student);
    } catch (err: any) {
      let displayError = err.message || 'Registration failed. Please try again.';
      
      // Try to parse JSON error from firestoreErrors utility
      try {
        const parsed = JSON.parse(err.message);
        displayError = parsed.error;
      } catch (e) {
        // Not a JSON error, keep original message
      }

      if (displayError.includes('auth/operation-not-allowed')) {
        setError('Email/Password registration is not enabled. Please enable it in the Firebase Console under Authentication > Sign-in method.');
      } else {
        setError(displayError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    if (!formData.department) {
      setError('Please select a course first before continuing with Google');
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      const student = await studentService.registerWithGoogle(formData.department as CourseType);
      setSuccessData(student);
    } catch (err: any) {
      setError(err.message || 'Google registration failed');
    } finally {
      setLoading(false);
    }
  };

  const RegistrationSuccessModal = ({ student }: { student: Student }) => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] overflow-hidden max-w-2xl w-full shadow-2xl relative"
      >
        {/* Success Header */}
        <div className="bg-indigo-600 p-8 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12, delay: 0.2 }}
            className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl"
          >
            <CheckCircle2 className="w-10 h-10 text-indigo-600" />
          </motion.div>
          <h2 className="text-3xl font-black tracking-tighter uppercase mb-2">{t('auth.successTitle')}</h2>
          <p className="text-indigo-100 text-sm font-bold uppercase tracking-widest opacity-80">{t('auth.successSubtitle')}</p>
        </div>

        <div className="p-10 space-y-8">
          {/* Profile Card */}
            <div className="flex flex-col md:flex-row items-center gap-8 p-6 bg-slate-50 rounded-3xl border border-slate-100">
            {student.photoURL && student.photoURL !== "" ? (
              <img 
                src={student.photoURL} 
                alt={student.fullName} 
                className="w-24 h-24 rounded-2xl object-cover shadow-lg border-4 border-white"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-lg border-4 border-white">
                <User className="w-10 h-10" />
              </div>
            )}
            <div className="text-center md:text-left flex-1">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase mb-1">{student.fullName}</h3>
              <p className="text-indigo-600 font-bold uppercase tracking-[0.2em] text-[10px] mb-4">{student.department}</p>
              
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{t('auth.yourCode')}</p>
                <div className="text-xl font-black text-slate-900 font-mono tracking-tighter bg-white px-4 py-2 rounded-xl border border-slate-200 inline-block">
                  {student.studentId}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-l-4 border-indigo-600 bg-indigo-50/50 rounded-r-2xl">
            <p className="text-slate-700 font-medium leading-relaxed italic text-sm">
              {t('auth.loginInstructions')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
            <button
               onClick={() => navigate('/dashboard')}
               className="flex flex-col items-center justify-center gap-3 p-6 bg-[#0f172a] text-white rounded-[2rem] hover:bg-slate-800 transition-all group"
            >
              <LayoutDashboard className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest text-center">{t('auth.goToDashboard')}</span>
            </button>
            <button
               onClick={() => navigate('/login')}
               className="flex flex-col items-center justify-center gap-3 p-6 bg-white border-2 border-slate-100 text-slate-900 rounded-[2rem] hover:border-indigo-600 transition-all group"
            >
              <LogIn className="w-6 h-6 text-indigo-600 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest text-center">{t('auth.login')}</span>
            </button>
            <button
               onClick={() => window.print()}
               className="flex flex-col items-center justify-center gap-3 p-6 bg-slate-100 text-slate-600 rounded-[2rem] hover:bg-slate-200 transition-all group"
            >
              <Download className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest text-center">{t('auth.downloadSlip')}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      <AnimatePresence>
        {successData && <RegistrationSuccessModal student={successData} />}
      </AnimatePresence>
      {/* Left side - Info - Geometric Balance Dark Side */}
      <div className="hidden lg:flex lg:w-1/3 bg-[#0f172a] p-16 text-slate-300 flex-col justify-between relative overflow-hidden shrink-0">
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 mb-16 hover:opacity-80 transition-opacity">
            <img src="https://i.postimg.cc/wTr99qNp/d-modern-logo-icon-for-Wanky-Academy-WA-1.png" alt="Wanky Academy" className="w-14 h-14 object-contain brightness-0 invert" />
            <span className="text-2xl font-black text-white tracking-tighter uppercase">Wanky</span>
          </Link>
          <div className="space-y-4 mb-12">
            <div className="inline-block px-3 py-1 bg-indigo-500/10 rounded text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-4">Wanky Academy Inscription</div>
            <h2 className="text-5xl font-black text-white leading-[0.9] tracking-tighter">BUILD YOUR <br/><span className="text-indigo-500">DIGITAL</span> <br/>FUTURE.</h2>
          </div>
          
          <div className="space-y-8 pt-12 border-t border-slate-800">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-indigo-400 font-mono text-xs">01</div>
              <div>
                <p className="font-bold text-white uppercase text-xs tracking-widest mb-1">Fill out your details</p>
                <p className="text-slate-500 text-xs font-medium uppercase tracking-wider leading-relaxed">Provide your personal information to create your student account.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-indigo-400 font-mono text-xs">02</div>
              <div>
                <p className="font-bold text-white uppercase text-xs tracking-widest mb-1">Choose your track</p>
                <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Select the academic program that fits your professional goals.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-auto relative z-10 opacity-30 text-[10px] font-bold uppercase tracking-widest">
          © 2026 Wanky Academy Portal
        </div>

        {/* Abstract Background Design */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-800/20 rotate-45 border-[20px] border-slate-800/10 -ml-32 -mb-32"></div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 p-8 lg:p-20 flex flex-col justify-center overflow-y-auto">
        <div className="max-w-3xl mx-auto w-full">
          <div className="mb-12 flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">{t('auth.register')}</h1>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">{t('auth.createAccount')}</p>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <Link to="/" className="text-slate-300 hover:text-indigo-600 transition-colors p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-[11px] font-black uppercase tracking-widest flex items-center gap-3">
                <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                {error}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
              {/* Profile Photo - Integrated ImageInput */}
              <div className="col-span-2">
                <ImageInput 
                  value={formData.photoURL}
                  onChange={(url) => setFormData({...formData, photoURL: url})}
                  folder="students"
                  label="Profile Picture"
                />
              </div>

              {/* Data Inputs */}
              <div className="space-y-6">
                <label className="block space-y-2">
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('auth.fullName')}</span>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                    <input type="text" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="Jean Dupont" className="geometric-input pl-10" />
                  </div>
                </label>

                <label className="block space-y-2">
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('auth.email')}</span>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                    <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="student@wanky.ac" className="geometric-input pl-10" />
                  </div>
                </label>

                <label className="block space-y-2">
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('auth.phone')}</span>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                    <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+225 XX XX XX XX" className="geometric-input pl-10" />
                  </div>
                </label>
              </div>

              <div className="space-y-6">
                <label className="block space-y-2">
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('auth.address')}</span>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                    <input type="text" required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Location, City" className="geometric-input pl-10" />
                  </div>
                </label>

                <label className="block space-y-2">
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('auth.birth')}</span>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                    <input type="date" required value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} className="geometric-input pl-10 pr-4" />
                  </div>
                </label>

                <label className="block space-y-2">
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('auth.course')}</span>
                  <select required value={formData.department} onChange={e => setFormData({...formData, department: e.target.value as CourseType})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer">
                    <option value="">-- {t('auth.course')} --</option>
                    <option value="Auto École">Auto École</option>
                    <option value="Informatique">Informatique</option>
                    <option value="Technique Informatique">Technique Informatique</option>
                  </select>
                </label>
              </div>

              {/* Password Section */}
              <div className="col-span-2 grid md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                <label className="block space-y-2">
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('auth.password')}</span>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                    <input type="password" required minLength={6} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="geometric-input pl-10" />
                  </div>
                </label>
                <label className="block space-y-2">
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('auth.confirmPassword')}</span>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                    <input type="password" required value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} className="geometric-input pl-10" />
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-8 space-y-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#0f172a] hover:bg-slate-800 text-white font-black uppercase tracking-[0.3em] text-sm rounded-lg shadow-2xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('common.loading')}
                  </>
                ) : (
                  t('auth.register')
                )}
              </button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
                  <span className="px-4 bg-white text-slate-400">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleRegister}
                disabled={loading}
                className="w-full py-4 bg-white border border-slate-200 text-slate-700 font-bold uppercase tracking-[0.2em] text-[11px] rounded-lg shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                {t('auth.googleContinue')}
              </button>
            </div>
          </form>

          <div className="mt-12 text-center">
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">
              {t('auth.haveAccount')} <Link to="/login" className="text-indigo-600 border-b-2 border-indigo-100 hover:border-indigo-600 transition-all ml-1">{t('auth.login')}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
