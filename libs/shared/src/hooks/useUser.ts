import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { createClient } from '@caterkingapp/supabase/client';
import { useRealtimeSync } from './useRealtimeSync';

interface User {
  id: string;
  display_name: string;
  role: string;
  company_id: string;
  email?: string;
  phone?: string;
}

export function useUser() {
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyId = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: userData } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single();
      if (userData) setCompanyId(userData.company_id);
    };
    fetchCompanyId();
  }, []);

  const query = useQuery({
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

  const realtimeState = useRealtimeSync({
    channelConfig: {
      name: companyId ? `company:${companyId}:users` : 'users',
      postgresChanges: companyId
        ? [
            {
              event: '*',
              schema: 'public',
              table: 'users',
            },
          ]
        : [],
    },
    queryKeysToInvalidate: [['user']],
    enablePollingOnDisconnect: true,
  });

  return {
    ...query,
    realtimeState,
  };
}
