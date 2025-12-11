import { useHeartbeat } from '../hooks/useHeartbeat';

export function DeviceStatus() {
  const { presence, isStale } = useHeartbeat();

  return (
    <div className="p-8 bg-gray-100 rounded-lg min-w-96">
      <h3 className="text-2xl font-bold mb-4">Device Presence</h3>
      {presence ? (
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="font-semibold">Device ID:</span>
            <span>{presence.device_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Status:</span>
            <span
              className={`px-2 py-1 rounded ${presence.status === 'online' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
            >
              {presence.status}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Last Heartbeat:</span>
            <span>{new Date(presence.last_heartbeat_at).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Heartbeat Age:</span>
            <span className={isStale ? 'text-red-500 font-bold' : 'text-green-500'}>
              {Math.floor(
                (Date.now() - new Date(presence.last_heartbeat_at).getTime()) / 1000 / 60,
              )}{' '}
              minutes
            </span>
          </div>
          {isStale && (
            <div className="mt-4 p-3 bg-red-100 border border-red-500 rounded">
              <p className="text-red-700 font-bold">⚠️ Device is STALE</p>
              <p className="text-red-600 text-sm">No heartbeat for over 5 minutes</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="animate-pulse">Loading presence data...</div>
        </div>
      )}
    </div>
  );
}
