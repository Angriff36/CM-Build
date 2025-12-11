#!/usr/bin/env node

// CLI script to generate audit reports for the last 24 hours

import { createClient } from '@supabase/supabase-js';
import { format } from 'date-fns';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function generateReport() {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Critical actions to report
  const criticalActions = [
    'combine',
    'approve_combine',
    'reject_combine',
    'reassign',
    'snapshot',
    'undo',
    'undo_combine',
    'rollback',
  ];

  const { data, error } = await supabase
    .from('audit_logs')
    .select('created_at, user_id, entity_type, entity_id, action, diff')
    .in('action', criticalActions)
    .gte('created_at', twentyFourHoursAgo.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching audit logs:', error);
    process.exit(1);
  }

  console.log('Audit Report - Last 24 Hours');
  console.log('==============================');
  console.log('');

  if (data.length === 0) {
    console.log('No audit events found in the last 24 hours.');
    return;
  }

  // Print table header
  console.log(
    'Timestamp'.padEnd(20),
    'User ID'.padEnd(40),
    'Entity'.padEnd(15),
    'Action'.padEnd(15),
    'Details',
  );
  console.log('-'.repeat(20), '-'.repeat(40), '-'.repeat(15), '-'.repeat(15), '-'.repeat(50));

  for (const log of data) {
    const timestamp = format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss');
    const userId = log.user_id.slice(0, 36); // Truncate UUID
    const entity = `${log.entity_type}:${log.entity_id.slice(0, 8)}`;
    const action = log.action;
    const details = JSON.stringify(log.diff).slice(0, 50);

    console.log(
      timestamp.padEnd(20),
      userId.padEnd(40),
      entity.padEnd(15),
      action.padEnd(15),
      details,
    );
  }

  console.log('');
  console.log(`Total events: ${data.length}`);
}

generateReport().catch(console.error);
