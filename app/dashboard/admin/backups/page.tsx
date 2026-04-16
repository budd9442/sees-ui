import { redirect } from 'next/navigation';

/** Consolidated with `/dashboard/admin/backup`. */
export default function BackupsRedirectPage() {
  redirect('/dashboard/admin/backup');
}
