# Activity Diagram to Sequence Diagram Mapping

This document provides a comprehensive mapping between each activity diagram and its corresponding sequence diagram in the Student Enrollment System.

## Primary Mappings (Main System Functions)

| # | Activity Diagram | Sequence Diagram | Use Case Description |
|---|------------------|------------------|----------------------|
| 01 | `Activity_Backup_Restore_Data.drawio` | `01_Sequence_Backup_Restore_Data.puml` | Admin backup and restore system data |
| 02 | `Activity_Bulk_Enroll_Students.drawio` | `02_Sequence_Bulk_Enroll_Students.puml` | Admin bulk enrollment of students |
| 03 | `Activity_Communicate_With_Advisor.drawio` | `03_Sequence_Communicate_With_Advisor.puml` | Student-advisor communication system |
| 04 | `Activity_Configure_System_Settings.drawio` | `04_Sequence_Configure_System_Settings.puml` | Admin system configuration management |
| 05 | `Activity_Generate_Performance_Reports.drawio` | `05_Sequence_Generate_Performance_Reports.puml` | HOD performance report generation |
| 06 | `Activity_Manage_Module_Information.drawio` | `06_Sequence_Manage_Module_Information.puml` | Staff module information management |
| 07 | `Activity_Manage_User_Accounts.drawio` | `07_Sequence_Manage_User_Accounts.puml` | Admin user account management |
| 08 | `Activity_Modify_Lecture_Schedules.drawio` | `08_Sequence_Modify_Lecture_Schedules.puml` | Staff lecture schedule modification |
| 09 | `Activity_Monitor_System_Performance.drawio` | `09_Sequence_Monitor_System_Performance.puml` | Admin system performance monitoring |
| 10 | `Activity_Provide_Academic_Feedback.drawio` | `10_Sequence_Provide_Academic_Feedback.puml` | System academic feedback provision |
| 11 | `Activity_Register_For_Modules.drawio` | `11_Sequence_Register_For_Modules.puml` | Student module registration |
| 12 | `Activity_Select_Degree_Path.drawio` | `12_Sequence_Select_Degree_Path.puml` | L1 student degree path selection |
| 13 | `Activity_Select_Specialization.drawio` | `13_Sequence_Select_Specialization.puml` | L2 student specialization selection |
| 14 | `Activity_Set_Academic_Goals.drawio` | `14_Sequence_Set_Academic_Goals.puml` | Student academic goal setting |
| 15 | `Activity_Submit_Anonymous_Reports.drawio` | `15_Sequence_Submit_Anonymous_Reports.puml` | Student anonymous report submission |
| 16 | `Activity_Track_Credit_Progress.drawio` | `16_Sequence_Track_Credit_Progress.puml` | Student credit progress tracking |
| 17 | `Activity_Track_GPA_Academic_Class.drawio` | `17_Sequence_Track_GPA_Academic_Class.puml` | Student GPA and academic class tracking |
| 18 | `Activity_Upload_Release_Grades.drawio` | `18_Sequence_Upload_Release_Grades.puml` | Staff grade upload and release |
| 19 | `Activity_View_High_Performer_Rankings.drawio` | `19_Sequence_View_High_Performer_Rankings.puml` | HOD high performer rankings view |
| 20 | `Activity_View_Lecture_Schedules.drawio` | `20_Sequence_View_Lecture_Schedules.puml` | Student lecture schedule viewing |

## Legacy/Alternative Mappings (UC Series)

| Activity Diagram | Description | Notes |
|------------------|-------------|-------|
| `Activity_UC01_Register_Modules.drawio` | Legacy module registration | Alternative to #11 |
| `Activity_UC02_Select_Degree_Program.drawio` | Legacy degree program selection | Alternative to #12 |
| `Activity_UC03_Select_Specialization.drawio` | Legacy specialization selection | Alternative to #13 |
| `Activity_UC04_View_Results.drawio` | Legacy results viewing | Not mapped to sequence |
| `Activity_UC06_Check_Eligibility.drawio` | Legacy eligibility checking | Not mapped to sequence |
| `Activity_UC07_Advisor_Guidance.drawio` | Legacy advisor guidance | Alternative to #03 |
| `Activity_UC08_Trends_Stats.drawio` | Legacy trends and statistics | Alternative to #05 |
| `Activity_UC09_Module_Stats.drawio` | Legacy module statistics | Alternative to #05 |

## Additional Activity Diagrams (No Direct Sequence Mapping)

| Activity Diagram | Description | Status |
|------------------|-------------|--------|
| `Activity_Track_Performance_Trends.drawio` | Performance trends tracking | Standalone activity |
| `example activity diagram.drawio` | Template/example | Not a functional diagram |

## Key Mapping Notes

### 1. **Preference-Based Selection System**
- **#12 Degree Path Selection**: Updated to use preference-based bulk allocation
- **#13 Specialization Selection**: Updated to use preference-based bulk allocation
- Both now follow: Submit Preferences → Bulk Processing → Allocation Result

### 2. **Simplified Sequence Diagrams**
All sequence diagrams have been simplified to match activity diagram complexity:
- Removed excessive validation and error handling
- Maintained all controllers and entities
- Focused on main happy-path flow
- Eliminated nested control structures

### 3. **Actor Mappings**
- **Student**: Primary user for academic functions (11, 12, 13, 14, 15, 16, 17, 20)
- **Admin**: System management functions (01, 02, 04, 07, 09)
- **Staff**: Academic content management (06, 08, 18)
- **HOD**: Reporting and analytics (05, 19)
- **Advisor**: Communication and guidance (03, 10)

### 4. **System Flow Consistency**
Each activity-sequence pair maintains:
- Same actors and primary entities
- Consistent business logic flow
- Matching decision points
- Aligned data flow patterns

## File Naming Convention

**Activity Diagrams**: `Activity_[Function_Name].drawio`
**Sequence Diagrams**: `[Number]_Sequence_[Function_Name].puml`

The numbering system (01-20) provides a logical ordering of system functions from administrative tasks to student-facing features.
