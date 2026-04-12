# SEES - Student Enrollment & Evaluation System

A modern, full-featured academic management platform built with Next.js 14, TypeScript, and shadcn/ui.

## 🚀 Quick Start

```bash
cd d:\SDP\sees-ui
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 Test Credentials

Use your assigned institutional credentials to log in. In production, authentication is strictly enforced via database-verified records.

| Email | Role | Description |
|-------|------|-------------|
| `alice@university.edu` | Student | L2, MIT, BSE, GPA: 3.75 |
| `sarah.wilson@university.edu` | Staff | Academic Staff Member |
| `michael.smith@university.edu` | Advisor | Degree-Path Advisor |
| `john.anderson@university.edu` | HOD | Head of Department |
| `admin@university.edu` | Admin | System Administrator |

## ✨ Features

### **5 Role-Based Dashboards**
- **Student** - GPA tracking, module registration, pathway selection, grades view
- **Staff** - Module management, grade entry, student roster
- **Advisor** - Advisee monitoring, intervention tracking
- **HOD** - Department analytics, pathway demand analysis
- **Admin** - User management, system configuration

### **Implemented Features**
- ✅ Authentication with secure Prisma integration
- ✅ Student Dashboard with real GPA trends and credit analytics
- ✅ Grades View with semester filtering and real-time computation
- ✅ Module Registration with prerequisite and capacity validation
- ✅ Pathway Selection with database-driven demand monitoring
- ✅ All 5 role dashboards (Production-Hardened)
- ✅ 100% Database-Driven: No simulated data or hardcoded logic

## 📦 Tech Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui components
- Zustand (state management)
- Recharts (data visualization)
- React Hook Form + Zod (forms)
- Sonner (notifications)

## 📁 Key Files

```
app/
├── login/page.tsx                 # Login page
├── dashboard/
│   ├── layout.tsx                 # Main layout with nav/sidebar
│   ├── student/
│   │   ├── page.tsx               # Student dashboard
│   │   ├── grades/page.tsx        # Grades view
│   │   ├── modules/page.tsx       # Module registration
│   │   └── pathway/page.tsx       # Pathway selection
│   ├── staff/page.tsx
│   ├── advisor/page.tsx
│   ├── hod/page.tsx
│   └── admin/page.tsx

components/
├── ui/                            # shadcn/ui components
├── common/                        # Custom components
│   ├── stat-card.tsx
│   ├── grade-card.tsx
│   └── module-card.tsx
└── layout/
    ├── navbar.tsx
    ├── sidebar.tsx
    └── page-header.tsx

lib/
├── db.ts                          # Prisma Client singleton
├── auth/                          # Auth configurations
├── gpaCalculations.ts
└── dateFormatters.ts

stores/
├── authStore.ts                   # Auth state (Zustand)
└── appStore.ts                    # App state (Zustand)

types/
└── index.ts                       # TypeScript definitions
```

## 🎯 Core Functionality

### Student Features
- Real-time GPA calculation and visualization
- Semester-wise grade breakdown
- Module registration with:
  - Prerequisite validation
  - Capacity checking
  - Credit limit enforcement (12-24 credits)
- Pathway selection (MIT vs IT) with:
  - 60% demand threshold monitoring
  - GPA-based ranking when oversubscribed
  - Lock state when confirmed

### All Roles
- Role-specific dashboards
- Personalized navigation
- Real-time notification system
- Database-driven data integrity

## 🚧 Development Status

**✅ Completed**
- Project setup and production configuration
- Type system and database schema
- Secure authentication flow (Auth.js + Prisma)
- Layout system (navbar, sidebar)
- Student dashboard + core academic pages
- Production dashboards for all roles
- System hardening and simulation-layer purification

**⏳ In Progress**
- Additional student screens (schedule, goals, messages, internship)
- Staff grade management
- Advisor intervention tools
- HOD reports and analytics
- Admin configuration panels

See `IMPLEMENTATION_STATUS.md` for detailed progress.

## 📊 Database Architecture

The system is powered by a high-fidelity Prisma schema designed for academic governance:
- **50+ Relational Entities**: Including Students, Staff, Advisors, and HODs.
- **Dynamic Module Logic**: Supporting prerequisites, capacity limits, and semester-specific registration.
- **Academic Records**: Real-time GPA computation across 500+ grade records.
- **Institutional Governance**: Real-time Approval Tasks, Interventions, and Messaging.

Schema synchronization and seeding are handled via Prisma:
```bash
npx prisma db seed
```

## 🎨 Design System

- **Primary**: Blue (#1e40af)
- **Success**: Green (#16a34a)
- **Warning**: Amber (#f59e0b)
- **Destructive**: Red (#dc2626)
- **Font**: Inter

## 📝 Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm start        # Production server
npm run lint     # Lint code
```

- Legacy UI components may still use static icons where dynamic versions are pending.
- Bulk enrollment requires a specific CSV template.

## 📸 Screenshots

To capture for documentation:
1. Login page
2. Student dashboard with GPA trends
3. Grades view
4. Module registration
5. Pathway selection with demand meters
6. Each role dashboard

## 🤝 Contributing

This is an academic project. For the full project scope, see:
- `IMPLEMENTATION_STATUS.md` - Development progress
- `d:\SDP\` - Original requirements and design docs

---

**Built with Next.js 14, TypeScript, and shadcn/ui**
