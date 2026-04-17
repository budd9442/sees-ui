# Chapter 4

## 4.1 Introduction

This chapter presents the implementation of the SEES platform based on the design artifacts developed in the previous chapters. The implementation is delivered as a full-stack web application that supports role-based academic operations for students, staff, advisors, heads of department (HOD), and administrators.

The chapter focuses on three dimensions of implementation quality:

1. The selected technology stack and development environment used to build and maintain the system.
2. The realized user interfaces and data-entry workflows that operationalize the identified use cases.
3. The critical backend flows and special implementations that ensure reliability, security, scalability, and maintainability.

In contrast to generic implementation descriptions, this chapter documents the actual technologies, routes, actions, and processing flows implemented in the SEES codebase.

## 4.2 Programming Languages and Development Tools

### 4.2.1 Next.js and React (Frontend and Full-Stack Framework)

The SEES platform is implemented using Next.js 15 with React 19. The project follows the App Router architecture, where page rendering, route-level composition, server-side logic, and API route handlers are organized within the `app` directory.

This architecture supports:

- Server-rendered and client-rendered pages within the same application.
- Co-location of API endpoints under `app/api/.../route.ts`.
- Strong integration between UI and server actions for form and workflow operations.

The approach allows SEES to implement rich role-specific dashboards while preserving secure server-side data access and controlled navigation.

### 4.2.2 TypeScript

The implementation uses TypeScript across frontend and backend modules. Type definitions are used for user/session models, action inputs, and workflow contracts (for example, LMS import status payloads and grade structures). This reduces runtime defects by catching integration issues during development and improves maintainability for a large multi-role domain.

### 4.2.3 Tailwind CSS and Component Infrastructure

The UI layer is styled with Tailwind CSS (v4) and a reusable component approach. The system uses composable UI primitives and utility-based styling to keep screens consistent across role dashboards and onboarding modules.

Additional UI support libraries include:

- Radix UI components for accessible interface primitives.
- `sonner` for user feedback notifications (success/error/toast states).
- `lucide-react` for iconography.
- `@tanstack/react-table` and charting utilities for data-driven interfaces.

This combination provides a responsive and maintainable user experience while reducing design drift between modules.

### 4.2.4 Node.js Runtime and Next.js Route Handlers

SEES executes on a Node.js runtime. Backend endpoints are implemented primarily as Next.js route handlers and server actions. This model enables explicit request validation, authenticated execution, and structured JSON responses.

Examples of implemented backend styles include:

- Authentication-aware API handlers (e.g., LMS import endpoints).
- Scheduled endpoint processing (e.g., cron metrics collection).
- Action-based domain logic in `lib/actions/*` modules for dashboard data and transactional operations.

### 4.2.5 PostgreSQL and Prisma ORM

The data layer uses PostgreSQL with Prisma ORM. Prisma models and migrations define the persistent academic domain, including users, students, staff, grades, module registrations, LMS import sessions, and system metrics.

Prisma is used for:

- Type-safe querying.
- Relational includes for role and academic-context hydration.
- Transactional write operations (e.g., LMS commit replacing registrations and grades atomically).

This stack ensures relational integrity while keeping database access explicit and testable.

### 4.2.6 Authentication and Access Control (NextAuth + bcrypt)

Authentication is implemented with NextAuth (Auth.js v5 beta) using credentials-based login. Passwords are verified with `bcryptjs`, and successful logins are enriched with role and profile information through JWT/session callbacks.

Access control is enforced through:

- Middleware-based route protection.
- Server-side role checks in route handlers and actions.
- Post-login dashboard redirection by role.
- Additional student progression gates (onboarding completion and LMS import completion/skip checks).

This layered approach prevents unauthorized access while preserving user-specific navigation behavior.

### 4.2.7 Asynchronous Processing with RabbitMQ Workers

SEES uses RabbitMQ (`amqplib`) for background processing where immediate request/response execution would reduce reliability or user experience. The LMS import preview process is implemented as an asynchronous worker flow:

1. A secure API endpoint creates an import session.
2. A queue job is published with session and LMS credentials.
3. A worker consumes the job, performs staged LMS extraction and matching, and updates progress.
4. The frontend polls session status until preview is ready.
5. The user confirms commit to finalize transactional writes.

