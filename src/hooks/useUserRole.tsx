import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { fetchApi } from '@/lib/api';

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<'user' | 'trainer' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setRole(null); setLoading(false); return; }
    
    fetchApi('/users/profile')
      .then((data) => {
        if (data && data.role) {
          setRole(data.role.toLowerCase() as 'user' | 'trainer' | 'admin');
        } else {
          setRole('user');
        }
        setLoading(false);
      })
      .catch(() => {
        setRole('user');
        setLoading(false);
      });
  }, [user]);

  const isTrainer = role === 'trainer';
  const isPremium = typeof window !== 'undefined' && user ? localStorage.getItem(`premium_${user.id}`) === 'true' : false;

  return { role, isTrainer, isPremium, loading };
}
