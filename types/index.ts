// Core type definitions for the Student Enrollment & Evaluation System

export type UserRole = 'student' | 'staff' | 'advisor' | 'hod' | 'admin';

export type DegreeProgram = 'MIT' | 'IT';

export type Specialization = 'BSE' | 'OSCM' | 'IS';

export type AcademicYear = 'L1' | 'L2' | 'L3' | 'L4';

export type AcademicClass =
  | 'First Class'
  | 'Second Class Upper'
  | 'Second Class Lower'
  | 'Third Class'
  | 'Pass';

export type EnrollmentStatus = 'enrolled' | 'graduated' | 'suspended';

export type Semester = 'S1' | 'S2';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string; // Computed from firstName + lastName
  role: UserRole;
  avatar?: string;
  isActive: boolean;
}

export interface Student extends User {
  role: 'student';
  studentId: string;
  academicYear: AcademicYear;
  degreeProgram?: DegreeProgram;
  specialization?: Specialization;
  currentGPA: number;
  totalCredits: number;
  academicClass: AcademicClass;
  pathwayLocked: boolean;
  enrollmentDate: string;
  enrollmentStatus: EnrollmentStatus;
}

export interface Module {
  id: string;
  code: string;
  title: string;
  credits: number;
  description: string;
  prerequisites: string[]; // Module codes
  academicYear: AcademicYear;
  degreeProgram?: DegreeProgram;
  specialization?: Specialization;
  semester: Semester;
  isActive: boolean;
  capacity: number;
  enrolled: number;
  lecturer?: string;
  schedule?: string;
}

export interface Grade {
  id: string;
  studentId: string;
  moduleId: string;
  moduleCode: string;
  moduleTitle: string;
  grade: number; // 0-100
  letterGrade: string; // A+, A, B+, etc.
  points: number; // GPA points (0-4)
  credits: number;
  semester: string;
  academicYear: string;
  isReleased: boolean;
}

