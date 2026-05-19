import { supabase } from '../lib/supabase';
import { mapPayment } from '../lib/supabaseHelpers';
import { FinancialSettings, StudentPayment, Receipt } from '../types';

export const financeService = {
  async getSettings(): Promise<FinancialSettings | null> {
    const { data } = await supabase.from('system_settings').select('data').eq('id', 'financial').maybeSingle();
    return data ? data.data as FinancialSettings : null;
  },

  async updateSettings(settings: FinancialSettings) {
    const { error } = await supabase.from('system_settings').upsert({
      id: 'financial',
      data: settings,
      updated_at: new Date().toISOString()
    });
    if (error) throw error;
  },

  async addPayment(paymentData: Omit<StudentPayment, 'id' | 'createdAt' | 'status' | 'validatedBy'>, adminUid: string) {
    if (!paymentData.studentUid) throw new Error("ID de l'étudiant manquant.");
    if (!paymentData.amount || paymentData.amount <= 0) throw new Error("Montant du paiement invalide.");

    const isMonthly = paymentData.paymentType === 'monthly';
    const isInstallment = String(paymentData.paymentType).includes('installment');

    if (isMonthly && !paymentData.month) throw new Error("Veuillez sélectionner un mois pour le paiement mensuel.");

    // Generate receipt code
    const { data: counter } = await supabase.from('counters').select('count').eq('id', 'receipts').maybeSingle();
    const count = (counter?.count || 0) + 1;
    await supabase.from('counters').update({ count, updated_at: new Date().toISOString() }).eq('id', 'receipts');

    const year = new Date().getFullYear();
    const receiptCode = `WA-REC-${year}-${count.toString().padStart(4, '0')}`;

    const paymentObj: any = {
      student_uid: paymentData.studentUid,
      student_id: paymentData.studentId || '',
      full_name: paymentData.fullName || '',
      department: paymentData.department || 'N/A',
      payment_type: paymentData.paymentType,
      amount: paymentData.amount,
      status: 'paid',
      validated_by: adminUid,
      receipt_code: receiptCode
    };

    if (isMonthly && paymentData.month) paymentObj.month = paymentData.month;
    if (isInstallment) paymentObj.installment = paymentData.paymentType;

    const { data: paymentResult, error: paymentError } = await supabase
      .from('payments')
      .insert(paymentObj)
      .select()
      .single();

    if (paymentError) throw new Error(paymentError.message);

    // Update financial record
    const recordId = `record_${paymentData.studentUid}`;
    const { data: existingRecord } = await supabase.from('financial_records').select('*').eq('id', recordId).maybeSingle();

    if (existingRecord) {
      await supabase.from('financial_records').update({
        total_paid: (existingRecord.total_paid || 0) + paymentData.amount,
        updated_at: new Date().toISOString()
      }).eq('id', recordId);
    } else {
      const settings = await this.getSettings();
      let totalRequired = 0;
      if (settings) {
        if (paymentData.department === 'Informatique') totalRequired = settings.informatique.registrationFee + (settings.informatique.monthlyFee * 12);
        else if (paymentData.department === 'Technique Informatique') totalRequired = settings.techniqueInfo.registrationFee + (settings.techniqueInfo.monthlyFee * 12);
        else if (paymentData.department === 'Auto École') totalRequired = settings.autoEcole.total + settings.autoEcole.registrationFee;
      }
      await supabase.from('financial_records').insert({
        id: recordId,
        student_uid: paymentData.studentUid,
        total_paid: paymentData.amount,
        total_required: totalRequired,
        remaining_balance: Math.max(0, totalRequired - paymentData.amount)
      });
    }

    // Generate receipt
    let description = "Frais d'Inscription";
    if (isMonthly) description = `Mensualité - ${paymentData.month}`;
    else if (isInstallment) description = `Versement - ${paymentData.paymentType}`;

    await supabase.from('receipts').insert({
      receipt_code: receiptCode,
      student_uid: paymentData.studentUid,
      student_id: paymentData.studentId || '',
      full_name: paymentData.fullName || '',
      department: paymentData.department || 'N/A',
      payment_id: paymentResult.id,
      payment_type: paymentData.paymentType,
      description,
      amount: paymentData.amount,
      validated_by: adminUid,
      status: 'valid'
    });

    return paymentResult.id;
  },

  subscribeToStudentPayments(studentUid: string, callback: (payments: StudentPayment[]) => void) {
    const load = async () => {
      const { data } = await supabase
        .from('payments')
        .select('*')
        .eq('student_uid', studentUid)
        .order('created_at', { ascending: false });
      callback((data || []).map(mapPayment) as StudentPayment[]);
    };

    const channel = supabase
      .channel(`payments-${studentUid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments', filter: `student_uid=eq.${studentUid}` }, load)
      .subscribe();

    load();
    return () => supabase.removeChannel(channel);
  },

  subscribeToAllPayments(callback: (payments: StudentPayment[]) => void) {
    const load = async () => {
      const { data } = await supabase.from('payments').select('*').order('created_at', { ascending: false });
      callback((data || []).map(mapPayment) as StudentPayment[]);
    };

    const channel = supabase
      .channel('payments-all')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, load)
      .subscribe();

    load();
    return () => supabase.removeChannel(channel);
  },

  async getStudentBalance(studentUid: string, department: string) {
    const settings = await this.getSettings();
    if (!settings) return null;

    const { data: payments } = await supabase.from('payments').select('amount').eq('student_uid', studentUid);
    const totalPaid = (payments || []).reduce((acc, p) => acc + (p.amount || 0), 0);

    let requiredTotal = 0;
    if (department === 'Informatique') {
      requiredTotal = settings.informatique.registrationFee + (settings.informatique.monthlyFee * 12);
    } else if (department === 'Technique Informatique') {
      requiredTotal = settings.techniqueInfo.registrationFee + (settings.techniqueInfo.monthlyFee * 12);
    } else if (department === 'Auto École') {
      requiredTotal = settings.autoEcole.total + settings.autoEcole.registrationFee;
    }

    return {
      paid: totalPaid,
      remaining: Math.max(0, requiredTotal - totalPaid),
      progress: requiredTotal > 0 ? (totalPaid / requiredTotal) * 100 : 0
    };
  }
};
