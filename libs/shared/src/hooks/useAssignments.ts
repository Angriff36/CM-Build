import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AssignTaskRequest } from '../dto/tasks';
import type { TaskDTO } from '../types';
import { createClient } from '@caterkingapp/supabase/client';

export function useAssignments() {
  const queryClient = useQueryClient();

  const assignMutation = useMutation({
    mutationFn: async (variables: AssignTaskRequest) => {
      const supabase = createClient();

      // Update the task assignment
      const { error } = await supabase
        .from('tasks')
        .update({ assigned_user_id: variables.user_id })
        .eq('id', variables.task_id);

      if (error) throw error;

      // Log the assignment for audit purposes
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('company_id')
          .eq('id', user.id)
          .single();

        if (userData?.company_id) {
          await supabase.from('audit_logs').insert({
            company_id: userData.company_id,
            actor_id: user.id,
            entity_type: 'task',
            entity_id: variables.task_id,
            action: 'UPDATE',
            diff: {
              assigned_user_id: variables.user_id,
              action: 'assignment',
            },
          });
        }
      }

      return { success: true };
    },
    onMutate: async (variables: AssignTaskRequest) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasks = queryClient.getQueryData(['tasks']);

      queryClient.setQueryData(['tasks'], (old: unknown) => {
        if (!old) return old;
        return (old as TaskDTO[]).map((task: TaskDTO) =>
          task.id === variables.task_id
            ? { ...task, assigned_user_id: variables.user_id || null }
            : task,
        );
      });

      return { previousTasks };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  return {
    assignTask: assignMutation.mutate,
    isAssigning: assignMutation.isPending,
    assignError: assignMutation.error,
  };
}
