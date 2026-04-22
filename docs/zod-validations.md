# Zod Validation Schemas

This document lists all Zod validation schemas used across the SEES platform for data integrity and API safety.

## 👤 User & Authentication
Centralized schemas for user profiles and security.

- [userSchema](file:///d:/dev/sees-ui/lib/validations/user.ts#L3) - Core user profile schema.
- [updateUserSchema](file:///d:/dev/sees-ui/lib/validations/user.ts#L26) - Partial schema for user updates.
- [setPasswordSchema](file:///d:/dev/sees-ui/lib/validations/user.ts#L32) - Validation for initial password setting (min 8 chars, complexity rules).
- [changePasswordSchema](file:///d:/dev/sees-ui/lib/validations/user.ts#L46) - Validation for password changes (includes current password check).
- [profileUpdateSchema](file:///d:/dev/sees-ui/app/dashboard/profile/page.tsx#L43) - Client-side profile form validation.

## 🏛️ Admin & Academic Management
Schemas used in administrative server actions for resource creation.

- [ProgramSchema](file:///d:/dev/sees-ui/lib/actions/admin-programs.ts#L10) - Degree program creation.
- [SpecializationSchema](file:///d:/dev/sees-ui/lib/actions/admin-programs.ts#L17) - Program specialization metadata.
- [ModuleSchema](file:///d:/dev/sees-ui/lib/actions/admin-modules.ts#L10) - Academic module definitions.
- [specializationPreferenceSchema](file:///d:/dev/sees-ui/lib/actions/specialization-actions.ts#L10) - Student specialization selection.
- [pathwayGuidancePreferenceSchema](file:///d:/dev/sees-ui/lib/actions/pathway-actions.ts#L10) - Student pathway preference tracking.

## 📊 Analytics & Reporting
Complex schemas for dynamic query generation and report definitions.

- [analyticsQueryFiltersSchema](file:///d:/dev/sees-ui/lib/analytics/schema.ts#L15) - Filters for SQL analytics.
- [analyticsQueryInputSchema](file:///d:/dev/sees-ui/lib/analytics/schema.ts#L49) - Main input for analytics engine.
- [visualSpecSchema](file:///d:/dev/sees-ui/lib/analytics/schema.ts#L132) - Visualization specifications (charts, KPIs).
- [reportDefinitionSchema](file:///d:/dev/sees-ui/lib/analytics/schema.ts#L150) - Full report structure.
- [assistantResponseSchema](file:///d:/dev/sees-ui/lib/analytics/schema.ts#L169) - AI-generated analytics response structure.

## 🎓 Graduation & Business Rules
Logic for degree auditing and graduation eligibility.

- [graduationDivisionSchema](file:///d:/dev/sees-ui/lib/graduation/rule-schema.ts#L66) - Category grouping for graduation rules.
- [graduationConditionSchema](file:///d:/dev/sees-ui/lib/graduation/rule-schema.ts#L19) - Specific logic conditions (GPA, credits, etc.).
- [conditionScopeSchema](file:///d:/dev/sees-ui/lib/graduation/rule-schema.ts#L4) - Enumeration of rule scopes.

## 📝 Onboarding
Schemas for the student onboarding questionnaire.

- [onboardingQuestionSchema](file:///d:/dev/sees-ui/lib/onboarding/question-schema.ts#L14) - Individual question definition.
- [onboardingQuestionsDocumentSchema](file:///d:/dev/sees-ui/lib/onboarding/question-schema.ts#L31) - Full onboarding configuration.
- [onboardingAnswersSchema](file:///d:/dev/sees-ui/lib/onboarding/question-schema.ts#L55) - Student answer submission validation.

## 🤖 Chatbot & AI
Infrastructure for AI-driven interactions.

- [SQLPlanSchema](file:///d:/dev/sees-ui/lib/chatbot/planner-schema.ts#L8) - Validation for AI-generated SQL execution plans.
