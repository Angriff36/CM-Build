#!/usr/bin/env tsx

import { createClient } from '../../libs/supabase/src/client';

const BACKLOG_THRESHOLD = 10; // Alert if more than 10 pending/processing
const CHECK_INTERVAL_MS = 60000; // Check every minute

async function checkMediaQueue() {
  const supabase = createClient();

  try {
    // Get counts of pending and processing media assets
    const { count: pendingCount, error: pendingError } = await supabase
      .from('media_assets')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const { count: processingCount, error: processingError } = await supabase
      .from('media_assets')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'processing');

    if (pendingError || processingError) {
      console.error('Error querying media assets:', pendingError || processingError);
      return;
    }

    const totalBacklog = (pendingCount || 0) + (processingCount || 0);

    console.log(
      `[${new Date().toISOString()}] Media queue status: ${totalBacklog} items (${pendingCount?.length || 0} pending, ${processingCount?.length || 0} processing)`,
    );

    if (totalBacklog > BACKLOG_THRESHOLD) {
      console.error(
        `ALERT: Media processing backlog exceeds threshold (${totalBacklog} > ${BACKLOG_THRESHOLD})`,
      );
      // In production, send notification via email, Slack, etc.
      // For now, just log
    }

    // Optional: Log oldest pending items
    if (totalBacklog > 0) {
      const { data: oldestPending } = await supabase
        .from('media_assets')
        .select('id, created_at, storage_path')
        .in('status', ['pending', 'processing'])
        .order('created_at', { ascending: true })
        .limit(5);

      if (oldestPending) {
        console.log('Oldest items:');
        oldestPending.forEach((item) => {
          console.log(`  - ${item.id}: ${item.storage_path} (${item.created_at})`);
        });
      }
    }
  } catch (error) {
    console.error('Error in checkMediaQueue:', error);
  }
}

async function main() {
  console.log('Starting media queue watcher...');

  // Initial check
  await checkMediaQueue();

  // Set up interval
  setInterval(checkMediaQueue, CHECK_INTERVAL_MS);
}

if (require.main === module) {
  main().catch(console.error);
}
