'use client';

import React, { useState, useEffect } from 'react';
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

interface AuditLog {
  id: string;
  action: string;
  entity_id: string;
  diff: any;
  created_at: string;
}

interface CombineReviewProps {
  suggestions: Suggestion[];
  auditLogs: AuditLog[];
  onUpdate: () => void;
}

export default function CombineReviewPage({
  suggestions,
  auditLogs,
  onUpdate,
}: CombineReviewProps) {
  const [loading, setLoading] = useState<string | null>(null);

  if (!isFeatureEnabled('admin.task-combine-review.v1')) {
    return <div>Feature not enabled</div>;
  }

  // TODO: Implement task combine review when tables and RPC functions are available
  return (
    <main className="p-8">
      <h1>Task Combine Review</h1>
      <div>
        <p>Found {suggestions.length} suggestions</p>
        <p>Audit logs: {auditLogs.length}</p>
        <button onClick={onUpdate}>Refresh</button>
        Task combination review feature is not yet fully implemented. Database tables and RPC
        functions need to be created.
      </div>
    </main>
  );
}
