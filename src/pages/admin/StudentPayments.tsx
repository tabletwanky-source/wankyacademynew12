import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Loader2, 
  CheckCircle2, 
  X,
  Calendar,
  CreditCard,
  DollarSign,
  ArrowRight,
  Receipt as ReceiptIcon,
  Printer
} from 'lucide-react';
import { financeService } from '../../services/financeService';
import { studentService } from '../../services/studentService';
import { Student, StudentPayment, FinancialSettings } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import Modal from '../../components/common/Modal';

export default function AdminStudentPayments() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<StudentPayment[]>([]);
  const [settings, setSettings] = useState<FinancialSettings | null>(null);
  
  // Selection
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Payment Form
  const [paymentForm, setPaymentForm] = useState({
    type: 'monthly' as 'inscription' | 'monthly' | 'installment',
    amount: 0,
    month: 'Janvier',
    installment: 'installment_1'
  });

  const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const installments = [
    { label: '1e Versement', value: 'installment_1' },
    { label: '2e Versement', value: 'installment_2' }
  ];

  useEffect(() => {
    loadData();
    const unsub = financeService.subscribeToAllPayments((data) => setPayments(data));
    return unsub;
  }, []);

  const loadData = async () => {
    try {
      const [studentsData, settingsData] = await Promise.all([
        studentService.getAllStudents(),
        financeService.getSettings()
      ]);
      setStudents(studentsData);
      setSettings(settingsData);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPayment = (student: Student) => {
    setSelectedStudent(student);
    if (settings) {
      const dept = student.department;
      let initialAmount = 0;
      let initialType: typeof paymentForm.type = 'monthly';

      if (dept === 'Auto École') {
        initialType = 'inscription';
        initialAmount = settings.autoEcole.registrationFee;
      } else if (dept === 'Informatique') {
        initialType = 'monthly';
        initialAmount = settings.informatique.monthlyFee;
      } else {
        initialType = 'monthly';
        initialAmount = settings.techniqueInfo.monthlyFee;
      }

      setPaymentForm({
        ...paymentForm,
        type: initialType,
        amount: initialAmount
      });
    }
    setShowPaymentModal(true);
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !user || submitting) return;

    setSubmitting(true);
    try {
      const paymentData: any = {
        studentUid: selectedStudent.uid,
        studentId: selectedStudent.studentId,
        fullName: selectedStudent.fullName,
        department: selectedStudent.department,
        paymentType: paymentForm.type === 'installment' ? paymentForm.installment : paymentForm.type,
        amount: paymentForm.amount,
      };

      if (paymentForm.type === 'monthly') {
        paymentData.month = paymentForm.month;
      }

      await financeService.addPayment(paymentData, user.uid);

      setShowPaymentModal(false);
      toast.success('Paiement enregistré avec succès');
      
      // Reset form
      setPaymentForm({
        ...paymentForm,
        month: months[(new Date().getMonth() + 1) % 12] // Suggest next month
      });
      
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'enregistrement du paiement');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      <p className="text-xs font-black uppercase tracking-widest text-slate-400">Synchronisation des registres financiers...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-black text-slate-800 tracking-tight italic uppercase">Gestion des Paiements</h1>
           <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Encaissement et suivi des mensualités</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Student Search & Select */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                 <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Rechercher un étudiant..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-xs font-bold italic outline-none focus:border-indigo-600 transition-all"
                    />
                 </div>
              </div>
              <div className="p-2 max-h-[500px] overflow-y-auto">
                 {filteredStudents.map(student => (
                   <button 
                     key={student.uid}
                     onClick={() => handleOpenPayment(student)}
                     className="w-full p-4 hover:bg-indigo-50 rounded-2xl flex items-center gap-4 transition-all group text-left"
                   >
                      <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0 group-hover:scale-110 transition-transform">
                         {student.photoURL ? (
                           <img src={student.photoURL} alt="" className="w-full h-full object-cover" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-600">
                             <Users className="w-5 h-5" />
                           </div>
                         )}
                      </div>
                      <div className="min-w-0 flex-1">
                         <p className="text-xs font-black text-slate-800 uppercase italic truncate">{student.fullName}</p>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter truncate">{student.studentId} • {student.department}</p>
                      </div>
                      <Plus className="w-4 h-4 text-slate-300 group-hover:text-indigo-600" />
                   </button>
                 ))}
              </div>
           </div>
        </div>

        {/* Recent Payments History */}
        <div className="lg:col-span-8 space-y-6">
           <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <h2 className="font-black text-slate-800 uppercase italic tracking-tight">Derniers Encaissements</h2>
                 <div className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-lg">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span className="text-[9px] font-black uppercase text-slate-500">Live Sync</span>
                 </div>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-slate-50/50 border-b border-slate-100">
                          <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Étudiant</th>
                          <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Détails</th>
                          <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Montant</th>
                          <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {payments.map(payment => (
                         <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                               <p className="text-xs font-black text-slate-800 uppercase italic whitespace-nowrap">{payment.fullName}</p>
                               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{payment.studentId}</p>
                            </td>
                            <td className="px-6 py-4">
                               <div className="flex items-center gap-2">
                                  <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md text-[9px] font-black uppercase italic">
                                    {payment.paymentType}
                                  </span>
                                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                                    {payment.paymentType === 'monthly' ? payment.month : payment.installment || 'Inscription'}
                                  </span>
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               <p className="text-sm font-black text-slate-900 italic">RD$ {payment.amount}</p>
                            </td>
                            <td className="px-6 py-4">
                               <div className="flex items-center gap-2 text-emerald-600">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span className="text-[9px] font-black uppercase tracking-widest">Validé</span>
                               </div>
                            </td>
                         </tr>
                       ))}
                       {payments.length === 0 && (
                         <tr>
                           <td colSpan={4} className="px-6 py-20 text-center">
                              <p className="text-xs font-black text-slate-300 uppercase italic">Aucun historique de paiement</p>
                           </td>
                         </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      </div>

      {/* Payment Modal */}
      <Modal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)}
        title="Nouvel Encaissement"
      >
        {selectedStudent && (
          <form onSubmit={handleAddPayment} className="space-y-6">
             <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black italic">
                   {selectedStudent.fullName.substring(0,2).toUpperCase()}
                </div>
                <div>
                   <p className="text-xs font-black text-slate-800 uppercase italic">{selectedStudent.fullName}</p>
                   <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{selectedStudent.department}</p>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Type de Paiement</label>
                   <select 
                     value={paymentForm.type}
                     onChange={e => {
                       const type = e.target.value as typeof paymentForm.type;
                       let amount = 0;
                       if (settings) {
                          if (type === 'inscription') amount = selectedStudent.department === 'Auto École' ? settings.autoEcole.registrationFee : settings.informatique.registrationFee;
                          else if (type === 'monthly') amount = selectedStudent.department === 'Informatique' ? settings.informatique.monthlyFee : settings.techniqueInfo.monthlyFee;
                          else amount = settings.autoEcole.installment1;
                       }
                       setPaymentForm({...paymentForm, type, amount});
                     }}
                     className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold italic outline-none focus:border-indigo-600"
                   >
                      <option value="inscription">Inscription</option>
                      {selectedStudent.department !== 'Auto École' && <option value="monthly">Mensualité</option>}
                      {selectedStudent.department === 'Auto École' && <option value="installment">Versement (Installment)</option>}
                   </select>
                </div>

                <div className="col-span-2 md:col-span-1">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Montant (RD$)</label>
                   <input 
                     type="number" 
                     value={paymentForm.amount}
                     onChange={e => setPaymentForm({...paymentForm, amount: Number(e.target.value)})}
                     className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold italic outline-none focus:border-indigo-600"
                   />
                </div>

                {paymentForm.type === 'monthly' && (
                  <div className="col-span-2">
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Mois Correspondant</label>
                     <div className="grid grid-cols-3 gap-2">
                        {months.map(m => (
                          <button 
                            key={m}
                            type="button"
                            onClick={() => setPaymentForm({...paymentForm, month: m})}
                            className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${paymentForm.month === m ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                          >
                            {m}
                          </button>
                        ))}
                     </div>
                  </div>
                )}

                 {paymentForm.type === 'installment' && (
                  <div className="col-span-2">
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Versement n°</label>
                     <div className="grid grid-cols-2 gap-4">
                        {installments.map(i => (
                          <button 
                            key={i.value}
                            type="button"
                            onClick={() => {
                              let amount = paymentForm.amount;
                              if (settings) {
                                amount = i.value === 'installment_1' ? settings.autoEcole.installment1 : settings.autoEcole.installment2;
                              }
                              setPaymentForm({...paymentForm, installment: i.value, amount});
                            }}
                            className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${paymentForm.installment === i.value ? 'bg-amber-600 text-white shadow-lg shadow-amber-100' : 'bg-slate-50 text-slate-500'}`}
                          >
                            {i.label}
                          </button>
                        ))}
                     </div>
                  </div>
                )}
             </div>

             <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-[2] py-4 bg-[#0f172a] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest italic flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
                  Valider le Paiement
                </button>
             </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
