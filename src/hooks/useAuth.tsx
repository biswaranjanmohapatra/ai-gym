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
  signUp: (email: string, password: string, role: AppRole, name?: string) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<AppRole | null>;
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

      setUser({ id: authUser.id, email: authUser.email ?? null });

      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authUser.id)
        .limit(1)
        .maybeSingle();

      setRole((roles?.role as AppRole) ?? null);
      setLoading(false);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setRole(null);
      } else if (session?.user) {
        const authUser = session.user;
        setUser({ id: authUser.id, email: authUser.email ?? null });
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', authUser.id)
          .limit(1)
          .maybeSingle();
        setRole((roles?.role as AppRole) ?? null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, roleToAssign: AppRole, name?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/user-login`,
      },
    });
    if (error) throw error;
    const authUser = data.user;
    if (!authUser) return null;

    // Insert role
    await supabase.from('user_roles').upsert({
      user_id: authUser.id,
      role: roleToAssign,
    });

    // Insert profile with name and role
    await supabase.from('profiles').upsert({
      user_id: authUser.id,
      name: name || email.split('@')[0],
      role: roleToAssign,
    } as any);

    // Do not auto-sign-in; require email verification first
    setUser(null);
    setRole(null);
    return authUser.id;
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const authUser = data.user;
    if (!authUser) return null;

    // Enforce email verification
    if (!authUser.email_confirmed_at) {
      await supabase.auth.signOut();
      throw new Error('Please verify your email before logging in. Check your inbox.');
    }

    setUser({ id: authUser.id, email: authUser.email ?? null });

    const { data: roleRow } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', authUser.id)
      .limit(1)
      .maybeSingle();

    const resolvedRole = (roleRow?.role as AppRole) ?? null;
    setRole(resolvedRole);

    // Sync profile name/role if not set
    if (resolvedRole) {
      await supabase.from('profiles').upsert({
        user_id: authUser.id,
        role: resolvedRole,
      } as any);
    }

    return resolvedRole;
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
