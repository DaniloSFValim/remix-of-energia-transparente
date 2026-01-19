import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type AppRole = 'admin' | 'user';

export const useUserRole = () => {
  const { user, loading: authLoading } = useAuth();

  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: async (): Promise<AppRole[]> => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }
      
      return (data || []).map(r => r.role as AppRole);
    },
    enabled: !!user?.id,
  });

  const isAdmin = roles.includes('admin');
  const loading = authLoading || rolesLoading;

  return {
    roles,
    isAdmin,
    loading,
  };
};
