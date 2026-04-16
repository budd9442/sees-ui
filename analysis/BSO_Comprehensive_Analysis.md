# 2.7 Business System Option (BSO)

The options specify a set of alternative solutions to develop the Student Enrollment and Evaluation System (SEES), with different functional scopes and technological features. Each option is matched against the provision of the functionality looked by the users, meeting the business objectives, and facilitating or enhancing operational efficiency.

## 2.7.1 BSO-A: Mobile App Only Solution

### 1. Functional Description and Architectural Overview

**Functional Description:**

BSO-A provides a native mobile application solution focused primarily on student-facing functionalities. It enables student enrollment, pathway selection, module registration, GPA tracking, academic goal setting, and communication with degree-path advisors. The system supports real-time notifications and provides an intuitive mobile interface for students to manage their academic journey. However, it lacks comprehensive staff and administrative capabilities due to mobile platform limitations. This option is ideal for self-development with minimal resource requirements.

**Architectural Overview:**

- **Client-side**: Native mobile applications for iOS and Android platforms
- **Server-side**: Mobile backend services (BaaS) for data synchronization and API management
- **Database**: Cloud-based database optimized for mobile data access patterns
- **Communication**: Real-time push notifications and offline data synchronization

![BSO-A Architecture](images/bso-a-architecture.png)

### 2. Cost-Benefit Analysis

| Cost Component | Description | Cost Estimation (LKR) |
|---|---|---|
| **Backend Services** | Core API and database hosting | 25,000 |
| **Push Notification Service** | Real-time notification infrastructure | 5,000 |
| **API Services** | Third-party API integrations and services | 8,000 |
| **Domain & SSL** | Annual domain registration and SSL certificates | 3,000 |
| **Total** | | **41,000** |

### 3. Benefits

BSO-A offers enhanced student experience through a native mobile interface optimized for student workflows. The system provides real-time notifications with instant alerts for grade releases, GPA changes, and academic updates. Students can access basic information without internet connectivity through offline capability features. This option is cost-effective for student-focused operations with lower development costs for core student functions. The mobile-first approach increases student adoption rates and user engagement.

### 4. Limitations

BSO-A has limited staff functionality and cannot handle complex administrative workflows. The system cannot perform bulk enrollment or administrative tasks due to mobile platform constraints. Mobile device capabilities limit data-intensive operations, and the system cannot generate comprehensive reports or analytics dashboards. These limitations restrict the system's ability to support full university operations.

---

## 2.7.2 BSO-B: Web Platform Only Solution

### 1. Functional Description and Architectural Overview

**Functional Description:**

BSO-B provides a comprehensive web-based platform accessible across all devices and browsers. It includes all student functionalities plus complete staff and administrative capabilities. The system supports bulk operations, comprehensive reporting, analytics dashboards, and full administrative control. It provides responsive design for mobile access but lacks native mobile features like push notifications. This option offers the best balance of functionality and development simplicity for self-implementation.

**Architectural Overview:**

- **Client-side**: Responsive web application accessible on all modern browsers and devices
- **Server-side**: Full-stack web application with comprehensive backend services
- **Database**: Enterprise-grade relational database with full ACID compliance
- **Reporting Engine**: Integrated reporting and analytics capabilities

![BSO-B Architecture](images/bso-b-architecture.png)

### 2. Cost-Benefit Analysis

| Cost Component | Description | Cost Estimation (LKR) |
|---|---|---|
| **Backend Services** | Core API and database hosting | 25,000 |
| **Security Implementation** | SSL certificates and basic security tools | 8,000 |
| **API Services** | Third-party API integrations and services | 10,000 |
| **Domain & Hosting** | Annual domain registration and hosting | 5,000 |
| **Total** | | **48,000** |

### 3. Benefits

BSO-B provides complete functionality supporting all 38 functional requirements with 100% coverage. The system offers cross-platform access working on any device with a modern browser. It includes comprehensive administration with full staff and administrative capabilities. The system features advanced reporting with detailed analytics and customizable reports. The scalable architecture can handle unlimited users and data growth, while enterprise security provides advanced security features and role-based access control.

### 4. Limitations

BSO-B lacks push notification capabilities, which limits real-time communication with students. The system has browser dependency requiring modern browser and internet connectivity at all times. The mobile experience is not optimized for mobile-specific user interactions, and the system has higher development costs due to its comprehensive feature set.

---

