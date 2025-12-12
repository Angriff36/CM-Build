'use client';

import { useEffect, useState } from 'react';
import { Providers } from './providers';
import { OfflineBanner } from '../components/offline-banner';
import { useRealtimeSync } from '@caterkingapp/shared/hooks/useRealtimeSync';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isKiosk, setIsKiosk] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [gestureBuffer, setGestureBuffer] = useState('');

  // Global realtime state for display
  const realtimeState = useRealtimeSync({
    channelConfig: {
      name: 'display-global',
      postgresChanges: [
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
        },
      ],
    },
    queryKeysToInvalidate: [],
  });

  useEffect(() => {
    // Kiosk detection: fullscreen and no mouse pointer
    const checkKiosk = () => {
      const isFullscreen =
        window.innerHeight === screen.height && window.innerWidth === screen.width;
      const isKioskBrowser =
        navigator.userAgent.includes('Kiosk') ||
        (navigator.userAgent.includes('Chrome') && window.innerHeight === screen.height);
      setIsKiosk(isFullscreen || isKioskBrowser);
    };

    // Handle orientation change
    const handleOrientationChange = () => {
      checkKiosk();
      // Emit telemetry for orientation change
      console.log('Orientation change:', {
        orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
        timestamp: new Date().toISOString(),
      });
    };

    checkKiosk();
    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    // Request fullscreen on load if kiosk
    if (isKiosk) {
      document.documentElement.requestFullscreen().catch(console.error);
    }

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [isKiosk]);

  useEffect(() => {
    if (!isKiosk) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === 'A') {
        setGestureBuffer('A');
      } else if (gestureBuffer === 'A' && e.key === 'D') {
        setGestureBuffer('AD');
      } else if (gestureBuffer === 'AD' && e.key === 'M') {
        setGestureBuffer('ADM');
      } else if (gestureBuffer === 'ADM' && e.key === 'I') {
        setGestureBuffer('ADMI');
      } else if (gestureBuffer === 'ADMI' && e.key === 'N') {
        setShowSettings(true);
        setGestureBuffer('');
      } else {
        setGestureBuffer('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isKiosk, gestureBuffer]);

  return (
    <html lang="en">
      <body className={isKiosk ? 'cursor-none' : ''}>
        <Providers>
          {!realtimeState.isConnected && <OfflineBanner />}
          {children}
          {isKiosk && (
            <div className="fixed bottom-2 right-2 text-xs text-gray-500 bg-black bg-opacity-50 p-1 rounded">
              Hold Shift + type ADMIN for settings
            </div>
          )}
          {showSettings && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded max-w-md">
                <h2 className="text-xl font-bold mb-4">Admin Settings</h2>
                <div className="space-y-2">
                  <p>Device Status: Online</p>
                  <p>Last Heartbeat: {new Date().toLocaleString()}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                  >
                    Refresh Display
                  </button>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </Providers>
      </body>
    </html>
  );
}
