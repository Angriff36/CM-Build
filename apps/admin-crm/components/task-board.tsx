import React, { useState, useEffect } from 'react';
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
import { FixedSizeList as List } from 'react-window';
import { useDroppable } from '@dnd-kit/core';
import { useAssignments } from '@caterkingapp/shared/hooks/useAssignments';
import { useTasks } from '@caterkingapp/shared/hooks/useTasks';
import { useStaff } from '@caterkingapp/shared/hooks/useStaff';
import { useEffect } from 'react';
import { createClient } from '@caterkingapp/supabase';
import { useRealtimeSync } from '@caterkingapp/shared/hooks/useRealtimeSync';
import { OfflineBanner } from './offline-banner';

interface Task {
  id: string;
  name: string;
  status: string;
  station?: string;
  assigned_user_id?: string;
  priority?: string;
  quantity?: number;
  unit?: string;
}

interface Staff {
  id: string;
  display_name: string;
  role: string;
  status: string;
  presence: 'online' | 'idle' | 'offline';
  shift_start?: string;
  shift_end?: string;
}

interface TaskBoardProps {
  eventId?: string;
}

export function TaskBoard({ eventId }: TaskBoardProps) {
  const { tasks, isLoading, refetch } = useTasks({ eventId });
  const { staff } = useStaff();
  const { assignTask } = useAssignments();
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    const getCompanyId = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCompanyId(user?.user_metadata?.company_id || null);
    };
    getCompanyId();
  }, []);

  // Real-time subscription
  const realtimeState = useRealtimeSync({
    channelConfig: {
      name: companyId ? `company:${companyId}:tasks` : 'task_changes',
      postgresChanges: [
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
        },
      ],
    },
    queryKeysToInvalidate: [],
    onPostgresChange: () => refetch(),
    enablePollingOnDisconnect: true,
  });

  const OfflineBanner = () => (
    <div
      className="bg-amber-100 border-l-4 border-amber-300 text-amber-800 p-4 fixed top-0 left-0 right-0 z-40"
      role="alert"
    >
      <p>Realtime connection lost. Switching to polling mode.</p>
    </div>
  );

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

    // Only assign if dropping on a staff member or unassigned column
    const staffMember = staff.find((s) => s.id === newAssigneeId);
    if (staffMember || newAssigneeId === 'unassigned') {
      const assigneeId = newAssigneeId === 'unassigned' ? null : newAssigneeId;
      assignTask({ task_id: taskId, user_id: assigneeId });
    }
  };

  // Group tasks by staff member and include unassigned
  const groupedTasks = staff.reduce(
    (acc: Record<string, Task[]>, staffMember: Staff) => {
      acc[staffMember.id] = tasks.filter((task: Task) => task.assigned_user_id === staffMember.id);
      return acc;
    },
    {} as Record<string, Task[]>,
  );

  // Add unassigned tasks
  const unassignedTasks = tasks.filter((task: Task) => !task.assigned_user_id);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="flex h-full">
      {!realtimeState.isConnected && <OfflineBanner />}
      {/* Task Board */}
      <div className="flex-1 p-4">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {/* Unassigned column */}
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Unassigned</h3>
                <div className="w-3 h-3 rounded-full bg-gray-400" />
              </div>
              <Droppable id="unassigned">
                <SortableContext
                  items={unassignedTasks.map((t: Task) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {unassignedTasks.length > 0 ? (
                    <List
                      height={400}
                      itemCount={unassignedTasks.length}
                      itemSize={80}
                      itemData={unassignedTasks}
                    >
                      {({ index, style, data }) => {
                        const task = data[index];
                        return (
                          <div style={style}>
                            <SortableItem id={task.id}>
                              <TaskCard task={task} />
                            </SortableItem>
                          </div>
                        );
                      }}
                    </List>
                  ) : (
                    <div className="h-96 flex items-center justify-center text-gray-400">
                      No unassigned tasks
                    </div>
                  )}
                </SortableContext>
              </Droppable>
            </div>

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
                  <SortableContext
                    items={groupedTasks[staffMember.id].map((t: Task) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {groupedTasks[staffMember.id].length > 0 ? (
                      <List
                        height={400}
                        itemCount={groupedTasks[staffMember.id].length}
                        itemSize={80}
                        itemData={groupedTasks[staffMember.id]}
                      >
                        {({ index, style, data }) => {
                          const task = data[index];
                          return (
                            <div style={style}>
                              <SortableItem id={task.id}>
                                <TaskCard task={task} />
                              </SortableItem>
                            </div>
                          );
                        }}
                      </List>
                    ) : (
                      <div className="h-96 flex items-center justify-center text-gray-400">
                        No tasks assigned
                      </div>
                    )}
                  </SortableContext>
                </Droppable>
              </div>
            ))}
          </div>
        </DndContext>
      </div>

      {/* Staffing Sidebar */}
      <div className="w-64 bg-gray-50 p-4">
        <h3 className="font-semibold mb-4">Staff Presence</h3>
        {staff.map((staffMember: Staff) => (
          <div
            key={staffMember.id}
            className="flex items-center justify-between mb-3 p-2 bg-white rounded"
          >
            <div className="flex items-center">
              <div
                className={`w-3 h-3 rounded-full mr-2 ${
                  staffMember.presence === 'online'
                    ? 'bg-green-500'
                    : staffMember.presence === 'idle'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                }`}
              />
              <span className="text-sm font-medium">{staffMember.display_name}</span>
            </div>
            <div className="text-xs text-gray-500">
              {staffMember.shift_start} - {staffMember.shift_end}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TaskCard({ task }: { task: Task }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100';
      case 'claimed':
        return 'bg-blue-100';
      case 'completed':
        return 'bg-green-100';
      case 'verified':
        return 'bg-purple-100';
      default:
        return 'bg-gray-100';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'normal':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div
      className={`${getStatusColor(task.status)} p-3 rounded mb-2 border border-gray-200 cursor-move hover:shadow-md transition-shadow`}
      role="button"
      tabIndex={0}
      aria-label={`Task: ${task.name}, Status: ${task.status}, Priority: ${task.priority || 'normal'}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-sm mb-1">{task.name}</h4>
          {task.station && <p className="text-xs text-gray-600 mb-1">Station: {task.station}</p>}
          {(task.quantity || task.unit) && (
            <p className="text-xs text-gray-600">
              {task.quantity} {task.unit}
            </p>
          )}
        </div>
        {task.priority && (
          <div
            className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}
            title={`Priority: ${task.priority}`}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}

function Droppable({ id, children }: { id: string; children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className={`min-h-96 transition-colors ${isOver ? 'bg-blue-50' : ''}`}>
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
