# Use Case Descriptions for Student Enrollment and Evaluation System (Updated)

## 5.2.1 Bulk Enroll Students

| Field | Description |
|---|---|
| **Name of Use Case** | Bulk Enroll Students |
| **Use Case ID** | UCD-01 |
| **Description** | System administrator enrolls multiple new L1 students onto the platform using batch processing. |
| **Actors** | System Administrator |
| **Preconditions** | Administrator is logged in with appropriate privileges and student data file is prepared. |
| **Postconditions** | Valid students are enrolled, user accounts created, and confirmation notifications sent. |
| **Flow** | 1. Administrator uploads student data file (CSV/Excel).<br>2. System validates student information and checks for duplicates.<br>3. System creates user accounts for valid entries.<br>4. System sends enrollment confirmations and provides summary report. |
| **Alternative Flows** | If some records are invalid, system processes valid ones and generates error report for invalid entries. |
| **Requirements** | Data validation, duplicate detection, rollback capabilities, notification templates. |

## 5.2.2 Select Degree Path (Configurable)

| Field | Description |
|---|---|
| **Name of Use Case** | Select Degree Path (Configurable) |
| **Use Case ID** | UCD-02 |
| **Description** | L1 students select their degree pathway from configurable degree programs after completing first year, subject to demand-based allocation rules. |
| **Actors** | L1 Student |
| **Preconditions** | Student is logged in as L1 student, has completed foundation year, and pathway selection period is active. |
| **Postconditions** | Student's degree pathway is allocated based on demand rules, and pathway change restrictions are applied. |
| **Flow** | 1. Student accesses pathway selection interface.<br>2. System displays available degree programs and current demand statistics.<br>3. Student selects preferred pathway.<br>4. System checks current demand for selected pathway.<br>5. **If demand < threshold**: System allows free selection and confirms choice.<br>6. **If demand ≥ threshold**: System allocates based on GPA priority rules.<br>7. System updates student record and generates confirmation document. |
| **Alternative Flows** | **High Demand**: If demand exceeds threshold, system allocates based on GPA ranking criteria. |
| **Requirements** | Demand calculation, priority allocation, pathway change restrictions, communication of allocation rules. |

## 5.2.3 Configure System Settings

| Field | Description |
|---|---|
| **Name of Use Case** | Configure System Settings |
| **Use Case ID** | UCD-03 |
| **Description** | System administrator configures degree programs, academic rules, GPA calculations, and system settings dynamically without code changes. |
| **Actors** | System Administrator |
| **Preconditions** | Administrator is logged in with configuration privileges and system is operational. |
| **Postconditions** | System configuration is updated, all modules reflect new settings, and changes are logged for audit. |
| **Flow** | 1. Administrator accesses configuration management interface.<br>2. Administrator modifies settings (programs, rules, calculations).<br>3. System validates configuration changes.<br>4. System applies changes across all modules and updates user interfaces.<br>5. Administrator receives confirmation of successful configuration. |
| **Alternative Flows** | If configuration validation fails, system displays specific error messages and prevents changes. |
| **Requirements** | Dynamic configuration without system restart, real-time updates, configuration validation, audit trail. |

## 5.2.4 Select Specialization

| Field | Description |
|---|---|
| **Name of Use Case** | Select Specialization |
| **Use Case ID** | UCD-04 |
| **Description** | L2 students choose a specialization (BSE/OSCM/IS) based on configured prerequisites and capacity limits. |
| **Actors** | L2 Student |
| **Preconditions** | Student is logged in as L2 student, specialization selection window is open, and rules are configured. |
| **Postconditions** | Specialization is stored in student profile and relevant modules are enabled. |
| **Flow** | 1. Student opens specialization selection page.<br>2. System displays available specializations with requirements and current capacity.<br>3. Student selects preferred specialization.<br>4. System validates prerequisites and capacity availability.<br>5. System confirms selection and updates student profile. |
| **Alternative Flows** | If capacity is full, student is placed on waitlist and notified of status. |
| **Requirements** | Prerequisite validation, capacity checks, waitlist management. |

## 5.2.5 Register for Modules

