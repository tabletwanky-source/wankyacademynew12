import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { certificateService } from '../services/certificateService';
import { Certificate, OldCertificate } from '../types';
import { ShieldCheck, Search, Calendar, User, BookOpen, Award, CircleAlert as AlertCircle, CircleCheck as CheckCircle2, Circle as XCircle, Loader as Loader2, FileText, ExternalLink, Trophy } from 'lucide-react';
import { motion } from 'motion/react';

const ACADEMY_LOGO = "https://i.postimg.cc/wTr99qNp/d-modern-logo-icon-for-Wanky-Academy-WA-1.png";

export default function VerifyCertificate() {
  const { code } = useParams();
  const [loading, setLoading] = useState(false);
  const [searchCode, setSearchCode] = useState(code || '');
  const [result, setResult] = useState<{ type: string, data: Certificate | OldCertificate } | null>(null);
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
      const res = await certificateService.verifyCertificate(vCode);
      if (res) {
        setResult(res);
      } else {
        setError('Certificat non trouvé ou code invalide.');
        setResult(null);
      }
    } catch (err) {
      setError('Service de vérification actuellement indisponible.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify(searchCode);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 md:p-12 selection:bg-indigo-500 selection:text-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden"
      >
        <div className="bg-[#0f172a] p-10 md:p-14 text-center text-white relative">
           <img src={ACADEMY_LOGO} alt="WA Logo" className="w-20 h-20 mx-auto mb-6 object-contain" />
           <h1 className="text-3xl font-black italic tracking-tighter uppercase mb-2">Registre de Vérification</h1>
           <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] italic">Wanky Academy Public Academic Records</p>
           
           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
        </div>

        <div className="p-8 md:p-12 space-y-8">
           <form onSubmit={onSubmit} className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
              <input 
                type="text"
                value={searchCode}
                onChange={e => setSearchCode(e.target.value)}
                placeholder="Entrez le code de vérification (Ex: WA-CERT-...)"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-16 pr-6 py-6 text-sm font-black italic outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/5 transition-all uppercase placeholder:normal-case shadow-inner"
              />
              <button 
                type="submit"
                disabled={loading}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              </button>
           </form>

           {loading && (
             <div className="py-12 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-tight">Analyse des registres académiques...</p>
             </div>
           )}

           {error && !loading && (
             <div className="bg-red-50 border border-red-100 p-8 rounded-3xl flex flex-col items-center text-center gap-4">
                <XCircle className="w-12 h-12 text-red-500" />
                <div>
                   <h3 className="font-black text-red-900 uppercase italic">Échec de la Vérification</h3>
                   <p className="text-xs font-bold text-red-700 uppercase tracking-widest mt-1">{error}</p>
                </div>
             </div>
           )}

           {result && !loading && (
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="space-y-6"
             >
                <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-3xl relative overflow-hidden">
                   <div className="flex items-center gap-6 relative z-10">
                      <div className="w-16 h-16 bg-white shadow-xl shadow-emerald-200/50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                         <CheckCircle2 className="w-10 h-10" />
                      </div>
                      <div>
                         <h3 className="text-2xl font-black text-emerald-900 uppercase italic leading-none">Certificat Authentique</h3>
                         <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-2">{result.data.certificateCode}</p>
                      </div>
                   </div>
                   <Trophy className="absolute top-1/2 -translate-y-1/2 right-4 w-32 h-32 text-emerald-500/10 rotate-12" />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                   {[
                     { label: 'Nom de l\'Étudiant', value: result.data.studentName, icon: User },
                     { label: 'Département', value: result.data.department, icon: BookOpen },
                     { label: 'Examen / Cours', value: result.type === 'new' ? (result.data as Certificate).examTitle : 'Dossier Historique', icon: Award },
                     { label: 'Date d\'Émission', value: result.data.issueDate ? new Date(result.data.issueDate?.toDate ? result.data.issueDate.toDate() : result.data.issueDate).toLocaleDateString('fr-FR') : 'Indisponible', icon: Calendar }
                   ].map((item, i) => (
                     <div key={i} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                        <p className="text-sm font-black text-slate-800 uppercase italic leading-tight">{item.value}</p>
                     </div>
                   ))}
                </div>

                {result.type === 'old' && (result.data as OldCertificate).pdfUrl && (
                  <a 
                    href={(result.data as OldCertificate).pdfUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center justify-center gap-3 w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200"
                  >
                    <FileText className="w-4 h-4" />
                    Télécharger le Certificat Historique
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
             </motion.div>
           )}
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-200 text-center">
           <Link to="/" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">
              Retour au Portail Wanky Academy
           </Link>
        </div>
      </motion.div>
    </div>
  );
}