## 2.7.3 BSO-C: Hybrid Solution (Recommended)

### 1. Functional Description and Architectural Overview

**Functional Description:**

BSO-C combines the best of both mobile and web platforms, providing native mobile applications for students and a comprehensive web platform for staff and administrators. Students get the mobile experience with real-time notifications, while staff and administrators have full web-based capabilities for complex operations. This hybrid approach optimizes user experience for each user type while maintaining complete system functionality. While more complex to develop, it provides the most comprehensive solution for long-term academic management needs.

**Architectural Overview:**

- **Student Mobile Apps**: Native iOS and Android applications with real-time notifications
- **Staff Web Platform**: Comprehensive web application for administrative operations
- **Unified Backend**: Shared API services supporting both mobile and web clients
- **Integrated Database**: Single database serving both platforms with synchronized data
- **Communication Layer**: Real-time messaging and notification services

![BSO-C Architecture](images/bso-c-architecture.png)

### 2. Cost-Benefit Analysis

| Cost Component | Description | Cost Estimation (LKR) |
|---|---|---|
| **Unified Backend Services** | Shared API and database hosting | 25,000 |
| **Real-time Infrastructure** | Push notifications and live updates | 8,000 |
| **Security Implementation** | SSL certificates and security tools | 10,000 |
| **API Services** | Third-party API integrations and services | 12,000 |
| **Domain & Hosting** | Annual domain registration and hosting | 7,000 |
| **Total** | | **62,000** |

### 3. Benefits

BSO-C provides optimal user experience with tailored interfaces for each user type. The system offers complete functionality supporting all 38 functional requirements with 100% coverage. It features real-time communication with push notifications for students and live updates for staff. The scalable architecture can handle unlimited growth in users and data. The future-proof design makes it easy to extend and modify for new requirements. The system achieves high user adoption through mobile-first approach for students and comprehensive web interface for staff, resulting in streamlined workflows for all user types.

### 4. Limitations

BSO-C has higher development costs as the most expensive option due to dual platform development requirements. The system requires complex maintenance with expertise in both mobile and web technologies. Integration complexity necessitates ensuring seamless data synchronization between platforms, which adds to the overall system complexity.

---

## 2.8 BSO Analysis and Requirements Evaluation

This section examines the functional and non-functional requirements for their suitableness to meet the needs and objectives of the SEES project. From this review, it can be found that each requirement is appropriate to satisfy users' expectations, the functionality of the system, and standards of performance for the selected BSO to reach the intended outcomes.

### 2.8.1 BSO vs Functional Requirements

| ID | Requirement | BSO-A Mobile | BSO-B Web | BSO-C Hybrid |
|---|---|---|---|---|
| FR1.1 | Bulk enroll new students | × | ✓ | ✓ |
| FR1.2a | Record pathway preferences | ✓ | ✓ | ✓ |
| FR1.2b | Personalized pathway guidance | ✓ | ✓ | ✓ |
| FR1.2c | Monitor pathway demand | ✓ | ✓ | ✓ |
| FR1.2d | GPA-based pathway allocation | ✓ | ✓ | ✓ |
| FR1.2e | Prevent pathway changes | ✓ | ✓ | ✓ |
| FR2.1a | Collect specialization preferences | ✓ | ✓ | ✓ |
| FR2.1b | Provide specialization guidance | ✓ | ✓ | ✓ |
| FR2.2 | Select and change pathways | ✓ | ✓ | ✓ |
| FR3.1 | Register for modules | ✓ | ✓ | ✓ |
| FR3.2a | Plan module selection | ✓ | ✓ | ✓ |
| FR3.2b | Validate academic rules | ✓ | ✓ | ✓ |
| FR3.2c | Display credit progress | ✓ | ✓ | ✓ |
| FR3.3a | View current GPA | ✓ | ✓ | ✓ |
| FR3.3b | Set GPA & class goals | ✓ | ✓ | ✓ |
| FR3.4 | View academic class | ✓ | ✓ | ✓ |
| FR3.5a | Notify on grade release | ✓ | × | ✓ |
| FR3.5b | Notify on GPA/class changes | ✓ | × | ✓ |
| FR3.5c | Provide intervention recommendations | ✓ | ✓ | ✓ |
| FR3.6 | Communication with advisors | ✓ | ✓ | ✓ |
| FR3.7 | Submit anonymous reports | ✓ | ✓ | ✓ |
| FR3.8 | View lecture schedules | ✓ | ✓ | ✓ |
| FR4.1 | Advisor messaging system | × | ✓ | ✓ |
| FR5.1a | Upload module information | × | ✓ | ✓ |
| FR5.2 | Upload and release grades | × | ✓ | ✓ |
| FR5.3 | Generate performance statistics | × | ✓ | ✓ |
| FR5.4 | Modify lecture schedules | × | ✓ | ✓ |
| FR6.1 | Generate performance trends | × | ✓ | ✓ |
| FR6.2 | Generate eligible student lists | × | ✓ | ✓ |
| FR7.1 | Manage user accounts | × | ✓ | ✓ |
| FR7.2a | Monitor system performance | × | ✓ | ✓ |
| FR7.2b | Uptime monitoring | × | ✓ | ✓ |
| FR7.2c | Backup and restore | × | ✓ | ✓ |
| FR8 | Configure system settings | × | ✓ | ✓ |

