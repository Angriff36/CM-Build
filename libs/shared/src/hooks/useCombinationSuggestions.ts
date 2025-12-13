import { useQuery } from '@tanstack/react-query';
import { createClient } from '@caterkingapp/supabase/client';
import { useRealtimeSync } from './useRealtimeSync';

interface Suggestion {
  id: string;
  company_id: string;
  task_id: string;
  suggested_task_id: string;
  similarity_score: number;
  created_at: string;
  task: {
    id: string;
    name: string;
    quantity: number;
    unit: string | null;
    status: string;
    priority: string;
  };
  suggested_task: {
    id: string;
    name: string;
    quantity: number;
    unit: string | null;
    status: string;
    priority: string;
  };
}

interface UseCombinationSuggestionsOptions {
  companyId: string;
}

export function useCombinationSuggestions({ companyId }: UseCombinationSuggestionsOptions) {
  const query = useQuery({
    queryKey: ['combinationSuggestions', companyId],
    queryFn: async () => {
      // TODO: Implement task similarity suggestions when table is available
      // For now, return empty array to prevent runtime errors
      return [] as Suggestion[];

      // Original implementation (commented out until table exists):
      // const supabase = createClient();
      // const { data, error } = await supabase
      //   .from('task_similarity_suggestions')
      //   .select(
      //     `
      //     *,
      //     task:tasks!task_id(id, name, quantity, unit, status, priority),
      //     suggested_task:tasks!suggested_task_id(id, name, quantity, unit, status, priority)
      //   `,
      //   )
      //   .eq('company_id', companyId);
      // if (error) throw error;
      // return data as Suggestion[];
    },
  });

  const realtimeState = useRealtimeSync({
    channelConfig: {
      name: `company:${companyId}:suggestions`,
      postgresChanges: [
        {
          event: '*',
          schema: 'public',
          table: 'task_similarity_suggestions',
        },
      ],
    },
    queryKeysToInvalidate: [['combinationSuggestions', companyId]],
    enablePollingOnDisconnect: true,
  });

  return {
    ...query,
    realtimeState,
  };
}
