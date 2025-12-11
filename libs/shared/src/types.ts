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

export interface TaskDTO extends BaseEntity {
  event_id: string;
  name: string;
  status: string;
  priority: string;
  assigned_user_id?: string;
}