| Field | Description |
|---|---|
| **Name of Use Case** | Register for Modules |
| **Use Case ID** | UCD-05 |
| **Description** | Students register for academic modules subject to prerequisites, credit limits, and capacity constraints. |
| **Actors** | Student |
| **Preconditions** | Student is logged in and module registration window is open. |
| **Postconditions** | Registration is saved and student is enrolled or placed on waitlist if modules are full. |
| **Flow** | 1. Student accesses module registration interface.<br>2. System displays available modules with prerequisites and capacity information.<br>3. Student selects modules for registration.<br>4. System validates prerequisites, credit limits, and capacity.<br>5. System reserves seats or assigns waitlist position.<br>6. System confirms registration and sends confirmation. |
| **Alternative Flows** | If modules are full, student is placed on waitlist and notified of position. If prerequisites not met, registration is rejected with explanation. |
| **Requirements** | Prerequisite validation, credit limit checks, capacity management, waitlist functionality. |

## 5.2.6 Track GPA & Academic Class

| Field | Description |
|---|---|
| **Name of Use Case** | Track GPA & Academic Class |
| **Use Case ID** | UCD-06 |
| **Description** | Students view their current GPA and academic class computed using configured formulas and thresholds. |
| **Actors** | Student |
| **Preconditions** | Student is logged in and grades are available in the system. |
| **Postconditions** | Current GPA and academic class are displayed with historical trends. |
| **Flow** | 1. Student opens GPA tracking page.<br>2. System retrieves all completed grades and credit information.<br>3. System computes GPA using configured calculation methods.<br>4. System determines academic class based on GPA thresholds.<br>5. System displays current values with historical trends and progress indicators. |
| **Alternative Flows** | If insufficient grades available, system displays message indicating more grades needed for accurate calculation. |
| **Requirements** | GPA calculation formulas, academic class thresholds, historical data tracking, progress visualization. |

## 5.2.7 Set Academic Goals

| Field | Description |
|---|---|
| **Name of Use Case** | Set Academic Goals |
| **Use Case ID** | UCD-07 |
| **Description** | Students set GPA and academic class targets and track their progress toward achieving these goals. |
| **Actors** | Student |
| **Preconditions** | Student is logged in and goal templates are configured in the system. |
| **Postconditions** | Academic goals are saved and progress tracking is enabled with regular updates. |
| **Flow** | 1. Student accesses academic goals page.<br>2. System displays current GPA and academic class status.<br>3. Student sets target GPA and academic class goals.<br>4. System validates goals against realistic parameters.<br>5. System saves goals and enables progress tracking.<br>6. System shows progress indicators and achievement timeline. |
| **Alternative Flows** | If goals are unrealistic, system provides suggestions for achievable targets based on historical data. |
| **Requirements** | Goal templates, progress metrics, achievement tracking, realistic goal validation. |

## 5.2.8 Upload & Release Grades

| Field | Description |
|---|---|
| **Name of Use Case** | Upload & Release Grades |
| **Use Case ID** | UCD-08 |
| **Description** | Academic staff upload grades for modules, system validates and stores them, then recalculates student metrics and sends notifications. |
| **Actors** | Academic Staff |
| **Preconditions** | Staff is logged in with grading permissions and grading scheme is configured. |
| **Postconditions** | Grades are stored, GPA and academic class are recalculated, and students receive notifications. |
| **Flow** | 1. Staff accesses grade upload interface for their modules.<br>2. Staff uploads grade file or enters grades manually.<br>3. System validates grades against configured grading scheme.<br>4. Staff reviews and confirms grade submission.<br>5. System stores grades and recalculates affected student metrics.<br>6. Staff releases grades to students.<br>7. System sends notifications to students about grade availability. |
| **Alternative Flows** | If validation fails, system displays specific errors and prevents submission until corrected. |
| **Requirements** | Grade validation, metric recalculation, notification system, grade release controls. |

## 5.2.9 Generate Performance Reports (Downloadable)

| Field | Description |
|---|---|
| **Name of Use Case** | Generate Performance Reports (Downloadable) |
| **Use Case ID** | UCD-09 |
| **Description** | Head of Department generates configurable performance reports and exports them in multiple formats for formal reviews and sharing. |
| **Actors** | Head of Department |
| **Preconditions** | HOD is logged in and report templates are configured in the system. |
| **Postconditions** | Report is generated and exported, and export metadata is archived for audit purposes. |
| **Flow** | 1. HOD opens reporting interface and selects report type.<br>2. HOD configures filters (date range, cohorts, modules, etc.).<br>3. System compiles data and generates report using configured templates.<br>4. HOD reviews report preview and makes adjustments if needed.<br>5. HOD selects export format (PDF/Excel/CSV) and downloads report.<br>6. System archives export metadata including timestamp and parameters used. |
| **Alternative Flows** | If data is insufficient for selected filters, system suggests alternative parameters or partial data options. |
| **Requirements** | Configurable report templates, multi-format export capabilities, export auditing, data filtering options. |

