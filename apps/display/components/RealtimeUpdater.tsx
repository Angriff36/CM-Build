'use client';

interface RealtimeUpdaterProps {
  onDataUpdate: (data: any) => void;
}

export function RealtimeUpdater({ onDataUpdate }: RealtimeUpdaterProps) {
  // Disabled for now to prevent infinite loops
  return null;
}
