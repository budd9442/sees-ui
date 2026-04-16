# Use Case Descriptions for Existing System

## UC-01: Register Modules

| Field | Description |
|---|---|
| **Use Case ID** | UC-01 |
| **Name** | Register Modules |
| **Actors** | Students |
| **Description** | Students register for academic modules by filling out physical forms manually, with basic prerequisite checking. |
| **Pre-Condition** | Student is enrolled in the degree program (MIT or IT) and has access to physical registration forms. |
| **Main Flow** | • Student obtains physical module registration form from faculty office.<br>• Student manually fills out the form with personal details and selected modules.<br>• Student refers to degree guidebook to check module prerequisites and credit requirements.<br>• Student submits the completed form to the academic office.<br>• Office manually processes the registration form and checks basic prerequisites.<br>• Office manually verifies credit limits (minimum 30 credits per year, maximum per semester).<br>• Registration is completed, and student is enrolled in selected modules. |
| **Post-Condition** | Student is registered for modules and can attend exams. |
| **Alternative Flows** | • If prerequisites not met: Registration is rejected and student is notified.<br>• If credit limit exceeded: Registration is adjusted to meet limits. |

## UC-02: Select Degree Program (eKel)

| Field | Description |
|---|---|
| **Use Case ID** | UC-02 |
| **Name** | Select Degree Program (eKel) |
| **Actors** | Students |
| **Description** | Students select their degree program (MIT or IT) through the Learning Management System (eKel) at the beginning of 2nd year. |
| **Pre-Condition** | Student has completed foundation year (1st year) requirements and has access to eKel system. |
| **Main Flow** | • Student logs into the eKel Learning Management System.<br>• Student navigates to degree program selection section.<br>• Student reviews available degree programs (MIT and IT) and their requirements.<br>• Student selects preferred degree program from available options.<br>• System records the degree program selection in eKel database.<br>• Student receives confirmation of degree program selection. |
| **Post-Condition** | Student's degree program is recorded and they can proceed to pathway selection in 2nd year. |
| **Alternative Flows** | • If MIT selected: Student proceeds to pathway selection in 2nd year, then specialization selection in 3rd year.<br>• If IT selected: Student proceeds to pathway selection in 2nd year, then directly to module selection. |

## UC-03: Select Specialization (eKel)

| Field | Description |
|---|---|
| **Use Case ID** | UC-03 |
| **Name** | Select Specialization (eKel) |
| **Actors** | Students |
| **Description** | MIT students select their specialization (BSE, OSCM, or IS) through the Learning Management System (eKel) at the beginning of 3rd year. |
| **Pre-Condition** | Student has selected MIT degree program, completed 2nd year pathway selection, and has access to eKel system. |
| **Main Flow** | • Student logs into the eKel Learning Management System.<br>• Student navigates to specialization selection section.<br>• Student reviews three specialization options (BSE, OSCM, IS) and their requirements.<br>• Student selects preferred specialization from available options.<br>• System records the specialization selection in eKel database.<br>• Student receives confirmation of specialization selection. |
| **Post-Condition** | Student's specialization is recorded and they can access specialization-specific modules for 3rd year. |
| **Alternative Flows** | • If student changes mind: Student can modify specialization selection before final confirmation. |

## UC-04: View Results (FIS)

| Field | Description |
|---|---|
| **Use Case ID** | UC-04 |
| **Name** | View Results (FIS) |
| **Actors** | Students |
| **Description** | Students view their exam results through the Faculty Information System (FIS), including detailed grade breakdowns and academic standing. |
| **Pre-Condition** | Student has completed examinations and grades have been uploaded by academic staff. |
| **Main Flow** | • Student logs into the Faculty Information System (FIS).<br>• Student navigates to the results section.<br>• Student selects the academic term or module to view results.<br>• System displays the student's exam results and grades.<br>• Student can view detailed breakdown of marks (theory, practical, guided self-study components).<br>• Student can view cumulative GPA and academic class standing.<br>• Student can check progress toward graduation requirements. |
| **Post-Condition** | Student has viewed their exam results, GPA, and academic performance status. |
| **Alternative Flows** | • If grades not yet uploaded: System displays "Results pending" message.<br>• If student fails module: System shows retake options and requirements. |

