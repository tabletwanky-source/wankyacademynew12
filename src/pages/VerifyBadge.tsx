import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { badgeService } from '../services/badgeService';
import { 
  Contact, 
  Search, 
  Calendar, 
  User, 
  ShieldCheck, 
  QrCode,
  CheckCircle2,
  XCircle,
  Loader2,
  GraduationCap
} from 'lucide-react';
import { motion } from 'motion/react';

const ACADEMY_LOGO = "https://i.postimg.cc/wTr99qNp/d-modern-logo-icon-for-Wanky-Academy-WA-1.png";

export default function VerifyBadge() {
  const { code } = useParams();
  const [loading, setLoading] = useState(false);
  const [searchCode, setSearchCode] = useState(code || '');
  const [badge, setBadge] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (code) {
      handleVerify(code);
    }
  }, [code]);

  const handleVerify = async (vCode: string) => {
    if (!vCode) return;
    setLoading(true);
    setError(null);
    try {
      const res = await badgeService.verifyBadge(vCode);
      if (res) {
        setBadge(res);
      } else {
        setError('Badge non trouvé ou identifiant invalide.');
        setBadge(null);
      }
    } catch (err) {
      setError('Échec de la recherche. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify(searchCode);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-6 md:p-12 selection:bg-indigo-500 selection:text-white">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-white rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden"
      >
        <div className="bg-[#1e293b] p-10 md:p-14 text-center text-white relative">
           <img src={ACADEMY_LOGO} alt="WA Logo" className="w-24 h-24 mx-auto mb-6 object-contain" />
           <h1 className="text-3xl font-black italic tracking-tighter uppercase mb-2">Vérification de Badge</h1>
           <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] italic leading-tight">Wanky Academy Identity Registry - Official Verification</p>
           
           <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="p-10 md:p-14 space-y-10">
           <form onSubmit={onSubmit} className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
              <input 
                type="text"
                value={searchCode}
                onChange={e => setSearchCode(e.target.value)}
                placeholder="Code du Badge (Ex: WA-BADGE-...)"
                className="w-full bg-slate-50 border-4 border-slate-100 rounded-[2rem] pl-16 pr-6 py-6 text-sm font-black italic outline-none focus:border-indigo-600 transition-all uppercase placeholder:normal-case shadow-inner"
              />
              <button 
                type="submit"
                disabled={loading}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-indigo-600 text-white rounded-2xl hover:bg-slate-900 transition-all disabled:opacity-50 shadow-lg shadow-indigo-200"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              </button>
           </form>

           {loading && (
             <div className="py-12 flex flex-col items-center justify-center gap-6">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic animate-pulse">Scanning Global Identity Records...</p>
             </div>
           )}

           {error && !loading && (
             <div className="bg-red-50 border-4 border-red-100 p-10 rounded-[2.5rem] flex flex-col items-center text-center gap-6">
                <XCircle className="w-16 h-16 text-red-500" />
                <div>
                   <h3 className="text-xl font-black text-red-900 uppercase italic">Vérification Échouée</h3>
                   <p className="text-[11px] font-black text-red-700 uppercase tracking-widest mt-2">{error}</p>
                </div>
             </div>
           )}

           {badge && !loading && (
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="space-y-8"
             >
                <div className="bg-emerald-50 border-4 border-emerald-100 p-10 rounded-[2.5rem] relative overflow-hidden">
                   <div className="flex items-center gap-6 relative z-10">
                      <div className="w-20 h-20 bg-white shadow-xl shadow-emerald-200/50 text-emerald-600 rounded-[1.5rem] flex items-center justify-center shrink-0">
                         <CheckCircle2 className="w-12 h-12" />
                      </div>
                      <div>
                         <h3 className="text-2xl font-black text-emerald-900 uppercase italic leading-none">Identité Confirmée</h3>
                         <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mt-3">{badge.badgeCode}</p>
                      </div>
                   </div>
                   <QrCode className="absolute top-1/2 -translate-y-1/2 -right-8 w-40 h-40 text-emerald-500/10 rotate-12" />
                </div>

                <div className="grid grid-cols-1 gap-4">
                   {[
                     { label: 'Nom Complet', value: badge.studentName, icon: User },
                     { label: 'ID Étudiant', value: badge.studentId, icon: ShieldCheck },
                     { label: 'Département', value: badge.department, icon: GraduationCap },
                     { label: 'Statut Académique', value: badge.active ? 'ACTIF / ENREGISTRÉ' : 'EXPIRÉ /RÉVOQUÉ', high: true }
                   ].map((item, i) => (
                     <div key={i} className="bg-slate-50 p-6 rounded-[1.5rem] border-2 border-slate-100 flex items-center justify-between">
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                           <p className={`text-sm font-black uppercase italic ${item.high ? 'text-emerald-600' : 'text-slate-800'}`}>
                             {item.value}
                           </p>
                        </div>
                        {item.icon && <item.icon className="w-5 h-5 text-slate-200" />}
                     </div>
                   ))}
                </div>
             </motion.div>
           )}
        </div>

        <div className="p-10 bg-slate-50 border-t-4 border-slate-100 text-center">
           <Link to="/" className="text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-all flex items-center justify-center gap-3">
              <ShieldCheck className="w-4 h-4" />
              Wanky Academy Central Portal
           </Link>
        </div>
      </motion.div>
    </div>
  );
}

