/**
 * Canonical notification event keys (email channel).
 * Keep stable — stored in DB and used for dedupe.
 */
export const NotificationEventKey = {
    GRADE_RELEASED: 'GRADE_RELEASED',
    /** Study level promotion (e.g. L1 → L2), not GPA standing. */
    ACADEMIC_CLASS_CHANGED: 'ACADEMIC_CLASS_CHANGED',
    /** GPA-based standing (e.g. Second Upper → First Class) after grades are released. */
    ACADEMIC_STANDING_CHANGED: 'ACADEMIC_STANDING_CHANGED',
    ENROLLMENT_WELCOME: 'ENROLLMENT_WELCOME',
    DEADLINE_REMINDER: 'DEADLINE_REMINDER',
    MODULE_REGISTRATION_OPENED: 'MODULE_REGISTRATION_OPENED',
    PATHWAY_SELECTION_OPENED: 'PATHWAY_SELECTION_OPENED',
    SPECIALIZATION_SELECTION_OPENED: 'SPECIALIZATION_SELECTION_OPENED',
    PATHWAY_ALLOCATED: 'PATHWAY_ALLOCATED',
    REPORT_ASSIGNED: 'REPORT_ASSIGNED',
    REPORT_SUBMITTED: 'REPORT_SUBMITTED',
    SYSTEM_ALERT: 'SYSTEM_ALERT',
} as const;

export type NotificationEventKeyType =
    (typeof NotificationEventKey)[keyof typeof NotificationEventKey];

export const ALL_NOTIFICATION_EVENT_KEYS: NotificationEventKeyType[] = [
    NotificationEventKey.GRADE_RELEASED,
    NotificationEventKey.ACADEMIC_CLASS_CHANGED,
    NotificationEventKey.ACADEMIC_STANDING_CHANGED,
    NotificationEventKey.ENROLLMENT_WELCOME,
    NotificationEventKey.DEADLINE_REMINDER,
    NotificationEventKey.MODULE_REGISTRATION_OPENED,
    NotificationEventKey.PATHWAY_SELECTION_OPENED,
    NotificationEventKey.SPECIALIZATION_SELECTION_OPENED,
    NotificationEventKey.PATHWAY_ALLOCATED,
    NotificationEventKey.REPORT_ASSIGNED,
    NotificationEventKey.REPORT_SUBMITTED,
    NotificationEventKey.SYSTEM_ALERT,
];
