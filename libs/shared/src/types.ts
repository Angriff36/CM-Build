export interface BaseEntity {
  id: string;
  company_id: string;
  created_at: string;
}

export interface UserDTO extends BaseEntity {
  role: string;
  display_name: string;
  avatar_url?: string;
  status: string;
}

import { TaskStatus, TaskPriority } from './enums';

export interface TaskDTO extends BaseEntity {
  event_id: string;
  name: string;
  quantity: number;
  unit: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_user_id?: string;
  combined_group_id?: string;
  instructions_ref?: string;
  undo_token?: string;
}
