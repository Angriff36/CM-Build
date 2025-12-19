'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@codemachine/supabase';
import { isFeatureEnabled } from '@codemachine/shared';

interface Suggestion {
  id: string;
  task_id: string;
  suggested_task_id: string;
  similarity_score: number;
  tasks?: {
    id: string;
    name: string;
    quantity: number;
    unit: string;
  };
  suggested_tasks?: {
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
    const fetchSuggestions = async () => {
      // TODO: Implement task suggestions when table is available
      // For now, return empty array
      const data: Suggestion[] = [];
      setSuggestions(data);
    };
    fetchSuggestions();
  }, []);

  if (!isFeatureEnabled('prep.task-combine.v1')) {
    return <div>Feature not enabled</div>;
  }

  // TODO: Implement task combine when tables and RPC functions are available
  return (
    <main className="p-8">
      <h1>Task Combine Suggestions</h1>
      <div>
        Task combination feature is not yet implemented. Database tables and RPC functions need to
        be created.
      </div>
    </main>
  );
}