## 5.2.10 View Lecture Schedules

| Field | Description |
|---|---|
| **Name of Use Case** | View Lecture Schedules |
| **Use Case ID** | UCD-10 |
| **Description** | Students view their personalized lecture schedules with timetable information for registered modules. |
| **Actors** | Student |
| **Preconditions** | Student is logged in and lecture schedules are published for the current semester. |
| **Postconditions** | Student's personalized schedule is displayed with options to export or sync with calendar. |
| **Flow** | 1. Student opens schedule view from dashboard or navigation menu.<br>2. System retrieves student's registered modules and associated schedule data.<br>3. System displays timetable in calendar format with lecture times, venues, and instructor information.<br>4. Student can filter by week, month, or specific modules.<br>5. Student can export schedule or sync with external calendar applications. |
| **Alternative Flows** | If no schedules are published yet, system displays message with expected publication date. |
| **Requirements** | Calendar display, schedule filtering, export functionality, external calendar integration. |

## 5.2.11 Modify Lecture Schedules

| Field | Description |
|---|---|
| **Name of Use Case** | Modify Lecture Schedules |
| **Use Case ID** | UCD-11 |
| **Description** | Academic staff update lecture slots, venues, or times and notify all impacted students about changes. |
| **Actors** | Academic Staff |
| **Preconditions** | Staff is logged in with schedule modification permissions and has modules assigned. |
| **Postconditions** | Schedule is updated, affected students are notified, and change history is logged. |
| **Flow** | 1. Staff accesses schedule management interface for their modules.<br>2. Staff selects lecture slot to modify (time, venue, or instructor).<br>3. System validates changes against room availability and conflicts.<br>4. Staff confirms modifications and provides reason for change.<br>5. System updates schedule and identifies all affected students.<br>6. System sends notifications to impacted students with change details.<br>7. System logs change history for audit purposes. |
| **Alternative Flows** | If room conflicts exist, system suggests alternative venues or times. If too many students affected, system may require additional approval. |
| **Requirements** | Schedule validation, conflict detection, student notification system, change logging, approval workflows. |

## 5.2.12 Communicate with Advisor

| Field | Description |
|---|---|
| **Name of Use Case** | Communicate with Advisor |
| **Use Case ID** | UCD-12 |
| **Description** | Students and academic advisors exchange messages, schedule meetings, and maintain ongoing academic support communication. |
| **Actors** | Student, Academic Advisor |
| **Preconditions** | Both student and advisor are logged in, and advisor assignment exists in the system. |
| **Postconditions** | Messages are saved, meetings are scheduled, and communication history is maintained. |
| **Flow** | 1. Student or advisor opens communication interface.<br>2. User selects recipient and composes message with optional attachments.<br>3. System validates message content and sends notification to recipient.<br>4. Recipient receives notification and can view/respond to message.<br>5. Users can schedule meetings through integrated calendar system.<br>6. System sends meeting reminders and maintains communication history. |
| **Alternative Flows** | If advisor is unavailable, system can route urgent messages to backup advisor or department head. |
| **Requirements** | Messaging system, meeting scheduling, notification system, communication history, file attachments. |

## 5.2.13 Submit Anonymous Reports

| Field | Description |
|---|---|
| **Name of Use Case** | Submit Anonymous Reports |
| **Use Case ID** | UCD-13 |
| **Description** | Students submit anonymous reports about academic issues, concerns, or incidents that are routed to appropriate administrators. |
| **Actors** | Student |
| **Preconditions** | Student is logged in and anonymous reporting channel is enabled in the system. |
| **Postconditions** | Report is stored securely, flagged for review, and routed to appropriate administrators. |
| **Flow** | 1. Student accesses anonymous reporting form from dashboard or navigation.<br>2. Student selects report category (academic, administrative, safety, etc.).<br>3. Student provides detailed description of the issue or concern.<br>4. System strips identifying information and assigns unique tracking number.<br>5. System routes report to appropriate administrator based on category.<br>6. System sends confirmation to student with tracking number for follow-up.<br>7. Administrator receives notification and can respond through secure channel. |
| **Alternative Flows** | If urgent safety concerns are reported, system can escalate immediately to security or emergency contacts. |
| **Requirements** | Anonymous submission, secure routing, tracking system, administrator notification, response management. |

## 5.2.14 Track Credit Progress

