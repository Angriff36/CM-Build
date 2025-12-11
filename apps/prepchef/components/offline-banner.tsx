import React from 'react';

interface OfflineBannerProps {
  mode: 'realtime' | 'offline';
  lastSync?: Date;
  telemetry?: {
    reconnectAttempts?: number;
    pollingInterval?: number;
  };
}

export function OfflineBanner({ mode, lastSync, telemetry }: OfflineBannerProps) {
  const isRealtime = mode === 'realtime';
  const bannerClass = isRealtime
    ? 'bg-amber-100 border-amber-300 text-amber-800'
    : 'bg-gray-100 border-gray-300 text-gray-800';
  const overlayClass = isRealtime
    ? ''
    : 'fixed inset-0 bg-gray-500 bg-opacity-50 z-50 flex items-center justify-center';

  const getMessage = () => {
    const syncInfo = lastSync
      ? ` Last sync: ${Math.floor((Date.now() - lastSync.getTime()) / 60000)} min ago.`
      : '';
    if (isRealtime) {
      return `Realtime connection lost. Switching to polling mode.${syncInfo}`;
    }
    return `Offline mode active. Please check connection.${syncInfo}`;
  };

  const bannerContent = (
    <div
      className={`border-l-4 p-4 ${bannerClass} ${isRealtime ? '' : 'rounded-lg shadow-lg max-w-md mx-auto'}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <span className="text-xl">{isRealtime ? '⚠️' : '🚫'}</span>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">{getMessage()}</p>
          {telemetry && (
            <p className="text-xs mt-1">
              {isRealtime &&
                telemetry.reconnectAttempts &&
                `Reconnect attempts: ${telemetry.reconnectAttempts}`}
              {isRealtime &&
                telemetry.pollingInterval &&
                ` • Polling: ${telemetry.pollingInterval}s`}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  if (isRealtime) {
    return <div className="fixed top-0 left-0 right-0 z-40">{bannerContent}</div>;
  }

  return <div className={overlayClass}>{bannerContent}</div>;
}
