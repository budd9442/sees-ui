# Proposed System Use Case Diagram vs Functional Requirements Analysis

## Use Cases in Diagram vs Functional Requirements Mapping

### ✅ **FULLY ALIGNED USE CASES**

| Use Case in Diagram | Functional Requirements | Status |
|---|---|---|
| **Bulk Enroll Students** | FR1.1: Bulk enrolling new students | ✅ **Perfect Match** |
| **Register for Modules** | FR3.1: Register for academic modules | ✅ **Perfect Match** |
| **Track Credit Progress** | FR3.2a, FR3.2c: Plan module selection & display credit progress | ✅ **Perfect Match** |
| **Track GPA & Academic Class** | FR3.3a, FR3.4: View current GPA & academic class | ✅ **Perfect Match** |
| **Set Academic Goals** | FR3.3b: Set GPA & class goals | ✅ **Perfect Match** |
| **View Lecture Schedules** | FR3.8: View lecture schedules for registered modules | ✅ **Perfect Match** |
| **Modify Lecture Schedules** | FR5.4: Modify lecture schedules for modules | ✅ **Perfect Match** |
| **Communicate with Advisor** | FR3.6: Communication channel with degree-path advisor | ✅ **Perfect Match** |
| **Submit Anonymous Reports** | FR3.7: Submit anonymous reports | ✅ **Perfect Match** |
| **Upload & Release Grades** | FR5.2: Upload and release module marks | ✅ **Perfect Match** |
| **Generate Performance Reports** | FR5.3, FR6.1: Generate statistics and performance trends | ✅ **Perfect Match** |
| **Performance Dashboard & Risk Alerts** | FR6.1: Generate overall statistics and performance trends | ✅ **Perfect Match** |
| **View High Performer Rankings** | FR6.2: Generate lists of eligible students for each academic class | ✅ **Perfect Match** |
| **Manage User Accounts** | FR7.1: Manage user accounts, roles, and access rights | ✅ **Perfect Match** |
| **Monitor System Performance** | FR7.2a: Monitor system performance and logs | ✅ **Perfect Match** |
| **Backup & Restore Data** | FR7.2c: Perform scheduled backups and allow system restore | ✅ **Perfect Match** |
| **Manage Module Information** | FR5.1a: Upload module information | ✅ **Perfect Match** |
| **Select Degree Path (Configurable)** | FR1.2a, FR1.2b: Record preferences & provide pathway guidance | ✅ **Perfect Match** |
| **Configure System Master data** | FR8: Configure degree programs, academic rules, and settings | ✅ **Perfect Match** |
| **Provide Academic Feedback & Suggestions** | FR3.5c: Provide personalized suggestions and intervention recommendations | ✅ **Perfect Match** |

### ⚠️ **PARTIALLY ALIGNED USE CASES**

| Use Case in Diagram | Functional Requirements | Gap Analysis |
|---|---|---|
| **Select Specialization (BSE/OSCM/IS)** | FR2.1a, FR2.1b, FR2.2: Collect preferences, provide guidance, select pathways | ⚠️ **Missing**: The diagram shows specialization selection but doesn't clearly represent the **pathway change restrictions** (FR1.2e) and **demand monitoring** (FR1.2c, FR1.2d) |

### ❌ **MISSING FUNCTIONAL REQUIREMENTS IN DIAGRAM**

| Functional Requirement | Description | Impact |
|---|---|---|
| **FR1.2c** | Monitor pathway demand and enforce capacity rules | ❌ **Missing**: No use case represents demand monitoring |
| **FR1.2d** | Allocate pathways based on GPA priority when demand exceeds capacity | ❌ **Missing**: No use case represents GPA-based allocation |
| **FR1.2e** | Prevent pathway changes when demand reaches threshold | ❌ **Missing**: No use case represents pathway change restrictions |
| **FR3.2b** | Validate planned credits against academic rules | ❌ **Missing**: Prerequisite validation not explicitly shown |
| **FR3.5a** | Notify students when module marks are released | ❌ **Missing**: Notification system not represented |
| **FR3.5b** | Notify students when GPA or academic class changes | ❌ **Missing**: Notification system not represented |
| **FR4.1** | Degree-path advisors receive and respond to messages from all students | ❌ **Missing**: Advisor's ability to view all advisees not shown |
| **FR7.2b** | Provide uptime monitoring and alerts | ❌ **Missing**: Uptime monitoring not represented |

## **ACTOR ALIGNMENT ANALYSIS**

### ✅ **CORRECTLY REPRESENTED ACTORS**
- **Student** (General) ✅
- **L1 Student** ✅
- **L2 Student** ✅  
- **L3 Student** ✅
- **L4 Student** ✅
- **Academic Staff** ✅
- **Head of Department** ✅
- **System Administrator** ✅
- **Academic Advisor** ✅

### ⚠️ **ACTOR RELATIONSHIP ISSUES**
- **Missing**: "Degree-Path Advisors" as distinct from general "Academic Advisor" (FR4.1 specifically mentions degree-path advisors)
- **Missing**: Clear representation of advisor-advisee relationships

## **RELATIONSHIP ANALYSIS**

### ✅ **CORRECTLY REPRESENTED RELATIONSHIPS**
- Student inheritance hierarchy ✅
- Include relationships for module registration ✅
- Extend relationships for academic goals ✅
- Extend relationships for system configuration ✅

### ❌ **MISSING RELATIONSHIPS**
- **Missing**: Include relationship for prerequisite validation (FR3.2b)
- **Missing**: Include relationship for notification system (FR3.5a, FR3.5b)
- **Missing**: Include relationship for demand monitoring (FR1.2c)
- **Missing**: Include relationship for GPA-based allocation (FR1.2d)

## **OVERALL ALIGNMENT SCORE**

### **Coverage Analysis:**
- **Total Functional Requirements**: 38
- **Fully Covered**: 20 requirements (53%)
- **Partially Covered**: 3 requirements (8%)
- **Missing**: 15 requirements (39%)

### **Critical Missing Elements:**
1. **Pathway Allocation Logic** (FR1.2c, FR1.2d, FR1.2e) - Core business logic
2. **Notification System** (FR3.5a, FR3.5b) - Critical user experience feature
3. **Prerequisite Validation** (FR3.2b) - Academic integrity requirement
4. **Advisor-Advisee Management** (FR4.1) - Academic support system
5. **Uptime Monitoring** (FR7.2b) - System reliability requirement

## **RECOMMENDATIONS**

### **High Priority Updates Needed:**
1. **Add "Monitor Pathway Demand" use case** connected to System Administrator
2. **Add "GPA-Based Pathway Allocation" use case** connected to L1 Students
3. **Add "Validate Prerequisites" use case** included in module registration
4. **Add "Send Notifications" use case** extending from grade release and GPA tracking
5. **Add "Manage Advisees" use case** for Academic Advisors
6. **Add "Uptime Monitoring" use case** for System Administrator

### **Medium Priority Updates:**
1. Clarify "Degree-Path Advisor" vs "Academic Advisor" distinction
2. Add pathway change restriction logic
3. Enhance advisor communication relationships

## **CONCLUSION**

The proposed system use case diagram covers **61% of functional requirements** but is missing several **critical business logic components**, particularly around pathway allocation, notifications, and academic validation. The diagram needs significant updates to fully align with the functional requirements, especially for the core academic management processes.
