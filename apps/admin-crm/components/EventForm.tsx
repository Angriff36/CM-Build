'use client';

import React, { useState } from 'react';
import { z } from 'zod';
import { EventSchema, CreateEventRequestSchema, Event } from '@caterkingapp/shared/dto/events';

type EventFormData = z.infer<typeof CreateEventRequestSchema>;

// Event type imported from DTO

interface EventFormProps {
  event?: Event | null;
  onSubmit: (data: Event) => void;
  onCancel: () => void;
}

export function EventForm({ event, onSubmit, onCancel }: EventFormProps) {
  const [formData, setFormData] = useState<EventFormData>({
    name: event?.name || '',
    date: event?.scheduled_at || event?.date || '',
    status: (event?.status as any) || 'draft',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shakeFields, setShakeFields] = useState<Set<string>>(new Set());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validatedData = CreateEventRequestSchema.parse(formData);
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
            <label htmlFor="event-status" className="block text-sm font-medium mb-1">
              Status
            </label>
            <select
              id="event-status"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
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
