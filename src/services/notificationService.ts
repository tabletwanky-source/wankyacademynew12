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
  deleteDoc,
  limit
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Notification } from '../types';

export const notificationService = {
  subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void) {
    if (!userId) return () => {};
    
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    return onSnapshot(q, (snap) => {
      const notes = snap.docs.map(d => ({ ...d.data(), id: d.id })) as Notification[];
      callback(notes);
    }, (error) => {
      console.error("Notification snapshot error:", error);
    });
  },

  async sendNotification(data: Omit<Notification, 'id' | 'read' | 'createdAt'>) {
    return await addDoc(collection(db, 'notifications'), {
      ...data,
      read: false,
      createdAt: serverTimestamp()
    });
  },

  async markAsRead(notificationId: string) {
    return await updateDoc(doc(db, 'notifications', notificationId), {
      read: true
    });
  },

  async deleteNotification(notificationId: string) {
    return await deleteDoc(doc(db, 'notifications', notificationId));
  }
};
