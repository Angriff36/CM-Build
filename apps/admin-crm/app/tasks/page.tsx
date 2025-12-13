'use client';

import { useState } from 'react';
import { TaskBoard } from '../../components/task-board';
import { useEvents } from '@caterkingapp/shared/hooks/useEvents';

export default function TasksPage() {
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const { data: events = [] } = useEvents();

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Task Board</h1>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <span className="text-sm font-medium">Event:</span>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All Events</option>
                {events?.map((event: any) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <TaskBoard eventId={selectedEventId || undefined} />
      </main>
    </div>
  );
}
