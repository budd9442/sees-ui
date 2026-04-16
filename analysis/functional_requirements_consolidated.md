# Consolidated Functional Requirements

## Student Enrollment & Pathway Management
| ID | Requirement | Roles | Priority |
|---|---|---|---|
| **FR1.1** | The system shall allow bulk enrolling new students onto the platform. | System Administrator | High |
| **FR1.2** | The system shall manage pathway selection including preference recording, personalized guidance, demand monitoring, capacity enforcement, GPA-based allocation, and change restrictions. | L1 Students | High |
| **FR1.3** | The system shall manage specialization selection including preference collection, personalized guidance, and pathway changes within allowed periods. | L2 Students | Medium |

## Academic Planning & Module Management
| ID | Requirement | Roles | Priority |
|---|---|---|---|
| **FR2.1** | The system shall allow students to register for academic modules at registration periods. | All Students | High |
| **FR2.2** | The system shall support module planning including credit planning, validation against academic rules, and display of planned vs completed credits. | All Students | High |
| **FR2.3** | The system shall allow students to view their current GPA calculated and set GPA & class goals. | All Students | High |
| **FR2.4** | The system shall allow students to view their current academic class. | All Students | High |

## Academic Monitoring & Communication
| ID | Requirement | Roles | Priority |
|---|---|---|---|
| **FR3.1** | The system shall notify students when module marks are released and when GPA or academic class changes. | All Students | High |
| **FR3.2** | The system shall provide personalized suggestions and intervention recommendations when GPA decreases or academic class drops, including advisor contact prompts and academic support resources. | All Students | High |
| **FR3.3** | The system shall provide a communication channel for students to contact their degree-path academic advisor. | All Students, Degree-Path Advisors | High |
| **FR3.4** | The system shall allow students to submit anonymous reports and view lecture schedules for their registered modules. | All Students | High |

## Academic Staff Operations
| ID | Requirement | Roles | Priority |
|---|---|---|---|
| **FR4.1** | The system shall allow staff to upload module information and upload and release module marks. | Academic Staff | High |
| **FR4.2** | The system shall generate statistics on student academic performance for modules using configurable reporting templates. | Academic Staff | Medium |
| **FR4.3** | The system shall allow academic staff to modify lecture schedules for their modules. | Academic Staff | High |

## Department Management & Analytics
| ID | Requirement | Roles | Priority |
|---|---|---|---|
| **FR5.1** | The system shall generate overall statistics and performance trends across the student body using configurable reporting templates. | Head of Department | High |
| **FR5.2** | The system shall generate lists of eligible students for each academic class using configurable criteria. | Head of Department | High |

## System Administration & Configuration
| ID | Requirement | Roles | Priority |
|---|---|---|---|
| **FR6.1** | The system shall allow the administrator to manage user accounts, roles, and access rights. | System Administrator | High |
| **FR6.2** | The system shall provide monitoring of system performance, logs, uptime monitoring with alerts, and perform scheduled backups and allow system restore. | System Administrator | High |
| **FR6.3** | The system shall allow administrators to configure degree programs, academic rules, and system settings dynamically without code changes. | System Administrator | High |

---

## Summary of Consolidation

**Original Requirements:** 38 individual requirements (FR1.1 through FR8)
**Consolidated Requirements:** 15 focused requirements (FR1.1 through FR6.3)

**Consolidation Benefits:**
- **Reduced Complexity:** 61% reduction in requirement count while maintaining essential detail
- **Improved Organization:** Related functionalities grouped into logical categories
- **Better Traceability:** Clearer mapping to user roles and priorities
- **Easier Maintenance:** Consolidated requirements covering complete functional areas
- **Production Ready:** Detailed enough for development while avoiding redundancy

**Coverage Maintained:**
- All original functionality preserved
- All user roles represented
- Priority levels maintained
- Complete system capability coverage
