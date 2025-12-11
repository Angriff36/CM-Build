import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface Task {
  id: string;
  name: string;
  quantity: number;
  unit: string | null;
  company_id: string;
  event_id: string | null;
  status: string;
}

interface SimilaritySuggestion {
  company_id: string;
  task_id: string;
  suggested_task_id: string;
  similarity_score: number;
}

// Unit normalization mappings
const UNIT_NORMALIZATIONS: Record<string, string> = {
  g: 'g',
  gram: 'g',
  grams: 'g',
  kg: 'kg',
  kilogram: 'kg',
  kilograms: 'kg',
  cup: 'cup',
  cups: 'cup',
  tbsp: 'tbsp',
  tablespoon: 'tbsp',
  tablespoons: 'tbsp',
  tsp: 'tsp',
  teaspoon: 'tsp',
  teaspoons: 'tsp',
  oz: 'oz',
  ounce: 'oz',
  ounces: 'oz',
  lb: 'lb',
  pound: 'lb',
  pounds: 'lb',
  ml: 'ml',
  milliliter: 'ml',
  milliliters: 'ml',
  l: 'l',
  liter: 'l',
  liters: 'l',
  pint: 'pint',
  pints: 'pint',
  quart: 'quart',
  quarts: 'quart',
  gallon: 'gallon',
  gallons: 'gallon',
};

function normalizeUnit(unit: string | null): string | null {
  if (!unit) return null;
  const lower = unit.toLowerCase().trim();
  return UNIT_NORMALIZATIONS[lower] || lower;
}

function normalizeName(name: string): string[] {
  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 0);
}

function computeSimilarity(task1: Task, task2: Task): number {
  if (task1.id === task2.id) return 0;

  const name1 = normalizeName(task1.name);
  const name2 = normalizeName(task2.name);

  // Early exit for tasks with very different names
  if (name1.length === 0 || name2.length === 0) return 0;

  // Simple word overlap with early exit optimization
  const set1 = new Set(name1);
  const set2 = new Set(name2);
  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  const nameSimilarity = intersection.size / union.size;

  // Early exit for low name similarity (<0.3)
  if (nameSimilarity < 0.3) return 0;

  // Unit compatibility
  const unit1 = normalizeUnit(task1.unit);
  const unit2 = normalizeUnit(task2.unit);
  const unitMatch = unit1 === unit2 ? 1 : 0;

  // Quantity ratio (if units match, closer quantities higher score)
  let quantitySimilarity = 0;
  if (unitMatch && task1.quantity > 0 && task2.quantity > 0) {
    const ratio =
      Math.min(task1.quantity, task2.quantity) / Math.max(task1.quantity, task2.quantity);
    quantitySimilarity = ratio;
  }

  // Weighted score: 0.6 name, 0.3 unit, 0.1 quantity
  const finalScore = 0.6 * nameSimilarity + 0.3 * unitMatch + 0.1 * quantitySimilarity;

  // Early exit for low final scores (<0.5 threshold)
  return finalScore < 0.5 ? 0 : finalScore;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      },
    );

    const { company_id } = await req.json();
    if (!company_id) {
      throw new Error('company_id required');
    }

    // Get user context
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Check role (assume manager or above can trigger)
    const { data: userData, error: roleError } = await supabaseClient
      .from('users')
      .select('role')
      .eq('id', user.id)
      .eq('company_id', company_id)
      .single();

    if (roleError || !['manager', 'event_lead', 'owner'].includes(userData.role)) {
      throw new Error('Insufficient permissions');
    }

    // Fetch tasks for company (available or claimed, not completed)
    const { data: tasks, error: tasksError } = await supabaseClient
      .from('tasks')
      .select('id, name, quantity, unit, company_id, event_id, status')
      .eq('company_id', company_id)
      .in('status', ['available', 'claimed', 'in_progress']);

    if (tasksError) {
      throw tasksError;
    }

    // Compute similarities
    const suggestions: SimilaritySuggestion[] = [];
    for (let i = 0; i < tasks.length; i++) {
      for (let j = i + 1; j < tasks.length; j++) {
        const score = computeSimilarity(tasks[i], tasks[j]);
        if (score > 0.5) {
          // threshold
          suggestions.push({
            company_id,
            task_id: tasks[i].id,
            suggested_task_id: tasks[j].id,
            similarity_score: score,
          });
          suggestions.push({
            company_id,
            task_id: tasks[j].id,
            suggested_task_id: tasks[i].id,
            similarity_score: score,
          });
        }
      }
    }

    // Insert suggestions (upsert to avoid duplicates)
    if (suggestions.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('task_similarity_suggestions')
        .upsert(suggestions, { onConflict: 'task_id,suggested_task_id' });

      if (insertError) {
        throw insertError;
      }
    }

    // Audit log
    await supabaseClient.from('audit_logs').insert({
      company_id,
      user_id: user.id,
      entity_type: 'task_similarity_suggestions',
      entity_id: null,
      action: 'generate',
      diff: { count: suggestions.length },
    });

    // Realtime notify (optional, perhaps notify managers)
    await supabaseClient.rpc('pg_notify', {
      channel: `company:${company_id}:task_similarity_suggestions`,
      payload: JSON.stringify({
        type: 'suggestions_generated',
        data: { count: suggestions.length },
        actor: user.id,
        timestamp: new Date().toISOString(),
      }),
    });

    return new Response(JSON.stringify({ success: true, suggestions_count: suggestions.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
