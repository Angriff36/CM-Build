import React, { useState, useEffect } from 'react';
import { createClient } from '@codemachine/supabase';

interface TaskFiltersProps {
  onFilterChange: (filters: {
    event_id?: string;
    status?: string[];
    priority?: string[];
    search?: string;
  }) => void;
  initialFilters?: { event_id?: string; status?: string[]; priority?: string[]; search?: string };
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

const PRIORITY_OPTIONS = [
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'normal', label: 'Normal' },
  { value: 'low', label: 'Low' },
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

  const togglePriority = (priority: string) => {
    const current = filters.priority || [];
    const updated = current.includes(priority)
      ? current.filter((p) => p !== priority)
      : [...current, priority];
    handleFilterChange({ priority: updated });
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
          value={filters.event_id || ''}
          onChange={(e) => handleFilterChange({ event_id: e.target.value || undefined })}
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
            <button
              key={option.value}
              onClick={() => toggleStatus(option.value)}
              className={`h-12 px-4 min-w-[100px] rounded-md border transition-colors ${
                (filters.status || []).includes(option.value)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              aria-pressed={(filters.status || []).includes(option.value)}
              aria-describedby={`status-${option.value}-help`}
            >
              {option.label}
            </button>
          ))}
        </div>
        {STATUS_OPTIONS.map((option) => (
          <p key={option.value} id={`status-${option.value}-help`} className="sr-only">
            Toggle filter for {option.label.toLowerCase()} tasks
          </p>
        ))}
      </fieldset>

      <fieldset>
        <legend className="block text-sm font-medium mb-2">Filter by Priority</legend>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Priority filters">
          {PRIORITY_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => togglePriority(option.value)}
              className={`h-12 px-4 min-w-[100px] rounded-md border transition-colors ${
                (filters.priority || []).includes(option.value)
                  ? 'bg-orange-600 text-white border-orange-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              aria-pressed={(filters.priority || []).includes(option.value)}
              aria-describedby={`priority-${option.value}-help`}
            >
              {option.label}
            </button>
          ))}
        </div>
        {PRIORITY_OPTIONS.map((option) => (
          <p key={option.value} id={`priority-${option.value}-help`} className="sr-only">
            Toggle filter for {option.label.toLowerCase()} priority tasks
          </p>
        ))}
      </fieldset>
    </section>
  );
}
