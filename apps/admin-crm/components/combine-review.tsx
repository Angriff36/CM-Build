'use client';

import { useState } from 'react';
import { createClient } from '../../../libs/supabase/src/client';

interface Suggestion {
  id: string;
  task_id: string;
  suggested_task_id: string;
  similarity_score: number;
  created_at: string;
  tasks: {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    event_id: string;
  };
  suggested_tasks: {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    event_id: string;
  };
}

interface AuditLog {
  id: string;
  action: string;
  entity_id: string;
  diff: any;
  created_at: string;
}

interface Props {
  suggestions: Suggestion[];
  auditLogs: AuditLog[];
  onUpdate: () => void;
}

export default function CombineReview({ suggestions, auditLogs }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const supabase = createClient();

  const handleApprove = async (suggestion: Suggestion) => {
    setLoading(suggestion.id);
    try {
      console.log('combine_approved', {
        suggestionId: suggestion.id,
        taskIds: [suggestion.task_id, suggestion.suggested_task_id],
      });
      const { data, error } = await supabase.rpc('combine_tasks', {
        task_ids: [suggestion.task_id, suggestion.suggested_task_id],
      });
      if (error) throw error;
      // Remove suggestion
      await supabase.from('task_similarity_suggestions').delete().eq('id', suggestion.id);
      onUpdate();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async (suggestionId: string) => {
    setLoading(suggestionId);
    try {
      console.log('combine_rejected', { suggestionId });
      await supabase.from('task_similarity_suggestions').delete().eq('id', suggestionId);
      onUpdate();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  const handleRollback = async (combinedGroupId: string) => {
    setLoading(combinedGroupId);
    try {
      console.log('combine_rollback', { combinedGroupId });
      const { data, error } = await supabase.rpc('undo_combine', {
        combined_group_id: combinedGroupId,
      });
      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async (suggestionId: string) => {
    setLoading(suggestionId);
    try {
      await supabase.from('task_similarity_suggestions').delete().eq('id', suggestionId);
      onUpdate();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  const handleRollback = async (combinedGroupId: string) => {
    setLoading(combinedGroupId);
    try {
      // For rollback, we need an undo token, but for combine, we'll assume direct undo
      // Since undo_task expects token, but for combine, we'll call it with a dummy or modify
      // For now, directly update, but better to use RPC
      // await supabase.rpc('undo_task', { undo_token: 'dummy' }); // but need proper token
      // Since no token for combine, perhaps create one or modify function
      // For simplicity, direct update
      const { data, error } = await supabase.rpc('undo_combine', {
        combined_group_id: combinedGroupId,
      });
      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div>
      <h2>Suggestions</h2>
      {suggestions.map((suggestion) => (
        <div key={suggestion.id} className="border p-4 mb-4">
          <p>
            {suggestion.tasks.name} + {suggestion.suggested_tasks.name}
          </p>
          <p>Score: {suggestion.similarity_score}</p>
          <button onClick={() => handleApprove(suggestion)} disabled={loading === suggestion.id}>
            Approve
          </button>
          <button onClick={() => handleReject(suggestion.id)} disabled={loading === suggestion.id}>
            Reject
          </button>
        </div>
      ))}

      <h2>Audit Trail</h2>
      {auditLogs.map((log) => (
        <div key={log.id} className="border p-4 mb-4">
          <p>
            Combined group {log.entity_id} at {log.created_at}
          </p>
          <button onClick={() => handleRollback(log.entity_id)}>Rollback</button>
        </div>
      ))}
    </div>
  );
}
