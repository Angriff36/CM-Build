'use client';

import React, { useState } from 'react';
import { useEvents } from '@caterkingapp/shared/hooks/useEvents';
import { useToast } from '@caterkingapp/shared/hooks/useToast';
import { EventForm } from '../../components/EventForm';

interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  status: string;
  // Add other fields as needed
}

export default function EventsPage() {
  const { events, isLoading, createEvent, updateEvent, deleteEvent } = useEvents();
  const { addToast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // Placeholder for role checking - replace with actual user role hook
  const userRole = 'owner'; // Mock role
  const canManageEvents = ['owner', 'manager'].includes(userRole);

  const handleCreate = async (eventData: Omit<Event, 'id'>) => {
    try {
      await createEvent(eventData);
      addToast('Event created successfully', 'success');
      setIsFormOpen(false);
    } catch (error) {
      addToast('Failed to create event', 'error');
    }
  };

  const handleUpdate = async (eventData: Event) => {
    try {
      await updateEvent(eventData);
      addToast('Event updated successfully', 'success');
      setEditingEvent(null);
    } catch (error) {
      addToast('Failed to update event', 'error');
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await deleteEvent(eventId);
      addToast('Event deleted successfully', 'success');
    } catch (error) {
      addToast('Failed to delete event', 'error');
    }
  };

  if (isLoading) return <div className="p-4">Loading events...</div>;

  return (
    <div className="p-6">
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
        {events.map((event: Event) => (
          <div key={event.id} className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold text-lg">{event.name}</h3>
            <p className="text-gray-600">{event.date}</p>
            <p className="text-gray-600">{event.location}</p>
            <p className="text-sm text-gray-500">Status: {event.status}</p>
            {canManageEvents && (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setEditingEvent(event)}
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
          event={editingEvent}
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
