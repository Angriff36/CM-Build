import React, { useState } from 'react';
import { Button } from '@codemachine/ui';
import { RecipeViewer } from './RecipeViewer';

interface Task {
  id: string;
  name: string;
  quantity: number;
  unit: string | null;
  status: string;
  priority: string;
  assigned_user_id: string | null;
  event_id: string | null;
  recipe_id: string | null;
}

interface TaskRowProps {
  task: Task;
  userId: string;
  onClaim: (taskId: string) => void;
  onComplete: (taskId: string) => void;
  isLoading?: boolean;
}

export function TaskRow({ task, userId, onClaim, onComplete, isLoading }: TaskRowProps) {
  const [isRecipeOpen, setIsRecipeOpen] = useState(false);
  const canClaim = task.status === 'available';
  const canComplete = task.status === 'claimed' && task.assigned_user_id === userId;

  return (
    <article
      className="border border-gray-200 rounded-lg p-4 mb-4 bg-white shadow-sm"
      role="article"
      aria-labelledby={`task-name-${task.id}`}
      aria-describedby={`task-details-${task.id}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 id={`task-name-${task.id}`} className="text-lg font-semibold text-gray-900">
            {task.name}
          </h3>
          <div id={`task-details-${task.id}`} className="text-gray-600">
            <p>
              Quantity: {task.quantity} {task.unit || 'units'}
            </p>
            <p className="text-sm text-gray-500">
              Priority: {task.priority} | Status: {task.status}
            </p>
            {task.assigned_user_id && (
              <p className="text-sm text-gray-500">
                Assigned to: {task.assigned_user_id === userId ? 'You' : 'Someone else'}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2 ml-4" role="group" aria-label="Task actions">
          {task.recipe_id && (
            <Button
              onClick={() => setIsRecipeOpen(true)}
              className="h-12 px-6 text-base min-w-[80px]"
              variant="outline"
              aria-label={`View recipe for: ${task.name}`}
            >
              Recipe
            </Button>
          )}
          {canClaim && (
            <Button
              onClick={() => onClaim(task.id)}
              disabled={isLoading}
              className="h-12 px-6 text-base min-w-[80px]"
              variant="primary"
              aria-label={`Claim task: ${task.name}`}
            >
              Claim
            </Button>
          )}
          {canComplete && (
            <Button
              onClick={() => onComplete(task.id)}
              disabled={isLoading}
              className="h-12 px-6 text-base min-w-[80px]"
              variant="secondary"
              aria-label={`Mark task as complete: ${task.name}`}
            >
              Complete
            </Button>
          )}
        </div>
      </div>
      {isRecipeOpen && task.recipe_id && (
        <RecipeViewer
          recipeId={task.recipe_id}
          onClose={() => setIsRecipeOpen(false)}
          taskQuantity={task.quantity}
        />
      )}
    </article>
  );
}
