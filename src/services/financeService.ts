import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  addDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { FinancialSettings, StudentPayment, Receipt } from '../types';

const FINANCIAL_SETTINGS_COLLECTION = 'systemSettings';
const FINANCIAL_SETTINGS_DOC = 'financial';

// Helper to clean data for Firestore (remove undefined)
const cleanData = (obj: any) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined)
  );
};

export const financeService = {
  // Financial Settings
  async getSettings(): Promise<FinancialSettings | null> {
    const docRef = doc(db, FINANCIAL_SETTINGS_COLLECTION, FINANCIAL_SETTINGS_DOC);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() as FinancialSettings : null;
  },

  async updateSettings(settings: FinancialSettings) {
    const docRef = doc(db, FINANCIAL_SETTINGS_COLLECTION, FINANCIAL_SETTINGS_DOC);
    await setDoc(docRef, settings, { merge: true });
  },

  // Student Payments
  async addPayment(paymentData: Omit<StudentPayment, 'id' | 'createdAt' | 'status' | 'validatedBy'>, adminUid: string) {
    if (!paymentData.studentUid) {
      throw new Error("ID de l'étudiant manquant.");
    }

    if (!paymentData.amount || paymentData.amount <= 0) {
      throw new Error("Montant du paiement invalide.");
    }

    const isMonthly = paymentData.paymentType === 'monthly';
    const isInstallment = paymentData.paymentType.includes('installment');

    if (isMonthly && !paymentData.month) {
      throw new Error("Veuillez sélectionner un mois pour le paiement mensuel.");
    }

    try {
      const paymentsRef = collection(db, 'payments');
      
      // Generate Unique Receipt Code
      const receiptCounterRef = doc(db, 'counters', 'receipts');
      const counterSnap = await getDoc(receiptCounterRef);
      let count = 1;
      
      if (counterSnap.exists()) {
        count = (counterSnap.data().count || 0) + 1;
        await updateDoc(receiptCounterRef, { count: increment(1) });
      } else {
        await setDoc(receiptCounterRef, { count: 1 });
      }

      const year = new Date().getFullYear();
      const receiptCode = `WA-REC-${year}-${count.toString().padStart(4, '0')}`;

      // Build payment object carefully
      const paymentObj: any = {
        studentUid: paymentData.studentUid,
        studentName: paymentData.fullName || '',
        studentCode: paymentData.studentId || '',
        department: paymentData.department || 'N/A',
        paymentType: paymentData.paymentType,
        amount: paymentData.amount,
        recordedBy: adminUid,
        status: 'paid',
        createdAt: serverTimestamp(),
        studentId: paymentData.studentId || '',
        fullName: paymentData.fullName || '',
        validatedBy: adminUid,
        receiptCode
      };

      if (isMonthly && paymentData.month) {
        paymentObj.month = paymentData.month;
      }
      
      if (isInstallment) {
        paymentObj.installment = paymentData.paymentType;
      }

      // Final sanitization
      const finalPayment = Object.fromEntries(
        Object.entries(paymentObj).filter(([_, v]) => v !== undefined)
      );

      const docRef = await addDoc(paymentsRef, finalPayment);

      // Update Financial Record
      const financialRecordRef = doc(db, 'financialRecords', `record_${paymentData.studentUid}`);
      const recordSnap = await getDoc(financialRecordRef);
      
      if (recordSnap.exists()) {
        await updateDoc(financialRecordRef, {
          totalPaid: increment(paymentData.amount),
          updatedAt: serverTimestamp()
        });
      } else {
        const settings = await this.getSettings();
        let totalRequired = 0;
        if (settings) {
          if (paymentData.department === 'Informatique') totalRequired = settings.informatique.registrationFee + (settings.informatique.monthlyFee * 12);
          else if (paymentData.department === 'Technique Informatique') totalRequired = settings.techniqueInfo.registrationFee + (settings.techniqueInfo.monthlyFee * 12);
          else if (paymentData.department === 'Auto École') totalRequired = settings.autoEcole.total + settings.autoEcole.registrationFee;
        }

        await setDoc(financialRecordRef, {
          studentUid: paymentData.studentUid,
          totalPaid: paymentData.amount,
          totalRequired,
          remainingBalance: Math.max(0, totalRequired - paymentData.amount),
          updatedAt: serverTimestamp()
        });
      }

      // Generate Receipt Document
      let description = 'Frais d\'Inscription';
      if (isMonthly) description = `Mensualité - ${paymentData.month}`;
      else if (isInstallment) description = `Versement - ${paymentData.paymentType}`;

      const receiptObj: any = {
        receiptCode,
        studentUid: paymentData.studentUid,
        studentId: paymentData.studentId || '',
        fullName: paymentData.fullName || '',
        department: paymentData.department || 'N/A',
        paymentId: docRef.id,
        paymentType: paymentData.paymentType,
        description,
        amount: paymentData.amount,
        generatedAt: serverTimestamp(),
        validatedBy: adminUid,
        status: 'valid'
      };

      const finalReceipt = Object.fromEntries(
        Object.entries(receiptObj).filter(([_, v]) => v !== undefined)
      );

      await addDoc(collection(db, 'receipts'), finalReceipt);
      
      return docRef.id;
    } catch (error: any) {
      console.error("Error recording payment:", error);
      if (error.code === 'permission-denied') {
        throw new Error("Accès refusé. Permissions Firestore insuffisantes.");
      }
      throw new Error(error.message || "Erreur lors de l'enregistrement du paiement.");
    }
  },

  subscribeToStudentPayments(studentUid: string, callback: (payments: StudentPayment[]) => void) {
    const q = query(
      collection(db, 'payments'), 
      where('studentUid', '==', studentUid),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const payments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudentPayment));
      callback(payments);
    });
  },

  subscribeToAllPayments(callback: (payments: StudentPayment[]) => void) {
    const q = query(collection(db, 'payments'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const payments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudentPayment));
      callback(payments);
    });
  },

  // Student Balances
  async getStudentBalance(studentUid: string, department: string) {
    const settings = await this.getSettings();
    if (!settings) return null;

    const q = query(collection(db, 'payments'), where('studentUid', '==', studentUid));
    const snapshot = await getDocs(q);
    const payments = snapshot.docs.map(doc => doc.data() as StudentPayment);

    let totalPaid = 0;
    payments.forEach(p => totalPaid += p.amount);

    let requiredTotal = 0;
    if (department === 'Informatique') {
      requiredTotal = settings.informatique.registrationFee + (settings.informatique.monthlyFee * 12); // Assuming 1 year
    } else if (department === 'Technique Informatique') {
      requiredTotal = settings.techniqueInfo.registrationFee + (settings.techniqueInfo.monthlyFee * 12);
    } else if (department === 'Auto École') {
      requiredTotal = settings.autoEcole.total + settings.autoEcole.registrationFee;
    }

    return {
      paid: totalPaid,
      remaining: Math.max(0, requiredTotal - totalPaid),
      progress: (totalPaid / requiredTotal) * 100
    };
  }
};