| Field | Description |
|---|---|
| **Name of Use Case** | Track Credit Progress |
| **Use Case ID** | UCD-14 |
| **Description** | Students track their completed credits against program requirements and monitor progress toward graduation. |
| **Actors** | Student |
| **Preconditions** | Student is logged in and program credit requirements are configured in the system. |
| **Postconditions** | Student's credit progress is displayed with completion status and remaining requirements. |
| **Flow** | 1. Student opens credit progress page from dashboard or navigation.<br>2. System retrieves student's completed modules and credit information.<br>3. System calculates completed credits by category (core, elective, specialization, etc.).<br>4. System compares against program requirements and displays progress indicators.<br>5. System shows remaining credits needed and suggests upcoming modules.<br>6. Student can view detailed breakdown by semester and module type. |
| **Alternative Flows** | If student is behind on credits, system provides warnings and suggests summer courses or additional modules. |
| **Requirements** | Credit calculation, progress tracking, requirement validation, graduation planning, module suggestions. |

## 5.2.15 Performance Dashboard & Risk Alerts

| Field | Description |
|---|---|
| **Name of Use Case** | Performance Dashboard & Risk Alerts |
| **Use Case ID** | UCD-15 |
| **Description** | Head of Department views live dashboards with cohort performance trends and risk alerts to identify at-risk student groups. |
| **Actors** | Head of Department |
| **Preconditions** | HOD is logged in and historical performance data is available in the system. |
| **Postconditions** | Live performance charts are displayed with risk alerts surfaced and drill-down capabilities enabled. |
| **Flow** | 1. HOD opens performance dashboard from main navigation.<br>2. System loads real-time KPIs, trends, and risk signals across all cohorts.<br>3. HOD can filter dashboard by specific cohorts, modules, or time periods.<br>4. System highlights at-risk student segments with color-coded alerts.<br>5. HOD can drill down into specific risk areas for detailed analysis.<br>6. System provides intervention recommendations and resource allocation suggestions. |
| **Alternative Flows** | If risk thresholds are exceeded, system can automatically notify advisors and suggest immediate interventions. |
| **Requirements** | Real-time data aggregation, performance visualizations, risk alert thresholds, drill-down capabilities, intervention recommendations. |

## 5.2.16 Manage User Accounts

| Field | Description |
|---|---|
| **Name of Use Case** | Manage User Accounts |
| **Use Case ID** | UCD-16 |
| **Description** | System administrator manages user accounts, roles, permissions, and access rights across the platform. |
| **Actors** | System Administrator |
| **Preconditions** | Administrator is logged in with user management privileges and role-based access control is configured. |
| **Postconditions** | User accounts are updated, role changes are applied, and all modifications are audited. |
| **Flow** | 1. Administrator accesses user management interface from admin dashboard.<br>2. Administrator searches for specific users or views user lists with filters.<br>3. Administrator selects user and views current account details and permissions.<br>4. Administrator modifies user information, roles, or access rights as needed.<br>5. System validates changes against security policies and role constraints.<br>6. System applies changes and updates user permissions across all modules.<br>7. System logs all changes for audit purposes and notifies affected users. |
| **Alternative Flows** | If role changes affect critical permissions, system may require additional approval or confirmation. |
| **Requirements** | Role-based access control, user search and filtering, permission management, audit logging, security validation. |

## 5.2.17 Monitor System Performance

| Field | Description |
|---|---|
| **Name of Use Case** | Monitor System Performance |
| **Use Case ID** | UCD-17 |
| **Description** | System administrator monitors system metrics, logs, health status, and performance indicators to ensure optimal operation. |
| **Actors** | System Administrator |
| **Preconditions** | Administrator is logged in with monitoring privileges and system monitoring is enabled. |
| **Postconditions** | System metrics are visible, alerts are actionable, and performance issues are identified. |
| **Flow** | 1. Administrator opens system monitoring dashboard from admin interface.<br>2. System displays real-time KPIs including response times, error rates, and resource usage.<br>3. Administrator can view detailed logs, system health status, and performance trends.<br>4. System highlights any alerts or performance issues requiring attention.<br>5. Administrator can drill down into specific metrics or time periods for detailed analysis.<br>6. Administrator can configure alert thresholds and notification settings. |
| **Alternative Flows** | If critical issues are detected, system can automatically escalate alerts and suggest remediation actions. |
| **Requirements** | Real-time monitoring, performance metrics, log analysis, alerting system, health status indicators. |

## 5.2.18 Backup & Restore Data

