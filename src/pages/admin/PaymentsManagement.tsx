import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2 } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Payment } from '../../types';

export default function PaymentsManagement() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getPaymentSummary().then(res => {
      setPayments(res);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
      <div className="p-8 bg-slate-900 text-white flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
           <h2 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-2">Financial Protocol</h2>
           <h3 className="text-3xl font-black tracking-tighter">Installment Engine <span className="text-indigo-400">V1.0</span></h3>
        </div>
        <div className="text-right">
           <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">System Revenue</p>
           <p className="text-2xl font-black text-emerald-400">DOP {payments.reduce((a,b) => a + b.amount, 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-white border-b border-slate-100">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">ID Reference</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Payment Type</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Amount</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Remaining</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Auth Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {payments.map(p => (
              <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-6">
                  <span className="font-mono text-[11px] font-black text-slate-900">{p.studentCode}</span>
                </td>
                <td className="px-8 py-6">
                   <div className="flex flex-col">
                     <span className="text-xs font-black text-slate-900">{p.paymentType}</span>
                     <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{p.paymentDate?.toDate ? p.paymentDate.toDate().toLocaleDateString() : 'N/A'}</span>
                   </div>
                </td>
                <td className="px-8 py-6 text-center">
                  <span className="text-xs font-black text-slate-900">RD$ {p.amount.toLocaleString()}</span>
                </td>
                <td className="px-8 py-6 text-center">
                  <span className="text-xs font-bold text-red-500">RD$ {(p.remainingBalance || 0).toLocaleString()}</span>
                </td>
                <td className="px-8 py-6 text-right">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
