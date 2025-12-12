export interface ApiError {
  code: string;
  message: string;
  remediation?: string;
}

export function mapSupabaseError(error: unknown): { status: number; error: ApiError } {
  const message = error.message || 'Unknown error';

  if (message.includes('Task not found')) {
    return {
      status: 404,
      error: {
        code: 'TASK_NOT_FOUND',
        message: 'The requested task was not found.',
        remediation: 'Check the task ID and ensure it exists in your company.',
      },
    };
  }

  if (message.includes('Insufficient permissions')) {
    return {
      status: 403,
      error: {
        code: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to perform this action.',
        remediation: 'Contact your manager or check your role assignments.',
      },
    };
  }

  if (message.includes('not available for claiming') || message.includes('cannot be completed')) {
    return {
      status: 409,
      error: {
        code: 'INVALID_TASK_STATUS',
        message: 'The task is in an invalid status for this operation.',
        remediation: 'Refresh the task list and try again.',
      },
    };
  }

  if (message.includes('Invalid or expired undo token')) {
    return {
      status: 400,
      error: {
        code: 'INVALID_UNDO_TOKEN',
        message: 'The undo token is invalid or has expired.',
        remediation: 'Request a new undo token by performing the action again.',
      },
    };
  }

  // Default
  return {
    status: 500,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An internal error occurred.',
      remediation: 'Please try again later or contact support.',
    },
  };
}