**Coverage Summary:**
- **BSO-A**: 22/38 requirements (58%) - Mobile app limitations for staff/admin tasks
- **BSO-B**: 36/38 requirements (95%) - Full web platform capabilities (no real-time notifications)
- **BSO-C**: 38/38 requirements (100%) - Complete functionality across both platforms

### 2.8.2 BSO vs Non-Functional Requirements

| ID | Requirement | BSO-A Mobile | BSO-B Web | BSO-C Hybrid |
|---|---|---|---|---|
| NFR1 | Support 400+ concurrent users | ✓ | ✓ | ✓ |
| NFR2 | Maintain 95% uptime | ✓ | ✓ | ✓ |
| NFR3 | Implement 2FA and encryption | ✓ | ✓ | ✓ |
| NFR4 | Allow expansion for new modules | ✓ | ✓ | ✓ |
| NFR5 | Follow modular design | ✓ | ✓ | ✓ |
| NFR6 | Run on modern browsers/mobile | ✓ | ✓ | ✓ |
| NFR7 | Support dynamic configuration | × | ✓ | ✓ |
| NFR8 | Support unlimited degree programs | × | ✓ | ✓ |
| NFR9 | Provide audit trails and rollback | × | ✓ | ✓ |

**Coverage Summary:**
- **BSO-A**: 6/9 requirements (67%) - Limited by mobile platform constraints
- **BSO-B**: 9/9 requirements (100%) - Full enterprise capabilities
- **BSO-C**: 9/9 requirements (100%) - Complete non-functional coverage

---

## 2.9 Selected BSO with Justification

**Recommended Selection: BSO-B (Web Platform Only)**

The web platform solution (BSO-B) has been selected as the most suitable for the Student Enrollment and Evaluation System project. This option provides the optimal balance between comprehensive functionality, cost-effectiveness, and development simplicity.

### Justification for BSO-B Selection:

The web platform solution (BSO-B) has been selected as the most suitable for the Student Enrollment and Evaluation System project because it provides comprehensive functionality with 95% coverage of all functional requirements (36 out of 38 requirements) at a significantly lower cost than the hybrid solution. BSO-B offers complete administrative capabilities with full staff and administrative functionalities, ensuring all university operations can be efficiently managed through a single platform. The responsive web design provides cross-platform access working on any device with a modern browser, eliminating the need for separate mobile app development and maintenance. The system features advanced reporting capabilities with detailed analytics and customizable reports, comprehensive user account management, and enterprise-grade security with role-based access control. The scalable architecture can handle unlimited users and data growth without performance degradation. With a development cost of LKR 48,000 compared to LKR 62,000 for the hybrid solution, BSO-B provides excellent value for money while delivering near-complete functionality. The web-based approach simplifies maintenance, reduces complexity, and ensures consistent user experience across all devices and platforms.

### Alternative Considerations:

- **BSO-A** was considered for its cost-effectiveness and mobile-first approach, but rejected due to inability to support essential staff and administrative functions (only 58% requirement coverage).
- **BSO-C** was considered for its complete functionality and optimal user experience, but rejected due to higher development costs (LKR 62,000) and increased complexity in maintaining both mobile and web platforms.

The web platform solution aligns perfectly with the project's goals of providing comprehensive academic management tools while maintaining cost-effectiveness and operational simplicity. This approach ensures the system will meet current needs efficiently and can be enhanced with additional features as requirements evolve.
