import type { NotificationTemplate } from '@/types';
import type { NotificationEventKeyType } from '@/lib/notifications/events';
import { NotificationEventKey } from '@/lib/notifications/events';

/** UI category ↔ persisted `event_key`. */
export const CATEGORY_TO_EVENT_KEY: Record<NotificationTemplate['category'], NotificationEventKeyType> = {
    grade_release: NotificationEventKey.GRADE_RELEASED,
    academic_class_change: NotificationEventKey.ACADEMIC_CLASS_CHANGED,
    academic_standing_changed: NotificationEventKey.ACADEMIC_STANDING_CHANGED,
    enrollment_welcome: NotificationEventKey.ENROLLMENT_WELCOME,
    deadline_reminder: NotificationEventKey.DEADLINE_REMINDER,
    module_registration_opened: NotificationEventKey.MODULE_REGISTRATION_OPENED,
    pathway_selection_opened: NotificationEventKey.PATHWAY_SELECTION_OPENED,
    specialization_selection_opened: NotificationEventKey.SPECIALIZATION_SELECTION_OPENED,
    pathway_allocated: NotificationEventKey.PATHWAY_ALLOCATED,
    report_assigned: NotificationEventKey.REPORT_ASSIGNED,
    report_submitted: NotificationEventKey.REPORT_SUBMITTED,
    system_alert: NotificationEventKey.SYSTEM_ALERT,
};

export const EVENT_KEY_TO_CATEGORY: Record<NotificationEventKeyType, NotificationTemplate['category']> = {
    [NotificationEventKey.GRADE_RELEASED]: 'grade_release',
    [NotificationEventKey.ACADEMIC_CLASS_CHANGED]: 'academic_class_change',
    [NotificationEventKey.ACADEMIC_STANDING_CHANGED]: 'academic_standing_changed',
    [NotificationEventKey.ENROLLMENT_WELCOME]: 'enrollment_welcome',
    [NotificationEventKey.DEADLINE_REMINDER]: 'deadline_reminder',
    [NotificationEventKey.MODULE_REGISTRATION_OPENED]: 'module_registration_opened',
    [NotificationEventKey.PATHWAY_SELECTION_OPENED]: 'pathway_selection_opened',
    [NotificationEventKey.SPECIALIZATION_SELECTION_OPENED]: 'specialization_selection_opened',
    [NotificationEventKey.PATHWAY_ALLOCATED]: 'pathway_allocated',
    [NotificationEventKey.REPORT_ASSIGNED]: 'report_assigned',
    [NotificationEventKey.REPORT_SUBMITTED]: 'report_submitted',
    [NotificationEventKey.SYSTEM_ALERT]: 'system_alert',
};

export function eventKeyToCategory(eventKey: string): NotificationTemplate['category'] {
    return EVENT_KEY_TO_CATEGORY[eventKey as NotificationEventKeyType] ?? 'system_alert';
}

export function categoryToEventKey(category: NotificationTemplate['category']): NotificationEventKeyType {
    return CATEGORY_TO_EVENT_KEY[category];
}
