import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

type AppRole = 'user' | 'trainer' | 'admin';

interface AuthUser {
  id: string;
  email: string | null;
  name?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  role: AppRole | null;
  loading: boolean;
  signUp: (email: string, password: string, role: AppRole, name?: string) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<AppRole | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfileRole = async (userId: string): Promise<AppRole> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.warn('Could not fetch role from profiles:', error.message);
        return 'user';
      }
      return (data?.role as AppRole) || 'user';
    } catch (e) {
      console.error('Error fetching role:', e);
      return 'user';
    }
  };

  useEffect(() => {
    // Check active session on load
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const u = session.user;
        setUser({ id: u.id, email: u.email || null, name: u.user_metadata?.name });
        const userRole = await fetchProfileRole(u.id);
        setRole(userRole);
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const u = session.user;
        setUser({ id: u.id, email: u.email || null, name: u.user_metadata?.name });
        const userRole = await fetchProfileRole(u.id);
        setRole(userRole);
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, roleToAssign: AppRole, name?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: roleToAssign,
          name: name
        }
      }
    });

    if (error) {
      throw new Error(error.message || 'Registration failed');
    }
    
    return data.user?.id || null;
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message || 'Login failed');
    }
    
    // Some setups require email_confirmed_at. If needed:
    // if (!data.user.email_confirmed_at) throw new Error('Please confirm your email first.');

    const u = data.user;
    setUser({ id: u.id, email: u.email || null, name: u.user_metadata?.name });
    
    const userRole = await fetchProfileRole(u.id);
    setRole(userRole);

    return userRole;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
