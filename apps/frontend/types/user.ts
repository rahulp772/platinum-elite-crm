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
  tenantId?: string;
  roleId?: string;
  role?: UserRoleType;
  isSuperAdmin?: boolean;
  permissions?: string[];
}

export interface AuthResponse {
  access_token: string;
  user: User;
}
