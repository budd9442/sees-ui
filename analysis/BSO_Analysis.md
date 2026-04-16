## BSO vs Requirements Matrix

**Platform-Based BSO Definitions:**
- **BSO-A: Mobile App Only** - Native mobile application for students (iOS/Android)
- **BSO-B: Web Platform Only** - Browser-based system accessible on all devices
- **BSO-C: Hybrid Solution** - Mobile app for students + Web platform for staff/admin

Legend: ✓ = Fully Supported, ~ = Partially Supported, × = Not Supported

| Requirement | BSO-A Mobile App | BSO-B Web Platform | BSO-C Hybrid |
|-------------|------------------|-------------------|--------------|
| **Student Enrollment** | | | |
| Bulk enroll students | × | ✓ | ✓ |
| Record pathway preferences | ✓ | ✓ | ✓ |
| Personalized pathway guidance | ✓ | ✓ | ✓ |
| Monitor pathway demand (60% rule) | ✓ | ✓ | ✓ |
| GPA-based pathway allocation | ✓ | ✓ | ✓ |
| Pathway change restrictions | ✓ | ✓ | ✓ |
| **Module Management** | | | |
| Register for modules | ✓ | ✓ | ✓ |
| Plan module selection | ✓ | ✓ | ✓ |
| Validate academic rules | ✓ | ✓ | ✓ |
| View planned vs completed credits | ✓ | ✓ | ✓ |
| **Academic Tracking** | | | |
| View GPA | ✓ | ✓ | ✓ |
| Set GPA goals | ✓ | ✓ | ✓ |
| View academic class | ✓ | ✓ | ✓ |
| Set academic class goals | ✓ | ✓ | ✓ |
| **Communication** | | | |
| Student-degree-path-advisor messaging | ✓ | ✓ | ✓ |
| Anonymous reporting | ✓ | ✓ | ✓ |
| View lecture schedules | ✓ | ✓ | ✓ |
| View lecture schedules | ✓ | ✓ | ✓ |
| Real-time notifications | ✓ | × | ✓ |
| **Staff Operations** | | | |
| Upload module information | × | ✓ | ✓ |
| Upload and release grades | × | ✓ | ✓ |
| Modify lecture schedules | × | ✓ | ✓ |
| Track batch internship progress | × | ✓ | ✓ |
| **Level-Specific Functions** | | | |
| L3: Update internship status | ✓ | ✓ | ✓ |
| **Analytics & Reporting** | | | |
| Module performance statistics | × | ✓ | ✓ |
| Overall performance trends | × | ✓ | ✓ |
| Eligible student lists | × | ✓ | ✓ |
| **System Administration** | | | |
| User account management | × | ✓ | ✓ |
| System monitoring | × | ✓ | ✓ |
| Backup and restore | × | ✓ | ✓ |

**Coverage Summary:**
- **BSO-A**: 18/31 requirements (58%) - Mobile app limitations for staff/admin tasks
- **BSO-B**: 29/31 requirements (94%) - Full web platform capabilities (no real-time notifications)
- **BSO-C**: 31/31 requirements (100%) - Best of both platforms

**Key Platform Differences:**
- **BSO-A** excels at student mobile experience with real-time notifications but cannot handle complex staff/admin workflows or degree-path advisor functions
- **BSO-B** provides full functionality through responsive web design but lacks real-time push notifications
- **BSO-C** optimizes user experience with native mobile notifications for students and web for staff/admin operations
