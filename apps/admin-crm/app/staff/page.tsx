'use client';

import React, { useState } from 'react';
import { useStaff } from '@caterkingapp/shared/hooks/useStaff';
import { useToast } from '@caterkingapp/shared/hooks/useToast';
import { useTasks } from '@caterkingapp/shared/hooks/useTasks';
import { useAssignments } from '@caterkingapp/shared/hooks/useAssignments';
import { useUser } from '@caterkingapp/shared/hooks/useUser';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';

interface Staff {
  id: string;
  display_name: string;
  role: string;
  status: string;
  presence: 'online' | 'idle' | 'offline';
  shift_start?: string;
  shift_end?: string;
}

interface StaffFormData {
  display_name: string;
  role: string;
  shift_start: string;
  shift_end: string;
}

function TaskCard({ task }: { task: any }) {
  return (
    <div className="bg-gray-100 p-2 rounded mb-2 border border-gray-200 cursor-move hover:shadow-md transition-shadow">
      <h4 className="font-medium text-sm">{task.name}</h4>
      {task.station && <p className="text-xs text-gray-600">Station: {task.station}</p>}
    </div>
  );
}

function Droppable({ id, children }: { id: string; children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className={`transition-colors ${isOver ? 'bg-blue-50' : ''}`}>
      {children}
    </div>
  );
}

function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

export default function StaffPage() {
  const { staff, isLoading, createStaff, updateStaff, deleteStaff } = useStaff();
  const { addToast } = useToast();
  const { data: tasks } = useTasks();
  const { assignTask } = useAssignments();
  const { data: user } = useUser();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState<StaffFormData>({
    display_name: '',
    role: 'staff',
    shift_start: '',
    shift_end: '',
  });

  const canManageStaff = user && ['owner', 'manager'].includes(user.role);

  const handleCreate = async () => {
    try {
      await createStaff(formData);
      addToast('Staff member added successfully', 'success');
      setIsFormOpen(false);
      resetForm();
    } catch (error) {
      addToast('Failed to add staff member', 'error');
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const newAssigneeId = over.id as string;

    const userId = newAssigneeId === 'unassigned' ? null : newAssigneeId;
    assignTask({ task_id: taskId, user_id: userId });
    addToast('Task assignment updated successfully', 'success');
  };

  const handleUpdate = async () => {
    if (!editingStaff) return;
    try {
      await updateStaff({ ...editingStaff, ...formData });
      addToast('Staff member updated successfully', 'success');
      setEditingStaff(null);
      resetForm();
    } catch (error) {
      addToast('Failed to update staff member', 'error');
    }
  };

  const handleDelete = async (staffId: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    try {
      await deleteStaff(staffId);
      addToast('Staff member deleted successfully', 'success');
    } catch (error) {
      addToast('Failed to delete staff member', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      display_name: '',
      role: 'staff',
      shift_start: '',
      shift_end: '',
    });
  };

  const openEditForm = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    setFormData({
      display_name: staffMember.display_name,
      role: staffMember.role,
      shift_start: staffMember.shift_start || '',
      shift_end: staffMember.shift_end || '',
    });
  };

  if (isLoading) return <div className="p-4">Loading staff...</div>;

  const unassignedTasks = tasks.filter((task: any) => !task.assigned_user_id);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Staff Management</h1>
        {canManageStaff && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Staff Member
          </button>
        )}
      </div>

      {/* Task Assignment Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Task Assignment</h2>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Unassigned Tasks */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold mb-2">Unassigned Tasks</h3>
              <Droppable id="unassigned">
                <SortableContext
                  items={unassignedTasks.map((t: any) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {unassignedTasks.length > 0 ? (
                    unassignedTasks.map((task: any) => (
                      <SortableItem key={task.id} id={task.id}>
                        <TaskCard task={task} />
                      </SortableItem>
                    ))
                  ) : (
                    <div className="text-gray-400 text-sm">No unassigned tasks</div>
                  )}
                </SortableContext>
              </Droppable>
            </div>

            {/* Staff Members as Drop Zones */}
            {staff.map((staffMember: Staff) => (
              <div key={staffMember.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{staffMember.display_name}</h3>
                  <div
                    className={`w-3 h-3 rounded-full ${
                      staffMember.presence === 'online'
                        ? 'bg-green-500'
                        : staffMember.presence === 'idle'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                    title={`Presence: ${staffMember.presence}`}
                  />
                </div>
                <Droppable id={staffMember.id}>
                  <div className="min-h-32">
                    {tasks.filter((task: any) => task.assigned_user_id === staffMember.id).length >
                    0 ? (
                      <SortableContext
                        items={tasks
                          .filter((task: any) => task.assigned_user_id === staffMember.id)
                          .map((t: any) => t.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {tasks
                          .filter((task: any) => task.assigned_user_id === staffMember.id)
                          .map((task: any) => (
                            <SortableItem key={task.id} id={task.id}>
                              <TaskCard task={task} />
                            </SortableItem>
                          ))}
                      </SortableContext>
                    ) : (
                      <div className="text-gray-400 text-sm">No tasks assigned</div>
                    )}
                  </div>
                </Droppable>
              </div>
            ))}
          </div>
        </DndContext>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {staff.map((staffMember: Staff) => (
          <div key={staffMember.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg">{staffMember.display_name}</h3>
              <div
                className={`w-3 h-3 rounded-full ${
                  staffMember.presence === 'online'
                    ? 'bg-green-500'
                    : staffMember.presence === 'idle'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                }`}
                title={`Presence: ${staffMember.presence}`}
              />
            </div>
            <p className="text-gray-600">Role: {staffMember.role}</p>
            <p className="text-gray-600">Status: {staffMember.status}</p>
            {staffMember.shift_start && staffMember.shift_end && (
              <p className="text-sm text-gray-500">
                Shift: {staffMember.shift_start} - {staffMember.shift_end}
              </p>
            )}
            {canManageStaff && (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => openEditForm(staffMember)}
                  className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(staffMember.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {(isFormOpen || editingStaff) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={formData.display_name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, display_name: e.target.value }))
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                  className="w-full p-2 border rounded"
                >
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                  <option value="event_lead">Event Lead</option>
                  <option value="owner">Owner</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Shift Start</label>
                <input
                  type="time"
                  value={formData.shift_start}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, shift_start: e.target.value }))
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Shift End</label>
                <input
                  type="time"
                  value={formData.shift_end}
                  onChange={(e) => setFormData((prev) => ({ ...prev, shift_end: e.target.value }))}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={editingStaff ? handleUpdate : handleCreate}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingStaff ? 'Update' : 'Add'}
                </button>
                <button
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingStaff(null);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
