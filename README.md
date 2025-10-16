# SEES - Student Enrollment & Evaluation System

A modern, full-featured academic management platform built with Next.js 14, TypeScript, and shadcn/ui.

## 🚀 Quick Start

```bash
cd d:\SDP\sees-ui
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 Test Credentials

Use any of these emails to log in (any password works in demo mode):

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
- ✅ Authentication with role-based routing
- ✅ Student Dashboard with GPA trends and credit charts
- ✅ Grades View with semester filtering
- ✅ Module Registration with prerequisite checking
- ✅ Pathway Selection with 60% demand threshold logic
- ✅ All 5 role dashboards (basic implementations)
- ✅ Mock data: 50+ students, 30+ modules, 500+ grades

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
├── mock/
│   ├── generators.ts              # Mock data generators
│   └── data.ts                    # Centralized mock data
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
- Notification system
- Mock data integration

## 🚧 Development Status

**✅ Completed**
- Project setup and configuration
- Type system and mock data
- Authentication flow
- Layout system (navbar, sidebar)
- Student dashboard + 3 core pages
- All 5 role dashboards (basic)

**⏳ In Progress**
- Additional student screens (schedule, goals, messages, internship)
- Staff grade management
- Advisor intervention tools
- HOD reports and analytics
- Admin configuration panels

See `IMPLEMENTATION_STATUS.md` for detailed progress.

## 📊 Mock Data

The system includes realistic mock data:
- 50+ students (L1-L4, various GPAs, pathways)
- 30+ modules (with prerequisites, capacity limits)
- 500+ grades (normal GPA distribution)
- 100+ messages (advisor-student)
- 200+ notifications

All data is generated in `lib/mock/generators.ts`.

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

## 🐛 Known Issues

- Mock authentication accepts any password
- Some screens are placeholders
- Data doesn't persist (except auth via localStorage)
- No real backend integration

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
