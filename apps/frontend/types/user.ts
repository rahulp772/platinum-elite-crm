export type UserRole = 'admin' | 'agent';

export interface User {
  id: string;
  email: string;
  name: string;
  tenantId?: string;
  roleId?: string;
  isSuperAdmin?: boolean;
  permissions?: string[];
}

export interface AuthResponse {
  access_token: string;
  user: User;
}
