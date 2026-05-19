import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  Receipt as ReceiptIcon, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  Download,
  Printer,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  FileText
} from 'lucide-react';
import { financeService } from '../../services/financeService';
import { useAuth } from '../../context/AuthContext';
import { StudentPayment } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import Modal from '../../components/common/Modal';
import { QRCodeCanvas } from 'qrcode.react';
import { exportAsImage, exportAsPDF } from '../../lib/exportUtils';
import { toast } from 'sonner';

const ACADEMY_LOGO = "https://i.postimg.cc/wTr99qNp/d-modern-logo-icon-for-Wanky-Academy-WA-1.png";

export default function StudentPayments() {
  const { studentData, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<StudentPayment[]>([]);
  const [balance, setBalance] = useState<{paid: number, remaining: number, progress: number} | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<StudentPayment | null>(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const receiptRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !studentData) return;
    
    const unsub = financeService.subscribeToStudentPayments(user.uid, (data) => {
      setPayments(data);
      setLoading(false);
    });

    financeService.getStudentBalance(user.uid, studentData.department).then(setBalance);

    return unsub;
  }, [user, studentData]);

  const handleDownloadReceiptPNG = async () => {
    if (!receiptRef.current || !selectedPayment || generatingPDF) return;
    setGeneratingPDF(true);
    try {
      await exportAsImage(receiptRef.current, `WA-Receipt-${selectedPayment.receiptCode}`);
      toast.success('Reçu téléchargé en PNG');
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de l\'export image');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleDownloadReceiptPDF = async () => {
    if (!receiptRef.current || !selectedPayment || generatingPDF) return;
    
    // Validate data
    if (!selectedPayment.fullName || !selectedPayment.receiptCode) {
      toast.error('Données de paiement incomplètes');
      return;
    }

    setGeneratingPDF(true);
    try {
      await exportAsPDF(receiptRef.current, `WA-Receipt-${selectedPayment.receiptCode}`, 'portrait');
      toast.success('Reçu téléchargé en PDF');
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la génération du PDF');
    } finally {
      setGeneratingPDF(false);
    }
  };

  if (loading || !studentData) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      <p className="text-xs font-black uppercase tracking-widest text-slate-400">Accès au portail financier...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20 selection:bg-indigo-500 selection:text-white">
      {/* Header & Balance Cards */}
      <div className="grid lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">Mes Paiements</h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Suivi des frais de scolarité</p>
         </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
         {/* Paid Card */}
         <motion.div 
            whileHover={{ y: -5 }}
            className="bg-emerald-600 rounded-[2rem] p-8 text-white shadow-xl shadow-emerald-200"
         >
            <div className="flex justify-between items-start mb-6">
               <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                  <TrendingUp className="w-6 h-6" />
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-400 px-3 py-1 rounded-full">Total Payé</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Montant cumulé</p>
            <h3 className="text-3xl font-black italic">RD$ {balance?.paid || 0}</h3>
         </motion.div>

         {/* Remaining Card */}
         <motion.div 
            whileHover={{ y: -5 }}
            className="bg-[#0f172a] rounded-[2rem] p-8 text-white shadow-xl shadow-slate-200"
         >
            <div className="flex justify-between items-start mb-6">
               <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                  <DollarSign className="w-6 h-6" />
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-500 px-3 py-1 rounded-full">Reste à Payer</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Balance actuelle</p>
            <h3 className="text-3xl font-black italic">RD$ {balance?.remaining || 0}</h3>
         </motion.div>

         {/* Course Progress Card */}
         <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm flex flex-col justify-between"
         >
            <div className="flex justify-between items-start">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Avancement des frais</p>
               <ShieldCheck className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="mt-8">
               <div className="flex justify-between items-end mb-2">
                  <h3 className="text-4xl font-black italic text-slate-800">{Math.round(balance?.progress || 0)}%</h3>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Parcours Complet</p>
               </div>
               <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${balance?.progress || 0}%` }}
                    className="h-full bg-indigo-600 rounded-full"
                  />
               </div>
            </div>
         </motion.div>
      </div>

      {/* Payments History Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
         <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-3">
               <CreditCard className="w-5 h-5 text-indigo-600" />
               <h2 className="font-black text-slate-800 uppercase italic tracking-tight">Historique des Transactions</h2>
            </div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Montant</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {payments.map(payment => (
                    <tr key={payment.id} className="hover:bg-slate-50/80 transition-all group">
                       <td className="px-8 py-5">
                          <p className="text-xs font-black text-slate-800 uppercase italic">
                            {payment.paymentType === 'monthly' ? `Mois de ${payment.month}` : payment.installment || 'Frais d\'Inscription'}
                          </p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Code: {payment.receiptCode}</p>
                       </td>
                       <td className="px-8 py-5">
                          <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest italic ${
                            payment.paymentType === 'registration' ? 'bg-indigo-50 text-indigo-600' :
                            payment.paymentType === 'monthly' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {payment.paymentType}
                          </span>
                       </td>
                       <td className="px-8 py-5">
                          <p className="text-sm font-black text-slate-900 italic">RD$ {payment.amount}</p>
                       </td>
                       <td className="px-8 py-5">
                          <div className="flex items-center gap-2 text-slate-400">
                             <Clock className="w-3.5 h-3.5" />
                             <span className="text-[10px] font-bold uppercase">{payment.createdAt?.toDate?.()?.toLocaleDateString()}</span>
                          </div>
                       </td>
                       <td className="px-8 py-5 text-right">
                          <button 
                            onClick={() => setSelectedPayment(payment)}
                            className="p-3 bg-white border-2 border-slate-100 text-slate-400 rounded-xl hover:border-indigo-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                            title="Voir le Reçu"
                          >
                             <ReceiptIcon className="w-5 h-5" />
                          </button>
                       </td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr>
                       <td colSpan={5} className="px-8 py-24 text-center">
                          <div className="flex flex-col items-center gap-4">
                             <CreditCard className="w-12 h-12 text-slate-200" />
                             <p className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] italic">Aucun paiement enregistré</p>
                          </div>
                       </td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {/* Digital Receipt Modal */}
      <Modal 
        isOpen={!!selectedPayment} 
        onClose={() => setSelectedPayment(null)}
        title="Reçu de Paiement Digital"
        maxWidth="max-w-2xl"
      >
        {selectedPayment && (
          <div className="space-y-8">
             <div className="bg-slate-900 p-8 md:p-12 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                {/* Official Receipt Design */}
                <div 
                  ref={receiptRef}
                  className="bg-white rounded-3xl p-10 md:p-14 relative export-safe-bg-white"
                >
                   {/* Logo & Header */}
                   <div className="flex justify-between items-start mb-12">
                      <div className="flex items-center gap-4">
                         <img 
                           crossOrigin="anonymous"
                           src={ACADEMY_LOGO} 
                           alt="Logo" 
                           className="w-16 h-16 object-contain"
                           onError={(e) => {
                             (e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=WA&background=0f172a&color=fff";
                           }}
                         />
                         <div>
                            <h2 className="text-xl font-black italic uppercase tracking-tighter">Wanky Academy</h2>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Official Payment Receipt</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest italic border border-emerald-100 mb-2">Paiement Partiel Approuvé</div>
                         <p className="text-[9px] font-mono font-bold text-slate-400">{selectedPayment.receiptCode}</p>
                      </div>
                   </div>

                   {/* Student & Payment Info */}
                   <div className="grid grid-cols-2 gap-10 mb-12">
                      <div className="space-y-4">
                         <div>
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Étudiant</p>
                            <p className="text-sm font-black text-slate-800 uppercase italic leading-tight">{selectedPayment.fullName}</p>
                            <p className="text-[10px] font-bold text-slate-600 mt-1">{selectedPayment.studentId}</p>
                         </div>
                         <div>
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Département</p>
                            <p className="text-xs font-black text-slate-800 uppercase italic leading-tight">{selectedPayment.department}</p>
                         </div>
                      </div>
                      <div className="space-y-4 text-right">
                         <div>
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Détails du Paiement</p>
                            <p className="text-sm font-black text-indigo-600 uppercase italic">
                              {selectedPayment.paymentType === 'registration' ? 'Frais d\'Inscription' : 
                               selectedPayment.paymentType === 'monthly' ? `Mensualité - ${selectedPayment.month}` : 
                               `Versement - ${selectedPayment.installment}`}
                            </p>
                         </div>
                         <div>
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Date d'Opération</p>
                            <p className="text-xs font-black text-slate-800 uppercase italic">{selectedPayment.createdAt?.toDate?.()?.toLocaleDateString()}</p>
                         </div>
                      </div>
                   </div>

                   {/* Amount Table */}
                   <div className="bg-slate-50/50 rounded-2xl p-6 mb-12 border-2 border-dashed border-slate-100">
                      <div className="flex justify-between items-center mb-4">
                         <p className="text-xs font-bold text-slate-500 uppercase tracking-widest italic">Description</p>
                         <p className="text-xs font-bold text-slate-500 uppercase tracking-widest italic">Montant Payé</p>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                         <h3 className="text-xl font-black text-slate-800 uppercase italic">Total Encaissement</h3>
                         <h3 className="text-2xl font-black text-indigo-600 italic">RD$ {selectedPayment.amount}</h3>
                      </div>
                   </div>

                   {/* Footer QR & Signature */}
                   <div className="flex justify-between items-end border-t-2 border-slate-50 pt-10">
                      <div className="flex items-center gap-6">
                         <div className="p-2 border-2 border-slate-50 rounded-lg">
                            <QRCodeCanvas 
                              value={`${window.location.origin}/dashboard/payments`} 
                              size={64}
                            />
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">Vérification de Receipt</p>
                            <p className="text-[8px] font-bold text-slate-300 uppercase mt-1">Scan pour accès digital</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <div className="w-32 h-0.5 bg-slate-100 mb-2 ml-auto"></div>
                         <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Validé par Academy</p>
                         <p className="text-[10px] font-black italic text-slate-400 mt-1 uppercase">Direction Financière</p>
                      </div>
                   </div>
                </div>
             </div>

             <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  onClick={() => window.print()}
                  className="flex-1 p-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3"
                >
                   <Printer className="w-5 h-5" /> Imprimer
                </button>
                <div className="flex-[2] flex gap-4">
                   <button 
                     onClick={handleDownloadReceiptPNG}
                     disabled={generatingPDF}
                     className="flex-1 py-4 bg-white text-indigo-600 border-4 border-indigo-600 rounded-3xl text-xs font-black uppercase tracking-widest hover:bg-indigo-50 transition-all flex items-center justify-center gap-3 italic disabled:opacity-50"
                   >
                      {generatingPDF ? <Loader2 className="w-5 h-5 animate-spin" /> : <ReceiptIcon className="w-5 h-5" />} Image
                   </button>
                   <button 
                     onClick={handleDownloadReceiptPDF}
                     disabled={generatingPDF}
                     className="flex-1 py-4 bg-[#0f172a] text-white rounded-3xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 italic disabled:opacity-50"
                   >
                      {generatingPDF ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />} PDF
                   </button>
                </div>
             </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