This design decouples long-running LMS operations from user-facing request latency and improves resilience.

### 4.2.8 Testing and Verification Tooling

The project uses Node's built-in test runner (`node:test`) with `tsx` for TypeScript test execution. Existing tests validate high-impact logic such as:

- Graduation/eligibility rule evaluation.
- Notification template rendering behavior.
- LMS grade-letter conversion and module matching edge cases.

These tests provide a baseline safety net for core academic calculations and messaging correctness.

### 4.2.9 DevOps and Deployment Toolchain

The deployment toolchain includes Docker-based packaging and CI/CD workflow automation. The repository contains:

- A production-oriented Docker build.
- GitHub Actions workflow for build/deploy orchestration.
- Kubernetes manifests (`k8s`) for service, ingress, and environment deployment.

This enables repeatable deployment, environment consistency, and operational scalability.

## 4.3 User Interface Demonstration and Data Entry Screens

### 4.3.1 Authentication Entry (Login)

The login interface accepts user credentials and invokes authenticated server-side sign-in logic. On success, the system resolves role and profile context, records audit events, and redirects users to the dashboard root. Invalid credentials and unauthorized access attempts are handled with controlled error responses.

This screen acts as the single trust boundary for all subsequent role-based operations.

### 4.3.2 Dashboard Landing and Role-Aware Navigation

After login, users are redirected to role-specific dashboard views. The dashboard layout fetches fresh user data from the database to prevent stale-session behavior and to ensure role determination reflects current records.

The navigation framework dynamically adapts options by role (Admin, HOD, Staff, Advisor, Student). For HOD users, the interface also supports perspective switching where applicable, allowing controlled transition between staff and HOD operational contexts.

### 4.3.3 Student Onboarding Data Entry

Students without completed onboarding are automatically redirected to onboarding before dashboard usage. The onboarding interface collects profile and academic preference data from configurable question sets stored in system settings.

Submission flow characteristics:

- Client-side rendering of dynamic question forms.
- Server-side validation of answers against configured schema.
- Metadata persistence and onboarding completion timestamp update.

This ensures every student enters downstream academic workflows with required baseline context.

### 4.3.4 LMS Import Interface (Student)

After onboarding, students are routed to LMS import unless they have already completed or explicitly skipped it. The LMS import page supports:

- Secure LMS password entry (student ID inferred server-side as username).
- "Preview first" processing with visible stage and progress percentage.
- Per-year matched/unmatched module summaries and inferred pathway/level context.
- Explicit commit action to finalize imported registrations and grades.

This UI is designed to minimize accidental data overwrite by separating preview and commit phases.

### 4.3.5 Student Grades and Academic Performance Views

The student grades view provides:

- Semester-filtered and all-semester grade tables.
- GPA computation and summary cards.
- Released-grade aware calculations.
- Export capability for grade records.

These interfaces operationalize academic transparency by giving students direct access to structured performance data.

### 4.3.6 Administrative Monitoring and Configuration Interfaces

Administrative views include operational dashboards for system-wide activity and metrics. Notable implementation areas include:

- Dashboard summaries for administrative decision support.
- Metrics visualization using data from periodic system sampling.
- Configuration and notification management actions.

These screens provide governance-level observability and control over platform behavior.

## 4.4 Special Implementations

### 4.4.1 Layered Validation Strategy

SEES applies validation in multiple layers:

- **Frontend validation:** Required field checks and controlled UI state (for example, LMS password presence before preview start).
- **Backend validation:** Route-level request shape validation, role authorization, ownership checks, and process precondition validation (e.g., onboarding must be completed before LMS import).
- **Domain validation:** Transaction-scoped checks for academic data consistency, grading conversions, and registration replacement logic.

This layered model prevents malformed writes and enforces business constraints even if client-side checks are bypassed.

### 4.4.2 Authentication, Authorization, and Route Gating

A combined middleware and server-action policy controls access:

- Unauthenticated dashboard access is redirected to login.
- Login page access is redirected away for already authenticated users.
- Role checks are repeated in backend endpoints to protect data operations.
- Student progression gates enforce onboarding and LMS import sequencing before dashboard access.

This implementation reduces privilege leakage and preserves orderly student lifecycle progression.

### 4.4.3 Queue-Based LMS Import Pipeline

