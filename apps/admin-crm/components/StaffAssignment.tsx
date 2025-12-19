'use client';

import React from 'react';
import { useTasks } from '@codemachine/shared/hooks/useTasks';
import { useAssignments } from '@codemachine/shared/hooks/useAssignments';
import { useToast } from '@codemachine/shared/hooks/useToast';
import { useStaff } from '@codemachine/shared/hooks/useStaff';
import type { Database } from '@codemachine/supabase';
import { OfflineBanner } from './offline-banner';
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
import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type Staff = Database['public']['Tables']['users']['Row'] & {
  presence: 'online' | 'idle' | 'offline';
};

type Task = Database['public']['Tables']['tasks']['Row'];

function TaskCard({ task }: { task: Task }) {
  return (
    <div className="bg-gray-100 p-2 rounded mb-2 border border-gray-200 cursor-move hover:shadow-md transition-shadow">
      <h4 className="font-medium text-sm">{task.name}</h4>
      {task.status && <p className="text-xs text-gray-600">Status: {task.status}</p>}
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

export function StaffAssignment() {
  const {
    data: staff = [],
    isLoading: staffLoading,
    realtimeState: staffRealtimeState,
  } = useStaff();
  const {
    data: tasks = [],
    isLoading: tasksLoading,
    realtimeState: tasksRealtimeState,
  } = useTasks();
  const { assignTask } = useAssignments();
  const { addToast } = useToast();

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

  if (staffLoading || tasksLoading) return <div className="p-4">Loading...</div>;

  const unassignedTasks = tasks.filter((task) => !task.assigned_user_id);

  return (
    <div className="mb-8">
      {(!staffRealtimeState.isConnected || !tasksRealtimeState.isConnected) && <OfflineBanner />}
      <h2 className="text-xl font-semibold mb-4">Task Assignment</h2>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Unassigned Tasks */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Unassigned Tasks</h3>
            <Droppable id="unassigned">
              <SortableContext
                items={unassignedTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {unassignedTasks.length > 0 ? (
                  unassignedTasks.map((task) => (
                    <SortableItem key={task.id} id={task.id}>
                      <TaskCard task={task as any} />
                    </SortableItem>
                  ))
                ) : (
                  <div className="text-gray-400 text-sm">No unassigned tasks</div>
                )}
              </SortableContext>
            </Droppable>
          </div>

          {/* Staff Members as Drop Zones */}
          {staff.map((staffMember) => (
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
                  {tasks.filter((task) => task.assigned_user_id === staffMember.id).length > 0 ? (
                    <SortableContext
                      items={tasks
                        .filter((task) => task.assigned_user_id === staffMember.id)
                        .map((t) => t.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {tasks
                        .filter((task) => task.assigned_user_id === staffMember.id)
                        .map((task) => (
                          <SortableItem key={task.id} id={task.id}>
                            <TaskCard task={task as any} />
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
  );
}
