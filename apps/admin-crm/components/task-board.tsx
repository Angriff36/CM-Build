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
import { createClient } from '@codemachine/supabase';
import type { Database } from '@codemachine/supabase';
import { OfflineBanner } from './offline-banner';

type Task = Database['public']['Tables']['tasks']['Row'];

type Staff = Database['public']['Tables']['users']['Row'] & {
  presence: 'online' | 'idle' | 'offline';
  shift_start?: string;
  shift_end?: string;
};

interface TaskBoardProps {
  eventId?: string;
}

export function TaskBoard({ eventId }: TaskBoardProps) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Get current user and company
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Fetch tasks and staff
        let tasksQuery = supabase.from('tasks').select(
          `
            *,
            assigned_user:users(id, display_name),
            event:events(id, name)
          `,
        );

        if (eventId) {
          tasksQuery = tasksQuery.eq('event_id', eventId);
        }

        const [tasksResult, staffResult] = await Promise.all([
          tasksQuery
            .order('priority', { ascending: false })
            .order('created_at', { ascending: false }),

          supabase.from('users').select('id, display_name, status').eq('status', 'active'),
        ]);

        if (tasksResult.error) throw tasksResult.error;
        if (staffResult.error) throw staffResult.error;

        setTasks(tasksResult.data || []);
        setStaff(staffResult.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const newAssigneeId = over.id as string;

    // Only assign if dropping on a staff member or unassigned column
    const staffMember = staff.find((s: any) => s.id === newAssigneeId);
    if (staffMember || newAssigneeId === 'unassigned') {
      const assigneeId = newAssigneeId === 'unassigned' ? null : newAssigneeId;

      try {
        const { error } = await supabase
          .from('tasks')
          .update({ assigned_user_id: assigneeId })
          .eq('id', taskId);

        if (error) throw error;

        // Refetch data
        let refetchQuery = supabase.from('tasks').select(
          `
            *,
            assigned_user:users(id, display_name),
            event:events(id, name)
          `,
        );

        if (eventId) {
          refetchQuery = refetchQuery.eq('event_id', eventId);
        }

        const { data: updatedTasks } = await refetchQuery
          .order('priority', { ascending: false })
          .order('created_at', { ascending: false });

        if (updatedTasks) setTasks(updatedTasks);
      } catch (error) {
        console.error('Error assigning task:', error);
      }
    }
  };

  // Group tasks by staff member and include unassigned
  const groupedTasks = staff.reduce(
    (acc: Record<string, any[]>, staffMember: any) => {
      acc[staffMember.id] = tasks.filter((task: any) => task.assigned_user_id === staffMember.id);
      return acc;
    },
    {} as Record<string, any[]>,
  );

  // Add unassigned tasks
  const unassignedTasks = tasks.filter((task: any) => !task.assigned_user_id);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="flex h-full">
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
                  items={unassignedTasks.map((t: any) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {unassignedTasks.length > 0 ? (
                    <List
                      height={400}
                      width="100%"
                      itemCount={unassignedTasks.length}
                      itemSize={80}
                      itemData={unassignedTasks}
                    >
                      {({ index, style, data }) => {
                        const task = data[index];
                        return (
                          <div style={style}>
                            <SortableItem id={task.id}>
                              <TaskCard task={task as any} />
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

            {staff.map((staffMember: any) => (
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
                        width="100%"
                        itemCount={groupedTasks[staffMember.id].length}
                        itemSize={80}
                        itemData={groupedTasks[staffMember.id]}
                      >
                        {({ index, style, data }) => {
                          const task = data[index];
                          return (
                            <div style={style}>
                              <SortableItem id={task.id}>
                                <TaskCard task={task as any} />
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
        {staff.map((staffMember: any) => (
          <div
            key={staffMember.id}
            className="flex items-center justify-between mb-3 p-2 bg-white rounded"
          >
            <div className="flex items-center">
              <div
                className={`w-3 h-3 rounded-full mr-2 ${
                  (staffMember as any).presence === 'online'
                    ? 'bg-green-500'
                    : (staffMember as any).presence === 'idle'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                }`}
                title={`Presence: ${(staffMember as any).presence}`}
              />
              <span className="text-sm font-medium">{(staffMember as any).display_name}</span>
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

function TaskCard({ task }: { task: any }) {
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
