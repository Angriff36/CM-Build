import { useEffect, useState } from 'react';

interface PresenceData {
  last_heartbeat_at: string;
  device_id: string;
  status: 'online' | 'offline';
}

export function useHeartbeat() {
  const [presence, setPresence] = useState<PresenceData | null>(null);
  const [isStale, setIsStale] = useState(false);

  useEffect(() => {
    const checkPresence = async () => {
      try {
        const response = await fetch('/api/presence');
        if (response.ok) {
          const data: PresenceData = await response.json();
          setPresence(data);
          const lastHeartbeat = new Date(data.last_heartbeat_at);
          const now = new Date();
          const diffMs = now.getTime() - lastHeartbeat.getTime();
          setIsStale(diffMs > 5 * 60 * 1000); // 5 minutes stale
        } else {
          setIsStale(true);
        }
      } catch (error) {
        console.error('Heartbeat check failed:', error);
        setIsStale(true);
      }
    };

    checkPresence();
    const interval = setInterval(checkPresence, 60000); // every minute

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isStale) {
      // Create toast notification instead of alert
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-red-500 text-white p-4 rounded shadow-lg z-50';
      toast.innerHTML = `
        <div class="font-bold">Device Heartbeat Stale</div>
        <div class="text-sm">Last heartbeat: ${presence ? new Date(presence.last_heartbeat_at).toLocaleString() : 'Unknown'}</div>
        <div class="text-sm">Check device connection and refresh display.</div>
      `;
      document.body.appendChild(toast);

      // Auto-remove after 10 seconds
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 10000);

      // Also emit telemetry event
      console.log('Heartbeat stale alert:', {
        deviceId: presence?.device_id,
        lastHeartbeat: presence?.last_heartbeat_at,
        timestamp: new Date().toISOString(),
      });
    }
  }, [isStale, presence]);

  return { presence, isStale };
}
