'use client';

import { useEffect, useState } from 'react';
import { createClient } from '../../../libs/supabase/src/client';
import { isFeatureEnabled } from '../../../libs/shared/src/flags';

interface Suggestion {
  id: string;
  task_id: string;
  suggested_task_id: string;
  similarity_score: number;
  tasks: {
    id: string;
    name: string;
    quantity: number;
    unit: string;
  };
  suggested_tasks: {
    id: string;
    name: string;
    quantity: number;
    unit: string;
  };
}

export default function CombinePage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isFeatureEnabled('prep.task-combine.v1')) {
      console.log('feature_exposed', { flag: 'prep.task-combine.v1', exposed: false });
      return;
    }
    console.log('feature_exposed', { flag: 'prep.task-combine.v1', exposed: true });

    const supabase = createClient();
    const fetchSuggestions = async () => {
      const { data } = await supabase.from('task_similarity_suggestions').select(`
          id,
          task_id,
          suggested_task_id,
          similarity_score,
          tasks!task_id (
            id,
            name,
            quantity,
            unit
          ),
          suggested_tasks:tasks!suggested_task_id (
            id,
            name,
            quantity,
            unit
          )
        `);
      setSuggestions(data || []);
    };
    fetchSuggestions();
  }, []);

  const handleCombine = async (suggestion: Suggestion) => {
    setLoading(true);
    const supabase = createClient();
    try {
      console.log('combine_opt_in', {
        suggestionId: suggestion.id,
        taskIds: [suggestion.task_id, suggestion.suggested_task_id],
      });
      await supabase.rpc('combine_tasks', {
        task_ids: [suggestion.task_id, suggestion.suggested_task_id],
      });
      // Remove from list
      setSuggestions(suggestions.filter((s) => s.id !== suggestion.id));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isFeatureEnabled('prep.task-combine.v1')) {
    return <div>Feature not enabled</div>;
  }

  return (
    <main className="p-8">
      <h1>Task Combine Suggestions</h1>
      {suggestions.map((suggestion) => (
        <div key={suggestion.id} className="border p-4 mb-4">
          <p>
            Combine {suggestion.tasks.name} with {suggestion.suggested_tasks.name}
          </p>
          <p>Score: {suggestion.similarity_score}</p>
          <button onClick={() => handleCombine(suggestion)} disabled={loading}>
            Combine Tasks
          </button>
          <details>
            <summary>Details</summary>
            <p>
              Task 1: {suggestion.tasks.name} - {suggestion.tasks.quantity} {suggestion.tasks.unit}
            </p>
            <p>
              Task 2: {suggestion.suggested_tasks.name} - {suggestion.suggested_tasks.quantity}{' '}
              {suggestion.suggested_tasks.unit}
            </p>
          </details>
        </div>
      ))}
    </main>
  );
}
