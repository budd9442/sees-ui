# Coding Standards & Architecture

This document outlines the architectural patterns and coding standards followed in the SEES platform.

## 🏗️ Core Architecture
The project is built using **Next.js 15** with the **App Router** and **React 19**.

- **Server-First Logic**: We prioritize Next.js **Server Actions** (`'use server'`) over traditional REST/Route Handlers for data mutations and protected fetches.
- **ORM**: **Prisma** is used as the primary database interface with PostgreSQL.
- **Authentication**: **Auth.js (NextAuth v5)** manages session state and role-based access control (RBAC).

## 🛡️ Validation & Type Safety
Type safety is a non-negotiable requirement across the stack.

- **Zod for Schemas**: All data entering Server Actions or API routes must be validated using **Zod**.
- **Double-Sided Validation**: Validation is performed on the client (for UX) and re-verified on the server (for security).
- **TypeScript**: Strict mode is enabled. We avoid `any` unless absolutely necessary for external library compatibility.

## 📝 API Documentation
We use a "Documentation as Code" approach for our Server Actions.

- **Swagger/OpenAPI**: Every Server Action must be decorated with a `@swagger` JSDoc annotation.
- **Standardized Metadata**: Include summary, description, tags (e.g., `Admin Actions`), and request/response schemas.
- **Internal Audit**: We use scripts (like `audit_docs.js`) to ensure 100% documentation coverage.

## 🎨 Frontend & UI
We follow a modern, utility-first styling approach with a focus on premium aesthetics.

- **Tailwind CSS 4**: Used for all styling. We leverage Tailwind variables and the latest v4 engine features.
- **Component Library**: Based on **Radix UI** primitives and **Shadcn/UI** patterns.
- **Animations**: **Framer Motion** is used for micro-interactions and smooth layout transitions.
- **Icons**: **Lucide React** is the standard icon set.
- **Toasts**: **Sonner** is used for all system notifications and feedback.

## 📁 Directory Structure
- `app/`: Routing and UI pages.
- `components/`: Reusable UI components.
- `lib/`:
    - `actions/`: Server Actions organized by domain, typically named `[domain]-actions.ts` or `admin-[domain].ts`.
    - `validations/`: Centralized Zod schemas.
    - `db.ts`: Prisma client singleton.
    - `audit/`: Audit logging infrastructure.
    - `services/`: External integrations (AI, Email, LMS).
- `docs/`: Documentation and architecture guides.

## ⚙️ Background Tasks & Real-time
- **Workers**: Long-running or heavy tasks (Email, LMS imports, GPA calculations) are handled by background workers located in `lib/queue/`.
- **Real-time**: **Pusher** is used for real-time updates and notifications.

## 🔍 Audit & Monitoring
- **Audit Logs**: Every sensitive administrative action (Create, Update, Delete) must call `writeAuditLog` to maintain a system-wide audit trail.
- **System Metrics**: Periodic collection of system health metrics using `scripts/collect-system-metrics.ts`.
