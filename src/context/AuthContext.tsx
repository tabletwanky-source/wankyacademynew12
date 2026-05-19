import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
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

  const fetchUserData = async (userId: string, email: string) => {
    const isWhitelisted = ADMIN_EMAILS.includes(email.toLowerCase().trim());

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('uid', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user data:', error);
      setUserData(null);
      return;
    }

    if (data) {
      const profile = mapProfileToAppUser(data);
      if (isWhitelisted && profile.role !== 'admin') {
        setUserData({ ...profile, role: 'admin' } as AppUser);
      } else {
        setUserData(profile);
      }
    } else {
      // Create default profile if missing
      const defaultProfile = {
        uid: userId,
        email,
        full_name: 'Étudiant',
        role: isWhitelisted ? 'admin' : 'student',
        department: 'Informatique',
        active: true,
        status: 'active'
      };
      const { error: insertError } = await supabase
        .from('profiles')
        .insert(defaultProfile);
      if (!insertError) {
        setUserData(mapProfileToAppUser(defaultProfile) as AppUser);
      }
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSessionChange(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        await handleSessionChange(session);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSessionChange = async (session: Session | null) => {
    if (session?.user) {
      setUser(session.user);
      await fetchUserData(session.user.id, session.user.email || '');
    } else {
      setUser(null);
      setUserData(null);
    }
    setLoading(false);
  };

  const login = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
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

// Maps snake_case DB row to camelCase AppUser
function mapProfileToAppUser(row: any): AppUser {
  return {
    uid: row.uid,
    email: row.email,
    fullName: row.full_name || row.fullName || '',
    role: row.role,
    department: row.department,
    active: row.active ?? true,
    status: row.status ?? 'active',
    phoneNumber: row.phone_number || row.phoneNumber || '',
    phone: row.phone || '',
    whatsapp: row.whatsapp || '',
    address: row.address || '',
    bio: row.bio || '',
    emergencyContact: row.emergency_contact || '',
    dateOfBirth: row.date_of_birth || '',
    photoURL: row.photo_url || row.photoURL || '',
    profileImageUrl: row.profile_image_url || '',
    studentId: row.student_id || row.studentId || '',
    studentCode: row.student_code || '',
    mustChangePassword: row.must_change_password ?? false,
    temporaryPassword: row.temporary_password ?? false,
    lastLogin: row.last_login || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  } as any;
}
