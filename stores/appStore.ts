import { create } from 'zustand';
import type {
  Student,
  Module,
  Grade,
  Message,
  Notification,
  AcademicGoal,
  PathwayDemand,
  User,
  Internship,
  AnonymousReport,
  Intervention,
  Meeting,
  SystemConfiguration,
  AuditLog,
  Backup,
  NotificationTemplate,
  ReportTemplate,
} from '@/types';
import { hardcodedData } from '@/lib/mock/hardcoded-data';

interface AppState {
  students: Student[];
  staff: User[];
  modules: Module[];
  grades: Grade[];
  messages: Message[];
  notifications: Notification[];
  academicGoals: AcademicGoal[];
  pathwayDemand: PathwayDemand;
  internships: Internship[];
  anonymousReports: AnonymousReport[];
  interventions: Intervention[];
  meetings: Meeting[];
  systemConfiguration: SystemConfiguration[];
  auditLogs: AuditLog[];
  backups: Backup[];
  notificationTemplates: NotificationTemplate[];
  reportTemplates: ReportTemplate[];

  // Actions
  addStudent: (student: Student) => void;
  updateStudent: (studentId: string, updates: Partial<Student>) => void;
  updateModule: (moduleId: string, updates: Partial<Module>) => void;
  addGrade: (grade: Grade) => void;
  updateGrade: (gradeId: string, updates: Partial<Grade>) => void;
  addMessage: (message: Message) => void;
  markMessageAsRead: (messageId: string) => void;
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: (userId: string) => void;
  updatePathwayDemand: (demand: Partial<PathwayDemand>) => void;
  addAcademicGoal: (goal: AcademicGoal) => void;
  updateAcademicGoal: (goalId: string, updates: Partial<AcademicGoal>) => void;
  addInternship: (internship: Internship) => void;
  updateInternship: (internshipId: string, updates: Partial<Internship>) => void;
  addAnonymousReport: (report: AnonymousReport) => void;
  updateAnonymousReport: (reportId: string, updates: Partial<AnonymousReport>) => void;
  addIntervention: (intervention: Intervention) => void;
  updateIntervention: (interventionId: string, updates: Partial<Intervention>) => void;
  addMeeting: (meeting: Meeting) => void;
  updateMeeting: (meetingId: string, updates: Partial<Meeting>) => void;
  updateSystemConfiguration: (configId: string, updates: Partial<SystemConfiguration>) => void;
  addAuditLog: (log: AuditLog) => void;
  addBackup: (backup: Backup) => void;
  updateBackup: (backupId: string, updates: Partial<Backup>) => void;
  deleteBackup: (backupId: string) => void;
  addNotificationTemplate: (template: NotificationTemplate) => void;
  updateNotificationTemplate: (templateId: string, updates: Partial<NotificationTemplate>) => void;
  deleteNotificationTemplate: (templateId: string) => void;
  addReportTemplate: (template: ReportTemplate) => void;
  updateReportTemplate: (templateId: string, updates: Partial<ReportTemplate>) => void;
  deleteReportTemplate: (templateId: string) => void;
}

