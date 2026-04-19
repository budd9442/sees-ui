// Core type definitions for the Student Enrollment & Evaluation System

export type UserRole = 'student' | 'staff' | 'advisor' | 'hod' | 'admin';

export type DegreeProgram = 'MIT' | 'IT';

export type Specialization = 'BSE' | 'OSCM' | 'IS';

export type AcademicYear = 'L1' | 'L2' | 'L3' | 'L4' | 'GRADUATED';

export type AcademicClass =
  | 'First Class'
  | 'Second Class Upper'
  | 'Second Class Lower'
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
  currentLevel?: string;
  degreeProgram?: DegreeProgram;
  specialization?: Specialization;
  avatar?: string;
  isActive: boolean;
  isHOD?: boolean;
  isGraduated?: boolean;
  phone?: string;
  linkedin?: string;
  github?: string;
  address?: string;
  bio?: string;
  emergency_contact?: string;
  lastLoginDate?: string | Date;
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
  graduationStatus?: 'NOT_GRADUATED' | 'PENDING' | 'GRADUATED';
  graduatedAt?: string;
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
  learningOutcomes?: string[];
  status?: 'active' | 'inactive';
  isCompulsory?: boolean;
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

export type QuantGoalType = 'GPA_TARGET' | 'CREDITS_TARGET' | 'MODULE_GRADE_TARGET' | 'CGPA_IMPROVEMENT';

export interface AcademicGoal {
  id: string;
  studentId: string;
  title: string;
  description?: string;
  goalType: QuantGoalType;
  targetValue: number;
  baselineValue?: number;
  metricUnit: 'GPA' | 'CREDITS' | 'MARKS' | 'POINTS';
  moduleId?: string | null;
  moduleCode?: string | null;
  deadline?: string | Date;
  progress: number; // 0-100
  status: 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED';
  createdAt: string;
  milestones?: string[];
}

export interface StudentDashboardGoalTargets {
  gpaTargetLine: { value: number; goalId: string }[];
  creditsTargetLine: { value: number; goalId: string }[];
  cgpaImprovementLine: { value: number; baseline: number; goalId: string }[];
}

export interface StudentGoalsSummary {
  totalGoals: number;
  completedGoals: number;
  overdueGoals: number;
  activeGoal: {
    id: string;
    title: string;
    goalType: QuantGoalType | string;
    progress: number;
    targetValue: number | null;
    moduleCode: string | null;
    deadline: string | null;
  } | null;
  graphTargets: StudentDashboardGoalTargets;
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
  url?: string; // Document resource URL
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
  url?: string; // Attachment resource URL
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
  status: 'success' | 'failed' | 'warning' | 'info';
  /** AUTH | EMAIL | ADMIN | STAFF | SYSTEM when sourced from `audit_logs`. */
  category?: string;
  metadata?: Record<string, unknown>;
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
  downloadUrl?: string; // Asset download URL
  checksum?: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  category:
    | 'grade_release'
    | 'academic_class_change'
    | 'academic_standing_changed'
    | 'enrollment_welcome'
    | 'pathway_allocated'
    | 'deadline_reminder'
    | 'module_registration_opened'
    | 'pathway_selection_opened'
    | 'specialization_selection_opened'
    | 'system_alert';
  /** Persisted event key (optional on client until loaded from server). */
  eventKey?: string;
  subject: string;
  body: string;
  placeholders: string[]; // Available placeholders like {{studentName}}, {{gpa}}
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationTriggerRow {
  eventKey: string;
  enabled: boolean;
  configJson?: { daysBeforeClose?: number[] } | null;
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
  workStyle?: string;
  learningStyle?: string;
  timeCommitment?: string;
  locationPreference?: string;
  salaryExpectation?: string;
  industryInterest?: string[];
  additionalNotes?: string;
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
  technicalInterests?: string[];
  careerFocus?: string[];
  projectTypes?: string[];
  learningGoals?: string[];
  skillDevelopment?: string[];
  workEnvironment?: string;
  additionalNotes?: string;
}

export interface RankingEntry {
  id: string;
  studentId: string;
  studentName: string;
  gpa: number;
  weightedAverage?: number; // For tiebreaking
  weightedScore?: number; // For different ranking criteria
  rank: number;
  previousRank?: number;
  change?: number;
  academicClass: AcademicClass;
  pathway: DegreeProgram;
  specialization?: Specialization;
  semester: string;
  academicYear: string;
  tiebreakApplied: boolean;
  tiebreakReason?: string;
  totalCredits?: number;
  passRate?: number;
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

export interface CustomScheduleItem {
  id: string;
  studentId: string;
  title: string;
  description?: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string;
  endTime: string;
  location?: string;
  type: 'personal' | 'study' | 'work' | 'exercise' | 'social' | 'other';
  color: string;
  isRecurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  priority: 'low' | 'medium' | 'high';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleConflict {
  id: string;
  item1Id: string;
  item2Id: string;
  item1Type: 'academic' | 'custom';
  item2Type: 'academic' | 'custom';
  conflictType: 'time' | 'location';
  severity: 'warning' | 'error';
  message: string;
  createdAt: string;
}