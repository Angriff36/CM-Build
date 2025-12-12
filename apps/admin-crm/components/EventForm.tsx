'use client';

import React, { useState } from 'react';
import { z } from 'zod';

// Assuming Event schema exists, create a simple one for now
const EventSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  date: z.string().min(1, 'Date is required'),
  location: z.string().min(1, 'Location is required'),
  status: z.string().optional(),
});

type EventFormData = z.infer<typeof EventSchema>;

interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  status?: string;
}

interface EventFormProps {
  event?: Event | null;
  onSubmit: (data: Event) => void;
  onCancel: () => void;
}

export function EventForm({ event, onSubmit, onCancel }: EventFormProps) {
  const [formData, setFormData] = useState<EventFormData>({
    name: event?.name || '',
    date: event?.date || '',
    location: event?.location || '',
    status: event?.status || 'planned',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shakeFields, setShakeFields] = useState<Set<string>>(new Set());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validatedData = EventSchema.parse(formData);
      const submitData = event ? { ...event, ...validatedData } : { ...validatedData, id: '' };
      onSubmit(submitData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMap: Record<string, string> = {};
        const shakeSet = new Set<string>();
        error.issues.forEach((err) => {
          if (err.path[0]) {
            errorMap[err.path[0] as string] = err.message;
            shakeSet.add(err.path[0] as string);
          }
        });
        setErrors(errorMap);
        setShakeFields(shakeSet);
        setTimeout(() => setShakeFields(new Set()), 300);
      }
    }
  };

  const handleChange = (field: keyof EventFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{event ? 'Edit Event' : 'Create Event'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="event-name" className="block text-sm font-medium mb-1">
              Name
            </label>
            <input
              id="event-name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`w-full p-2 border rounded transition-transform ${shakeFields.has('name') ? 'animate-shake' : ''}`}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="event-date" className="block text-sm font-medium mb-1">
              Date
            </label>
            <input
              id="event-date"
              type="datetime-local"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className={`w-full p-2 border rounded transition-transform ${shakeFields.has('date') ? 'animate-shake' : ''}`}
            />
            {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
          </div>
          <div>
            <label htmlFor="event-location" className="block text-sm font-medium mb-1">
              Location
            </label>
            <input
              id="event-location"
              type="text"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              className={`w-full p-2 border rounded transition-transform ${shakeFields.has('location') ? 'animate-shake' : ''}`}
            />
            {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
          </div>
          <div>
            <label htmlFor="event-status" className="block text-sm font-medium mb-1">
              Status
            </label>
            <select
              id="event-status"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="planned">Planned</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {event ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
