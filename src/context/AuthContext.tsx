import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserRole } from '../types';
import { auth } from '../services/firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';

export interface AppUser {
  id: string;
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

interface AuthContextType {
  role: UserRole;
  user: AppUser | null;
  loading: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithName: (name: string, pin: string) => Promise<boolean>;
  loginWithRole: (role: UserRole) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAILS = ['willians.souza@escola.pr.gov.br', 'f4330252301@gmail.com']; 
const MEDIATOR_EMAILS: string[] = []; 

const CUSTOM_STUDENTS = [
  { name: 'ASMA QARI ZADAH', pin: 'asma', email: 'asma@pontes.com' },
  { name: 'HOSNA QARI ZADAH', pin: 'hosna', email: 'hosna@pontes.com' },
  { name: 'Ione Jordão Ribeiro', pin: 'ione', email: 'ione@pontes.com' }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    console.log("AuthProvider: Initializing...");
    
    // Check initial mock user state
    const savedMock = localStorage.getItem('dari_mock_user');
    if (savedMock) {
      const mockUser = JSON.parse(savedMock);
      setUser(mockUser);
      setRole('student');
      setLoading(false);
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: any) => {
      console.log("AuthProvider: Auth state changed:", !!firebaseUser);
      if (firebaseUser) {
        handleUser(firebaseUser);
      } else if (!savedMock) {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUser = (firebaseUser: User | null) => {
    console.log("AuthContext: Handling user:", firebaseUser?.email);
    
    if (firebaseUser) {
      const normalizedUser: AppUser = {
        id: firebaseUser.uid,
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        user_metadata: {
          full_name: firebaseUser.displayName || '',
          avatar_url: firebaseUser.photoURL || ''
        }
      };
      setUser(normalizedUser);

      if (firebaseUser.email) {
        if (ADMIN_EMAILS.includes(firebaseUser.email)) {
          console.log("AuthContext: User is ADMIN");
          setRole('admin');
          localStorage.setItem('dari_role', 'admin');
        } else if (MEDIATOR_EMAILS.includes(firebaseUser.email)) {
          console.log("AuthContext: User is MEDIATOR");
          setRole('mediator');
          localStorage.setItem('dari_role', 'mediator');
        } else {
          console.log("AuthContext: User is STUDENT (default)");
          setRole('student');
          localStorage.setItem('dari_role', 'student');
        }
      }
    } else {
      setUser(null);
      setRole(null);
      localStorage.removeItem('dari_role');
    }
  };

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Error logging in with Google:', error.message);
      setAuthError(error.message);
    }
  };

  const signInWithName = async (name: string, pin: string): Promise<boolean> => {
    setAuthError(null);
    const student = CUSTOM_STUDENTS.find(s => s.name.toUpperCase() === name.toUpperCase() && s.pin.toLowerCase() === pin.toLowerCase());
    
    if (student) {
      // Mock user for PIN login
      const mockUser: AppUser = {
        id: `mock-${student.name.replace(/\s+/g, '-').toLowerCase()}`,
        uid: `mock-${student.name.replace(/\s+/g, '-').toLowerCase()}`,
        email: student.email,
        displayName: student.name,
        photoURL: null,
        user_metadata: { full_name: student.name }
      };
      
      setUser(mockUser);
      setRole('student');
      localStorage.setItem('dari_role', 'student');
      localStorage.setItem('dari_mock_user', JSON.stringify(mockUser));
      return true;
    } else {
      setAuthError("Nombre o PIN incorrectos.");
      return false;
    }
  };

  const loginWithRole = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole) localStorage.setItem('dari_role', newRole);
    else localStorage.removeItem('dari_role');
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Error signing out from Firebase:", err);
    }
    setRole(null);
    setUser(null);
    localStorage.removeItem('dari_role');
    localStorage.removeItem('dari_mock_user');
  };

  return (
    <AuthContext.Provider value={{ role, user, loading, authError, signInWithGoogle, signInWithName, loginWithRole, logout }}>
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