## UC-05: Upload Grades (FIS)

| Field | Description |
|---|---|
| **Use Case ID** | UC-05 |
| **Name** | Upload Grades (FIS) |
| **Actors** | Academic Staff |
| **Description** | Academic staff upload student grades into the Faculty Information System (FIS). |
| **Pre-Condition** | Academic staff has completed grading of student assessments and has access to FIS. |
| **Main Flow** | • Academic staff logs into the Faculty Information System (FIS).<br>• Staff navigates to the grade upload section for their module.<br>• Staff manually enters student grades and marks into the system.<br>• Staff verifies all grades are correctly entered.<br>• Staff submits the grades to make them available to students.<br>• System updates student records with new grades. |
| **Post-Condition** | Student grades are uploaded and available for viewing in FIS. |

## UC-06: Check Class Eligibility (Manual)

| Field | Description |
|---|---|
| **Use Case ID** | UC-06 |
| **Name** | Check Class Eligibility (Manual) |
| **Actors** | Academic Staff, Head of Department |
| **Description** | Staff and HOD manually verify student graduation eligibility and class standing based on degree requirements. |
| **Pre-Condition** | Student has completed required courses and staff has access to student records. |
| **Main Flow** | • Staff retrieves student's academic transcript and course history.<br>• Staff manually reviews completed courses against graduation requirements for specific degree program.<br>• Staff checks if student meets minimum GPA requirements (2.00 for graduation, 3.70+ for First Class).<br>• Staff verifies completion of required credit hours (132 credits for Honours, 102 for regular degree).<br>• Staff checks completion of mandatory courses (INTE 31356, GNCT 32216, research project).<br>• Staff manually calculates and confirms student's academic class standing.<br>• Staff documents eligibility status and class standing in student records. |
| **Post-Condition** | Student's graduation eligibility and class standing are verified and recorded. |

## UC-07: Get Advisor Guidance

| Field | Description |
|---|---|
| **Use Case ID** | UC-07 |
| **Name** | Get Advisor Guidance |
| **Actors** | Students, Academic Advisors |
| **Description** | Students receive academic guidance from advisors through physical meetings or email communication. |
| **Pre-Condition** | Student is assigned an academic advisor and needs academic support or guidance. |
| **Main Flow** | • Student identifies need for academic guidance or support.<br>• Student contacts advisor via email or schedules physical meeting.<br>• Advisor reviews student's academic record and current situation.<br>• Advisor provides personalized guidance and recommendations.<br>• Advisor documents the guidance session and follow-up actions.<br>• Student receives guidance and implements recommendations. |
| **Post-Condition** | Student has received academic guidance and support from their advisor. |

## UC-08: Get Trends & Stats (Manual)

| Field | Description |
|---|---|
| **Use Case ID** | UC-08 |
| **Name** | Get Trends & Stats (Manual) |
| **Actors** | Head of Department |
| **Description** | HOD manually generates department performance trends and statistics for analysis. |
| **Pre-Condition** | HOD needs performance data and has access to student records and grade information. |
| **Main Flow** | • HOD collects student performance data from various sources (FIS, manual records).<br>• HOD manually compiles grade distributions and pass rates.<br>• HOD calculates department-wide statistics and trends.<br>• HOD analyzes performance patterns and identifies areas of concern.<br>• HOD prepares manual reports and presentations for department review.<br>• HOD documents findings and recommendations. |
| **Post-Condition** | Department performance trends and statistics are generated for decision-making. |

## UC-09: Get Module Stats (Manual)

| Field | Description |
|---|---|
| **Use Case ID** | UC-09 |
| **Name** | Get Module Stats (Manual) |
| **Actors** | Academic Staff |
| **Description** | Academic staff manually generate module performance statistics for course analysis. |
| **Pre-Condition** | Staff has completed grading and needs to analyze module performance. |
| **Main Flow** | • Staff collects grade data for their specific module from FIS.<br>• Staff manually calculates pass rates, grade distributions, and averages.<br>• Staff analyzes student performance patterns and trends.<br>• Staff identifies areas where students struggled or excelled.<br>• Staff prepares manual reports on module performance.<br>• Staff documents recommendations for course improvement. |
| **Post-Condition** | Module performance statistics are generated for course evaluation and improvement. |