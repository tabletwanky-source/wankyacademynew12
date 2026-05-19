import { 
  collection, 
  addDoc, 
  query, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ServiceRequest } from '../types';

export const multiService = {
  // Public action
  async createRequest(data: Omit<ServiceRequest, 'id' | 'createdAt' | 'status'>) {
    try {
      const docRef = await addDoc(collection(db, 'serviceRequests'), {
        ...data,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creating service request:", error);
      throw error;
    }
  },

  // Admin actions
  async getAllRequests() {
    try {
      const q = query(
        collection(db, 'serviceRequests'), 
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ ...d.data(), id: d.id })) as ServiceRequest[];
    } catch (error) {
      console.error("Error fetching requests:", error);
      throw error;
    }
  },

  async updateRequestStatus(requestId: string, status: ServiceRequest['status']) {
    try {
      const docRef = doc(db, 'serviceRequests', requestId);
      await updateDoc(docRef, { status });
    } catch (error) {
      console.error("Error updating request:", error);
      throw error;
    }
  },

  async deleteRequest(requestId: string) {
    try {
      await deleteDoc(doc(db, 'serviceRequests', requestId));
    } catch (error) {
      console.error("Error deleting request:", error);
      throw error;
    }
  }
};
