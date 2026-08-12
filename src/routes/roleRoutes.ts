import type { Role } from '../types';

export const ROLE_HOME: Record<Role, string> = {
  ADMIN: '/admin',
  TRAINER: '/trainer',
  MEMBER: '/member',
};

export function homePathForRole(role: Role): string {
  return ROLE_HOME[role] ?? '/login';
}
