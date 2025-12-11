import React, { useState, useEffect } from 'react';
import { createClient } from '@caterkingapp/supabase/client';
import { Button } from '@caterkingapp/ui';

interface TaskFiltersProps {
  onFilterChange: (filters: { eventId?: string; status?: string[]; search?: string }) => void;
  initialFilters?: { eventId?: string; status?: string[]; search?: string };
}

interface Event {
  id: string;
  name: string;
}

const STATUS_OPTIONS = [
  { value: 'available', label: 'Available' },
  { value: 'claimed', label: 'Claimed' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

export function TaskFilters({ onFilterChange, initialFilters = {} }: TaskFiltersProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    const fetchEvents = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from('events').select('id, name');
      if (!error && data) {
        setEvents(data);
      }
    };
    fetchEvents();
  }, []);

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFilterChange(updated);
  };

  const toggleStatus = (status: string) => {
    const current = filters.status || [];
    const updated = current.includes(status)
      ? current.filter((s) => s !== status)
      : [...current, status];
    handleFilterChange({ status: updated });
  };

  return (
    <section className="mb-6 space-y-4" aria-label="Task filters">
      <div>
        <label htmlFor="search" className="block text-sm font-medium mb-1">
          Search Tasks
        </label>
        <input
          id="search"
          type="text"
          value={filters.search || ''}
          onChange={(e) => handleFilterChange({ search: e.target.value })}
          placeholder="Search by task name..."
          className="w-full px-3 py-2 h-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-describedby="search-help"
        />
        <p id="search-help" className="sr-only">
          Enter text to search task names
        </p>
      </div>

      <div>
        <label htmlFor="event" className="block text-sm font-medium mb-1">
          Filter by Event
        </label>
        <select
          id="event"
          value={filters.eventId || ''}
          onChange={(e) => handleFilterChange({ eventId: e.target.value || undefined })}
          className="w-full px-3 py-2 h-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-describedby="event-help"
        >
          <option value="">All Events</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.name}
            </option>
          ))}
        </select>
        <p id="event-help" className="sr-only">
          Select an event to filter tasks
        </p>
      </div>

      <fieldset>
        <legend className="block text-sm font-medium mb-2">Filter by Status</legend>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Status filters">
          {STATUS_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant={(filters.status || []).includes(option.value) ? 'primary' : 'outline'}
              onClick={() => toggleStatus(option.value)}
              className="h-12 px-4 min-w-[100px]"
              aria-pressed={(filters.status || []).includes(option.value)}
              aria-describedby={`status-${option.value}-help`}
            >
              {option.label}
            </Button>
          ))}
        </div>
        {STATUS_OPTIONS.map((option) => (
          <p key={option.value} id={`status-${option.value}-help`} className="sr-only">
            Toggle filter for {option.label.toLowerCase()} tasks
          </p>
        ))}
      </fieldset>
    </section>
  );
}
