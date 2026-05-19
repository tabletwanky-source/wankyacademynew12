import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { certificateService } from '../../services/certificateService';
import { Certificate } from '../../types';
import { Award, Download, Eye, ExternalLink, ShieldCheck, Calendar, FileText, Printer, Loader as Loader2, Trophy, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Modal from '../../components/common/Modal';
import { QRCodeCanvas } from 'qrcode.react';
import { exportAsImage, exportAsPDF } from '../../lib/exportUtils';
import { toast } from 'sonner';

const ACADEMY_LOGO = "https://i.postimg.cc/wTr99qNp/d-modern-logo-icon-for-Wanky-Academy-WA-1.png";

export default function StudentCertificates() {
  const { user } = useAuth();
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [generating, setGenerating] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = certificateService.subscribeStudentCertificates(user.uid, (data) => {
      setCerts(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const handleDownloadPNG = async () => {
    if (!certRef.current || !selectedCert || generating) return;
    setGenerating(true);
    try {
      await exportAsImage(certRef.current, `WA-Certificate-${selectedCert.certificateCode}`);
      toast.success('Certificat téléchargé en PNG');
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de l\'export image');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!certRef.current || !selectedCert || generating) return;
    
    // Validate
    if (!selectedCert.studentName || !selectedCert.certificateCode) {
      toast.error('Données du certificat incomplètes');
      return;
    }

    setGenerating(true);
    try {
      await exportAsPDF(certRef.current, `WA-Certificate-${selectedCert.certificateCode}`, 'landscape');
      toast.success('Certificat téléchargé en PDF');
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
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Authenticating Credentials...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 selection:bg-indigo-500 selection:text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight italic uppercase">Mes Certificats</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Dossiers Académiques Officiels</p>
        </div>
      </div>

      {certs.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-20 text-center flex flex-col items-center gap-6">
           <Award className="w-16 h-16 text-slate-200" />
           <div>
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest italic">Aucun Certificat Pour Le Moment</h3>
              <p className="text-xs font-black text-slate-300 uppercase tracking-widest mt-2 max-w-sm mx-auto">
                Réussissez vos examens avec 70% ou plus pour obtenir vos certificats officiels de l'académie.
              </p>
           </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certs.map((cert) => (
            <motion.div 
              key={cert.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 transition-all group overflow-hidden"
            >
               <div className="bg-[#0f172a] h-32 p-6 text-white relative overflow-hidden">
                  <Award className="w-20 h-20 text-indigo-500/10 absolute -right-4 -bottom-4 rotate-12" />
                  <div className="relative z-10">
                     <p className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.3em] italic mb-1">WA Academy / {cert.department}</p>
                     <h3 className="text-sm font-black italic uppercase tracking-tight line-clamp-2">{cert.examTitle}</h3>
                  </div>
               </div>
               
               <div className="p-6 space-y-4">
                  <div className="flex justify-between items-end">
                     <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Code de Vérification</p>
                        <p className="text-xs font-mono font-bold text-slate-700">{cert.certificateCode}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Date d'Émission</p>
                        <p className="text-xs font-bold text-slate-700 italic">{cert.issueDate ? new Date(cert.issueDate?.toDate ? cert.issueDate.toDate() : cert.issueDate).toLocaleDateString('fr-FR') : '—'}</p>
                     </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-slate-50">
                     <button 
                       onClick={() => setSelectedCert(cert)}
                       className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-100 hover:bg-white hover:border-slate-300 transition-all flex items-center justify-center gap-2"
                     >
                       <Eye className="w-3.5 h-3.5" /> Voir / Télécharger
                     </button>
                  </div>
               </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Certificate Preview Modal */}
      <Modal 
        isOpen={!!selectedCert} 
        onClose={() => setSelectedCert(null)}
        title="Terminal de Certificat"
        maxWidth="max-w-5xl"
      >
        {selectedCert && (
          <div className="space-y-8">
             <div className="bg-slate-900 border-8 border-slate-800 rounded-[2.5rem] p-4 md:p-12 relative overflow-hidden group shadow-2xl overflow-x-auto">
                {/* Official Certificate Design */}
                <div 
                  ref={certRef}
                  className="bg-white aspect-[1.414/1] min-w-[700px] relative p-16 md:p-24 border-[12px] border-slate-900/5 shadow-2xl shadow-indigo-100 export-safe-bg-white"
                >
                   {/* Border Pattern */}
                   <div className="absolute inset-4 border-4 border-double border-slate-200"></div>
                   <div className="absolute inset-8 border-2 border-slate-100"></div>

                   <div className="h-full relative flex flex-col items-center justify-center text-center gap-8">
                      <img 
                        crossOrigin="anonymous" 
                        src={ACADEMY_LOGO} 
                        alt="WA Logo" 
                        className="w-24 h-24 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=WA&background=0f172a&color=fff";
                        }}
                      />
                      
                      <div className="space-y-2">
                         <h4 className="text-sm font-black uppercase tracking-[0.5em] text-slate-400 italic">Certificate of Completion</h4>
                         <p className="text-xs font-serif italic text-slate-500">Wanky Academy of Professional Excellence</p>
                      </div>

                      <div className="space-y-6">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">This honors academic achievement for</p>
                         <h2 className="text-4xl font-black text-slate-900 italic uppercase underline decoration-4 underline-offset-8 decoration-indigo-600">{selectedCert.studentName}</h2>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">for successfully passing the final evaluation with a score of {selectedCert.score}% in</p>
                         <h3 className="text-2xl font-black text-indigo-600 uppercase italic tracking-tight">{selectedCert.examTitle}</h3>
                      </div>

                      <div className="mt-12 w-full flex justify-between items-end border-t-2 border-slate-100 pt-12">
                         <div className="text-left space-y-4">
                            <div>
                               <p className="text-[8px] font-black uppercase tracking-widest text-slate-300">Verification ID</p>
                               <p className="text-[10px] font-mono font-bold text-slate-900">{selectedCert.certificateCode}</p>
                            </div>
                            <div>
                               <p className="text-[8px] font-black uppercase tracking-widest text-slate-300">Issued On</p>
                               <p className="text-[10px] font-bold text-slate-900 uppercase italic">{selectedCert.issueDate ? new Date(selectedCert.issueDate?.toDate ? selectedCert.issueDate.toDate() : selectedCert.issueDate).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</p>
                            </div>
                         </div>
                         
                         <div className="flex flex-col items-center gap-2">
                            <div className="w-24 h-24 bg-white p-2 border-2 border-slate-50 shadow-sm relative">
                               <QRCodeCanvas 
                                 value={`${window.location.origin}/verify-certificate/${selectedCert.certificateCode}`}
                                 size={80}
                               />
                            </div>
                            <p className="text-[6px] font-black text-slate-400 uppercase tracking-[0.3em]">Scan to Verify</p>
                         </div>

                         <div className="text-right space-y-1">
                            <div className="w-32 border-b-2 border-slate-900/10 mb-2"></div>
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-300">Authorized Signature</p>
                            <p className="text-[10px] font-black italic text-slate-700">Academy Director</p>
                         </div>
                      </div>

                      <Trophy className="absolute -bottom-8 -right-8 w-48 h-48 text-slate-50 rotate-12 -z-10" />
                   </div>
                </div>
             </div>

             <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 bg-indigo-50 p-6 rounded-3xl border border-indigo-100 flex items-start gap-4">
                   <ShieldCheck className="w-6 h-6 text-indigo-600 shrink-0" />
                   <div className="space-y-1">
                      <p className="text-[11px] font-bold text-indigo-900 leading-relaxed italic">
                        Ce certificat est un enregistrement académique vérifié. Partagez le lien pour confirmer son authenticité.
                      </p>
                      <p className="text-[9px] font-black text-indigo-600 truncate">{window.location.origin}/verify-certificate/{selectedCert.certificateCode}</p>
                   </div>
                </div>

                <div className="flex gap-4 shrink-0">
                   <button 
                     onClick={() => window.print()}
                     className="p-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all shadow-sm"
                     title="Print Draft"
                   >
                     <Printer className="w-6 h-6" />
                   </button>
                   <button 
                     onClick={handleDownloadPNG}
                     className="flex items-center gap-3 px-8 py-4 bg-white text-indigo-600 border-4 border-indigo-600 rounded-2xl text-[11px] font-black uppercase tracking-widest italic hover:bg-indigo-50 transition-all shadow-xl shadow-indigo-100"
                   >
                     <ImageIcon className="w-5 h-5" /> Image
                   </button>
                   <button 
                     onClick={handleDownloadPDF}
                     className="flex items-center gap-3 px-8 py-4 bg-[#0f172a] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest italic hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                   >
                     <FileText className="w-5 h-5" /> PDF
                   </button>
                </div>
             </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

