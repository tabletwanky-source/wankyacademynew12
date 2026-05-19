import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp,
  getDocs,
  limit,
  getDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Certificate, OldCertificate } from '../types';

export const certificateService = {
  subscribeStudentCertificates(studentUid: string, callback: (certs: Certificate[]) => void) {
    const q = query(
      collection(db, 'certificates'),
      where('studentUid', '==', studentUid),
      where('status', '==', 'active'),
      orderBy('issueDate', 'desc')
    );
    return onSnapshot(q, (snap) => {
      const certs = snap.docs.map(d => ({ ...d.data(), id: d.id })) as Certificate[];
      callback(certs);
    });
  },

  async generateCertificate(data: Omit<Certificate, 'id' | 'issueDate' | 'status' | 'verificationUrl' | 'certificateCode'>) {
    // Generate unique code: WA-CERT-YYYY-XXXX
    const year = new Date().getFullYear();
    const q = query(collection(db, 'certificates'), orderBy('certificateCode', 'desc'), limit(1));
    const lastSnap = await getDocs(q);
    
    let lastNum = 0;
    if (!lastSnap.empty) {
      const lastCode = lastSnap.docs[0].data().certificateCode;
      const parts = lastCode.split('-');
      lastNum = parseInt(parts[parts.length - 1]);
    }
    
    const newNum = (lastNum + 1).toString().padStart(4, '0');
    const certificateCode = `WA-CERT-${year}-${newNum}`;
    const verificationUrl = `/verify-certificate/${certificateCode}`;

    return await addDoc(collection(db, 'certificates'), {
      ...data,
      certificateCode,
      verificationUrl,
      status: 'active',
      issueDate: serverTimestamp()
    });
  },

  async verifyCertificate(code: string) {
    // Check main certificates
    const q1 = query(collection(db, 'certificates'), where('certificateCode', '==', code), where('status', '==', 'active'));
    const snap1 = await getDocs(q1);
    if (!snap1.empty) return { type: 'new', data: { ...snap1.docs[0].data(), id: snap1.docs[0].id } as Certificate };

    // Check old certificates
    const q2 = query(collection(db, 'oldCertificates'), where('certificateCode', '==', code), where('verified', '==', true));
    const snap2 = await getDocs(q2);
    if (!snap2.empty) return { type: 'old', data: { ...snap2.docs[0].data(), id: snap2.docs[0].id } as OldCertificate };

    return null;
  },

  async revokeCertificate(certId: string) {
    return await updateDoc(doc(db, 'certificates', certId), {
      status: 'revoked'
    });
  },

  // Admin: Manual import
  async importOldCertificate(data: Omit<OldCertificate, 'id' | 'verified'>) {
    return await addDoc(collection(db, 'oldCertificates'), {
      ...data,
      verified: true,
      issueDate: serverTimestamp()
    });
  },

  subscribeAllCertificates(callback: (certs: Certificate[]) => void) {
    const q = query(collection(db, 'certificates'), orderBy('issueDate', 'desc'));
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ ...d.data(), id: d.id })) as Certificate[]);
    });
  }
};
