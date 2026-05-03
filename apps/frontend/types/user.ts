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
  isOnboardingComplete?: boolean;
  jobTitle?: string;
  phone?: string;
  whatsapp?: string;
  officeAddress?: string;
  tenant?: any;
}

export interface TenantSubscription {
  isTrial: boolean;
  trialStartDate?: string;
  trialEndDate?: string;
  planName?: string;
  subscriptionStatus?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}
