/**
 * Shared rules for HOD-managed registration windows (pathway/spec selection, module registration).
 * A close deadline is required for student-facing "window open" — otherwise only status changes (e.g. CLOSED) apply.
 */
export type RegistrationTimeWindowResult = { ok: true } | { ok: false; message: string };

export const SELECTION_ROUND_WINDOW_COPY = {
    notYetOpen: 'This selection round has not opened yet.',
    noCloseDeadline: 'No closing deadline is set for this round.',
    pastDeadline: 'The application deadline for this round has passed.',
} as const;

export const MODULE_REGISTRATION_WINDOW_COPY = {
    notYetOpen: 'Module registration has not opened yet.',
    noCloseDeadline: 'No closing deadline is set for this registration period.',
    pastDeadline: 'The module registration deadline has passed.',
} as const;

export function isWithinRegistrationWindow(
    opens_at: Date | null,
    closes_at: Date | null,
    now: Date,
    labels: {
        notYetOpen: string;
        noCloseDeadline: string;
        pastDeadline: string;
    }
): RegistrationTimeWindowResult {
    if (opens_at && now < opens_at) return { ok: false, message: labels.notYetOpen };
    if (!closes_at) return { ok: false, message: labels.noCloseDeadline };
    if (now > closes_at) return { ok: false, message: labels.pastDeadline };
    return { ok: true };
}
