import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assignTask } from '@caterkingapp/supabase/rpc/tasks';
import type { AssignTaskRequest } from '../dto/tasks';
import { createClient } from '@caterkingapp/supabase/client';

export function useAssignments() {
  const queryClient = useQueryClient();

  const assignMutation = useMutation({
    mutationFn: async (variables: AssignTaskRequest) => {
      // Call the assignment RPC
      const result = await assignTask(variables);

      // Log the assignment for audit purposes
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase.from('audit_logs').insert({
          company_id: (await supabase.from('users').select('company_id').eq('id', user.id).single())
            .data?.company_id,
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

      return result;
    },
    onMutate: async (variables: AssignTaskRequest) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasks = queryClient.getQueryData(['tasks']);

      queryClient.setQueryData(['tasks'], (old: any) => {
        if (!old) return old;
        return old.map((task: any) =>
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
