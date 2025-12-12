'use client';

import { useEffect, useState } from 'react';
import { createClient } from '../../../../libs/supabase/src/client';
import { isFeatureEnabled } from '../../../../libs/shared/src/flags';
import CombineReview from '../../../components/combine-review';

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

export default function CombinePage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [eventFilter, setEventFilter] = useState<string>('');
  const [stationFilter, setStationFilter] = useState<string>('');
  const [confidenceFilter, setConfidenceFilter] = useState<string>('');

  useEffect(() => {
    if (!isFeatureEnabled('prep.task-combine.v1')) {
      console.log('feature_exposed', { flag: 'prep.task-combine.v1', exposed: false });
      return;
    }
    console.log('feature_exposed', { flag: 'prep.task-combine.v1', exposed: true });

    const supabase = createClient();
    const fetchData = async () => {
      const { data: suggestionsData } = await supabase.from('task_similarity_suggestions').select(`
          id,
          task_id,
          suggested_task_id,
          similarity_score,
          created_at,
          tasks!task_id (
            id,
            name,
            quantity,
            unit,
            event_id
          ),
          suggested_tasks:tasks!suggested_task_id (
            id,
            name,
            quantity,
            unit,
            event_id
          )
        `);
      setSuggestions(suggestionsData || []);

      const { data: logs } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('entity_type', 'task')
        .eq('action', 'combine');
      setAuditLogs(logs || []);
    };
    fetchData();
  }, []);

  if (!isFeatureEnabled('prep.task-combine.v1')) {
    return <div>Feature not enabled</div>;
  }

  const filteredSuggestions = suggestions.filter((s) => {
    if (
      eventFilter &&
      s.tasks.event_id !== eventFilter &&
      s.suggested_tasks.event_id !== eventFilter
    )
      return false;
    if (confidenceFilter) {
      const conf = parseFloat(confidenceFilter);
      if (s.similarity_score < conf) return false;
    }
    return true;
  });

  return (
    <main className="p-8">
      <h1>Task Combine Approval Board</h1>
      <div className="filters">
        <select value={eventFilter} onChange={(e) => setEventFilter(e.target.value)}>
          <option value="">All Events</option>
          {/* Add dynamic options if needed */}
        </select>
        <select value={stationFilter} onChange={(e) => setStationFilter(e.target.value)}>
          <option value="">All Stations</option>
        </select>
        <select value={confidenceFilter} onChange={(e) => setConfidenceFilter(e.target.value)}>
          <option value="">All Confidence</option>
          <option value="0.5">High (0.5+)</option>
          <option value="0.7">Very High (0.7+)</option>
        </select>
      </div>
      <CombineReview
        suggestions={filteredSuggestions}
        auditLogs={auditLogs}
        onUpdate={() => {
          // Refresh data
          const supabase = createClient();
          const fetchData = async () => {
            const { data: suggestionsData } = await supabase.from('task_similarity_suggestions')
              .select(`
              id,
              task_id,
              suggested_task_id,
              similarity_score,
              created_at,
              tasks!task_id (
                id,
                name,
                quantity,
                unit,
                event_id
              ),
              suggested_tasks:tasks!suggested_task_id (
                id,
                name,
                quantity,
                unit,
                event_id
              )
            `);
            setSuggestions(suggestionsData || []);

            const { data: logs } = await supabase
              .from('audit_logs')
              .select('*')
              .eq('entity_type', 'task')
              .eq('action', 'combine');
            setAuditLogs(logs || []);
          };
          fetchData();
        }}
      />
    </main>
  );
}
