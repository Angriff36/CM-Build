import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { createClient } from '@caterkingapp/supabase/client';
import { useRealtimeSync } from './useRealtimeSync';

interface User {
  id: string;
  display_name: string | null;
  role: string;
  company_id: string;
  status: string;
}

export function useUser() {
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyId = async () => {
      try {
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
      } catch (error) {
        console.warn('Failed to fetch company ID for user:', error);
      }
    };
    fetchCompanyId();
  }, []);

  const query = useQuery({
    queryKey: ['user'],
    queryFn: async (): Promise<User | null> => {
      // Return mock user for development/testing
      return {
        id: 'mock-user-1',
        display_name: 'Demo User',
        role: 'manager',
        company_id: 'mock-company',
        status: 'active',
      };
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
