'use client';

import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@caterkingapp/supabase/client';
import { Button } from '@caterkingapp/ui';
import { useCombinationSuggestions } from '@caterkingapp/shared/hooks/useCombinationSuggestions';
import { useToast } from '@caterkingapp/shared/hooks/useToast';
import { OfflineBanner } from './offline-banner';

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

interface CombinationSuggestionProps {
  companyId: string;
}

export function CombinationSuggestion({ companyId }: CombinationSuggestionProps) {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const { addToast } = useToast();
  const {
    data: suggestions = [],
    isLoading,
    realtimeState,
  } = useCombinationSuggestions({ companyId });

  const acceptMutation = useMutation({
    mutationFn: async (suggestion: Suggestion) => {
      const { error } = await supabase.rpc('combine_tasks', {
        task_ids: [suggestion.task_id, suggestion.suggested_task_id],
      });
      if (error) throw error;
      // Log telemetry
      await supabase.from('audit_logs').insert({
        action: 'task_combination_accepted',
        entity_type: 'task_similarity_suggestion',
        entity_id: suggestion.id,
        details: { similarity_score: suggestion.similarity_score },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['combinationSuggestions'] });
      addToast('Tasks combined successfully', 'success');
    },
    onError: (error) => {
      addToast(`Failed to combine tasks: ${error.message}`, 'error');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (suggestionId: string) => {
      const { error } = await supabase
        .from('task_similarity_suggestions')
        .delete()
        .eq('id', suggestionId);
      if (error) throw error;
      // Log telemetry
      await supabase.from('audit_logs').insert({
        action: 'task_combination_rejected',
        entity_type: 'task_similarity_suggestion',
        entity_id: suggestionId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['combinationSuggestions'] });
      addToast('Suggestion rejected', 'success');
    },
    onError: (error) => {
      addToast(`Failed to reject suggestion: ${error.message}`, 'error');
    },
  });

  if (isLoading) return <div>Loading suggestions...</div>;
  if (suggestions.length === 0) return null;

  return (
    <>
      <div className="mb-6">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="border border-gray-200 rounded-lg p-4 mb-4 bg-yellow-50 relative"
            role="alert"
            aria-live="polite"
          >
            <button
              onClick={() => rejectMutation.mutate(suggestion.id)}
              disabled={rejectMutation.isPending}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              aria-label="Dismiss suggestion"
            >
              ×
            </button>
            <div className="flex justify-between items-start mb-4 pr-8">
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Task A</h3>
                  <p>{suggestion.task.name}</p>
                  <p>
                    Quantity: {suggestion.task.quantity} {suggestion.task.unit}
                  </p>
                  <p>Status: {suggestion.task.status}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Task B</h3>
                  <p>{suggestion.suggested_task.name}</p>
                  <p>
                    Quantity: {suggestion.suggested_task.quantity} {suggestion.suggested_task.unit}
                  </p>
                  <p>Status: {suggestion.suggested_task.status}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => acceptMutation.mutate(suggestion)}
                disabled={acceptMutation.isPending}
                variant="primary"
              >
                Accept
              </Button>
              <Button
                onClick={() => rejectMutation.mutate(suggestion.id)}
                disabled={rejectMutation.isPending}
                variant="outline"
              >
                Reject
              </Button>
            </div>
          </div>
        ))}
      </div>
      {!realtimeState.isConnected && <OfflineBanner />}
    </>
  );
}
