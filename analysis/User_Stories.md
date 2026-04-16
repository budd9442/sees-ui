# User Stories for Student Enrollment & Evaluation System (SEES)

| Role | Story ID | Description |
|---|---|---|
| Student (L1) | US-01 | As an L1 student, I want to select my degree path, so I can continue in a suitable program. |
| Student (L2) | US-02 | As an L2 student, I want to choose a specialization, so I can access relevant modules. |
| Student | US-03 | As a student, I want to register for modules, so I can enroll each semester within rules. |
| Student | US-04 | As a student, I want to view my timetable, so I can plan my week. |
| Student | US-05 | As a student, I want to track my earned credits, so I know progress toward graduation. |
| Student | US-06 | As a student, I want to view my GPA and academic class, so I understand my standing. |
| Student | US-07 | As a student, I want feedback when GPA/class drops, so I can take corrective actions. |
| Student | US-08 | As a student, I want to set academic goals, so I can track progress to targets. |
| Student | US-09 | As a student, I want to communicate with my advisor, so I can get guidance. |
| Student | US-10 | As a student, I want to submit anonymous reports, so I can safely raise concerns. |
| Academic Staff | US-11 | As staff, I want to upload and release grades, so students receive results promptly. |
| Academic Staff | US-12 | As staff, I want to modify lecture schedules within constraints, so I can resolve conflicts. |
| Academic Staff | US-13 | As staff, I want to manage module information, so details remain accurate. |
| HOD | US-14 | As HOD, I want to generate downloadable performance reports, so I can share formal summaries for reviews. |
| HOD | US-15 | As HOD, I want a live performance dashboard with risk alerts, so I can act early on emerging issues. |
| System Administrator | US-16 | As an admin, I want to bulk enroll students, so new intakes are onboarded efficiently. |
| System Administrator | US-17 | As an admin, I want to manage user accounts and roles, so access is controlled. |
| System Administrator | US-18 | As an admin, I want to configure degree programs and academic rules, so the system adapts without code changes. |
| System Administrator | US-19 | As an admin, I want to configure GPA formulas and grading schemes, so calculations match policy. |
| System Administrator | US-20 | As an admin, I want to configure academic calendar and feature flags, so timelines and features reflect policy. |
| System Administrator | US-21 | As an admin, I want to configure notification and report templates, so communications are consistent. |
| System Administrator | US-22 | As an admin, I want to back up and restore data, so I can recover from incidents. |
| System Administrator | US-23 | As an admin, I want to monitor system health and usage, so I can ensure reliability. |
| Advisor | US-24 | As an advisor, I want to view advisees’ GPA trends and alerts, so I can intervene early. |
| Advisor | US-25 | As an advisor, I want to message students and schedule sessions, so I can support them effectively. |

## Acceptance Criteria (samples)
- US-03 Register for modules: prerequisites, credit limits, and capacity are validated; success or waitlist shown.
- US-06 View GPA/class: GPA computed via configured formula; class via configured thresholds; values match transcript.
- US-07 Feedback: when GPA drops or class declines, system shows actionable suggestions and advisor prompt.
- US-18 Configure programs/rules: changes apply without restart; versioned with audit; conflicts blocked.
- US-22 Backup/restore: scheduled backups succeed; restore verifies data integrity and audits action.

## Non-Functional Notes
- Supports 400+ concurrent users with responsive UI for 95% of requests.
- Configuration changes propagate in real time across modules.
- All key actions are audited with actor, time, and change details.