| Field | Description |
|---|---|
| **Name of Use Case** | Backup & Restore Data |
| **Use Case ID** | UCD-18 |
| **Description** | System administrator performs secure data backup operations and restores data from backup when needed for disaster recovery. |
| **Actors** | System Administrator |
| **Preconditions** | Administrator is logged in with backup privileges and secure storage is configured. |
| **Postconditions** | Backup/restore operation is completed successfully and all actions are audited for compliance. |
| **Flow** | 1. Administrator accesses backup and restore interface from admin dashboard.<br>2. Administrator selects backup type (full, incremental, or selective) and data scope.<br>3. System validates backup parameters and checks storage availability.<br>4. System performs backup operation with integrity checks and encryption.<br>5. System verifies backup integrity and stores metadata for future reference.<br>6. Administrator receives confirmation with backup details and location information. |
| **Alternative Flows** | For restore operations, administrator can select specific backup point and restore scope (full system or selective data). |
| **Requirements** | Secure backup storage, data encryption, integrity verification, restore capabilities, audit logging, disaster recovery planning. |

## 5.2.19 Manage Module Information

| Field | Description |
|---|---|
| **Name of Use Case** | Manage Module Information |
| **Use Case ID** | UCD-19 |
| **Description** | Academic staff manage module metadata including descriptions, prerequisites, credit values, and scheduling information. |
| **Actors** | Academic Staff |
| **Preconditions** | Staff is logged in with module management permissions and has modules assigned to them. |
| **Postconditions** | Module details are updated, changes are published, and version history is maintained. |
| **Flow** | 1. Staff accesses module management interface from staff dashboard.<br>2. Staff selects module to edit or creates new module entry.<br>3. Staff updates module fields (title, description, prerequisites, credits, schedule).<br>4. System validates changes against academic rules and constraints.<br>5. Staff reviews changes and saves modifications.<br>6. System publishes updates and maintains version history.<br>7. System notifies affected students and advisors of module changes. |
| **Alternative Flows** | If changes affect student registrations, system may require additional approval or provide impact analysis. |
| **Requirements** | Module validation, version control, change notification, impact analysis, academic rule enforcement. |

## 5.2.20 Provide Academic Feedback & Suggestions

| Field | Description |
|---|---|
| **Name of Use Case** | Provide Academic Feedback & Suggestions |
| **Use Case ID** | UCD-20 |
| **Description** | System automatically surfaces personalized academic feedback and intervention suggestions when student GPA decreases or academic class drops. |
| **Actors** | Student |
| **Preconditions** | Student is logged in and GPA or academic class has been recalculated with changes detected. |
| **Postconditions** | Personalized feedback is displayed to student with optional advisor contact prompts and academic support resources. |
| **Flow** | 1. System detects GPA decrease or academic class drop during grade processing.<br>2. System evaluates student's academic history and current performance patterns.<br>3. System generates personalized suggestions based on configured intervention rules.<br>4. System displays feedback to student with specific recommendations and resources.<br>5. Student can access suggested academic support services and resources.<br>6. System optionally prompts student to contact their academic advisor for additional support. |
| **Alternative Flows** | If student's performance continues to decline, system can escalate alerts to advisors and suggest more intensive interventions. |
| **Requirements** | Performance monitoring, intervention rule engine, personalized feedback generation, resource recommendations, advisor escalation. |

## 5.2.21 View High Performer Rankings (Batch Top)

| Field | Description |
|---|---|
| **Name of Use Case** | View High Performer Rankings (Batch Top) |
| **Use Case ID** | UCD-21 |
| **Description** | Head of Department views ranked lists of top-performing students by batch with configurable weighted-average tiebreaker for GPA ties. |
| **Actors** | Head of Department |
| **Preconditions** | HOD is logged in, grades are finalized for the selected period, and weighted-average formula is configured. |
| **Postconditions** | Ranked list is displayed with tie-break decisions indicated and rankings are optionally exported. |
| **Flow** | 1. HOD opens Rankings page and selects batch/semester for analysis.<br>2. System computes GPA-based ranking for all students in the selected batch.<br>3. System identifies students with tied GPAs and applies weighted-average formula using configured weights.<br>4. System reorders tied students based on weighted-average calculations.<br>5. System displays final rankings with clear tie-break annotations and explanations.<br>6. HOD can export rankings in PDF/Excel/CSV format for official records. |
| **Alternative Flows** | If weighted-average formula is not configured, system uses default tie-breaking rules or alphabetical ordering. |
| **Requirements** | Configurable weighted-average formula, transparent tie-break rule application, ranking export capabilities, batch filtering. |
