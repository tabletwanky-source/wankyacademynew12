import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { AppUser, UserRole, Student, Professor } from '../types';

interface AuthContextType {
  user: User | null;
  userData: AppUser | null;
  studentData: Student | null;
  professorData: Professor | null;
  role: UserRole | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

export const ADMIN_EMAILS = [
  'wankyacademy@gmail.com',
  'wankychat3@gmail.com',
  'admin@wankyacademy.com',
  'preacherwan@gmail.com'
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeUser: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (unsubscribeUser) {
        unsubscribeUser();
        unsubscribeUser = undefined;
      }

      setUser(currentUser);
      
      if (currentUser) {
        const email = currentUser.email?.toLowerCase().trim() || '';
        const isWhitelisted = ADMIN_EMAILS.includes(email);
        
        const userRef = doc(db, 'users', currentUser.uid);
        
        unsubscribeUser = onSnapshot(userRef, async (userSnap) => {
          if (userSnap.exists()) {
            const data = userSnap.data() as AppUser;
            if (isWhitelisted && data.role !== 'admin') {
              setUserData({ ...data, role: 'admin' });
            } else {
              setUserData(data);
            }
          } else {
            // If user exists in Auth but not in Firestore, create default entry
            const defaultData: AppUser = {
              uid: currentUser.uid,
              email: email,
              fullName: currentUser.displayName || 'Étudiant',
              role: isWhitelisted ? 'admin' : 'student',
              department: 'Multimédia', // Default department
              active: true,
              status: 'active',
              createdAt: new Date()
            } as any;

            try {
              const { setDoc } = await import('firebase/firestore');
              await setDoc(userRef, defaultData);
              // Snapshot will trigger again once doc is created
            } catch (err) {
              console.error("Error creating default user record:", err);
              if (isWhitelisted) {
                setUserData(defaultData);
              } else {
                setUserData(null);
              }
            }
          }
          setLoading(false);
        }, (err) => {
          console.error("Error fetching user data:", err);
          setUserData(null);
          setLoading(false);
        });
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUser) unsubscribeUser();
    };
  }, []);

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const loginWithGoogle = async () => {
    const { googleProvider } = await import('../lib/firebase');
    const { signInWithPopup } = await import('firebase/auth');
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const role = userData?.role || null;
  const studentData = role === 'student' ? (userData as Student) : null;
  const professorData = role === 'professor' ? (userData as Professor) : null;

  return (
    <AuthContext.Provider value={{ 
      user, 
      userData, 
      studentData, 
      professorData, 
      role, 
      loading, 
      login, 
      loginWithGoogle, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
