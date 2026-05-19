import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { badgeService } from '../../services/badgeService';
import { Badge } from '../../types';
import { 
  Contact, 
  Download, 
  Printer, 
  Loader2, 
  ShieldCheck, 
  QrCode,
  MapPin,
  Calendar,
  Zap,
  User,
  Image as ImageIcon,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { QRCodeCanvas } from 'qrcode.react';
import { exportAsImage, exportAsPDF } from '../../lib/exportUtils';

const ACADEMY_LOGO = "https://i.postimg.cc/wTr99qNp/d-modern-logo-icon-for-Wanky-Academy-WA-1.png";

export default function StudentBadge() {
  const { studentData, user } = useAuth();
  const [badge, setBadge] = useState<Badge | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = badgeService.subscribeStudentBadge(user.uid, (data) => {
      setBadge(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const handleGenerateBadge = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      await badgeService.generateBadge(user.uid);
      toast.success('Badge ID généré avec succès !');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Impossible de générer le badge. Vérifiez votre profil.');
    } finally {
      setGenerating(false);
    }
  };

  const downloadPNG = async () => {
    if (!badgeRef.current || !studentData || generating) return;
    setGenerating(true);
    try {
      await exportAsImage(badgeRef.current, `WA-Badge-${studentData.studentId}`);
      toast.success('Badge téléchargé en PNG');
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du téléchargement');
    } finally {
      setGenerating(false);
    }
  };

  const downloadPDF = async () => {
    if (!badgeRef.current || !studentData || generating) return;
    
    // Validate
    if (!studentData.studentId || !studentData.fullName) {
       toast.error('Données de profil incomplètes');
       return;
    }

    setGenerating(true);
    try {
      await exportAsPDF(badgeRef.current, `WA-Badge-${studentData.studentId}`, 'portrait');
      toast.success('Badge téléchargé en PDF');
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la génération du PDF');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return (
    <div className="py-20 flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Analyse du Registre d'Identification...</p>
    </div>
  );

  const verificationUrl = badge ? `${window.location.origin}/verify-badge/${badge.badgeCode}` : '';

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 selection:bg-indigo-500 selection:text-white">
      <div className="text-center md:text-left">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight italic uppercase">Carte d'Identité Scolaire</h1>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Générer et gérer votre badge digital de l'académie</p>
      </div>

      {!badge ? (
        <div className="bg-white rounded-[3rem] border border-slate-200 p-12 md:p-20 shadow-2xl shadow-slate-200/50 flex flex-col items-center text-center gap-8">
           <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center border-2 border-indigo-100/50">
              <Zap className="w-12 h-12" />
           </div>
           <div className="space-y-4">
              <h2 className="text-2xl font-black text-slate-800 italic uppercase">Prêt pour votre Badge Digital?</h2>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed max-w-sm mx-auto">
                Obtenez votre carte d'étudiant officielle INSTANTANÉMENT pour l'année académique 2026.
              </p>
           </div>
           <button 
             onClick={handleGenerateBadge}
             disabled={generating}
             className="px-12 py-5 bg-indigo-600 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] italic shadow-2xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50"
           >
             {generating ? (
               <span className="flex items-center gap-3">
                 <Loader2 className="w-5 h-5 animate-spin" />
                 Génération en cours...
               </span>
             ) : 'Générer Mon Badge Maintenant'}
           </button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-12 items-start">
           {/* Badge Preview */}
           <div className="lg:col-span-7 flex justify-center print:block print:w-full">
              <motion.div 
                ref={badgeRef}
                initial={{ opacity: 0, rotateY: 20 }}
                animate={{ opacity: 1, rotateY: 0 }}
                className="w-full max-w-[400px] aspect-[1/1.58] bg-white rounded-[2.5rem] border-4 border-[#0f172a] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] overflow-hidden relative print:shadow-none print:border-2 export-safe-bg-white"
              >
                 {/* ID Card Header */}
                 <div className="bg-[#0f172a] p-8 text-white flex flex-col items-center gap-4">
                    <img 
                      crossOrigin="anonymous" 
                      src={ACADEMY_LOGO} 
                      alt="WA Logo" 
                      className="w-16 h-16 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=WA&background=0f172a&color=fff";
                      }}
                    />
                    <div className="text-center">
                       <h3 className="font-black italic tracking-tighter text-sm uppercase">WANKY ACADEMY</h3>
                       <p className="text-[7px] font-black uppercase tracking-[0.4em] text-indigo-400">STUDENT IDENTIFICATION BADGE</p>
                    </div>
                 </div>

                 {/* ID Content */}
                 <div className="p-10 flex flex-col items-center">
                    <div className="relative mb-8">
                       <div className="w-44 h-44 rounded-[2rem] border-4 border-slate-100 overflow-hidden bg-slate-50 shadow-xl">
                          {studentData?.photoURL ? (
                            <img src={studentData.photoURL} alt="Student" className="w-full h-full object-cover" crossOrigin="anonymous" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-100">
                               <User className="w-20 h-20 text-slate-300" />
                            </div>
                          )}
                       </div>
                       <div className="absolute -bottom-4 -right-4 bg-white p-2 rounded-2xl shadow-lg border-2 border-slate-100">
                          <QRCodeCanvas 
                            value={verificationUrl}
                            size={48}
                            level="H"
                            includeMargin={false}
                          />
                       </div>
                    </div>

                    <div className="text-center space-y-1 mb-6 w-full">
                       <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter truncate">{studentData?.fullName}</h2>
                       <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">{studentData?.department}</p>
                    </div>

                    <div className="w-full space-y-3 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                       <div className="flex justify-between items-center text-[9px] uppercase tracking-widest font-black italic">
                          <span className="text-slate-400">Student ID</span>
                          <span className="text-slate-900">{studentData?.studentId}</span>
                       </div>
                       <div className="flex justify-between items-center text-[9px] uppercase tracking-widest font-black italic">
                          <span className="text-slate-400">Academic Year</span>
                          <span className="text-slate-900">2026-2027</span>
                       </div>
                       <div className="flex justify-between items-center text-[9px] uppercase tracking-widest font-black italic">
                          <span className="text-slate-400">Status</span>
                          <span className="bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">ACTIVE</span>
                       </div>
                    </div>

                    <div className="mt-8 flex justify-between items-center w-full">
                       <div className="space-y-1">
                          <p className="text-[7px] font-black uppercase tracking-widest text-slate-300">Authority Signature</p>
                          <p className="text-[10px] font-black italic text-slate-600">Admin Office</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[7px] font-black uppercase tracking-widest text-slate-300">Badge Code</p>
                          <p className="text-[10px] font-mono font-bold text-slate-400">{badge.badgeCode}</p>
                       </div>
                    </div>
                 </div>

                 {/* Bottom Bar */}
                 <div className="absolute bottom-0 left-0 w-full h-2 bg-indigo-600"></div>
              </motion.div>
           </div>

           {/* Actions & Info */}
           <div className="lg:col-span-5 space-y-8 py-10">
              <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6">
                 <div>
                    <h3 className="text-lg font-black text-slate-800 uppercase italic flex items-center gap-3">
                       <Contact className="w-6 h-6 text-indigo-600" />
                       Options du Badge
                    </h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Manage your digital identification</p>
                 </div>

                 <div className="space-y-4">
                    <button 
                      onClick={() => window.print()}
                      className="w-full py-5 bg-[#0f172a] text-white rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 italic hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                    >
                      <Printer className="w-5 h-5" /> Imprimer le Badge
                    </button>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={downloadPNG}
                        disabled={generating}
                        className="py-5 bg-white text-indigo-600 border-4 border-indigo-600 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 italic hover:bg-indigo-50 transition-all disabled:opacity-50"
                      >
                        {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />} PNG
                      </button>
                      <button 
                         onClick={downloadPDF}
                         disabled={generating}
                         className="py-5 bg-white text-slate-600 border-4 border-slate-600 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 italic hover:bg-slate-50 transition-all disabled:opacity-50"
                      >
                         {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />} PDF
                      </button>
                    </div>
                 </div>
              </div>

              <div className="bg-amber-50 p-8 rounded-[3rem] border border-amber-100 flex gap-4">
                 <ShieldCheck className="w-8 h-8 text-amber-600 shrink-0" />
                 <div>
                    <p className="text-xs font-black text-amber-900 uppercase italic">Security Protocol</p>
                    <p className="text-[11px] font-bold text-amber-800 leading-relaxed mt-2 italic">
                       Votre badge digital est lié à votre compte sécurisé. Une utilisation abusive ou la falsification de l'ID scolaire entraînera des sanctions académiques immédiates.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