The LMS import pipeline is a key special implementation. It combines synchronous and asynchronous components to ensure responsiveness and correctness:

1. **Preview initiation API:** validates student state and queues a job.
2. **Worker processing:** performs LMS login, year-wise extraction, module matching, and inference.
3. **Progress persistence:** stage/progress updates stored in session records for polling UI.
4. **Preview rendering:** frontend displays inferred context and match quality.
5. **Commit endpoint:** executes transactional replacement of registrations/grades and updates student metadata.

By decoupling processing and commit, the system preserves data safety and user control.

### 4.4.4 Metrics Collection and Operational Health Monitoring

System observability is implemented through periodic metrics sampling and retention management:

- Cron-protected endpoint collects CPU, memory, storage, uptime, health score, and active-user count.
- Old records are pruned based on retention policy.
- Admin metrics endpoint returns chronological records for dashboard charts and cards.
- A fallback sample mechanism collects metrics during dashboard usage if scheduled cron execution is not active.

This ensures near-continuous operational visibility in both fully scheduled and partially configured environments.

### 4.4.5 Grading and Academic Context Integrity

The implementation enforces academically meaningful transformations:

- LMS letter grades are resolved into institutional grade points through configured grading bands.
- "Pass" grades are handled as a non-band special case.
- GPA-oriented computations and presentation logic differentiate released and unreleased records.
- Imported module registrations are replaced transactionally to avoid duplicate state.

These controls protect the integrity of academic results and downstream eligibility computations.

## 4.5 Quality Assurance Methods Used

### 4.5.1 Automated Test Coverage

The current implementation includes automated tests for critical logic units:

- **Graduation/eligibility tests:** validate classification thresholds and rule conditions.
- **LMS import logic tests:** verify letter-to-grade resolution, level inference, and matching safeguards.
- **Notification rendering tests:** ensure safe and correct template interpolation and HTML escaping.

Although not exhaustive across all modules, these tests focus on correctness-sensitive components where defects can significantly impact students and administrators.

### 4.5.2 Manual and Scenario-Based Verification

Manual verification remains important for composite workflows that combine UI, server actions, route handlers, and background jobs. High-priority scenarios include:

- Login and role-based dashboard routing for all user categories.
- Student onboarding completion and gating behavior.
- LMS import preview, progress polling, commit, and skip paths.
- Admin metrics visualization with scheduled collection behavior.
- Grade display and export pathways under different release states.

Scenario-based checks are used to validate end-to-end behavior beyond unit-level correctness.

### 4.5.3 Reliability and Failure Handling Checks

The implementation includes failure-aware responses in critical flows (for example, queue enqueue failures, unauthorized API usage, and commit precondition mismatch). Quality assurance therefore includes negative-path testing to verify that:

- Errors are surfaced to users safely.
- Partial write states are minimized via transaction boundaries.
- Unauthorized requests fail with explicit status codes.

## 4.6 Reports

### 4.6.1 Academic Performance Reports

The student module provides grade and GPA-oriented reporting through tabular views and CSV export functions. Reports support semester-level and cumulative analysis, helping students and advisors review progression over time.

### 4.6.2 Departmental and Eligibility-Oriented Reporting

HOD and related academic modules provide ranking and eligibility data views that support departmental decisions for progression, advising, and degree-completion monitoring.

### 4.6.3 Operational and System Health Reporting

Administrative reporting includes real-time and historical infrastructure-oriented indicators (CPU, memory, storage, uptime, health score, active user counts). These reports support capacity planning and reliability monitoring.

### 4.6.4 Workflow and Monitoring Outputs

Additional report-like outputs are embedded within workflow screens, such as LMS import preview summaries (matched/unmatched modules and inferred context), which act as pre-commit validation artifacts for users and administrators.

## 4.7 Summary

This chapter documented the implemented SEES solution using a project-specific SDP format. The system combines a modern full-stack architecture (Next.js, React, TypeScript, Prisma, PostgreSQL) with secure authentication, role-aware navigation, asynchronous LMS integration, and operational monitoring.

The implementation emphasizes correctness and user safety through layered validation, transaction-protected writes, and queue-based long-running processes. Together with targeted automated testing and scenario-driven verification, the delivered solution is positioned for dependable academic operations and scalable future enhancement.
