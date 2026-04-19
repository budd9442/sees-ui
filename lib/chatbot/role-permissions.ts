/**
 * Role permission helpers — kept for reference / future use.
 * SQL-level restrictions are enforced in sql-validator.ts.
 */

export type UserRole = 'student' | 'staff' | 'advisor' | 'hod' | 'admin';

const STAFFISH_ROLES = new Set<UserRole>(['staff', 'advisor', 'hod', 'admin']);

export function hasChatbotDbAccess(role: string): boolean {
  return ['student', 'staff', 'advisor', 'hod', 'admin'].includes(role);
}

export function isStaffRole(role: string): boolean {
  return STAFFISH_ROLES.has(role as UserRole);
}

export function canSeePII(role: string): boolean {
  return role !== 'student';
}
