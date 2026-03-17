import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

type AppRole = 'user' | 'trainer' | 'admin';

interface AuthUser {
  id: string;
  email: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  role: AppRole | null;
  loading: boolean;
  signUp: (email: string, password: string, role: AppRole) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      const authUser = data.user;
      if (!authUser) {
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      setUser({ id: authUser.id, email: authUser.email });

      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authUser.id)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Failed to load user role', error);
        setRole(null);
      } else {
        setRole((roles?.role as AppRole) ?? null);
      }

      setLoading(false);
    };

    init();
  }, []);

  const signUp = async (email: string, password: string, roleToAssign: AppRole) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "http://localhost:8080/user-login",
      },
    });
    if (error) throw error;
    const authUser = data.user;
    if (!authUser) return;

    await supabase.from('user_roles').insert({
      user_id: authUser.id,
      role: roleToAssign,
    });

    // Do not auto-sign-in; require email verification first
    setUser(null);
    setRole(null);
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    const authUser = data.user;
    if (!authUser) return;

    // Enforce email verification
    if (!authUser.email_confirmed_at) {
      await supabase.auth.signOut();
      throw new Error("Please verify your email before logging in.");
    }

    setUser({ id: authUser.id, email: authUser.email });

    const { data: roleRow } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', authUser.id)
      .limit(1)
      .maybeSingle();

    setRole((roleRow?.role as AppRole) ?? null);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
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
