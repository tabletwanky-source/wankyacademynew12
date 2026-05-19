import { 
  db 
} from '../lib/firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  SystemGeneralSettings,
  SystemBrandingSettings,
  SystemAuthSettings,
  FinancialSettings,
  SystemCertificateSettings,
  SystemBadgeSettings,
  SystemExamSettings,
  SystemNotificationSettings,
  SystemSecuritySettings,
  SystemStudentSettings,
  SystemMultiservicesSettings,
  SystemMaintenanceSettings
} from '../types';

const COLLECTION = 'systemSettings';

export const systemSettingsService = {
  async getSettings<T>(docId: string): Promise<T | null> {
    const docRef = doc(db, COLLECTION, docId);
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data() as T : null;
  },

  async updateSettings<T>(docId: string, data: Partial<T>) {
    const docRef = doc(db, COLLECTION, docId);
    await setDoc(docRef, data, { merge: true });
  },

  subscribeSettings<T>(docId: string, callback: (data: T) => void) {
    return onSnapshot(doc(db, COLLECTION, docId), (snap) => {
      if (snap.exists()) {
        callback(snap.data() as T);
      }
    });
  },

  // Helper methods for specific documents
  async getGeneralSettings(): Promise<SystemGeneralSettings | null> {
    const docRef = doc(db, COLLECTION, 'general');
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data() as SystemGeneralSettings : null;
  },

  async getFinancialSettings(): Promise<FinancialSettings | null> {
    const docRef = doc(db, COLLECTION, 'financial');
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data() as FinancialSettings : null;
  },

  async getExamSettings(): Promise<SystemExamSettings | null> {
    const docRef = doc(db, COLLECTION, 'exams');
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data() as SystemExamSettings : null;
  },

  async getBrandingSettings(): Promise<SystemBrandingSettings | null> {
    const docRef = doc(db, COLLECTION, 'branding');
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data() as SystemBrandingSettings : null;
  }
};
