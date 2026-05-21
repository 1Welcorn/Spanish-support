import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserRole } from '../types';
export type ProjectMode = 'afghan' | 'spanish' | 'sareh';
import { supabase } from '../services/supabase';

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
  projectMode: ProjectMode | null;
  setProjectMode: (mode: ProjectMode | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAILS = ['willians.souza@escola.pr.gov.br', 'f4330252301@gmail.com']; 
const MEDIATOR_EMAILS: string[] = []; 

export const CUSTOM_STUDENTS = [
  { name: 'ASMA QARI ZADAH', pin: 'asma', email: 'asma.zadah@escola.pr.gov.br', mode: 'afghan' },
  { name: 'HOSNA QARI ZADAH', pin: 'hosna', email: 'hosna.zadah@escola.pr.gov.br', mode: 'afghan' },
  { name: 'IONE JORDÃO RIBEIRO', pin: 'ione', email: 'ione.ribeiro@escola.pr.gov.br', mode: 'sareh' }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [projectMode, setProjectMode] = useState<ProjectMode | null>(null);

  const handleUser = async (supabaseUser: any) => {
    console.log("AuthContext: Handling user:", supabaseUser?.email);
    
    if (supabaseUser) {
      const normalizedUser: AppUser = {
        id: supabaseUser.id,
        uid: supabaseUser.id,
        email: supabaseUser.email || null,
        displayName: supabaseUser.user_metadata?.full_name || supabaseUser.email || null,
        photoURL: supabaseUser.user_metadata?.avatar_url || null,
        user_metadata: {
          full_name: supabaseUser.user_metadata?.full_name || '',
          avatar_url: supabaseUser.user_metadata?.avatar_url || ''
        }
      };
      setUser(normalizedUser);

      // Ensure profile exists in profiles table
      try {
        await supabase.from('profiles').upsert({
          id: supabaseUser.id,
          email: supabaseUser.email,
          name: supabaseUser.user_metadata?.full_name || supabaseUser.email,
          updated_at: new Date().toISOString()
        });
      } catch (e) {
        console.error("AuthContext profiles upsert error:", e);
      }

      // Identify Role and Auto-Mode
      if (supabaseUser.email) {
        const email = supabaseUser.email.toLowerCase();
        console.log("AuthContext: Validating role for email:", email);
        
        // Is it an Admin?
        if (ADMIN_EMAILS.includes(email)) {
          console.log("AuthContext: ROLE SET TO ADMIN");
          setRole('admin');
          localStorage.setItem('dari_role', 'admin');
          const savedMode = localStorage.getItem('dari_project_mode') as ProjectMode;
          if (savedMode) setProjectMode(savedMode);
        } 
        // Is it a Mediator?
        else if (MEDIATOR_EMAILS.includes(email)) {
          console.log("AuthContext: ROLE SET TO MEDIATOR");
          setRole('admin'); // Mediator has full access
          localStorage.setItem('dari_role', 'admin');
        } 
        // Is it a known Student?
        else {
          const studentProfile = CUSTOM_STUDENTS.find(s => s.email.toLowerCase() === email);
          
          if (studentProfile) {
            console.log("AuthContext: Recognized Student:", studentProfile.name);
            setRole('student');
            setProjectMode(studentProfile.mode as ProjectMode);
            localStorage.setItem('dari_role', 'student');
            localStorage.setItem('dari_project_mode', studentProfile.mode);
          } else {
            console.log("AuthContext: Unknown user, defaulting to student");
            setRole('student');
            localStorage.setItem('dari_role', 'student');
          }
        }
      }
    } else {
      setUser(null);
      setRole(null);
      localStorage.removeItem('dari_role');
    }
  };

  useEffect(() => {
    console.log("AuthProvider: Initializing...");
    
    // Check initial mock user state
    const savedMock = localStorage.getItem('dari_mock_user');
    const savedMode = localStorage.getItem('dari_project_mode') as ProjectMode;
    
    if (savedMode) setProjectMode(savedMode);

    if (savedMock) {
      try {
        const mockUser = JSON.parse(savedMock);
        const savedRole = localStorage.getItem('dari_role') as UserRole;
        setUser(mockUser);
        setRole(savedRole || 'student');
      } catch (e) {
        console.error("Error parsing saved mock user:", e);
      }
    }

    // Get current session state
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        handleUser(session.user);
      } else if (!savedMock) {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    // Listen to changes in auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("AuthProvider: Auth state changed:", !!session);
      if (session?.user) {
        handleUser(session.user);
      } else {
        const freshMock = localStorage.getItem('dari_mock_user');
        if (!freshMock) {
          setUser(null);
          setRole(null);
        }
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (error: any) {
      console.error('Error logging in with Google:', error.message);
      setAuthError(error.message);
    }
  };

  const signInWithName = async (name: string, pin: string): Promise<boolean> => {
    setAuthError(null);
    const student = CUSTOM_STUDENTS.find(s => s.name.toUpperCase() === name.toUpperCase() && s.pin.toLowerCase() === pin.toLowerCase());
    
    if (student) {
      // Determine mode based on student profile or name
      let mode: ProjectMode = student.mode as ProjectMode;
      
      if (!mode) {
        mode = name.toUpperCase().includes('ASMA') || name.toUpperCase().includes('HOSNA') ? 'afghan' : 'spanish';
      }
      
      const studentEmail = student.email;
      const studentPassword = `${pin}_secure_sareh_2026`;

      try {
        setLoading(true);
        // 1. Try to sign in with password
        let authUser: any = null;
        const signInRes = await supabase.auth.signInWithPassword({
          email: studentEmail,
          password: studentPassword,
        });

        // 2. If user doesn't exist, sign them up
        if (signInRes.error && (signInRes.error.message.includes('Invalid login credentials') || signInRes.error.message.includes('User not found'))) {
          console.log("AuthContext: Student does not exist in Supabase Auth, signing them up...");
          const signUpRes = await supabase.auth.signUp({
            email: studentEmail,
            password: studentPassword,
            options: {
              data: {
                full_name: student.name,
              }
            }
          });

          if (signUpRes.error) throw signUpRes.error;
          authUser = signUpRes.data.user;
        } else if (signInRes.error) {
          throw signInRes.error;
        } else {
          authUser = signInRes.data.user;
        }

        if (!authUser) throw new Error("No user returned from Supabase Auth");

        // 3. Upsert profile in profiles table
        const profileData = {
          id: authUser.id,
          email: studentEmail,
          name: student.name,
          updated_at: new Date().toISOString()
        };
        await supabase.from('profiles').upsert(profileData);

        const appUser: AppUser = {
          id: authUser.id,
          uid: authUser.id,
          email: studentEmail,
          displayName: student.name,
          photoURL: null,
          user_metadata: { full_name: student.name }
        };

        setUser(appUser);
        setRole('student');
        setProjectMode(mode);

        localStorage.setItem('dari_role', 'student');
        localStorage.setItem('dari_project_mode', mode);
        localStorage.setItem('dari_mock_user', JSON.stringify(appUser));
        setLoading(false);
        return true;
      } catch (err: any) {
        console.error("AuthContext student login error:", err);
        setAuthError(err.message || "Erro na autenticação com o servidor.");
        setLoading(false);
        return false;
      }
    } else {
      setAuthError("Nombre o PIN incorrectos.");
      return false;
    }
  };

  const loginWithRole = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole) {
      localStorage.setItem('dari_role', newRole);
      if (newRole === 'admin') {
        const mockAdmin = {
          id: '49f4c398-7cf1-4541-ba66-f045cf7b719e',
          uid: '49f4c398-7cf1-4541-ba66-f045cf7b719e',
          email: 'willians.souza@escola.pr.gov.br',
          displayName: 'Admin (Bypass)',
          photoURL: null,
          user_metadata: { full_name: 'Admin (Bypass)' }
        };
        
        supabase.from('profiles').upsert({
          id: '49f4c398-7cf1-4541-ba66-f045cf7b719e',
          email: 'willians.souza@escola.pr.gov.br',
          name: 'Admin (Bypass)',
          updated_at: new Date().toISOString()
        }).then(({ error }) => {
          if (error) console.error("Error upserting mock admin profile:", error);
        });

        setUser(mockAdmin);
        localStorage.setItem('dari_mock_user', JSON.stringify(mockAdmin));
      }
    } else {
      localStorage.removeItem('dari_role');
    }
  };

  const handleSetProjectMode = (mode: ProjectMode | null) => {
    setProjectMode(mode);
    if (mode) {
      localStorage.setItem('dari_project_mode', mode);
    } else {
      localStorage.removeItem('dari_project_mode');
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Error signing out from Supabase:", err);
    }
    setRole(null);
    setUser(null);
    setProjectMode(null);
    localStorage.removeItem('dari_role');
    localStorage.removeItem('dari_mock_user');
    localStorage.removeItem('dari_project_mode');
  };

  return (
    <AuthContext.Provider value={{ 
      role, user, loading, authError, signInWithGoogle, signInWithName, loginWithRole, logout,
      projectMode, setProjectMode: handleSetProjectMode
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
