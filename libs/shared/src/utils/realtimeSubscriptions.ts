import { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';

export interface PostgresChangeConfig {
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  schema: string;
  table: string;
  filter?: string;
}

export interface BroadcastConfig {
  event: string;
  self?: boolean;
}

export interface ChannelConfig {
  name: string;
  postgresChanges?: PostgresChangeConfig[];
  broadcasts?: BroadcastConfig[];
}

export function createPostgresChangeSubscription(
  supabase: SupabaseClient,
  config: PostgresChangeConfig,
  onChange: () => void,
): RealtimeChannel {
  return supabase
    .channel(`postgres_${config.table}_${config.event}`)
    .on('postgres_changes', config, onChange);
}

export function createBroadcastSubscription(
  supabase: SupabaseClient,
  config: BroadcastConfig,
  onBroadcast: (payload: unknown) => void,
): RealtimeChannel {
  return supabase
    .channel(`broadcast_${config.event}`)
    .on('broadcast', { event: config.event, self: config.self ?? false }, onBroadcast);
}

export function createRealtimeChannel(
  supabase: SupabaseClient,
  config: ChannelConfig,
  onPostgresChange?: () => void,
  onBroadcast?: (payload: unknown) => void,
): RealtimeChannel {
  let channel = supabase.channel(config.name);

  if (config.postgresChanges && onPostgresChange) {
    config.postgresChanges.forEach((changeConfig) => {
      channel = channel.on('postgres_changes', changeConfig, onPostgresChange);
    });
  }

  if (config.broadcasts && onBroadcast) {
    config.broadcasts.forEach((broadcastConfig) => {
      channel = channel.on(
        'broadcast',
        { event: broadcastConfig.event, self: broadcastConfig.self ?? false },
        onBroadcast,
      );
    });
  }

  return channel;
}

export function subscribeToChannel(
  channel: RealtimeChannel,
  onSubscribe?: (status: string, err?: unknown) => void,
): RealtimeChannel {
  return channel.subscribe(onSubscribe);
}

export function unsubscribeFromChannel(supabase: SupabaseClient, channel: RealtimeChannel): void {
  supabase.removeChannel(channel);
}
