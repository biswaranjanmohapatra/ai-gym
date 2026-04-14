import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { fetchApi } from '@/lib/api';

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<'user' | 'trainer' | 'admin' | null>(null);
  const [isPremium, setIsPremium] = useState(false);
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
        if (data && data.profile?.premiumUntil) {
          setIsPremium(new Date(data.profile.premiumUntil) > new Date());
        }
        setLoading(false);
      })
      .catch(() => {
        setRole('user');
        setIsPremium(false);
        setLoading(false);
      });
  }, [user]);

  const isTrainer = role === 'trainer';

  return { role, isTrainer, isPremium, loading };
}
