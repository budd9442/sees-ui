# Database Schema Normalization Analysis (3NF)

## ✅ Fully Normalized Tables

Most tables follow 3NF strictly:
- User Management: `User`, `RegistrationToken`, `PasswordResetToken`, `Staff`, `Advisor`, `HOD`
- Academic Structure: `DegreeProgram`, `Specialization`, `ProgramIntake`, `Module`, `AcademicYear`, `Semester`, `StaffAssignment`
- Enrollment: `ModuleRegistration`, `GradingScheme`, `GradingBand`
- Communication: `Message`, `Notification`, `AnonymousReport`
- System: `SystemSetting`, `LectureSchedule`, `SystemMetric`, `FeatureFlag`, `CalendarEvent`

---

## ⚠️ Denormalized Fields

### Student.current_gpa
**Type**: Derived field  
**Justification**: Calculated from grades via complex aggregation. Denormalized for performance as it's accessed frequently on dashboards, profiles, and rankings.

### Student.academic_class
**Type**: Derived field  
**Justification**: Derived from GPA. Stored to preserve historical classification at graduation, even if grading rules change later.

### Student.current_level
**Type**: Derived field  
**Justification**: Not strictly derivable from admission year due to repeats, accelerated progression, and leaves of absence. Denormalized for accuracy and query performance.

### Student.enrollment_status
**Type**: Status field  
**Justification**: Current enrollment state. Denormalized to avoid complex event-sourcing pattern and enable fast filtering of active students.

### Grade.student_id
**Type**: Redundant foreign key  
**Justification**: Available via `ModuleRegistration`, but denormalized to enable direct queries like "all grades for student X" without extra joins.

### Grade.module_id
**Type**: Redundant foreign key  
**Justification**: Available via `ModuleRegistration`, but denormalized for efficient indexing and direct module-based grade queries.

### Grade.semester_id
**Type**: Redundant foreign key  
**Justification**: Available via `ModuleRegistration`, but denormalized for semester-based grade filtering and reporting.

### Ranking.degree_path_id
**Type**: Redundant foreign key  
**Justification**: Available via `Student`, but denormalized to preserve program at time of ranking and enable fast program leaderboard queries.

### Ranking.gpa
**Type**: Snapshot field  
**Justification**: Point-in-time snapshot. Denormalized to preserve historical ranking values even if grades are corrected later.

### Ranking.weighted_average
**Type**: Snapshot field  
**Justification**: Point-in-time snapshot. Denormalized for historical integrity and audit trail of ranking calculations.

### BulkEnrollmentBatch.total_records
**Type**: Aggregated count  
**Justification**: COUNT of child records. Denormalized to avoid expensive aggregations when displaying batch summaries on dashboards.

### BulkEnrollmentBatch.successful_records
**Type**: Aggregated count  
**Justification**: COUNT WHERE status = SUCCESS. Denormalized for UI responsiveness during batch processing.

### BulkEnrollmentBatch.failed_records
**Type**: Aggregated count  
**Justification**: COUNT WHERE status = FAILED. Denormalized for real-time batch progress monitoring without query overhead.

### ProgramStructure.credits
**Type**: Optional override  
**Justification**: Usually inherits from `Module.credits`, but allows program-specific overrides when same module has different credit values in different programs.

---

## ✅ Conclusion

**Overall Assessment**: Well-designed schema with **intentional, justified denormalization**.

All denormalizations trade minimal storage for significant performance gains or preserve temporal/historical integrity. No problematic violations that would cause update anomalies.

