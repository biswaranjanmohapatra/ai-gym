import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<'user' | 'trainer' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setRole(null); setLoading(false); return; }
    
    supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (data && data.length > 0) {
          // Prioritize admin > trainer > user
          const roles = data.map(r => r.role);
          if (roles.includes('admin')) setRole('admin');
          else if (roles.includes('trainer')) setRole('trainer');
          else setRole('user');
        } else {
          setRole('user');
        }
        setLoading(false);
      });
  }, [user]);

  const isTrainer = role === 'trainer';
  const isPremium = typeof window !== 'undefined' && user ? localStorage.getItem(`premium_${user.id}`) === 'true' : false;

  return { role, isTrainer, isPremium, loading };
}
