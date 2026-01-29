# Requirements Traceability Matrix

Mapping of functional requirements to database schema components and UI paths.

---

## FR1: Student Enrollment & Pathway Management

| ID | Requirement | Schema Components | UI Path | Status |
|---|---|---|---|---|
| **FR1.1** | Bulk enroll new students | `User`, `Student`, `RegistrationToken` | `/dashboard/admin/bulk-enroll` | ✅ |
| **FR1.2** | Pathway selection & management | `Student.degree_path_id`, `DegreeProgram`, `PathwayPreference`, `SystemSetting` | `/dashboard/student/pathway`<br>`/dashboard/student/pathway-preferences` | ✅ |
| **FR1.3** | Specialization selection | `Student.specialization_id`, `Specialization`, `SpecializationPreference` | `/dashboard/student/specialization`<br>`/dashboard/student/specialization-preferences` | ✅ |

---

## FR2: Academic Planning & Module Management

| ID | Requirement | Schema Components | UI Path | Status |
|---|---|---|---|---|
| **FR2.1** | Module registration | `ModuleRegistration`, `Module`, `Semester`, `Student` | `/dashboard/student/modules` | ✅ |
| **FR2.2** | Module planning & credit tracking | `ModuleRegistration`, `Module.credits`, `Student.current_level` | `/dashboard/student/credits` | ✅ |
| **FR2.3** | View GPA & set goals | `Student.current_gpa`, `GPAHistory`, `AcademicGoal` | `/dashboard/student/goals`<br>`/dashboard/student/grades` | ✅ |
| **FR2.4** | View academic class | `Student.current_class`, `Ranking` | `/dashboard/student/profile`<br>`/dashboard/student/rankings` | ✅ |

---

## FR3: Academic Monitoring & Communication

| ID | Requirement | Schema Components | UI Path | Status |
|---|---|---|---|---|
| **FR3.1** | Notifications for marks/GPA | `Notification`, `Grade`, `GPAHistory` | `/dashboard/student` (notifications) | ✅ |
| **FR3.2** | Personalized suggestions | `Notification`, `Student.current_gpa`, AI integration | `/dashboard/student/personalized-feedback` | ✅ |
| **FR3.3** | Contact advisor | `Message`, `Advisor`, `Student` | `/dashboard/student/messages` | ✅ |
| **FR3.4** | Anonymous reports & schedules | `AnonymousReport`, `LectureSchedule`, `ModuleRegistration` | `/dashboard/student/reports`<br>`/dashboard/student/schedule` | ✅ |

---

## FR4: Academic Staff Operations

| ID | Requirement | Schema Components | UI Path | Status |
|---|---|---|---|---|
| **FR4.1** | Upload module info & marks | `Module`, `Grade`, `StaffAssignment` | `/dashboard/staff/modules`<br>`/dashboard/staff/roster/[moduleId]` | ✅ |
| **FR4.2** | Generate module statistics | `Grade`, `Module`, `ModuleRegistration` | `/dashboard/staff/analytics` | ✅ |
| **FR4.3** | Modify lecture schedules | `LectureSchedule`, `StaffAssignment` | `/dashboard/staff/schedule` | ✅ |

---

## FR5: Department Management & Analytics

| ID | Requirement | Schema Components | UI Path | Status |
|---|---|---|---|---|
| **FR5.1** | Overall statistics & trends | `Student`, `Grade`, `GPAHistory`, `Ranking` | `/dashboard/hod/analytics`<br>`/dashboard/hod/reports` | ✅ |
| **FR5.2** | Eligible students lists | `Ranking`, `Student`, `DegreeProgram` | `/dashboard/hod/eligible` | ✅ |

---

## FR6: System Administration & Configuration

| ID | Requirement | Schema Components | UI Path | Status |
|---|---|---|---|---|
| **FR6.1** | Manage users & roles | `User`, `Staff`, `Student`, `Advisor`, `HOD` | `/dashboard/admin/users` | ✅ |
| **FR6.2** | System monitoring & backups | `SystemSetting`, Logs (external) | `/dashboard/admin/system-monitoring`<br>`/dashboard/admin/logs`<br>`/dashboard/admin/backup-restore` | ✅ |
| **FR6.3** | Configure programs & rules | `DegreeProgram`, `Specialization`, `ProgramStructure`, `SystemSetting`, `FeatureFlag` | `/dashboard/admin/programs`<br>`/dashboard/admin/config/programs`<br>`/dashboard/admin/dynamic-configuration` | ✅ |

---

## Schema Component Details

