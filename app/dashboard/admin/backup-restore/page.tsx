import { redirect } from 'next/navigation';

/** Consolidated with `/dashboard/admin/backup` (real encrypted snapshots). */
export default function BackupRestoreRedirectPage() {
  redirect('/dashboard/admin/backup');
}
