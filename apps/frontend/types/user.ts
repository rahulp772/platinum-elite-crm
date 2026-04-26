export type UserRole = 'admin' | 'agent';

export interface UserRoleType {
  id: string;
  name: string;
  level?: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  tenantId?: string;
  roleId?: string;
  role?: UserRoleType;
  isSuperAdmin?: boolean;
  permissions?: string[];
  timezone?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}
