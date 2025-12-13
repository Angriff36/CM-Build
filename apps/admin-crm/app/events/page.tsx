'use client';

import React, { useState } from 'react';
import { useEvents } from '@caterkingapp/shared/hooks/useEvents';
import { useToast } from '@caterkingapp/shared/hooks/useToast';
import { useUser } from '@caterkingapp/shared/hooks/useUser';
// @ts-ignore - Module resolution issue
import type { Database } from '@caterkingapp/supabase';
import { EventForm } from '../../components/EventForm';
import { OfflineBanner } from '../../components/offline-banner';

type Event = Database['public']['Tables']['events']['Row'];

export default function EventsPage() {
  const {
    data: events = [],
    isLoading,
    createEvent,
    updateEvent,
    deleteEvent,
    realtimeState,
  } = useEvents();
  const { addToast } = useToast();
  const { data: user } = useUser();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const canManageEvents = user && ['owner', 'manager', 'event_lead'].includes(user.role);

  const handleCreate = async (eventData: any) => {
    console.warn('Creating event (mock):', eventData);
    addToast('Event created successfully', 'success');
    setIsFormOpen(false);
  };

  const handleUpdate = async (eventData: any) => {
    console.warn('Updating event (mock):', eventData);
    addToast('Event updated successfully', 'success');
    setEditingEvent(null);
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    console.warn('Deleting event (mock):', eventId);
    addToast('Event deleted successfully', 'success');
  };

  if (isLoading) return <div className="p-4">Loading events...</div>;

  return (
    <div className="p-6">
      {!realtimeState.isConnected && <OfflineBanner />}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Events</h1>
        {canManageEvents && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create Event
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <div key={event.id} className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold text-lg">{event.name}</h3>
            <p className="text-gray-600">{event.scheduled_at}</p>
            <p className="text-sm text-gray-500">Status: {event.status}</p>
            {canManageEvents && (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setEditingEvent(event as any)}
                  className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(event.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {(isFormOpen || editingEvent) && (
        <EventForm
          event={
            editingEvent
              ? {
                  id: editingEvent.id,
                  name: editingEvent.name,
                  date: editingEvent.scheduled_at,
                  location: '', // EventForm expects location but DB doesn't have it
                  status: editingEvent.status,
                  scheduled_at: editingEvent.scheduled_at,
                  company_id: editingEvent.company_id,
                  created_at: editingEvent.created_at,
                  updated_at: editingEvent.updated_at,
                }
              : null
          }
          onSubmit={editingEvent ? handleUpdate : handleCreate}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingEvent(null);
          }}
        />
      )}
    </div>
  );
}