export const useAppStore = create<AppState>()((set) => ({
  students: hardcodedData.students,
  staff: hardcodedData.staffUsers,
  modules: hardcodedData.modules,
  grades: hardcodedData.grades,
  messages: hardcodedData.messages,
  notifications: hardcodedData.notifications,
  academicGoals: hardcodedData.academicGoals,
  pathwayDemand: hardcodedData.pathwayDemand,
  internships: hardcodedData.internships,
  anonymousReports: hardcodedData.anonymousReports,
  interventions: hardcodedData.interventions,
  meetings: hardcodedData.meetings,
  systemConfiguration: hardcodedData.systemConfiguration,
  auditLogs: hardcodedData.auditLogs,
  backups: hardcodedData.backups,
  notificationTemplates: hardcodedData.notificationTemplates,
  reportTemplates: hardcodedData.reportTemplates,

  addStudent: (student) =>
    set((state) => ({
      students: [...state.students, student],
    })),

  updateStudent: (studentId, updates) =>
    set((state) => ({
      students: state.students.map((s) =>
        s.studentId === studentId ? { ...s, ...updates } : s
      ),
    })),

  updateModule: (moduleId, updates) =>
    set((state) => ({
      modules: state.modules.map((m) =>
        m.id === moduleId ? { ...m, ...updates } : m
      ),
    })),

  addGrade: (grade) =>
    set((state) => ({
      grades: [...state.grades, grade],
    })),

  updateGrade: (gradeId, updates) =>
    set((state) => ({
      grades: state.grades.map((g) =>
        g.id === gradeId ? { ...g, ...updates } : g
      ),
    })),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  markMessageAsRead: (messageId) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId ? { ...m, isRead: true } : m
      ),
    })),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [...state.notifications, notification],
    })),

  markNotificationAsRead: (notificationId) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === notificationId ? { ...n, isRead: true } : n
      ),
    })),

  markAllNotificationsAsRead: (userId) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.userId === userId ? { ...n, isRead: true } : n
      ),
    })),

  updatePathwayDemand: (demand) =>
    set((state) => ({
      pathwayDemand: { ...state.pathwayDemand, ...demand },
    })),

  addAcademicGoal: (goal) =>
    set((state) => ({
      academicGoals: [...state.academicGoals, goal],
    })),

  updateAcademicGoal: (goalId, updates) =>
    set((state) => ({
      academicGoals: state.academicGoals.map((g) =>
        g.id === goalId ? { ...g, ...updates } : g
      ),
    })),

  addInternship: (internship) =>
    set((state) => ({
      internships: [...state.internships, internship],
    })),

  updateInternship: (internshipId, updates) =>
    set((state) => ({
      internships: state.internships.map((i) =>
        i.id === internshipId ? { ...i, ...updates } : i
      ),
    })),

  addAnonymousReport: (report) =>
    set((state) => ({
      anonymousReports: [...state.anonymousReports, report],
    })),

  updateAnonymousReport: (reportId, updates) =>
    set((state) => ({
      anonymousReports: state.anonymousReports.map((r) =>
        r.id === reportId ? { ...r, ...updates } : r
      ),
    })),

  addIntervention: (intervention) =>
    set((state) => ({
      interventions: [...state.interventions, intervention],
    })),

  updateIntervention: (interventionId, updates) =>
    set((state) => ({
      interventions: state.interventions.map((i) =>
        i.id === interventionId ? { ...i, ...updates } : i
      ),
    })),

  addMeeting: (meeting) =>
    set((state) => ({
      meetings: [...state.meetings, meeting],
    })),

  updateMeeting: (meetingId, updates) =>
    set((state) => ({
      meetings: state.meetings.map((m) =>
        m.id === meetingId ? { ...m, ...updates } : m
      ),
    })),

  updateSystemConfiguration: (configId, updates) =>
    set((state) => ({
      systemConfiguration: state.systemConfiguration.map((c) =>
        c.id === configId ? { ...c, ...updates } : c
      ),
    })),

  addAuditLog: (log) =>
    set((state) => ({
      auditLogs: [...state.auditLogs, log],
    })),

  addBackup: (backup) =>
    set((state) => ({
      backups: [...state.backups, backup],
    })),

  updateBackup: (backupId, updates) =>
    set((state) => ({
      backups: state.backups.map((b) =>
        b.id === backupId ? { ...b, ...updates } : b
      ),
    })),

  deleteBackup: (backupId) =>
    set((state) => ({
      backups: state.backups.filter((b) => b.id !== backupId),
    })),

  addNotificationTemplate: (template) =>
    set((state) => ({
      notificationTemplates: [...state.notificationTemplates, template],
    })),

  updateNotificationTemplate: (templateId, updates) =>
    set((state) => ({
      notificationTemplates: state.notificationTemplates.map((t) =>
        t.id === templateId ? { ...t, ...updates } : t
      ),
    })),

  deleteNotificationTemplate: (templateId) =>
    set((state) => ({
      notificationTemplates: state.notificationTemplates.filter((t) => t.id !== templateId),
    })),

  addReportTemplate: (template) =>
    set((state) => ({
      reportTemplates: [...state.reportTemplates, template],
    })),

  updateReportTemplate: (templateId, updates) =>
    set((state) => ({
      reportTemplates: state.reportTemplates.map((t) =>
        t.id === templateId ? { ...t, ...updates } : t
      ),
    })),

  deleteReportTemplate: (templateId) =>
    set((state) => ({
      reportTemplates: state.reportTemplates.filter((t) => t.id !== templateId),
    })),
}));
