import {
  generateStudents,
  generateModules,
  generateGrades,
  generateMessages,
  generateNotifications,
  generateAcademicGoals,
  generatePathwayDemand,
  generateStaffUsers,
  generateTestStudent,
  generateInternships,
  generateAnonymousReports,
  generateInterventions,
  generateMeetings,
  generateSystemConfiguration,
  generateAuditLogs,
  generateBackups,
  generateNotificationTemplates,
  generateReportTemplates,
} from './generators';

// Generate all mock data
export const mockTestStudent = generateTestStudent();
export const mockStudents = [mockTestStudent, ...generateStudents(50)];
export const mockModules = generateModules(30);
export const mockGrades = generateGrades(mockStudents, mockModules);
export const mockMessages = generateMessages(mockStudents, 100);
export const mockNotifications = generateNotifications(mockStudents, 200);
export const mockAcademicGoals = generateAcademicGoals(mockStudents);
export const mockPathwayDemand = generatePathwayDemand(mockStudents);
export const mockStaffUsers = generateStaffUsers();
export const mockInternships = generateInternships(mockStudents);
export const mockAnonymousReports = generateAnonymousReports(15);
export const mockInterventions = generateInterventions(mockStudents);
export const mockMeetings = generateMeetings(mockStudents);
export const mockSystemConfiguration = generateSystemConfiguration();
export const mockAuditLogs = generateAuditLogs(200);
export const mockBackups = generateBackups(10);
export const mockNotificationTemplates = generateNotificationTemplates();
export const mockReportTemplates = generateReportTemplates();

// Combine all users
export const mockAllUsers = [...mockStudents, ...mockStaffUsers];

// Export for easy access
export const mockData = {
  students: mockStudents,
  modules: mockModules,
  grades: mockGrades,
  messages: mockMessages,
  notifications: mockNotifications,
  academicGoals: mockAcademicGoals,
  pathwayDemand: mockPathwayDemand,
  staffUsers: mockStaffUsers,
  allUsers: mockAllUsers,
  internships: mockInternships,
  anonymousReports: mockAnonymousReports,
  interventions: mockInterventions,
  meetings: mockMeetings,
  systemConfiguration: mockSystemConfiguration,
  auditLogs: mockAuditLogs,
  backups: mockBackups,
  notificationTemplates: mockNotificationTemplates,
  reportTemplates: mockReportTemplates,
};
