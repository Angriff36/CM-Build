'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@codemachine/supabase';

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
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchSuggestions();
  }, [companyId]);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('task_similarity_suggestions')
        .select(
          `
          *,
          task:tasks(id, name, quantity, unit),
          suggested_task:tasks(id, name, quantity, unit)
        `,
        )
        .eq('company_id', companyId)
        .gte('similarity_score', 0.8)
        .order('similarity_score', { ascending: false })
        .limit(5);

      if (!error && data) {
        setSuggestions(data);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="text-yellow-800">Loading task combination suggestions...</div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-yellow-900 mb-3">Task Combination Suggestions</h3>
      <div className="space-y-2">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="flex items-center justify-between bg-white rounded p-3"
          >
            <div className="flex-1">
              <div className="font-medium text-gray-900">
                Combine: {suggestion.task?.name} + {suggestion.suggested_task?.name}
              </div>
              <div className="text-sm text-gray-600">
                Similarity: {Math.round(suggestion.similarity_score * 100)}%
              </div>
            </div>
            <button className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 transition-colors">
              Combine Tasks
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