### Core User Management
- `User` - Base user entity
- `Student` - Student-specific data (GPA, pathway, class)
- `Staff` - Staff members
- `Advisor` - Academic advisors
- `HOD` - Head of Department

### Academic Structure
- `DegreeProgram` - MIT, IT programs
- `Specialization` - BSE, OSCM, IS
- `ProgramStructure` - Module-program mappings
- `Module` - Course modules
- `Semester` - Academic periods
- `AcademicYear` - Year tracking

### Student Progress
- `ModuleRegistration` - Student module enrollments
- `Grade` - Module marks and grades
- `GPAHistory` - Historical GPA records
- `Ranking` - Class rankings
- `AcademicGoal` - Student goals

### Preferences & Selection
- `PathwayPreference` - Degree pathway choices
- `SpecializationPreference` - Specialization choices

### Communication & Monitoring
- `Message` - Student-advisor messaging
- `Notification` - System notifications
- `AnonymousReport` - Anonymous feedback

### Staff & Scheduling
- `StaffAssignment` - Staff-module assignments
- `LectureSchedule` - Lecture timetables

### System Configuration
- `SystemSetting` - Dynamic configuration
- `FeatureFlag` - Feature toggles
- `RegistrationToken` - User onboarding tokens

---

## UI Path Structure

### Student Dashboard (`/dashboard/student/`)
- Main: `page.tsx`, `dashboard-view.tsx`
- Pathway: `pathway/`, `pathway-preferences/`
- Specialization: `specialization/`, `specialization-preferences/`
- Modules: `modules/`
- Credits: `credits/`
- Grades: `grades/`
- Goals: `goals/`
- Profile: `profile/`
- Rankings: `rankings/`
- Messages: `messages/`
- Reports: `reports/`
- Schedule: `schedule/`
- Feedback: `personalized-feedback/`

### Staff Dashboard (`/dashboard/staff/`)
- Modules: `modules/`
- Roster: `roster/[moduleId]/`
- Analytics: `analytics/`
- Schedule: `schedule/`

### HOD Dashboard (`/dashboard/hod/`)
- Analytics: `analytics/`
- Reports: `reports/`
- Eligible: `eligible/`
- Rankings: `rankings/`
- Pathways: `pathways/`
- Weighted Average: `weighted-average-configuration/`

### Admin Dashboard (`/dashboard/admin/`)
- Users: `users/`
- Bulk Enroll: `bulk-enroll/`, `bulk-enroll/history/`
- Programs: `programs/`, `config/programs/`
- Modules: `modules/`
- Configuration: `dynamic-configuration/`, `config/`
- Monitoring: `system-monitoring/`, `logs/`
- Backup: `backup-restore/`
- Calendar: `academic-calendar/`
- Reports Review: `reports-review/`

### Advisor Dashboard (`/dashboard/advisor/`)
- Students: `students/`, `students/[studentId]/`
- Messages: `messages/`
- Records: `records/`
- Meetings: `meeting-scheduling/`

---

## Implementation Coverage

| Functional Area | Requirements | Implemented | Coverage |
|---|---|---|---|
| Student Enrollment & Pathway | 3 | 3 | 100% |
| Academic Planning & Modules | 4 | 4 | 100% |
| Monitoring & Communication | 4 | 4 | 100% |
| Staff Operations | 3 | 3 | 100% |
| Department Management | 2 | 2 | 100% |
| System Administration | 3 | 3 | 100% |
| **Total** | **19** | **19** | **100%** |

---

## Key Implementation Files

### Actions (Server-side logic)
- `lib/actions/user-actions.ts` - User management
- `lib/actions/student-actions.ts` - Student operations
- `lib/actions/module-actions.ts` - Module operations
- `lib/actions/grade-actions.ts` - Grade management
- `lib/actions/pathway-actions.ts` - Pathway selection
- `lib/actions/specialization-actions.ts` - Specialization selection

### API Routes
- `/api/admin/bulk-enroll/route.ts` - Bulk enrollment
- `/api/chat/route.ts` - AI-powered chat
- `/api/cron/` - Scheduled tasks

### Components
- `components/layout/sidebar.tsx` - Navigation
- `components/student/` - Student-specific components
- `components/staff/` - Staff-specific components
- `components/admin/` - Admin-specific components

---

## Notes

- All functional requirements have corresponding schema components and UI paths
- 100% implementation coverage across all 6 functional areas
- Database schema supports all requirements through Prisma models
- UI follows role-based access control (RBAC) patterns
- Each role has dedicated dashboard with appropriate features