export interface AcademicGoal {
  id: string;
  studentId: string;
  title: string;
  description?: string;
  category: 'academic' | 'skill' | 'career' | 'personal';
  priority: 'low' | 'medium' | 'high';
  targetGPA: number;
  targetClass: AcademicClass;
  targetValue?: string;
  currentValue?: string;
  targetDate: string;
  deadline?: string;
  currentProgress: number; // 0-100
  progress?: number; // 0-100 (alias for currentProgress)
  isActive: boolean;
  createdAt: string;
  milestones?: string[];
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  receiverId: string;
  receiverName: string;
  subject: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  parentId?: string; // For threading
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface PathwayDemand {
  MIT: number; // Percentage
  IT: number; // Percentage
  totalStudents: number;
  thresholdReached: boolean;
  lastUpdated: string;
}

export interface ModuleRegistration {
  id: string;
  studentId: string;
  moduleId: string;
  semester: string;
  academicYear: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  moduleId: string;
  sessionDate: string;
  status: 'present' | 'absent' | 'late' | 'excused';
}

export interface Assessment {
  id: string;
  moduleId: string;
  name: string;
  type: 'exam' | 'assignment' | 'quiz' | 'project';
  weight: number; // Percentage
  dueDate?: string;
  maxScore: number;
}

export interface SystemConfig {
  id: string;
  version: string;
  gpaFormula: string;
  creditLimits: {
    min: number;
    max: number;
  };
  pathwayThreshold: number; // 60%
  academicClassThresholds: {
    firstClass: number;
    secondUpper: number;
    secondLower: number;
    thirdClass: number;
    pass: number;
  };
}

export interface DashboardStats {
  totalStudents: number;
  averageGPA: number;
  retentionRate: number;
  pathwayDistribution: {
    MIT: number;
    IT: number;
  };
}

// New types for comprehensive features

export interface Internship {
  id: string;
  studentId: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  status: 'applied' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  supervisorName: string;
  supervisorEmail: string;
  supervisorPhone?: string;
  description?: string;
  progress: number; // 0-100
  milestones: InternshipMilestone[];
  documents: InternshipDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface InternshipMilestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  completedDate?: string;
}

export interface InternshipDocument {
  id: string;
  name: string;
  type: 'report' | 'certificate' | 'evaluation' | 'other';
  uploadedAt: string;
  url?: string; // Mock file URL
}

export interface AnonymousReport {
  id: string;
  studentId?: string; // Optional for anonymous reports
  category: 'academic_misconduct' | 'harassment' | 'discrimination' | 'safety_concern' | 'facility_issue' | 'other';
  title: string;
  description: string;
  attachments: ReportAttachment[];
  status: 'submitted' | 'in_review' | 'resolved' | 'escalated';
  submittedAt: string;
  reviewedAt?: string;
  resolvedAt?: string;
  reviewedBy?: string;
  assignedTo?: string;
  adminNotes?: string;
  responseNotes?: string;
  consentToContact?: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface ReportAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url?: string; // Mock file URL
  uploadedAt: string;
}

export interface Intervention {
  id: string;
  studentId: string;
  advisorId: string;
  type: 'gpa_drop' | 'class_decline' | 'attendance_issue' | 'academic_warning' | 'manual';
  title: string;
  description: string;
  triggerReason: string;
  severity: 'low' | 'medium' | 'high';
  suggestions: string[];
  resources: InterventionResource[];
  status: 'active' | 'acknowledged' | 'resolved' | 'escalated';
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  notes?: string;
  studentNotes?: string;
  advisorNotes?: string;
  acknowledged?: boolean;
  selectedResources?: string[];
}

export interface InterventionResource {
  id: string;
  title: string;
  description: string;
  type: 'study_tip' | 'resource_link' | 'contact_info' | 'action_item' | 'service' | 'workshop' | 'program';
  url?: string;
  contactInfo?: string;
  contact?: string;
}

export interface Meeting {
  id: string;
  advisorId: string;
  studentId: string;
  title: string;
  description?: string;
  scheduledDate: string;
  duration: number; // minutes
  location: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  meetingType: 'academic' | 'career' | 'personal' | 'emergency';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SystemConfiguration {
  id: string;
  category: 'academic' | 'user_management' | 'system_settings' | 'security' | 'notifications';
  key: string;
  value: any;
  description: string;
  isActive: boolean;
  version: number;
  lastModified: string;
  modifiedBy: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  status: 'success' | 'failed' | 'warning';
}

export interface Backup {
  id: string;
  name: string;
  description?: string;
  type: 'manual' | 'scheduled' | 'system';
  status: 'in_progress' | 'completed' | 'failed';
  size: number; // bytes
  createdAt: string;
  completedAt?: string;
  downloadUrl?: string; // Mock download URL
  checksum?: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  category: 'grade_release' | 'gpa_change' | 'pathway_allocated' | 'deadline_reminder' | 'system_alert';
  subject: string;
  body: string;
  placeholders: string[]; // Available placeholders like {{studentName}}, {{gpa}}
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'performance' | 'pathway' | 'module' | 'student' | 'system';
  sections: ReportSection[];
  layout: 'portrait' | 'landscape';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReportSection {
  id: string;
  title: string;
  type: 'text' | 'table' | 'chart' | 'summary';
  dataFields: string[];
  chartType?: 'bar' | 'line' | 'pie' | 'area';
  position: number;
}

export interface AcademicCalendar {
  id: string;
  name: string;
  academicYear: string;
  events: CalendarEvent[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  type: 'semester_start' | 'semester_end' | 'registration' | 'examination' | 'holiday' | 'deadline';
  isRecurring: boolean;
  recurrencePattern?: string;
}

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  targetRoles: UserRole[];
  conditions?: any;
  createdAt: string;
  updatedAt: string;
}

export interface PathwayPreference {
  id: string;
  studentId: string;
  interests: string[];
  strengths: string[];
  careerGoals: string[];
  preferredPathway: DegreeProgram;
  alternativePathway?: DegreeProgram;
  reasoning: string;
  submittedAt: string;
}

export interface SpecializationPreference {
  id: string;
  studentId: string;
  academicInterests: string[];
  careerAspirations: string[];
  preferredSpecialization: Specialization;
  alternativeSpecialization?: Specialization;
  reasoning: string;
  submittedAt: string;
}

export interface RankingEntry {
  id: string;
  studentId: string;
  studentName: string;
  gpa: number;
  weightedAverage?: number; // For tiebreaking
  rank: number;
  academicClass: AcademicClass;
  pathway: DegreeProgram;
  specialization?: Specialization;
  semester: string;
  academicYear: string;
  tiebreakApplied: boolean;
  tiebreakReason?: string;
}

export interface GradeUpload {
  id: string;
  moduleId: string;
  uploadedBy: string;
  uploadType: 'manual' | 'csv';
  status: 'draft' | 'validated' | 'released';
  totalStudents: number;
  validEntries: number;
  errors: GradeUploadError[];
  uploadedAt: string;
  releasedAt?: string;
}

export interface GradeUploadError {
  row: number;
  studentId: string;
  field: string;
  error: string;
  value?: any;
}

export interface ModuleSchedule {
  id: string;
  moduleId: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  startTime: string;
  endTime: string;
  room: string;
  type: 'lecture' | 'tutorial' | 'lab';
  capacity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}