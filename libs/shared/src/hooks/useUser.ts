import { useQuery } from '@tanstack/react-query';
import { createClient } from '@caterkingapp/supabase/client';

interface User {
  id: string;
  display_name: string;
  role: string;
  company_id: string;
  email?: string;
  phone?: string;
}

export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: async (): Promise<User | null> => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('users')
        .select('id, display_name, role, company_id, email, phone')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });
}
