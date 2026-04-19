export type UserWithRelations = {
  user_id: string;
  firstName: string | null;
  lastName: string | null;
  status: string;
  email: string;
  student: unknown | null;
  staff: {
    staff_type: string;
    advisor_profile: unknown | null;
    hod: unknown | null;
  } | null;
};

export function appRoleFromUserRecord(user: UserWithRelations): string {
  const st = user.staff;
  if (st) {
    if (st.staff_type === 'ADMIN' || st.staff_type === 'REGISTRAR') return 'admin';
    if (st.hod) return 'hod';
    if (st.advisor_profile) return 'advisor';
    return 'staff';
  }
  return 'student';
}
