'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@codemachine/supabase';
import type { Database } from '@codemachine/supabase';
import { EventForm } from '../../components/EventForm';
import type { Event } from '@codemachine/shared/dto/events';

type DbEvent = Database['public']['Tables']['events']['Row'];

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Get current user
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        if (!authUser) throw new Error('Not authenticated');

        // Get user profile
        const { data: userProfile } = await supabase
          .from('users')
          .select('role, company_id')
          .eq('id', authUser.id)
          .single();

        setUser({ ...authUser, role: userProfile?.role, company_id: userProfile?.company_id });

        // Fetch events
        const { data: eventsData, error } = await supabase
          .from('events')
          .select('*')
          .order('scheduled_at', { ascending: true });

        if (error) throw error;

        // Convert DbEvent to Event type
        const convertedEvents: Event[] = (eventsData || []).map((dbEvent: DbEvent) => ({
          id: dbEvent.id,
          name: dbEvent.name,
          date: dbEvent.scheduled_at || '',
          location: dbEvent.location || undefined,
          status: dbEvent.status as any, // Type assertion needed due to enum mismatch
          scheduled_at: dbEvent.scheduled_at || undefined,
          company_id: dbEvent.company_id || undefined,
          created_at: dbEvent.created_at || undefined,
          updated_at: dbEvent.updated_at || undefined,
        }));

        setEvents(convertedEvents);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const canManageEvents = user && ['owner', 'manager', 'event_lead'].includes(user.role);

  const handleCreate = async (eventData: Event) => {
    try {
      if (!user?.company_id) {
        throw new Error('Company ID is required');
      }

      const { error } = await supabase.from('events').insert({
        name: eventData.name,
        scheduled_at: eventData.date || new Date().toISOString(),
        location: eventData.location,
        status: (eventData.status as any) || 'scheduled',
        company_id: user.company_id,
      });

      if (error) throw error;

      // Refresh events
      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .order('scheduled_at', { ascending: true });

      if (eventsData) {
        const convertedEvents: Event[] = eventsData.map((dbEvent: DbEvent) => ({
          id: dbEvent.id,
          name: dbEvent.name,
          date: dbEvent.scheduled_at || '',
          location: dbEvent.location || undefined,
          status: dbEvent.status as any,
          scheduled_at: dbEvent.scheduled_at || undefined,
          company_id: dbEvent.company_id || undefined,
          created_at: dbEvent.created_at || undefined,
          updated_at: dbEvent.updated_at || undefined,
        }));
        setEvents(convertedEvents);
      }
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const handleUpdate = async (eventData: any) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({
          name: eventData.name,
          scheduled_at: eventData.date,
          location: eventData.location,
          status: eventData.status,
        })
        .eq('id', eventData.id);

      if (error) throw error;

      // Refetch events
      const { data } = await supabase
        .from('events')
        .select('*')
        .order('scheduled_at', { ascending: true });

      if (data) setEvents(data);
      setEditingEvent(null);
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const { error } = await supabase.from('events').delete().eq('id', eventId);

      if (error) throw error;

      // Refetch events
      const { data } = await supabase
        .from('events')
        .select('*')
        .order('scheduled_at', { ascending: true });

      if (data) setEvents(data);
    } catch (error) {
      console.error('Error deleting event:', error);
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
