--
-- PostgreSQL database dump
--

\restrict JEAYmDJ3X8dTqDnSTgzcZlx6F5b9OWlWoRDdhWXkut7Oo77mDRiCYT2E52RWfcF

-- Dumped from database version 15.15
-- Dumped by pg_dump version 15.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: sees_user
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO sees_user;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: sees_user
--

COMMENT ON SCHEMA public IS '';


--
-- Name: dblink; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS dblink WITH SCHEMA public;


--
-- Name: EXTENSION dblink; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION dblink IS 'connect to other PostgreSQL databases from within a database';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AcademicGoal; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public."AcademicGoal" (
    goal_id text NOT NULL,
    student_id text NOT NULL,
    target_gpa double precision,
    target_class text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    achieved_at timestamp(3) without time zone,
    category text DEFAULT 'academic'::text NOT NULL,
    deadline timestamp(3) without time zone,
    description text,
    milestones text[],
    priority text DEFAULT 'medium'::text NOT NULL,
    progress integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'IN_PROGRESS'::text NOT NULL,
    target_value text,
    title text DEFAULT 'Academic Goal'::text NOT NULL,
    goal_type text DEFAULT 'GPA_TARGET'::text NOT NULL,
    metric_unit text DEFAULT 'GPA'::text NOT NULL,
    target_value_number double precision,
    baseline_value double precision,
    module_id text
);


ALTER TABLE public."AcademicGoal" OWNER TO sees_user;

--
-- Name: AcademicRecoverySnapshot; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public."AcademicRecoverySnapshot" (
    snapshot_id text NOT NULL,
    student_id text NOT NULL,
    dip_fingerprint text NOT NULL,
    previous_gpa double precision NOT NULL,
    current_gpa double precision NOT NULL,
    advice_json jsonb NOT NULL,
    generated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AcademicRecoverySnapshot" OWNER TO sees_user;

--
-- Name: AcademicYear; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public."AcademicYear" (
    academic_year_id text NOT NULL,
    label text NOT NULL,
    start_date timestamp(3) without time zone NOT NULL,
    end_date timestamp(3) without time zone NOT NULL,
    active boolean DEFAULT true NOT NULL
);


ALTER TABLE public."AcademicYear" OWNER TO sees_user;

--
-- Name: Advisor; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public."Advisor" (
    advisor_id text NOT NULL,
    assigned_degree_path_id text,
    is_available_for_contact boolean DEFAULT true NOT NULL,
    specialty_areas jsonb,
    bio text
);


ALTER TABLE public."Advisor" OWNER TO sees_user;

--
-- Name: AnonymousReport; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public."AnonymousReport" (
    report_id text NOT NULL,
    student_id text NOT NULL,
    content text NOT NULL,
    priority text NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    admin_notes text,
    assigned_to text
);


ALTER TABLE public."AnonymousReport" OWNER TO sees_user;

--
-- Name: DegreeProgram; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public."DegreeProgram" (
    program_id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    active boolean DEFAULT true NOT NULL,
    is_common boolean DEFAULT false NOT NULL,
    academic_year_id text
);


ALTER TABLE public."DegreeProgram" OWNER TO sees_user;

--
-- Name: GPAHistory; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public."GPAHistory" (
    gpa_history_id text NOT NULL,
    student_id text NOT NULL,
    calculation_date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    gpa double precision NOT NULL,
    academic_class text
);


ALTER TABLE public."GPAHistory" OWNER TO sees_user;

--
-- Name: Grade; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public."Grade" (
    grade_id text NOT NULL,
    reg_id text NOT NULL,
    student_id text NOT NULL,
    module_id text NOT NULL,
    semester_id text NOT NULL,
    marks double precision,
    grade_point double precision NOT NULL,
    letter_grade text NOT NULL,
    attempt_no integer DEFAULT 1 NOT NULL,
    released_at timestamp(3) without time zone
);


ALTER TABLE public."Grade" OWNER TO sees_user;

--
-- Name: GradingBand; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public."GradingBand" (
    band_id text NOT NULL,
    scheme_id text NOT NULL,
    min_marks double precision NOT NULL,
    max_marks double precision NOT NULL,
    grade_point double precision NOT NULL,
    letter_grade text NOT NULL
);


ALTER TABLE public."GradingBand" OWNER TO sees_user;

--
-- Name: GradingScheme; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public."GradingScheme" (
    scheme_id text NOT NULL,
    name text NOT NULL,
    version text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    academic_year_id text
);


ALTER TABLE public."GradingScheme" OWNER TO sees_user;

--
-- Name: HOD; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public."HOD" (
    hod_id text NOT NULL,
    department text NOT NULL
);


ALTER TABLE public."HOD" OWNER TO sees_user;

--
-- Name: Internship; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public."Internship" (
    internship_id text NOT NULL,
    student_id text NOT NULL,
    company text NOT NULL,
    role text NOT NULL,
    start_date timestamp(3) without time zone NOT NULL,
    end_date timestamp(3) without time zone NOT NULL,
    status text DEFAULT 'applied'::text NOT NULL,
    supervisor_email text,
    supervisor_phone text,
    description text,
    progress integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    "supervisorName" text
);


ALTER TABLE public."Internship" OWNER TO sees_user;

--
-- Name: InternshipDocument; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public."InternshipDocument" (
    document_id text NOT NULL,
    internship_id text NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    url text NOT NULL,
    uploaded_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."InternshipDocument" OWNER TO sees_user;

--
-- Name: InternshipMilestone; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public."InternshipMilestone" (
    milestone_id text NOT NULL,
    internship_id text NOT NULL,
    title text NOT NULL,
    description text,
    due_date timestamp(3) without time zone NOT NULL,
    completed boolean DEFAULT false NOT NULL,
    completed_date timestamp(3) without time zone
);


ALTER TABLE public."InternshipMilestone" OWNER TO sees_user;

--
-- Name: LectureSchedule; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public."LectureSchedule" (
    schedule_id text NOT NULL,
    module_id text NOT NULL,
    staff_id text NOT NULL,
    day_of_week text NOT NULL,
    start_time timestamp(3) without time zone NOT NULL,
    end_time timestamp(3) without time zone NOT NULL,
    location text
);


ALTER TABLE public."LectureSchedule" OWNER TO sees_user;

--
-- Name: LmsImportSession; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public."LmsImportSession" (
    session_id text NOT NULL,
    student_id text NOT NULL,
    status text DEFAULT 'RUNNING'::text NOT NULL,
    stage text DEFAULT 'LOGIN'::text NOT NULL,
    progress_pct integer DEFAULT 0 NOT NULL,
    preview_json jsonb,
    error_message text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."LmsImportSession" OWNER TO sees_user;

--
-- Name: Message; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public."Message" (
    message_id text NOT NULL,
    sender_id text NOT NULL,
    recipient_id text NOT NULL,
    subject text NOT NULL,
    content text NOT NULL,
    sent_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    read_at timestamp(3) without time zone
);


ALTER TABLE public."Message" OWNER TO sees_user;

--
-- Name: Module; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public."Module" (
    module_id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    credits integer NOT NULL,
    level text NOT NULL,
    description text,
    active boolean DEFAULT true NOT NULL,
    academic_year_id text,
    counts_toward_gpa boolean DEFAULT true NOT NULL,
    custom_grading_bands jsonb
);


ALTER TABLE public."Module" OWNER TO sees_user;

--
-- Name: ModuleRegistration; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public."ModuleRegistration" (
    reg_id text NOT NULL,
    student_id text NOT NULL,
    module_id text NOT NULL,
    semester_id text NOT NULL,
    term text,
    registration_date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status text DEFAULT 'REGISTERED'::text NOT NULL
);


ALTER TABLE public."ModuleRegistration" OWNER TO sees_user;

--
-- Name: Notification; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public."Notification" (
    notification_id text NOT NULL,
    user_id text NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    sent_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    read_at timestamp(3) without time zone
);


ALTER TABLE public."Notification" OWNER TO sees_user;

--
-- Name: ProgramIntake; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public."ProgramIntake" (
    intake_id text NOT NULL,
    program_id text NOT NULL,
    academic_year_id text NOT NULL,
    min_students integer DEFAULT 0 NOT NULL,
    max_students integer DEFAULT 100 NOT NULL,
    status text DEFAULT 'OPEN'::text NOT NULL
);


ALTER TABLE public."ProgramIntake" OWNER TO sees_user;

--
-- Name: ProgramStructure; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public."ProgramStructure" (
    structure_id text NOT NULL,
    program_id text NOT NULL,
    specialization_id text,
    module_id text NOT NULL,
    semester_id text,
    academic_level text NOT NULL,
    semester_number integer NOT NULL,
    module_type text NOT NULL,
    credits integer,
    academic_year_id text
);


ALTER TABLE public."ProgramStructure" OWNER TO sees_user;

--
-- Name: Ranking; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public."Ranking" (
    ranking_id text NOT NULL,
    student_id text NOT NULL,
    degree_path_id text NOT NULL,
    rank integer NOT NULL,
    gpa double precision NOT NULL,
    weighted_average double precision NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Ranking" OWNER TO sees_user;

--
-- Name: Semester; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public."Semester" (
    semester_id text NOT NULL,
    academic_year_id text NOT NULL,
    label text NOT NULL,
    start_date timestamp(3) without time zone NOT NULL,
    end_date timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Semester" OWNER TO sees_user;

--
-- Name: Specialization; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public."Specialization" (
    specialization_id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    description text,
    program_id text NOT NULL,
    academic_year_id text
);


ALTER TABLE public."Specialization" OWNER TO sees_user;

--
-- Name: Staff; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public."Staff" (
    staff_id text NOT NULL,
    staff_number text NOT NULL,
    staff_type text NOT NULL,
    department text NOT NULL
);


ALTER TABLE public."Staff" OWNER TO sees_user;

--
-- Name: StaffAssignment; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public."StaffAssignment" (
    assignment_id text NOT NULL,
    staff_id text NOT NULL,
    program_id text,
    module_id text,
    role text NOT NULL,
    assigned_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    active boolean DEFAULT true NOT NULL,
    academic_year_id text
);


ALTER TABLE public."StaffAssignment" OWNER TO sees_user;

--
-- Name: Student; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public."Student" (
    student_id text NOT NULL,
    admission_year integer NOT NULL,
    current_gpa double precision DEFAULT 0.0 NOT NULL,
    academic_class text,
    degree_path_id text NOT NULL,
    specialization_id text,
    advisor_id text,
    current_level text,
    enrollment_status text DEFAULT 'ENROLLED'::text NOT NULL,
    pathway_locked boolean DEFAULT false NOT NULL,
    pathway_preference_1_id text,
    pathway_preference_2_id text,
    pathway_selection_date timestamp(3) without time zone,
    metadata jsonb,
    onboarding_completed_at timestamp(3) without time zone,
    graduation_status text DEFAULT 'NOT_GRADUATED'::text NOT NULL,
    graduated_at timestamp(3) without time zone
);


ALTER TABLE public."Student" OWNER TO sees_user;

--
-- Name: StudentAIFeedbackSnapshot; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public."StudentAIFeedbackSnapshot" (
    snapshot_id text NOT NULL,
    student_id text NOT NULL,
    feedback_json jsonb NOT NULL,
    prompt_context_hash text NOT NULL,
    gpa_at_generation double precision NOT NULL,
    transcript_fingerprint text NOT NULL,
    latest_released_grade_at timestamp(3) without time zone,
    generated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL,
    source_version text DEFAULT 'v1'::text NOT NULL,
    status text DEFAULT 'READY'::text NOT NULL,
    error_message text,
    invalidation_reason text
);


ALTER TABLE public."StudentAIFeedbackSnapshot" OWNER TO sees_user;

--
-- Name: SystemSetting; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public."SystemSetting" (
    setting_id text NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    description text,
    category text NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SystemSetting" OWNER TO sees_user;

--
-- Name: User; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public."User" (
    user_id text NOT NULL,
    email text NOT NULL,
    username text NOT NULL,
    password_hash text NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_login_date timestamp(3) without time zone,
    address text,
    avatar text,
    bio text,
    emergency_contact text,
    github text,
    linkedin text,
    phone text,
    role text DEFAULT 'student'::text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL
);


ALTER TABLE public."User" OWNER TO sees_user;

--
-- Name: _ModulePrerequisites; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public."_ModulePrerequisites" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_ModulePrerequisites" OWNER TO sees_user;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO sees_user;

--
-- Name: academic_credit_rules; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public.academic_credit_rules (
    id text NOT NULL,
    level text NOT NULL,
    semester_number integer NOT NULL,
    min_credits integer DEFAULT 12 NOT NULL,
    max_credits integer DEFAULT 24 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    academic_year_id text
);


ALTER TABLE public.academic_credit_rules OWNER TO sees_user;

--
-- Name: academic_path_transitions; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public.academic_path_transitions (
    id text NOT NULL,
    source_program_id text NOT NULL,
    target_program_id text NOT NULL,
    level text DEFAULT 'L2'::text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.academic_path_transitions OWNER TO sees_user;

--
-- Name: analytics_reports; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public.analytics_reports (
    report_id text NOT NULL,
    owner_user_id text NOT NULL,
    scope_role text NOT NULL,
    title text NOT NULL,
    definition jsonb NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.analytics_reports OWNER TO sees_user;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public.audit_logs (
    log_id text NOT NULL,
    admin_id text,
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id text NOT NULL,
    old_value text,
    new_value text,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    category text DEFAULT 'ADMIN'::text NOT NULL,
    metadata jsonb,
    ip_address text,
    user_agent text
);


ALTER TABLE public.audit_logs OWNER TO sees_user;

--
-- Name: bulk_enrollment_batches; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public.bulk_enrollment_batches (
    batch_id text NOT NULL,
    uploaded_by text NOT NULL,
    filename text NOT NULL,
    program_id text,
    level text,
    total_records integer DEFAULT 0 NOT NULL,
    successful_records integer DEFAULT 0 NOT NULL,
    failed_records integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'PROCESSING'::text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.bulk_enrollment_batches OWNER TO sees_user;

--
-- Name: bulk_enrollment_records; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public.bulk_enrollment_records (
    record_id text NOT NULL,
    batch_id text NOT NULL,
    email text NOT NULL,
    role text DEFAULT 'student'::text NOT NULL,
    user_id text,
    status text DEFAULT 'PENDING'::text NOT NULL,
    error_message text,
    email_sent boolean DEFAULT false NOT NULL,
    email_sent_at timestamp(3) without time zone,
    email_resend_count integer DEFAULT 0 NOT NULL,
    last_email_sent_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL
);


ALTER TABLE public.bulk_enrollment_records OWNER TO sees_user;

--
-- Name: calendar_events; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public.calendar_events (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    type text NOT NULL,
    "isRecurring" boolean DEFAULT false NOT NULL,
    "recurrencePattern" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.calendar_events OWNER TO sees_user;

--
-- Name: feature_flags; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public.feature_flags (
    id text NOT NULL,
    key text NOT NULL,
    name text NOT NULL,
    description text,
    "isEnabled" boolean DEFAULT false NOT NULL,
    "startDate" timestamp(3) without time zone,
    "endDate" timestamp(3) without time zone,
    "targetRoles" text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.feature_flags OWNER TO sees_user;

--
-- Name: graduation_eligibility_profiles; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public.graduation_eligibility_profiles (
    profile_id text NOT NULL,
    program_id text NOT NULL,
    rules jsonb NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    updated_by_staff_id text
);


ALTER TABLE public.graduation_eligibility_profiles OWNER TO sees_user;

--
-- Name: module_registration_rounds; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public.module_registration_rounds (
    round_id text NOT NULL,
    academic_year_id text NOT NULL,
    label text NOT NULL,
    status text DEFAULT 'DRAFT'::text NOT NULL,
    opens_at timestamp(3) without time zone,
    closes_at timestamp(3) without time zone,
    levels text[] DEFAULT ARRAY[]::text[] NOT NULL,
    notes text,
    student_message text,
    features jsonb,
    finalized_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.module_registration_rounds OWNER TO sees_user;

--
-- Name: notification_dispatch_logs; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public.notification_dispatch_logs (
    log_id text NOT NULL,
    dedupe_key text NOT NULL,
    event_key text NOT NULL,
    recipient_email text NOT NULL,
    recipient_user_id text,
    entity_type text,
    entity_id text,
    status text NOT NULL,
    error_message text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.notification_dispatch_logs OWNER TO sees_user;

--
-- Name: notification_email_templates; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public.notification_email_templates (
    template_id text NOT NULL,
    name text NOT NULL,
    event_key text NOT NULL,
    subject text NOT NULL,
    body text NOT NULL,
    placeholders jsonb,
    is_active boolean DEFAULT true NOT NULL,
    channel text DEFAULT 'email'::text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.notification_email_templates OWNER TO sees_user;

--
-- Name: notification_trigger_configs; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public.notification_trigger_configs (
    config_id text NOT NULL,
    event_key text NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    config_json jsonb,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.notification_trigger_configs OWNER TO sees_user;

--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public.password_reset_tokens (
    id text NOT NULL,
    user_id text NOT NULL,
    token text NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    used boolean DEFAULT false NOT NULL,
    used_at timestamp(3) without time zone
);


ALTER TABLE public.password_reset_tokens OWNER TO sees_user;

--
-- Name: registration_tokens; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public.registration_tokens (
    id text NOT NULL,
    user_id text NOT NULL,
    token text NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    used boolean DEFAULT false NOT NULL,
    used_at timestamp(3) without time zone
);


ALTER TABLE public.registration_tokens OWNER TO sees_user;

--
-- Name: selection_allocation_change_requests; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public.selection_allocation_change_requests (
    request_id text NOT NULL,
    round_id text NOT NULL,
    student_id text NOT NULL,
    requested_preference_1 text NOT NULL,
    requested_preference_2 text,
    reason text,
    status text DEFAULT 'PENDING'::text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    resolved_at timestamp(3) without time zone,
    resolved_by_user_id text
);


ALTER TABLE public.selection_allocation_change_requests OWNER TO sees_user;

--
-- Name: selection_applications; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public.selection_applications (
    app_id text NOT NULL,
    round_id text NOT NULL,
    student_id text NOT NULL,
    preference_1 text NOT NULL,
    preference_2 text,
    status text DEFAULT 'PENDING'::text NOT NULL,
    allocated_to text,
    waitlist_pos integer,
    gpa_at_time double precision DEFAULT 0.0 NOT NULL,
    applied_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.selection_applications OWNER TO sees_user;

--
-- Name: selection_round_configs; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public.selection_round_configs (
    config_id text NOT NULL,
    round_id text NOT NULL,
    program_id text,
    spec_id text,
    capacity integer DEFAULT 50 NOT NULL,
    priority integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.selection_round_configs OWNER TO sees_user;

--
-- Name: selection_rounds; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public.selection_rounds (
    round_id text NOT NULL,
    academic_year_id text NOT NULL,
    type text NOT NULL,
    label text NOT NULL,
    level text,
    status text DEFAULT 'DRAFT'::text NOT NULL,
    selection_mode text DEFAULT 'AUTO'::text NOT NULL,
    opens_at timestamp(3) without time zone,
    closes_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    approved_at timestamp(3) without time zone,
    notes text,
    allocation_change_grace_days integer DEFAULT 0 NOT NULL,
    target_program_id text
);


ALTER TABLE public.selection_rounds OWNER TO sees_user;

--
-- Name: system_metrics; Type: TABLE; Schema: public; Owner: sees_user
--

CREATE TABLE public.system_metrics (
    id text NOT NULL,
    "timestamp" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    cpu integer NOT NULL,
    cores integer NOT NULL,
    memory integer NOT NULL,
    storage_used double precision NOT NULL,
    storage_total double precision NOT NULL,
    storage_percent integer NOT NULL,
    uptime double precision NOT NULL,
    health integer NOT NULL,
    active_users integer NOT NULL
);


ALTER TABLE public.system_metrics OWNER TO sees_user;

--
-- Data for Name: AcademicGoal; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public."AcademicGoal" (goal_id, student_id, target_gpa, target_class, created_at, achieved_at, category, deadline, description, milestones, priority, progress, status, target_value, title, goal_type, metric_unit, target_value_number, baseline_value, module_id) FROM stdin;
e306e6a4-0d7b-4d89-9cd6-dd5f8f6d3dc6	STU001	3.5	\N	2026-04-16 14:53:47.575	\N	academic	\N	Maintain a strong GPA trend for this academic year.	\N	medium	68	COMPLETED	3.5	Reach 3.50 CGPA	GPA_TARGET	GPA	3.5	\N	\N
308bfa8e-3d3a-453e-a364-f7eeacb9f4c5	STU001	\N	\N	2026-04-16 14:53:47.575	\N	academic	\N	Stay on track for graduation credits.	\N	medium	52	COMPLETED	96	Complete 96 credits	CREDITS_TARGET	CREDITS	96	\N	\N
742c945d-8485-477a-9e7c-7b59460e7fcf	STU001	\N	\N	2026-04-16 14:53:47.575	\N	academic	\N	Lift marks in the architecture module.	\N	medium	60	IN_PROGRESS	75	Score 75 in INTE 21243	MODULE_GRADE_TARGET	MARKS	75	\N	ecbf469e-247b-4197-b733-f34490b94f8e
8102c732-9fac-42af-939d-36dd3cead425	STU001	\N	\N	2026-04-16 14:53:47.575	\N	academic	\N	Raise cumulative GPA by 0.30 points.	\N	medium	40	COMPLETED	0.3	Improve CGPA by 0.30	CGPA_IMPROVEMENT	POINTS	0.3	2.38	\N
0896e754-b9bb-495f-b748-e9d0a81f6053	IM/2024/116	3.9	\N	2026-04-17 16:58:05.845	\N	academic	2026-05-04 00:00:00	\N	{}	medium	99	IN_PROGRESS	3.9	gpa	GPA_TARGET	GPA	3.9	\N	\N
\.


--
-- Data for Name: AcademicRecoverySnapshot; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public."AcademicRecoverySnapshot" (snapshot_id, student_id, dip_fingerprint, previous_gpa, current_gpa, advice_json, generated_at) FROM stdin;
9a9a44f4-a8a2-4e05-890c-25b3a32a42ff	IM/2024/116	3.85_3.10	3.85	3.1	{"message": "We've noticed a slight dip in your GPA this semester. Don't worry—academic challenges are part of the journey!", "recovery_actions": ["Schedule a peer tutoring session", "Review foundations of your technical modules"], "support_resources": ["Peer Tutoring Center", "Module Office Hours"], "advisor_outreach_body": "Dear Advisor, I've noticed a drop in my performance this semester and would like to schedule a meeting to ensure I'm back on track.", "advisor_outreach_subject": "Request for Academic Support Meeting"}	2026-04-18 02:32:44.284
\.


--
-- Data for Name: AcademicYear; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public."AcademicYear" (academic_year_id, label, start_date, end_date, active) FROM stdin;
d0f33d92-6ff5-4627-801e-7edaceec7253	2024-2025	2024-01-01 00:00:00	2024-12-31 00:00:00	f
2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	2026-2027	2026-01-01 00:00:00	2027-01-01 00:00:00	t
\.


--
-- Data for Name: Advisor; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public."Advisor" (advisor_id, assigned_degree_path_id, is_available_for_contact, specialty_areas, bio) FROM stdin;
599cb63f-b19a-424c-aad6-7f0d4fa66eb5	\N	t	\N	\N
\.


--
-- Data for Name: AnonymousReport; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public."AnonymousReport" (report_id, student_id, content, priority, status, created_at, updated_at, admin_notes, assigned_to) FROM stdin;
2db5eec0-8389-407d-885c-f213f51e2510	16f172bf-5f54-46f0-aa41-a0a1de2b8f4b	The study area on the 3rd floor of the library has poor lighting in the evenings.	medium	PENDING	2026-04-16 14:53:57.036	2026-04-16 14:53:57.036	\N	\N
1cdb4325-d429-4eac-a145-74ba3f19e4cb	16f172bf-5f54-46f0-aa41-a0a1de2b8f4b	Requesting more practical sessions for Web Application Development.	high	IN_REVIEW	2026-04-16 14:53:57.038	2026-04-16 14:53:57.038	\N	\N
\.


--
-- Data for Name: DegreeProgram; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public."DegreeProgram" (program_id, code, name, description, active, is_common, academic_year_id) FROM stdin;
24bcdfbd-b096-438c-b69e-ad906fbdaf00	MIT-COMMON	MIT (Common Foundation)	\N	t	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
ca7dfed6-55a9-46c5-bee1-7034852ea30b	MIT	B.Sc. in Management & Information Technology	B.Sc. Honours in Management and Information Technology	t	f	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
65bd1828-487f-486b-be24-4f7e7c5e5ee2	IT	B.Sc. in Information Technology	B.Sc. Honours in Information Technology	t	f	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
\.


--
-- Data for Name: GPAHistory; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public."GPAHistory" (gpa_history_id, student_id, calculation_date, gpa, academic_class) FROM stdin;
398a05f4-5053-4401-92f3-bb3376beafc2	STU001	2023-12-31 00:00:00	3.84	\N
d5f39d9f-89e9-453e-a3c6-ab844f5ac3d8	IM/2024/001	2024-12-20 00:00:00	3.72	First Class
5268797b-082e-4bb8-8773-33717ee6dcf7	IM/2024/002	2024-12-20 00:00:00	3.72	First Class
97cf8332-9b7f-4f0f-bce0-31e029d2087a	IM/2024/003	2024-12-20 00:00:00	3.64	Second Upper
565aa786-1c50-4733-a342-297516f74dbf	IM/2024/004	2024-12-20 00:00:00	3.65	Second Upper
66f1085b-e819-421e-85bb-f9e7e89a8769	IM/2024/005	2024-12-20 00:00:00	3.51	Second Upper
ed710a9c-e606-418e-bda8-bede58cedc1b	IM/2024/006	2024-12-20 00:00:00	3.36	Second Upper
0d53f9b8-a5bb-4311-943b-7b9d04fe1144	IM/2024/007	2024-12-20 00:00:00	3.65	Second Upper
86729c93-4663-4cf7-a573-7462700a9e43	IM/2024/008	2024-12-20 00:00:00	3.47	Second Upper
e75069a5-d88d-4b92-b857-95cb32541433	IM/2024/009	2024-12-20 00:00:00	3.49	Second Upper
cb3cdcb0-2216-445d-8a8d-fab524087bc6	IM/2024/010	2024-12-20 00:00:00	3.7	First Class
8c704e32-a65f-4bf7-a81b-0a3c5ddcc33f	IM/2024/011	2024-12-20 00:00:00	3.58	Second Upper
0156848e-efd7-4dac-a00f-9475ed58e257	IM/2024/012	2024-12-20 00:00:00	3.59	Second Upper
7632339f-929a-4b1d-8ee5-958ab54ce70a	IM/2024/013	2024-12-20 00:00:00	3.75	First Class
7ba32421-cc71-4863-a2eb-59a6fc12a662	IM/2024/014	2024-12-20 00:00:00	3.67	Second Upper
05986dfc-56ee-4da5-8fbc-66dc66e10410	IM/2024/015	2024-12-20 00:00:00	3.71	First Class
7f35eeac-4ebf-4cba-853a-13c83f36b1e2	IM/2024/016	2024-12-20 00:00:00	3.76	First Class
96b54a67-9359-464a-868b-878b83de3d87	IM/2024/017	2024-12-20 00:00:00	3.65	Second Upper
419f48ea-50da-4377-8d6c-cb216f857238	IM/2024/018	2024-12-20 00:00:00	3.64	Second Upper
b738216f-5e54-449c-b883-da8b0e4e48e7	IM/2024/019	2024-12-20 00:00:00	3.82	First Class
f8a2b4bc-05bb-40e8-94cd-7e5d961c08ca	IM/2024/020	2024-12-20 00:00:00	3.71	First Class
9a9f43a2-2785-4624-8048-2ac5911fa300	IM/2024/021	2024-12-20 00:00:00	3.72	First Class
2c95f60c-05e9-4ec9-bcc1-a52273fde6ef	IM/2024/022	2024-12-20 00:00:00	3.72	First Class
38324e8d-b219-4701-92d1-7470a2a25cfc	IM/2024/023	2024-12-20 00:00:00	3.64	Second Upper
5e8c2416-ad23-4a0f-8a46-7301b9e06c31	IM/2024/024	2024-12-20 00:00:00	3.65	Second Upper
6ecc03e8-30db-402d-ad26-07f15e1fba71	IM/2024/025	2024-12-20 00:00:00	3.56	Second Upper
af730ea0-4e24-4ddf-ba8c-0430343735d6	IM/2024/026	2024-12-20 00:00:00	3.52	Second Upper
b0aaaf7c-647f-419a-a168-4e8a76740785	IM/2024/027	2024-12-20 00:00:00	3.47	Second Upper
f05df30e-0141-41c3-a7dc-993e0517de2e	IM/2024/028	2024-12-20 00:00:00	3.35	Second Upper
f7173dba-8deb-4c32-b88a-49615a190280	IM/2024/029	2024-12-20 00:00:00	3.49	Second Upper
aba32ba5-b7e1-43ca-9464-11ffd90b6d01	IM/2024/030	2024-12-20 00:00:00	3.7	First Class
d8bbcb6d-33b9-4f9d-a093-35e416dc2131	IM/2024/031	2024-12-20 00:00:00	3.58	Second Upper
38afba8d-2c63-4437-b839-8ec4fde694d4	IM/2024/032	2024-12-20 00:00:00	3.59	Second Upper
e20f3529-a588-4e1c-bbde-0419c31ce7b7	IM/2024/033	2024-12-20 00:00:00	3.75	First Class
46271d0f-da87-4027-8855-1e112b9c0b17	IM/2024/034	2024-12-20 00:00:00	3.67	Second Upper
8a8a5df9-b079-42fd-814e-49d9ec97408a	IM/2024/035	2024-12-20 00:00:00	3.71	First Class
69ac53de-3071-4e89-b31a-cac0d3c75aa5	IM/2024/036	2024-12-20 00:00:00	3.76	First Class
18789134-5bd3-4491-9db3-e3e53b08ccfb	IM/2024/037	2024-12-20 00:00:00	3.65	Second Upper
57ae702e-7ea1-4269-a9b5-b1e0abdbcb41	IM/2024/038	2024-12-20 00:00:00	3.64	Second Upper
346e84ee-0d9c-49fc-bbdd-f9092b9c0469	IM/2024/039	2024-12-20 00:00:00	3.82	First Class
ab94e7ee-99b8-4ff3-95dd-9c53dc33254d	IM/2024/040	2024-12-20 00:00:00	3.71	First Class
8f5c789f-0105-4acd-a120-6f66cc565ab4	IM/2024/041	2024-12-20 00:00:00	3.72	First Class
e8960039-e31f-4deb-8992-40d249eb5de4	IM/2024/042	2024-12-20 00:00:00	3.72	First Class
f5489ae2-f217-4508-a98e-6c1cafd9f77a	IM/2024/043	2024-12-20 00:00:00	3.64	Second Upper
11e3682c-e1a7-494e-825e-70073a23df67	IM/2024/044	2024-12-20 00:00:00	3.65	Second Upper
2083425d-6538-4d09-b9ea-67e6136fb486	IM/2024/045	2024-12-20 00:00:00	3.56	Second Upper
fbe62e68-b898-4875-b844-58c583bc8314	IM/2024/046	2024-12-20 00:00:00	3.52	Second Upper
12c3635a-4800-4756-a0a0-2f2109c8ad6f	IM/2024/047	2024-12-20 00:00:00	3.65	Second Upper
1a6f17b7-434b-48eb-8e84-98fcf11083ed	IM/2024/048	2024-12-20 00:00:00	3.44	Second Upper
a5a0e72a-5c54-4ea8-9349-dfe7e186ab3d	IM/2024/049	2024-12-20 00:00:00	3.39	Second Upper
0a218027-ba3c-4ba3-a64e-d6271dac9d11	IM/2024/050	2024-12-20 00:00:00	3.7	First Class
b14aecd5-11f9-4f3f-b80b-399faa1074b3	IM/2024/051	2024-12-20 00:00:00	3.58	Second Upper
e8168746-7909-4722-a8dd-f6cf4758638e	IM/2024/052	2024-12-20 00:00:00	3.59	Second Upper
e3d83356-5211-4739-9f77-09f7ef41e4d2	IM/2024/053	2024-12-20 00:00:00	3.75	First Class
133cac95-695b-4049-9262-e3a7c71a7918	IM/2024/054	2024-12-20 00:00:00	3.67	Second Upper
f450141c-26cd-4c99-9d60-8753d837c92a	IM/2024/055	2024-12-20 00:00:00	3.71	First Class
4c57a871-ec05-4748-bdb7-49d65d25ca23	IM/2024/056	2024-12-20 00:00:00	3.76	First Class
2b9fb2d9-a3b5-4240-8621-900bd7cf1ce6	IM/2024/057	2024-12-20 00:00:00	3.65	Second Upper
a1815860-cebf-4755-beb2-10b3cc4036d7	IM/2024/058	2024-12-20 00:00:00	3.64	Second Upper
453ed9da-ec4a-43dc-937a-cf19351773e7	IM/2024/059	2024-12-20 00:00:00	3.82	First Class
61ff81ec-909e-443d-bed0-7c49c6129485	IM/2024/060	2024-12-20 00:00:00	3.71	First Class
a77ef63a-de2c-40b7-857e-8a42505efa54	IM/2024/061	2024-12-20 00:00:00	3.72	First Class
583c94f1-3aae-4ee7-bf0a-bd4fed01183d	IM/2024/062	2024-12-20 00:00:00	3.72	First Class
9d076557-19c1-4f33-8829-b8f9f7a0183c	IM/2024/063	2024-12-20 00:00:00	3.64	Second Upper
420f7e28-7d1e-4fff-8efe-cb092a4b04a0	IM/2024/064	2024-12-20 00:00:00	3.65	Second Upper
fa184cea-c27f-446f-b57b-9962e0b76972	IM/2024/065	2024-12-20 00:00:00	3.56	Second Upper
8f374243-95ab-4440-b556-5dee5d05c59f	IM/2024/066	2024-12-20 00:00:00	3.52	Second Upper
da0fa943-8926-4d9f-bd23-b4938e7f096d	IM/2024/067	2024-12-20 00:00:00	3.65	Second Upper
b4a38031-c1b6-4f11-b54e-74e9d0a3bd46	IM/2024/068	2024-12-20 00:00:00	3.47	Second Upper
a9cf0e00-808d-4945-a423-556e210f3a03	IM/2024/069	2024-12-20 00:00:00	3.49	Second Upper
d4b17dc8-533a-4eac-b1be-6eb496041442	IM/2024/070	2024-12-20 00:00:00	3.55	Second Upper
f38a1afe-2073-4ca4-acef-59a8049639a5	IM/2024/071	2024-12-20 00:00:00	3.41	Second Upper
8bcb256d-5979-4538-9192-4e1b8f9d95e9	IM/2024/072	2024-12-20 00:00:00	3.59	Second Upper
f083af3a-33cb-4505-87d2-9dec489da60e	IM/2024/073	2024-12-20 00:00:00	3.75	First Class
0bd7bd6a-0142-40e1-8340-e5da5d534ded	IM/2024/074	2024-12-20 00:00:00	3.67	Second Upper
0b7e490d-90cb-471e-a0c6-7ae5e2cba46c	IM/2024/075	2024-12-20 00:00:00	3.71	First Class
f2d41253-de3f-49ed-bea9-cd5f7a5dd8f6	IM/2024/076	2024-12-20 00:00:00	3.76	First Class
948930e6-2803-41a3-8aae-0b2511f3b625	IM/2024/077	2024-12-20 00:00:00	3.65	Second Upper
893599d1-bf83-4099-9a46-f286e521c292	IM/2024/078	2024-12-20 00:00:00	3.64	Second Upper
fdeb6484-dd50-4fae-8c55-20a0d078b9b4	IM/2024/079	2024-12-20 00:00:00	3.82	First Class
6ead26ad-a246-4197-b1de-625aadf8258d	IM/2024/080	2024-12-20 00:00:00	3.71	First Class
f3239bfe-b6e0-4632-be01-3e0e94184f18	IM/2024/081	2024-12-20 00:00:00	3.72	First Class
986f0c38-784a-4ecd-8563-f5995a436a96	IM/2024/082	2024-12-20 00:00:00	3.72	First Class
661730ff-9a63-4d53-b4b6-5da877d13e8d	IM/2024/083	2024-12-20 00:00:00	3.64	Second Upper
02821dfa-572d-4473-b591-65631e7f78b7	IM/2024/084	2024-12-20 00:00:00	3.65	Second Upper
f5a23f2b-8e2e-4880-aed3-02e1ab7b0b0e	IM/2024/085	2024-12-20 00:00:00	3.56	Second Upper
5c12c129-910b-4c67-bc68-6971e05c5efa	IM/2024/086	2024-12-20 00:00:00	3.52	Second Upper
0b35381e-923a-4dad-bbea-e14372ea22ac	IM/2024/087	2024-12-20 00:00:00	3.65	Second Upper
be2d0ec1-4d53-4d46-af5b-b6cf62bb4852	IM/2024/088	2024-12-20 00:00:00	3.47	Second Upper
db8e3d28-d9b7-4119-a8f8-6eb49d82e16a	IM/2024/089	2024-12-20 00:00:00	3.49	Second Upper
0b8baca1-8f3b-4e84-8b4a-844e9e31cd08	IM/2024/090	2024-12-20 00:00:00	3.7	First Class
04b857a2-651f-4bea-999b-790cd94b2155	IM/2024/091	2024-12-20 00:00:00	3.58	Second Upper
00267489-7ecb-40ec-8521-4cf6f528567b	IM/2024/092	2024-12-20 00:00:00	3.49	Second Upper
e4fabd4a-1f5c-4840-94d2-924ef7e80001	IM/2024/093	2024-12-20 00:00:00	3.75	First Class
fe539657-0ec7-4124-89e8-081069300c25	IM/2024/094	2024-12-20 00:00:00	3.67	Second Upper
82545a63-062b-4471-b97b-d81bcbea5965	IM/2024/095	2024-12-20 00:00:00	3.71	First Class
90a2dee4-9276-4e1c-964e-485bfd6752ad	IM/2024/096	2024-12-20 00:00:00	3.76	First Class
f3ba6f1d-ba4b-4146-9f60-0ae6d4b38207	IM/2024/097	2024-12-20 00:00:00	3.65	Second Upper
61bcae86-0c7a-48da-bf11-f01834011140	IM/2024/098	2024-12-20 00:00:00	3.64	Second Upper
d081a4c2-0dff-4ae4-b80e-5ebf908372c0	IM/2024/099	2024-12-20 00:00:00	3.82	First Class
a540ad10-18e5-4ef5-bc2d-8fe53cbc85df	IM/2024/100	2024-12-20 00:00:00	3.71	First Class
4b57e211-06b8-4368-a5e9-adb627902008	IM/2024/101	2024-12-20 00:00:00	3.72	First Class
48d5017e-1def-4a0b-8845-7aaa50b9ee3d	IM/2024/102	2024-12-20 00:00:00	3.72	First Class
b76b459a-4669-4de5-803a-57351c363c90	IM/2024/103	2024-12-20 00:00:00	3.64	Second Upper
bf3124d7-77c6-407f-a366-5cf1e80a8615	IM/2024/104	2024-12-20 00:00:00	3.65	Second Upper
4703c27b-c97d-4132-9ce3-446d08442afe	IM/2024/105	2024-12-20 00:00:00	3.56	Second Upper
06346b64-1cfd-4b65-b0f1-b90643f91ed9	IM/2024/106	2024-12-20 00:00:00	3.52	Second Upper
e46ca235-c1b7-4c7d-977a-7c73d39237e9	IM/2024/107	2024-12-20 00:00:00	3.65	Second Upper
49c0a127-1e72-4d3c-924d-3219482fa20b	IM/2024/108	2024-12-20 00:00:00	3.47	Second Upper
ec9188aa-c5d5-4cc8-9e37-c9647d77c76c	IM/2024/109	2024-12-20 00:00:00	3.49	Second Upper
cc55c173-0ff7-452c-b67a-9ad47d546423	IM/2024/110	2024-12-20 00:00:00	3.7	First Class
ed7451d0-14bc-4d27-991c-47ef3cc49e29	IM/2024/111	2024-12-20 00:00:00	3.58	Second Upper
9283c17c-1558-4e77-90d5-0d567474b156	IM/2024/112	2024-12-20 00:00:00	3.59	Second Upper
8e5e0df7-f251-4f2d-9a17-8dce1499cfe8	IM/2024/113	2024-12-20 00:00:00	3.75	First Class
d18f8dd9-0eae-4334-b202-b1302e00f544	IM/2024/114	2024-12-20 00:00:00	3.49	Second Upper
b784e5dc-de47-403d-b26e-6c7f031a57b9	IM/2024/115	2024-12-20 00:00:00	3.71	First Class
8c5061a5-81a9-4600-9aa8-69e80bc48316	IM/2024/116	2024-12-20 00:00:00	3.76	First Class
\.


--
-- Data for Name: Grade; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public."Grade" (grade_id, reg_id, student_id, module_id, semester_id, marks, grade_point, letter_grade, attempt_no, released_at) FROM stdin;
a7e6fa1d-9d74-480d-a3a8-a79eb90af2ec	df3b19ec-f6ad-4893-9390-905dee2f23f7	STU001	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	0	3.7	A-	1	2026-04-16 14:53:47.37
b5037726-7000-4e7a-80fc-1764cd903261	479ea11e-2149-4b16-9551-8c89be028b77	STU001	9894f62f-df87-4476-af90-f04a6cc7bd5f	3382c9f4-30d9-46ef-91bc-45467677518a	0	3.7	A-	1	2026-04-16 14:53:47.379
457a31d4-609a-4f62-92fb-f3cfab0365de	7728ed78-55bf-43ba-9d75-fc285a3ef36b	STU001	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	0	0	Pass	1	2026-04-16 14:53:47.388
c91a851e-d336-426b-80a0-84d1d968c4f8	645a5c86-5a17-4af2-bcd3-3bf48157504c	STU001	5ee82f64-40a2-42ff-9177-6bcbd8c2b421	3382c9f4-30d9-46ef-91bc-45467677518a	0	4	A+	1	2026-04-16 14:53:47.395
9f821054-7059-429e-888f-4470ba90e445	accfb59c-4c7e-4bc3-b633-5ce93381861b	STU001	6a4365ba-f8e1-41d3-8d57-37d99c05b6eb	3382c9f4-30d9-46ef-91bc-45467677518a	0	4	A+	1	2026-04-16 14:53:47.403
4b3b1ccc-d020-4515-b57c-0c140e936458	c2c6444e-baa4-44d8-9cf8-22398986e749	STU001	45858f7a-e9f0-40ea-a8ae-f8c9bffc6871	b52e9840-4294-4c6b-86a9-2315f51dd27c	0	4	A	1	2026-04-16 14:53:47.411
619b6d7d-be3c-44d9-8fa8-3771bb805680	a2fed819-98a5-4b8a-b9e6-6107453e6f80	STU001	e29d6743-b886-4474-95b5-359aae809049	b52e9840-4294-4c6b-86a9-2315f51dd27c	0	4	A	1	2026-04-16 14:53:47.421
7372d0cf-38e4-46c9-9f1c-bdb0e0132b58	60eb2295-08e5-463e-9d63-773695400644	STU001	14b0f2a4-f3ef-4ff2-ad38-1fd08167b4d5	b52e9840-4294-4c6b-86a9-2315f51dd27c	0	4	A+	1	2026-04-16 14:53:47.428
af65987a-55ce-4400-9f53-9e879695c33e	4233c782-f278-4933-b742-15e3feb2eb37	STU001	885914a6-f005-4808-bde4-b67851801d16	3382c9f4-30d9-46ef-91bc-45467677518a	0	4	A+	1	2026-04-16 14:53:47.436
d181f7a7-516c-47e2-8165-748595c8706d	cb8b0b92-4a1c-468e-be6c-2eb56e804a07	STU001	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	0	4	A+	1	2026-04-16 14:53:47.444
1ce68914-f1e9-44e6-be89-a9c99c277955	a59a3726-f890-4d73-a19e-ebb346d5a459	STU001	48c173ad-69c2-4b1d-a620-b3be1b7492a2	b52e9840-4294-4c6b-86a9-2315f51dd27c	0	4	A+	1	2026-04-16 14:53:47.452
a9a06c27-63d4-42f1-b799-d9da4faf65d8	7587c7d5-29e7-4406-afdc-f3829b79cd79	STU001	22517233-8fda-461e-894a-57d765874c16	b52e9840-4294-4c6b-86a9-2315f51dd27c	0	3	B	1	2026-04-16 14:53:47.46
d86af1fa-3685-4491-b423-5c6ca71d3967	90bc7533-8f73-4f79-861d-858b32aee98b	STU001	1a825eee-395c-486a-b652-92e2ee82d9c1	b52e9840-4294-4c6b-86a9-2315f51dd27c	0	4	A	1	2026-04-16 14:53:47.467
7a477a21-3561-462c-aa57-dc0c5de4462d	4e3d8387-2d23-423f-8a23-1f5f42d3fc76	STU001	9d83de2f-d4f2-42f3-8182-cab722102acb	3382c9f4-30d9-46ef-91bc-45467677518a	0	4	A	1	2026-04-16 14:53:47.475
461b2f2a-952a-4d86-adf7-8efc6baac1bd	a3b3787e-3d17-4962-9a0f-ca901eac4f4a	STU001	e8261880-6a9a-4c26-8b4c-9b27826d496a	b52e9840-4294-4c6b-86a9-2315f51dd27c	0	3	B	1	2026-04-16 14:53:47.483
93e6dbfe-83ed-4950-b782-f39486f47f6f	b6cd52c3-da07-4613-b46d-39fdc62afda2	STU001	ecbf469e-247b-4197-b733-f34490b94f8e	3382c9f4-30d9-46ef-91bc-45467677518a	0	4	A+	1	2026-04-16 14:53:47.501
eeda5930-13fb-44d6-8e0e-691fabf5ebe3	04874f11-d6d8-40f0-93dc-5f214d0e496c	STU001	dd19d0bd-311c-4aaf-92c2-3cb6c82b1902	3382c9f4-30d9-46ef-91bc-45467677518a	0	4	A	1	2026-04-16 14:53:47.511
34afe2fc-30e4-4d8a-8988-0e45d0b88639	c5920aed-5e34-43fb-a965-150b4ff86e34	STU001	71ae9cd2-8ccd-4cc0-94a7-c416c0907810	3382c9f4-30d9-46ef-91bc-45467677518a	0	3	B	1	2026-04-16 14:53:47.527
2710effe-d750-4fd8-811b-4db083f83971	b7c71726-aacc-4873-a50d-2e6d7ff71a50	IM/2024/001	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3	B	1	2024-07-01 00:00:00
97be4208-52b5-48ac-8b3b-c92a1a6d45b6	8d1e9e3f-7db8-4103-874f-ad99f3a25389	16f172bf-5f54-46f0-aa41-a0a1de2b8f4b	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2.7	B-	1	\N
2b7ee216-7932-4bc7-bd6a-0b97c79b78c6	f1a35dde-9d0d-43f1-8256-143c384fd6fd	IM/2024/001	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
c17f20f6-5bfb-42d9-99f6-0d6d48c65b0e	6d1d86b2-a6d7-4daf-94e4-d1c8160ebe3a	IM/2024/001	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.7	A-	1	2024-07-01 00:00:00
40e59959-a21a-4e04-a401-4c33c29a4e5a	d8f9efb0-0cdd-424d-a029-c9a7ea3ccbac	IM/2024/002	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.7	A-	1	2024-07-01 00:00:00
ea2eb3a6-9c41-457f-b8ac-bc122e271249	588c8915-313e-4233-a5b5-201f83917900	IM/2024/002	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
ddbbc53d-51af-4d39-96fe-38e15e457888	61e099c6-cce1-436c-b748-b2196b04e92e	IM/2024/116	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2.7	B-	1	2026-04-17 17:11:22.596
a381e6b4-5c22-4335-bb26-cef1602cbb29	ca42c851-aea6-44c5-b80d-75da66c02f0e	IM/2024/002	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
5bb57fac-1f04-40d1-82f8-aa0e704bb2f2	546bc529-8890-4bb3-ba23-8ce9bb46c0c1	IM/2024/003	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
f8133383-34af-427e-bcd7-9aeb7cfd07ba	987a2995-9d6c-4313-a690-57ae452691ed	IM/2024/003	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
984e796a-b760-4347-a901-dd55a7e64814	8a73226d-13cc-4922-8e00-0982b322d51d	IM/2024/003	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2.3	C+	1	2024-07-01 00:00:00
3bed94ff-e09d-4498-9a09-ed232b0900b3	4c4d3c72-2d78-4fef-8dd1-dea52adcaffd	IM/2024/004	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3	B	1	2024-07-01 00:00:00
4af3522a-cd9f-42a0-9565-3cc63b22a059	adc66d27-4eae-4754-8d86-329459ce92a5	IM/2024/004	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
a9147906-d5e5-4141-8e65-9d77a51a5080	524183c8-c03f-498a-8e63-f7fbadcbcaba	IM/2024/004	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.7	A-	1	2024-07-01 00:00:00
42843300-4aad-4981-8ea5-e30d28994a55	3ed36c9a-b0e9-4ace-a654-d5b1866d2157	IM/2024/116	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2	C	1	2026-04-17 20:44:06.689
38bd9fd8-17b0-4b5d-9d49-c01d59ab8d9a	708ca214-93de-4b15-8c88-3447396bc5cb	IM/2024/005	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.7	A-	1	2024-07-01 00:00:00
12978e0c-121b-4f5d-8665-0b85e345905e	1bff761c-3a8b-4d16-8ec0-882571a5abf1	IM/2024/005	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
ac50807a-97c6-4a28-b3cc-b7afbdf618bf	0bf30ca5-bcdf-4c9a-9a77-ac25af6fc10e	IM/2024/005	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
39a94b6e-85d3-4597-a6bd-c5a2f2095482	06ad0f34-7859-412a-81d7-c8e2ceac3107	IM/2024/006	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
3007fa45-c50f-4f52-ae5b-84d59e52ae7c	16581dd8-6ef1-4bf8-bfdd-6103c9ccd171	IM/2024/006	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
44d2f1c2-d35a-4e43-93e6-e1ccf6153909	f09de42b-4e0d-4180-acad-73039b090feb	IM/2024/006	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3	B	1	2024-07-01 00:00:00
1306e80f-c9c9-4721-a1cc-99a8b7ea3293	6b4cf80c-ca17-42ee-b08c-c1dc13edda7e	IM/2024/007	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.3	B+	1	2024-07-01 00:00:00
d81d5012-4006-4ae0-8f80-278774bdf704	e2e80154-3a49-49b0-82f0-ecba83af6e07	IM/2024/007	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
85d3c59b-8a8f-4eb9-a2b8-fa886e472016	55b606c0-cf28-4da0-9e58-18fb5409a7d4	IM/2024/007	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.7	A-	1	2024-07-01 00:00:00
498acdc8-1004-495a-aad2-9feb7b951f26	d2fc97c8-c99c-4665-b75d-f337a040a07c	IM/2024/008	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
b9c446a5-3a9e-4cab-8925-2217a6e0b352	5adf3e3e-b933-4cae-b5aa-184028b37654	IM/2024/008	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
5457844e-1ad5-497c-8853-8d1176e24d3d	c23aa404-b2ed-4e97-97a2-6fbe9c61faa4	IM/2024/008	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
1b2c9790-1d59-4c38-89e9-cf23a989235d	ad00f950-aa62-483e-aab8-87072b209f9e	IM/2024/009	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
2f334925-131c-4bfb-ba39-1e3181b36789	0b071cae-25a5-4807-b9b4-d2bb2d1d701f	IM/2024/009	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
1842a537-a60c-49dd-a728-dbccd1210d45	88d9b944-022a-4e2f-ab4d-2f08d8ddb565	IM/2024/009	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3	B	1	2024-07-01 00:00:00
f2224a70-d55e-40ab-b756-c95cefe3f36f	851da9a4-1b11-42b8-81e4-45616b3dddf5	IM/2024/010	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.3	B+	1	2024-07-01 00:00:00
104c22ab-5aaa-4ca3-8fb5-9db68ba5024f	e4e08742-272b-47d1-baec-883fa175f878	IM/2024/010	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
16f1b3a3-e5ca-46ea-b9fc-5690d32ff777	ff9e61bf-0b20-464d-9767-653fcc43c962	IM/2024/010	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.7	A-	1	2024-07-01 00:00:00
3f4e528c-1c94-4c95-aca3-2d498a958d99	a901cc7f-6a46-4881-9b7c-98d2df1f62b4	IM/2024/011	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
0af91e29-f21c-4343-956b-72da4c3f0aed	5155f53d-ebbe-447a-961b-7cdda95c8c5d	IM/2024/011	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
9c774d1f-0694-4be8-8544-9e861bad773c	8ebadb7c-9cd7-44c2-8e6d-d63dca1c7623	IM/2024/011	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
ef3ffe13-8e6d-4004-a72d-78490ddba40b	04b4d37d-cfe8-484b-85f0-5b9182548cf2	IM/2024/012	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
737194e1-0800-46d1-a57a-42be9d611680	db2cff30-1fbb-426c-ab31-4d2bd94a341e	IM/2024/012	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
020f9f86-03d7-41e7-bd01-5fee3956ed3e	50ccff5f-07e2-42de-a563-945563bb4eb9	IM/2024/012	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.3	B+	1	2024-07-01 00:00:00
a993310c-3b85-41fe-818d-e1854739ac39	de403076-9d40-40d7-87a3-301e59e78528	IM/2024/013	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.3	B+	1	2024-07-01 00:00:00
31532808-fe9a-4da2-ada3-f9fb239b2687	c58e877f-d708-451c-ba66-18f981d34c58	IM/2024/013	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
a2b84fdb-4b8d-43ce-ac9d-fd93bfe41e41	15c8cd98-848d-41a0-a849-92900c0934e3	IM/2024/013	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
d4b9138a-5efb-46e5-86d3-94b91a26789c	bfc325a6-efe5-4481-855d-06880ac8746c	IM/2024/014	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
78b2eecb-2aa1-4360-b71f-8a7b9bdb3055	886f41fa-67b5-43cc-9b1b-ccf7e30bc462	IM/2024/014	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
31825a43-005c-4d89-b20c-8548f757fdbf	dbd77fdb-753e-4c14-a978-cb066a37bff5	IM/2024/014	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
24fcfed3-eae9-476c-87fb-150a71d8d203	cc7c20e4-9c8b-47ee-9b33-a419aff65b9a	IM/2024/015	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
f1569895-1378-45fd-95d0-cb90db5fb46f	3a278252-0da9-4a22-b5c9-3ac77b123788	IM/2024/015	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
78c8d9c7-576a-480f-9b56-6c2caf5dcd87	3d63b3ff-a11e-4b10-9386-a19d0137b4a9	IM/2024/015	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.3	B+	1	2024-07-01 00:00:00
05c049de-a4f1-4755-ab5d-5dd7cb9fc70b	5c93e4b2-2c3b-4490-96ae-613e018280fc	IM/2024/016	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.7	A-	1	2024-07-01 00:00:00
a41ed143-bec8-4401-80e5-a07e6146cea4	33e2821b-8d7c-4794-bb37-611cc10a1730	IM/2024/016	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
77b464fe-3a99-40f4-8442-95cc4b056f70	ec90f9dd-1f58-4eff-b2f8-d28e277c26cf	IM/2024/016	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
f7fcc17f-1e87-4b30-bc40-2a9bc3224ff3	49b7e155-9125-4102-a08d-cfcd95e45840	IM/2024/017	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
be3b11e7-a7f6-46c2-b04c-96a02d3c4781	b1a98fce-7aad-4fcf-8a4e-22321cebc713	IM/2024/017	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
d2fd36c3-c23b-4032-994d-d9372edb67ea	0e4af62f-5220-4bff-afa7-b5e053bf3d69	IM/2024/017	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
0b18d0e0-ffc2-4a6b-b587-e65faf83f5a8	5284cedc-a771-461f-9f75-eefde7ede20b	IM/2024/018	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2.3	C+	1	2024-07-01 00:00:00
231ffa83-2983-4337-992a-bb9489b4959a	df33fa61-2433-434b-bc8f-ee63ff07fd08	IM/2024/018	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
399e2b60-23b7-42cc-b086-97edbf75a91a	5bc57089-fa50-45d0-877f-cf0a997aef3e	IM/2024/018	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.3	B+	1	2024-07-01 00:00:00
3783062f-bf6f-41ba-b97e-c8a09e0368f8	8450716d-149e-4fde-b223-960ec822ad5c	IM/2024/019	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.7	A-	1	2024-07-01 00:00:00
63623818-681f-4014-98d4-b9b07ff3b9b9	44bb7eac-f466-4709-b786-b9cdbc52253e	IM/2024/019	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
4cd8ed83-b1a2-4524-a1d2-1efa7f3eaca8	b0cc794c-8e09-4719-985b-aa523c6c18ba	IM/2024/019	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
eb6d7680-26af-40af-9148-4870835b4afb	2fadabd8-bfb1-4332-b4e5-eaca25f1029d	IM/2024/020	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
ee44e740-a440-41bf-8b81-50749431c125	52f3880b-e39c-4eb5-8c3a-36e619b0941c	IM/2024/020	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
10fe9dd6-ef0e-4b97-b36b-f415ed4fa4c5	2e038e07-6a3b-4de1-84b5-5d80ebf0474d	IM/2024/020	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
91b37e07-63d9-4791-a3f6-a09dbaf70cd9	335b6f72-d683-46ea-aaa0-e5c736e9a0b2	IM/2024/021	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3	B	1	2024-07-01 00:00:00
26bca9d9-8de8-424c-a6ce-55b26b10ad16	d6d884bc-6065-4eae-9d23-2e53f0a43b8d	IM/2024/021	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
0c42c1b6-a2bd-4127-a223-8fecb7d72879	406a4a37-5f14-40e0-b388-9ab09ef63fb1	IM/2024/021	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.7	A-	1	2024-07-01 00:00:00
1a017b62-ec96-4513-b04b-eb709ac8d406	dec55110-5a52-4beb-a808-0c923311d822	IM/2024/022	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.7	A-	1	2024-07-01 00:00:00
f12ace3d-fa8a-4b49-a9ef-562b80b1d8dc	7f2dc44e-7396-46fd-a33a-0fea56aafa48	IM/2024/022	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
fcec24c6-e756-415c-be4b-8988f307ed1a	9b1ccc39-edbd-4162-b1a2-d3999ecda6d4	IM/2024/022	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
9344da21-0130-4cf1-9fe9-d7314a1802f4	004001b7-4ed2-43fd-82db-1a1e091d0322	IM/2024/023	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
2030216b-8555-4b1e-bef4-d32203f82eba	3ac895f0-583b-492a-b181-aed44f5ced12	IM/2024/023	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
81aef157-19f5-49e2-b60e-886310ea8248	a6495886-9fc4-4add-9845-5785a96c95a6	IM/2024/023	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2.3	C+	1	2024-07-01 00:00:00
c3a408ee-7d6c-4727-bbd0-ce6baeaffe88	72547468-186e-4e5b-b837-542a9477853a	IM/2024/024	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3	B	1	2024-07-01 00:00:00
2719413d-a667-49f6-a3a8-d2b6748aadf7	55b1d3aa-5649-43f3-9a18-2f71c5eb63e3	IM/2024/024	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
7ee33ab9-9ceb-4151-8bd6-ddfaad86887b	c42ff46f-cb8d-455f-b45c-226b192d7e39	IM/2024/024	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.7	A-	1	2024-07-01 00:00:00
8def1b07-b717-420f-a8dc-5e5d925c656a	280988cd-81af-4d3c-acb2-da680eb86796	IM/2024/025	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.7	A-	1	2024-07-01 00:00:00
8e649e9f-e7d6-4e69-9aab-f0fd09a49e73	b36c2128-a380-45b9-b0fc-4b450f065ab8	IM/2024/025	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
892645b5-b61c-4d28-b23e-c270e28168f4	f81c3f86-32d1-45fe-902a-c1c339e67cdd	IM/2024/025	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
ba432f5f-0c73-423f-a8ab-33542cd3a975	71b98566-a291-4652-ac3c-9b3e0a33a142	IM/2024/026	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
f001fee1-ea13-44b5-ace3-147aae4d9d0e	3f5cd620-6c77-4ee1-af65-a8b5cedca93b	IM/2024/026	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
f16be102-6112-4789-8474-479e78c4f48b	537e7b64-cec0-4ad2-be32-bf30ae016fcb	IM/2024/026	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3	B	1	2024-07-01 00:00:00
51bed647-1ba4-460d-a66b-dada68a305f3	ff257821-f5fc-4154-8c74-70c019acc6e0	IM/2024/027	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.3	B+	1	2024-07-01 00:00:00
cfb842bc-f96b-475b-933e-9c65a20eece7	e6f6b134-783a-48c6-8eb6-c7b6563ca0d7	IM/2024/027	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
ec634c04-d575-4d5e-913b-7236838b50a5	786d1bc4-d589-4f91-bacc-45cb240e630a	IM/2024/027	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.7	A-	1	2024-07-01 00:00:00
b0abe565-3052-4dc5-b191-5be371910e52	192e8897-fe6f-443a-a5e8-e1c0ca191fa4	IM/2024/028	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
a498cd29-b11d-4fc7-a4c2-257a5a895422	fcdb85cf-806f-4932-bdf8-e83bbd785d91	IM/2024/028	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
10a01ff9-41bb-4a37-96b9-245ccb04962d	fc990bf7-b445-4a0c-9fdc-d47218cab726	IM/2024/028	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
1822bc7c-e57c-4b2f-8cb6-c5eb29ce5101	0021fe73-4a99-4c37-a455-cff90f3b08b1	IM/2024/029	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
e56b629d-c4a2-4c4f-bfff-587f3b07eef1	a57ec67d-9094-4226-ba04-fce5288889ed	IM/2024/029	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
68ccfae1-270c-45c5-8921-c0eed6b1bf35	6c3a143f-18b7-4efe-9ebc-acc4c2f2a113	IM/2024/029	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3	B	1	2024-07-01 00:00:00
491f77e7-909d-4154-8428-7a691281348e	f1229f64-5a77-4d22-9b64-0c6418555556	IM/2024/030	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.3	B+	1	2024-07-01 00:00:00
73def79a-88e0-4ec4-8d86-6d048ec7850c	338d2654-0209-4f76-ac70-0a96fffa9e04	IM/2024/030	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
b4b6f81f-1af3-4a40-bc43-1997f866293f	f387c401-de57-4a84-9492-7633129b6a2c	IM/2024/030	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.7	A-	1	2024-07-01 00:00:00
e328f662-56fc-4149-9036-fb922e796d6a	625988e9-c70a-4dfd-8974-c73888996488	IM/2024/031	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
c7754404-f89e-4447-a0bb-4ba710d63292	875271d7-68e0-44cb-b90d-ec95a53f6b78	IM/2024/031	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
0a8e628d-cd11-4e79-aae2-0034e0dcca21	9fc57e99-5de4-42d2-98d3-4a6092bdab66	IM/2024/031	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
8ae81c5d-de07-4edc-ac9a-758f35876a92	0392df56-6223-42e8-9bb1-f1306d5f7037	IM/2024/032	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
c92d69be-7c51-49b6-880e-f178fde330fa	469190bd-7837-4c34-9929-b8cfe49d5c4b	IM/2024/032	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
01de532f-b2dd-40cd-8024-1c3390a83ed4	9252ec03-5d1c-486b-a731-b7f00ad80cd6	IM/2024/032	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.3	B+	1	2024-07-01 00:00:00
0fc2986a-0e17-4d38-9a45-ba0fe26fd569	efb89250-d533-4809-9640-81a415caebee	IM/2024/033	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.3	B+	1	2024-07-01 00:00:00
ce97b1fd-de57-4fa9-b9b9-adf9f15780f3	6c7630ab-71ea-4866-afaf-d41103e9896d	IM/2024/033	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
f61b1b17-c916-4658-bf61-786214425e44	70e7c1d5-b45a-4f7a-a9f6-524dee1270e3	IM/2024/033	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
485ee5af-afaa-4173-9a2e-683d222f1542	2198254f-30cc-4045-a781-fdbc3883f762	IM/2024/034	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
212492d9-9f4a-4863-818c-b1dc2bfcdc52	f7e95f9c-bac9-4f79-9d95-49730e201c7a	IM/2024/034	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
3e0791bd-5241-44e3-94f9-d294be972cfd	0c694bf3-699a-4897-b138-5d3cc20b0bac	IM/2024/034	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
98a1b426-9b4a-4481-b97a-76db76fe8fed	d293737b-d2cf-45ed-b443-24885caea3b1	IM/2024/035	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
e856b189-08ba-4ca3-bee2-659b8a000d7d	e4aee917-4677-4e20-b428-76574a97fa06	IM/2024/035	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
c007ef30-9a89-4763-b3c0-9253afa68499	adc6c511-0cc1-4120-a7da-c798086c01a8	IM/2024/035	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.3	B+	1	2024-07-01 00:00:00
7cdbd4bb-71ac-4aad-9780-23c285cb1405	316250f8-bd3f-45d2-8bb5-8c9618b16b98	IM/2024/036	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.7	A-	1	2024-07-01 00:00:00
6e53408f-08a5-424a-b3a2-a25bcc3c2af7	fbccd34e-b785-4e9c-86eb-7aaa99d3c5af	IM/2024/036	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
c4f5a65c-62ba-4478-b5c1-03eb3ccf1ffd	1b3e37e8-1ed3-42eb-b6ec-fe846b802d7d	IM/2024/036	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
74619f45-465e-46a0-8f9c-32cc9cc20626	66df8398-3193-49e1-bac7-5c6bb936f3c4	IM/2024/037	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
b840d64c-411c-4780-ab9b-fe8d908a752f	7a1c66cc-8e0e-4b6d-80b2-60d3eb77d0ac	IM/2024/037	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
9bd1b9ab-c666-46d4-a807-a16470c3ba27	0bf0f2c8-31b9-44f1-aca7-7b645afb535f	IM/2024/037	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
0c4a3a25-578f-4155-9178-10e86c90f4c6	5b2258fa-5b60-421e-be68-26d36825295e	IM/2024/038	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2.3	C+	1	2024-07-01 00:00:00
7dba1eaa-566e-48d1-8ebc-093c1db6f9fa	1bdd8129-c263-46ec-a0bf-3c9949f0ece2	IM/2024/038	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
14afe677-1d23-4d01-9057-7443a2b595b3	595a5549-5560-4bf4-9c84-4bf771dc9582	IM/2024/038	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.3	B+	1	2024-07-01 00:00:00
7eb704c4-486a-4a85-a147-53c5343aba54	19ed0bce-294d-424a-a5da-efe56fa577ec	IM/2024/039	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.7	A-	1	2024-07-01 00:00:00
1264989c-99b5-48b9-8c11-fd72ae5aa523	b9ec7a35-cddc-435e-a650-c32b41d3dce2	IM/2024/039	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
e4394e60-48b0-4aa3-a150-da0d4817bd36	40c0a2de-2c8f-4611-9177-836fdc9f129c	IM/2024/039	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
f6d03767-4973-43c0-a44d-9189eae63546	f57d9653-02e6-4625-81ca-eea4878b649e	IM/2024/040	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
4ab545ed-75ab-46ec-8dfd-ec818f304844	9009a70c-ae4a-4762-ba44-d28a208bf85c	IM/2024/040	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
3b1f6a75-2c5a-4d79-bec3-07d7075ab97d	d70ffe2e-14f6-4636-9903-76916791cd46	IM/2024/040	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
953ba15e-c36b-4493-bcd8-08df4b503d6b	7f00319b-eefd-46a9-9f56-29e33979396c	IM/2024/041	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3	B	1	2024-07-01 00:00:00
b15512de-d4c6-446c-8e30-80d16a8808f1	9794e25e-774c-482f-b2bc-309ee9927fe1	IM/2024/041	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
29c7d16c-95e5-4afc-90a5-f773ff70ff02	878c4eca-6590-4d41-a01b-15e0d6264f85	IM/2024/041	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.7	A-	1	2024-07-01 00:00:00
75dd0a4c-6d5a-499a-9fb3-fd9511ad1425	8b00dddf-5bfe-4388-a047-246e10101899	IM/2024/042	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.7	A-	1	2024-07-01 00:00:00
cf38f4fe-f8f1-4781-a722-b1afd30351f3	d58a1617-bd56-4196-8922-72aeaa033d82	IM/2024/042	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
b9c65110-ab2c-4633-9ca0-036c6d4bf514	72677372-d5d6-4497-85bc-597f57a4f109	IM/2024/042	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
21f71f57-0c51-4214-b02a-401895af0a06	51f5e17b-949f-4fe2-83b6-19eb891e48c8	IM/2024/043	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
8257c563-1070-4bac-817b-b29261fa9050	78528a6b-e68c-466f-8019-e5eaabc864cf	IM/2024/043	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
d825dc7d-b816-497d-8e3c-897802d9a8cc	ebb32efd-39c7-4694-bf14-7408c00ccc03	IM/2024/043	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2.3	C+	1	2024-07-01 00:00:00
159ef6a2-efd8-41ec-ac02-a411a853b7dd	b813d5a8-1e23-4a1e-9965-e9226d88837b	IM/2024/044	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3	B	1	2024-07-01 00:00:00
567e8fba-ca94-424f-9f31-0fb2e3bee437	1f1a4d63-a8e1-4af1-8c01-8e3b7ef3e7f3	IM/2024/044	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
c5fa8c76-5d78-420b-be93-f20ac0af5eb5	c9d0cd97-aa52-4bf0-bdc4-d7ada8e90289	IM/2024/044	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.7	A-	1	2024-07-01 00:00:00
5b27baaa-bb74-4a62-8612-9ede24c69c30	32224aa0-707f-4cfb-a1ea-57fe2d9ba9ca	IM/2024/045	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.7	A-	1	2024-07-01 00:00:00
b0caab64-1c74-4692-9a73-eaee5bba1124	ba6e29d5-cf84-4dec-943f-0f5ed0454c4c	IM/2024/045	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
1e324ee2-9871-41cc-9dd3-415d5d5adc74	e79e6781-ef80-4e29-bc63-a2f1f25dac4a	IM/2024/045	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
c34053c3-e951-4f7b-8c42-b5b4b522bb10	8624b2b8-194e-4b57-9e88-2e17b23f50ca	IM/2024/046	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
ab0d5e61-ceca-4b17-922d-411275ed3fdb	e8d5a4f8-a807-47bd-aaa7-a330fc549c6b	IM/2024/046	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
19847b57-62a6-4c80-aac5-da8e842de515	5944e1f4-5ef6-4fde-a99d-486d4321ab6c	IM/2024/046	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3	B	1	2024-07-01 00:00:00
c4590223-581a-4547-b6ce-7f0c5708344c	74d03f91-db6b-4154-a39b-02a9967c1a8a	IM/2024/047	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.3	B+	1	2024-07-01 00:00:00
c4279bb2-f037-462b-9ef0-32eb718c6453	74148c81-c92e-4847-a6f9-a0ef2a08529d	IM/2024/047	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
86005423-b7de-47b8-b956-09f10d947584	06f7dc6a-ec34-433f-bf29-436d303d878c	IM/2024/047	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.7	A-	1	2024-07-01 00:00:00
48f6c7d3-1ef3-439c-b67a-8682b0bee3b9	494e6f08-8069-4b13-973d-b4cbf727ae3e	IM/2024/048	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
b289c349-21f8-4b43-96bb-48011e2a431e	9b002e95-b8e4-426a-aed8-b63f2d7ebcad	IM/2024/048	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
f8fedece-080c-46ef-ad72-140de945dcb1	ac069297-d6d3-4372-a079-d29bcbfc41e9	IM/2024/048	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
1a8c96b4-1c5b-4226-b68a-2200edb19fe4	e5509052-dcad-4c37-bf4c-0e0910c0968b	IM/2024/049	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
f3985e86-80c0-4fe1-96f3-5b8aa9d85f57	c5ef3356-bd3f-4bd0-aca7-0e68479d7315	IM/2024/049	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
d93b32e5-c046-40c2-a476-0172037ffdc5	d4b597f1-9c2f-4c6a-a362-dfc8b4bca024	IM/2024/049	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	1.7	C-	1	2024-07-01 00:00:00
d5b904d3-f1d3-4364-aa32-7362939f1574	7b022d02-fb70-4ea1-99f4-6b20100ba493	IM/2024/050	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.3	B+	1	2024-07-01 00:00:00
2b967c6b-0fa5-41cd-8495-141c4431f252	09b17213-be4e-450b-9e9b-2cb4b7e0934d	IM/2024/050	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
f28347eb-b571-417a-831d-6471c14607bf	45a1ea27-5c80-4b57-9abc-84c5ebe1474c	IM/2024/050	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.7	A-	1	2024-07-01 00:00:00
28835ad5-0564-4821-90d9-c43e86a94e5e	2cd101e2-48ac-4cde-9557-fb9bbb8de61b	IM/2024/051	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
8f0ad7ea-ab7c-4c9e-8082-82f4dc107f18	1314023c-0660-4d95-a0f9-840513811ff1	IM/2024/051	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
eec22ebc-0f07-4556-9af8-fff8ade86fa1	d4a1042a-1d8e-4aa3-9fae-63c1240b5866	IM/2024/051	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
6be3e7ad-d2e6-4ec0-bce7-a279bd5b8d6f	f4a21a05-c54c-4f78-88bb-c6b8f59e7620	IM/2024/052	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
ae0ea86b-b79b-4e03-b4d1-12408d65de4a	777ff588-a997-4be7-be38-035937781727	IM/2024/052	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
ba3f8d23-1f71-4160-8ea3-7f50f460ca1d	68f0c2cf-712f-413e-8430-e57315eb5169	IM/2024/052	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.3	B+	1	2024-07-01 00:00:00
d2cac948-c77d-454a-864b-2b1395590761	19e26ddf-3819-4ac3-b796-8da7214afeff	IM/2024/053	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.3	B+	1	2024-07-01 00:00:00
20cc7ded-0d43-476f-84ad-ba8bbe1aefa8	7904ad72-f040-44f3-85ee-5695adab2291	IM/2024/053	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
f509badf-5700-403e-83e1-62d3b160f392	eaf716b4-048d-4cb0-9ca0-22fe40743b7e	IM/2024/053	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
710de7d1-d58b-4184-aac9-a8f5f580d94e	94b9e8c2-dab0-4909-b5a3-bd928f165aad	IM/2024/054	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
4570965e-cd35-425d-a662-f2bbce859cf8	0e78b51e-1449-490e-8d3a-e15ee353320a	IM/2024/054	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
213fb238-b95b-48fd-a2c2-6594c14442fa	d1073735-6381-4e94-80e3-51870209137b	IM/2024/054	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
3c05e1aa-523a-4f62-b377-d4d7c52fb7df	f7a2958b-5cd6-4f47-9559-563af57c628f	IM/2024/055	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
c3190c9a-0ec1-4662-aa86-db5d2dbd6704	4ec68c0d-465a-49c5-a2bc-4a3d23f7ba14	IM/2024/055	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
da4f81b2-50ba-450a-8ba7-f8aa5859507d	414cf806-bb0a-4c93-a20d-28296cdab0fa	IM/2024/055	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.3	B+	1	2024-07-01 00:00:00
71049755-fec1-47bd-811a-8500aa859c58	4197ad0e-2c9a-4b21-a934-2c04f51ecdb2	IM/2024/056	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.7	A-	1	2024-07-01 00:00:00
614cf713-5b8e-4092-9a59-416c333cad88	7dadace6-5403-4594-87cd-c98452f5b604	IM/2024/056	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
09bcdb42-5f8d-43e0-829f-cd141ac9b40e	ec497545-7fe1-482d-9c66-8cd33627bfbb	IM/2024/056	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
8ca99c22-c472-45cb-a266-958f6d90f5ff	7402c3e4-d4e3-415d-952a-a9e62b09f88b	IM/2024/057	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
1e03361d-c9ff-4198-b3b0-74904101e033	568ebdd6-163b-4854-98ac-d3d1c0d47c7a	IM/2024/057	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
5f9cadd6-72f0-4d35-891b-feea1976c6f2	2d9a4924-e021-4265-b543-3792bf5fd2a7	IM/2024/057	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
dc9c304e-5299-44ab-ae1c-2e549abce4f9	e3134159-7fec-474d-b0f2-76541e9522e0	IM/2024/058	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2.3	C+	1	2024-07-01 00:00:00
5b3b9780-5144-4680-96d8-d2e93e1f108a	25b29182-20e1-48d9-8c69-5bbcfdbb65c4	IM/2024/058	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
83bcb252-59a7-4266-b3da-faf9ed0e6476	77ba9b2b-5bfb-4c09-849c-7d66506682a3	IM/2024/058	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.3	B+	1	2024-07-01 00:00:00
62a86613-e905-4f9b-a5ff-02f01593c02b	e58c2abf-a40e-46f1-b055-59616e243746	IM/2024/059	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.7	A-	1	2024-07-01 00:00:00
f59fd479-12b0-4018-8c82-2466b6e7b1c9	15b412d5-8166-4944-a2fe-41e8b2b588bd	IM/2024/059	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
83d801b5-c8a1-4c0c-962e-83d1ed7e8acd	72802daa-8ca7-40ac-a922-bb1e9c4979f8	IM/2024/059	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
d0979337-cc1b-40d5-86fb-a5c8c159dbdc	54d9eb64-34b7-4d6e-aebe-4ae39d90e050	IM/2024/060	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
3fc6c025-6e3d-4dcd-b471-84cbb8aa54e6	bcdba615-02ee-4b7f-bc0c-14108dff91f7	IM/2024/060	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
11fe5948-198e-44c6-823d-c9971451aa8f	39874302-313c-4c31-89b4-232d0bde47c5	IM/2024/060	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
a8412755-e64c-4a39-a898-afc0a2816bdc	6c60093f-6b36-4eef-89f2-161fce170504	IM/2024/061	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3	B	1	2024-07-01 00:00:00
c841d851-476d-46f1-9126-70e7f21e0459	b099ee5b-47d6-49f3-9b76-04394a62540c	IM/2024/061	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
022c722b-c81d-4b3b-9a94-9aaceda31622	24ce6093-e524-4e49-9e35-cf0300b31445	IM/2024/061	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.7	A-	1	2024-07-01 00:00:00
9ddedeb1-c7f2-4bef-8ca6-ddea362ccfe6	e37417b6-0c0b-41f9-82aa-de335b51e32f	IM/2024/062	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.7	A-	1	2024-07-01 00:00:00
14e21e91-0d62-482d-a04d-0b40c26392f0	512962c0-fdd5-4e65-a93e-77acf9045a67	IM/2024/062	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
2be2c4c6-bf2a-42c2-b514-7f22b6c352ce	54ca1219-c95d-4017-9c05-dc731a96348f	IM/2024/062	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
316c62af-45a8-4e8c-9d71-f06d5b26de9c	28709cb1-2b9d-47cb-a21e-9e2e7ea73a53	IM/2024/063	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
1a9950d8-e13f-466a-b3da-7c1d54d99393	a9b4f0a8-c9b8-44c6-856c-03293ccfad95	IM/2024/063	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
f4cf870c-6ae8-4f1a-b2d9-84fda5ee0bf1	2ebef29d-738f-486a-afc5-e9f3537407b2	IM/2024/063	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2.3	C+	1	2024-07-01 00:00:00
7855f15b-a4b7-45af-a32b-2613cca37e98	e1fc4631-e038-4d47-b82a-fe09c48ce34b	IM/2024/064	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3	B	1	2024-07-01 00:00:00
4080c285-7a77-4a01-b530-61c88337132c	b8fcf5d4-6342-43ee-be2d-74a5150e0013	IM/2024/064	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
a1e7bee0-f1cd-43e2-9e76-05e46fed6e0c	b20fb1ac-45ce-4a9a-af4c-fbb83445a1b0	IM/2024/064	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.7	A-	1	2024-07-01 00:00:00
d59652fd-9fdb-4e9e-afce-e89518ceadb6	d5872aec-fe1c-4230-b585-009efb808415	IM/2024/065	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.7	A-	1	2024-07-01 00:00:00
8e6acd68-c52f-49ed-a093-78014c7b743c	02dbf357-57bb-4864-aa8c-5b6d39cffdc5	IM/2024/065	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
f7a80428-b1d4-423a-a5e7-23d9a4a848fe	650140a5-43a6-4ebf-909d-698c3477e4f2	IM/2024/065	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
92ef14d6-900a-485a-ad75-bb0015c65080	0166c01e-4e4e-479c-9ffd-2fbe476dea70	IM/2024/066	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
d814dfa4-b81b-4285-9fe1-e8954676e8d5	1d15eedb-25fa-4c0e-b5f7-6ca17785bb4b	IM/2024/066	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
f95c4502-dcfb-41ae-aeb2-1609208f5a8c	15eb09f3-6573-4028-ba1c-6dd1a910f0bb	IM/2024/066	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3	B	1	2024-07-01 00:00:00
8fa27f78-17b8-4763-9538-9b25315215e0	76804adf-8555-4a41-bcfc-fe03aa8a14cb	IM/2024/067	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.3	B+	1	2024-07-01 00:00:00
1cd5ae82-c24b-414c-80ec-57fffc530e29	ec013b01-e6fc-4d1a-8265-13bed552fa77	IM/2024/067	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
47191eed-6784-46e6-b236-b89d09c5cfdf	8aa40185-bd72-4c18-9f17-9862378daa6e	IM/2024/067	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.7	A-	1	2024-07-01 00:00:00
560eb550-3fb3-42e0-9068-c5c83f97c797	e4b334b1-dfe5-447e-a26e-051e2ac38e4b	IM/2024/068	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
588f05b5-f05b-4a0a-9049-7e810b9b62ae	ff6f6dc2-7791-42a8-b3a8-ca437b60dd9b	IM/2024/068	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
bd4db6e5-14b1-48a0-b5a4-6bb3579ebc1e	d08df97a-b5e0-49c3-9f91-3bd0786ba5ca	IM/2024/068	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
f25b5d35-e00a-41c8-8ea8-a350b39e5883	fbad68bc-d181-41f2-bf5b-8f36fe77c6f9	IM/2024/069	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
ce5e501f-5048-4000-9055-4e711789d35b	4b14f899-026a-4f21-bd83-e56341a36290	IM/2024/069	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
10ca86ac-60cb-4dd8-8356-e98589e05c39	4ee362ad-76b4-489e-83b8-b88d7746b421	IM/2024/069	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3	B	1	2024-07-01 00:00:00
f4ab13b6-fffa-4eec-a41e-0395a327827b	cf18d29b-8b4f-45bd-a2a5-9306f976ba48	IM/2024/070	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.3	B+	1	2024-07-01 00:00:00
6d6b66a4-7eb6-4b74-863c-5e908093546c	030debd4-70d5-48be-b6ff-ba6075a2b679	IM/2024/070	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
e8254c28-2eba-4b9b-a015-054ba43a9dcb	06b51fe1-51d8-4b96-ab34-7eaaf0a44012	IM/2024/070	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.7	A-	1	2024-07-01 00:00:00
5fcd6e03-ed90-499d-a2fc-5067eca62ded	fcb7974b-c460-4857-9ffc-73f68cd0cb1e	IM/2024/071	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
8f10902a-40b4-47eb-b475-11b5423013d1	a5a40e90-8e22-464e-9b33-0f1321847fa1	IM/2024/071	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
859572be-4fb6-472c-a2ec-d5bd1a4a2ca8	1f494b17-5e1a-4fce-be12-4e20ea9c15a2	IM/2024/071	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
4b092fa6-49bf-4d8e-ac23-4d161237cf85	4d22249f-4549-4d52-8b2f-55d56794c522	IM/2024/072	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
54441605-28cb-4c95-b0f0-d268e138f615	cd15bae9-f2cf-4dbe-b3f9-5f8abee2afc5	IM/2024/072	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
51cf3903-d6bd-4f0f-8432-31691731ace0	9a48cbc7-c0be-4000-a1cd-a2e00d72ecc1	IM/2024/072	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.3	B+	1	2024-07-01 00:00:00
276e8119-5db0-488b-8846-36af46f05444	dc030b24-79ef-455b-b7fd-91ef44bcc31b	IM/2024/073	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.3	B+	1	2024-07-01 00:00:00
90043db6-c467-48bd-825f-e93751601b4c	a0e791a2-b8d4-4b64-a871-b7f338805dbe	IM/2024/073	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
784d4198-19f5-425d-adc8-c6b76ddc64c9	592b1654-a68c-4f7c-a6ab-c6a3d25e192b	IM/2024/073	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
184b2f24-9d84-4466-a2d2-65272fcc42fe	9ec7f19f-b48e-45fa-9bd4-59d221da45f2	IM/2024/074	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
281d4b06-3fc9-4cc5-b895-d6a548325b2b	fd4fc94a-4535-458e-beb2-8069281f718b	IM/2024/074	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
04b35fb0-b79b-4099-a34b-d1542a845483	fa472feb-7316-4083-a9cb-3d957cd51e03	IM/2024/074	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
6185c664-84b7-4675-88fc-4dd6558e519e	38c4d66c-84be-4094-bfd5-7bfd3b02c159	IM/2024/075	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
ec4febf5-b532-4363-a029-7cb0c07c95f0	e4f7b69e-239b-4917-b9c9-fa581e5cb659	IM/2024/075	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
8c3c3eb9-95ea-4d7d-b4ab-2a82fe47147e	a092088c-7df4-4bcc-86f7-4c7f70ef5931	IM/2024/075	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.3	B+	1	2024-07-01 00:00:00
c50bd5ef-0e6b-4c0d-8270-7735a574f8bf	cfbf6fe9-aca5-4040-88c5-1985b6fcb617	IM/2024/076	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.7	A-	1	2024-07-01 00:00:00
2aaa07ca-a7b4-4bdb-9bdb-5e253701ee38	b5511369-a6a8-4902-be92-0b7876f135aa	IM/2024/076	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
5b1ada6b-cfbb-48df-afc2-f43b588373c6	637baea4-5993-42b5-9e85-16c7c62fd1bc	IM/2024/076	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
f7f54f25-809b-4a24-ad23-c79378c62573	878cbeae-2090-40ec-91d9-1a87991210cf	IM/2024/077	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
f9fa7eea-cdf4-4d28-8404-a81d03063109	5186089f-f89f-4ab3-a887-7ef5d273c757	IM/2024/077	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
2c500291-f49a-4771-8f2b-f1e390757d12	836e2ab9-72d1-4084-a61c-b46c9e633764	IM/2024/077	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
056838f5-7c27-4ed2-942f-a494f85dee5b	1d09888b-3aca-4042-badd-ba74dfb13bce	IM/2024/078	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2.3	C+	1	2024-07-01 00:00:00
05ff6958-9603-4cc0-b599-170958a4bbad	a8cc50d7-06fb-4fef-bbd2-f963ab1a0a5a	IM/2024/078	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
f33e0258-b67d-4850-878f-645c830ba76b	c2f51a08-8381-406a-8000-92ffc62fd2a0	IM/2024/078	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.3	B+	1	2024-07-01 00:00:00
019b67df-83d4-4a3b-8ce2-6950fd130250	89f6a8b4-d31e-4627-bdc3-b2526795feb9	IM/2024/079	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.7	A-	1	2024-07-01 00:00:00
20272540-7617-4626-9f95-7504f203cc83	3f0462d4-eae8-41a4-958f-986a8df195d2	IM/2024/079	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
d92b7b2b-d575-4a23-8916-21f12af1a03c	b1b7a7d7-710d-45d7-9780-809a0dd24ca9	IM/2024/079	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
01aa1cfa-d685-4e57-8173-9b776aedda44	2c0bac19-cdea-4c5f-ac42-402e4ecc4ccf	IM/2024/080	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
f2ac4d89-a800-45d3-9243-8a02953cff6f	cdce9158-1fc8-4a85-bca3-561b447062ec	IM/2024/080	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
67808953-3bc8-4c94-9c9f-70dbe696f772	1cc3b73e-266d-43cd-8879-ae1c13bb2fc8	IM/2024/080	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
dabf0c7f-8c4d-4e1a-bd69-f63db9f894eb	ea1e0553-2710-4158-a89f-dbd2333bea25	IM/2024/081	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3	B	1	2024-07-01 00:00:00
b930ad8e-ba0d-4897-847c-b25474a2c69c	5eb75d29-f843-4ad7-a58c-879311d039f1	IM/2024/081	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
6972ff4f-c38f-450b-af98-5ef9b2d134f0	ec602703-8b95-4724-acf2-0cd2fc5a6fc6	IM/2024/081	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.7	A-	1	2024-07-01 00:00:00
c8cb9ecd-c523-4e7e-9565-72b40e83246a	48383504-f2b5-46ea-b218-0eb4bbfc66f7	IM/2024/082	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.7	A-	1	2024-07-01 00:00:00
94fe565d-0dfc-40bf-a74b-7347ed3451dd	81f319d9-b9f3-4980-8753-4aad5f9c533a	IM/2024/082	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
94cb75cd-6314-4478-82f2-47014671a469	120f2d41-a989-4fdf-a816-bb7166feb290	IM/2024/082	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
b5ebd09c-00d7-46a9-bda7-992fc7b50084	ecc2b1c5-dc64-4417-a82a-e11bda45cdae	IM/2024/083	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
5fb8a284-2445-414b-91fe-a89f03ffb5be	70148122-19aa-4b99-b3e6-bb6c4cb69073	IM/2024/083	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
e9b09f20-add4-427f-a9b5-b4fa5ae9e7f2	768c3d5c-8749-4023-b5a7-bc6bc9a130e2	IM/2024/083	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2.3	C+	1	2024-07-01 00:00:00
17b4cebc-3d29-48af-ba99-d03dceaa7c7a	8a1c0d1d-7fa0-4387-9c32-9753c7bd845b	IM/2024/084	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3	B	1	2024-07-01 00:00:00
29319024-dfd8-44f3-950b-53c34b9b3f18	4110670f-47fb-4841-ab72-d35a5cc63f52	IM/2024/084	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
37e8443e-9cdc-4f84-9aa1-741529211885	45c45162-4b16-4102-815a-93fefd90b301	IM/2024/084	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.7	A-	1	2024-07-01 00:00:00
de0f0f4c-c37f-483a-add1-d5d2f5623fd7	bf5cbc18-4052-45c6-8a90-bef01e282a66	IM/2024/085	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.7	A-	1	2024-07-01 00:00:00
df213f27-3117-4f65-ad40-63f8f2313bc2	c59bda00-0f52-4f2e-bb15-a4dc103142fe	IM/2024/085	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
bad97db4-1c66-445c-911c-781ff5f075a2	b9142ac9-b991-40a4-916f-a65f26674822	IM/2024/085	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
5e0e3f56-0d91-4f3e-aeac-9b9d74fe8730	2df61f7f-fae9-4962-b52f-b4a02615ba44	IM/2024/086	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
6c437259-eb61-4bcb-b8d8-6e3d1bb85057	1fedfbc1-ba37-4c71-b288-cc1e72239de0	IM/2024/086	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
0707f13b-8c80-47c1-9d23-30e12e452b7b	a319598c-a8ca-4eac-8654-73c674b6a505	IM/2024/086	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3	B	1	2024-07-01 00:00:00
ab6ba970-cd18-4079-b8f9-4a479efd4e32	bbe69be4-a0fb-4d20-8cc7-d8b430ea2356	IM/2024/087	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.3	B+	1	2024-07-01 00:00:00
458e5c97-e156-4e81-8c59-5c7945425de8	bcf65584-fb43-42f0-8e82-83595277d5c0	IM/2024/087	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
024fc464-f18e-4111-afd4-9c365f3a1d3c	65c93b82-220e-45c3-af6d-4fd1739df8dc	IM/2024/087	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.7	A-	1	2024-07-01 00:00:00
e61e0b8a-0aac-4b3f-8691-79319538f9ca	3183869f-492f-4999-8d8d-d8a6c319c663	IM/2024/088	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
24e96b23-a93a-4035-9114-af726023a587	82c5ee39-d706-4796-969d-627a70992768	IM/2024/088	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
3da171e8-656b-4c3c-ab92-b8696c323bf9	717c66b6-4d6c-4deb-bd42-8f3ebbe0846d	IM/2024/088	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
503a14f7-8f48-4143-b452-f3e2a27ae03b	0824ae07-dce5-4a86-b773-654b29e8d575	IM/2024/089	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
3b08ad0c-ac82-459e-aa95-e084fa1aed47	b1bd699f-0dc6-483a-ba28-928ee3914fd6	IM/2024/089	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
d1b892fd-fa82-470b-a8ee-d6315a150006	c5588589-bce3-4aed-b59b-bc46398c7a40	IM/2024/089	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3	B	1	2024-07-01 00:00:00
52e1bed5-b496-4652-9e14-4b8144cac46f	b3910357-fd60-4a89-a287-7fade313d00e	IM/2024/090	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.3	B+	1	2024-07-01 00:00:00
e8557709-647a-4b6e-8f44-4e6d904600d6	b33424ce-ee9a-4e13-96e1-d388b434e949	IM/2024/090	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
aa4f8e57-4059-44a2-a494-909a286f3804	8b6183bb-4c95-4d96-893f-961ecc95e5b5	IM/2024/090	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.7	A-	1	2024-07-01 00:00:00
f7a82584-e4b8-4b5a-8454-444b898bbbb7	e39467e7-b3a9-4d4e-92ac-cc6f6705d954	IM/2024/091	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
1f72fccf-f827-461f-8bb0-77f45eded7a5	48cc98f2-1c73-4b92-9a2f-9b7f76d52b35	IM/2024/091	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
cdd634ce-b406-479a-acf8-1fb705f33071	cf095e51-900d-44ff-a0a9-488cfbe5af2a	IM/2024/091	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
a4b21738-e2cc-4ae0-b7dc-3ec1867f96d2	4a5df47f-aa6d-4b28-999a-104cd483c20e	IM/2024/092	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
4957c8d7-b703-4a83-8e9f-ce838dfd7851	b19c8244-1ab0-45f2-b87c-3935818b2568	IM/2024/092	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
e0cd5fdc-8951-4cc5-b7c2-6b3177702cc0	07cbc317-452b-4564-a8bd-83f8a8230cc3	IM/2024/092	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.3	B+	1	2024-07-01 00:00:00
bae9c323-d8ac-4070-924a-8e4e7ea46918	35f2ce02-b902-4ea1-9bce-c84223558d02	IM/2024/093	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.3	B+	1	2024-07-01 00:00:00
f8a77403-3235-47af-a2d8-93bd2abcf805	d4712eef-8ba0-4624-9508-a341e1c6a51b	IM/2024/093	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
762fa8a3-7d96-43a0-a0ef-936f24bf8372	605e094c-f216-4af6-974d-3a344c6a75bb	IM/2024/093	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
f9cd94df-2ea6-41c6-9b89-7870d0053457	acc7ff31-6286-416d-b7e2-0279614bc7c0	IM/2024/094	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
649cd779-31bf-41f9-86b0-55da66572d6a	bd7757c0-0b03-4b7d-b234-cd5c099c6bae	IM/2024/094	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
c0c56a21-5af4-483e-a453-1fde517a26a4	2f20883a-5015-489f-9bf4-cd30928b88b0	IM/2024/094	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
055dec6e-46b1-4733-9672-5f003361c037	c5c50544-0f0d-488b-826a-a983c523b5af	IM/2024/095	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
2d6aaee3-780f-4033-9fe4-9da08fc946dd	ba8072cc-ab93-4a68-957f-33b9a73f0841	IM/2024/095	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
ed7cf2c9-ce82-4d5a-9cbb-67f52fe8a741	f5fdcd61-1562-4aba-b458-f40b795f5652	IM/2024/095	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.3	B+	1	2024-07-01 00:00:00
d51e8fb7-8503-4710-98ae-08fd1bd99859	0e2315ba-4bdd-4382-ba8c-e66c19d246f0	IM/2024/096	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.7	A-	1	2024-07-01 00:00:00
9e432d06-0595-4a62-9126-542522260848	a49f7ace-46f7-4f3e-add8-20f5af005b2f	IM/2024/096	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
eeb45f3d-8116-4237-ab13-dd3eb6250ec4	337306db-2bd0-4521-85b6-b11d046d82a6	IM/2024/096	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
fb0a167c-9352-4f1d-968c-747a3d165880	e7b4510f-faf8-4a0a-b351-91ff4297e01c	IM/2024/097	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
a125e8ef-4116-402b-88bf-a1a74f56aa29	89969076-bf80-47ae-84b5-fa2b7fffaba8	IM/2024/097	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
8897367e-9994-4b99-9d83-22a480e999d2	bfac6d71-4a48-45c0-8a05-ac1fe37303e0	IM/2024/097	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
36952890-397f-4043-8cff-dc69ae8299e2	4638e8a9-fc8e-4473-ba07-9c70578647f5	IM/2024/098	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2.3	C+	1	2024-07-01 00:00:00
2d825b2f-364f-4e0b-9af8-22ff0458dd96	a2d0bdf0-9725-483a-8972-01425fe895ce	IM/2024/098	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
c17b32e6-ebe2-47d2-8a2b-03cde270df31	91170d1b-691c-4270-a0a6-c5c4e9fc19ff	IM/2024/098	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.3	B+	1	2024-07-01 00:00:00
0b4ca32d-716e-41ee-b998-24a6679d3bdb	d064475c-0ef4-4a67-9c0e-6b6e479426eb	IM/2024/099	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.7	A-	1	2024-07-01 00:00:00
1bc93eda-e638-4494-9e5d-21c4b2e19558	d413e909-9c33-4e1f-aece-ae2f7ad151f9	IM/2024/099	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
b317d48d-e2a3-47d3-9ab0-2de083c26715	46a5a0b8-a59c-4312-b5c5-6624e04eabf0	IM/2024/099	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
7f3157fc-0f4b-4d9c-88a1-8b6640edba90	c283c164-661a-42b5-8e63-004d3236e1ec	IM/2024/100	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
5f8e3119-3d7d-4d6f-8286-6e51181ca469	e30975d5-91c1-4924-b322-d8a81f0296e4	IM/2024/100	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
27ed71f0-1986-443a-b862-a75f5c2fe799	db549e00-81dc-4352-8eba-1277d6ab4836	IM/2024/100	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
72e226ea-dd96-4187-b7d5-ab6d078a6fcb	105b44cd-a913-4a0b-b49a-516fea3d60d8	IM/2024/101	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3	B	1	2024-07-01 00:00:00
16f95d8f-95e1-44f1-af0e-aa6cafe75559	e883ea94-e895-4090-8c06-6511a664e7d0	IM/2024/101	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
d5fe5983-e3c1-43c3-998e-94b30b5c6881	5ff3a27d-f4cd-4562-b8c5-2ec09fee79c5	IM/2024/101	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.7	A-	1	2024-07-01 00:00:00
b7fc4b9c-85f2-4212-af7a-40897eae8229	a3943543-a90f-4ebc-8c29-aef4759a7c0a	IM/2024/102	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.7	A-	1	2024-07-01 00:00:00
37e85474-8545-4ef6-a0e6-8e2aaf75bb52	0e8f3673-f254-4a59-8e95-e3ef3e9f8c63	IM/2024/102	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
175c0bd2-88a5-4f43-86cf-19cf1c448c35	0a8dc5e9-9db5-4e0d-87aa-517fecf8f46d	IM/2024/102	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
0f65f3b0-0c6c-4a9e-aeb0-6e2fcf66acb3	bdad5f7d-cccb-4a7f-b7de-2ac545eb33db	IM/2024/103	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
18e0229a-8e2a-496f-be34-4ea4d57040a9	49da3d33-1c65-4f55-9e69-3b5872ef14c6	IM/2024/103	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
79bf6f75-67f8-4ea2-9a5a-3ce14c542fe4	4bc3f86f-fe84-49d3-8ba4-1e4795bdf174	IM/2024/103	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2.3	C+	1	2024-07-01 00:00:00
6510b9ef-1c34-43ab-8a9a-7649dc3c856e	25852f72-d592-4e79-b5c8-8a4c7eb345ad	IM/2024/104	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3	B	1	2024-07-01 00:00:00
93177b90-aef4-4f77-8794-46f6979b4542	7f228ae0-addd-4485-8c74-733c73bb2713	IM/2024/104	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
2c6baa9f-ab2d-4419-94c0-956648187acc	d1a4adda-cde9-4838-84af-96a22de2c5e6	IM/2024/104	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.7	A-	1	2024-07-01 00:00:00
298e04bd-13f3-4e29-bfdb-9539df72b9e4	9f65ade4-8d4d-4b8e-81e6-d1e1ca473945	IM/2024/105	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.7	A-	1	2024-07-01 00:00:00
2c4b78bc-a8b4-4591-9fb6-4c8174a76df5	28f04ec5-45b5-480d-9e15-26d6737a1dab	IM/2024/105	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
8cfea566-6c03-4545-927a-3f8afb500f7f	bc8fb5af-f8e9-476c-b22f-46420042749a	IM/2024/105	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
4f1d7dbe-2a24-4d2f-b3a2-d11975a69c02	b2a3a070-295f-4583-bf57-9bae6fb1edaf	IM/2024/106	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
4a56c2e5-8e2f-4f28-93e5-bfadd57c35c1	61832885-2ce2-4c47-94c8-0770385fe685	IM/2024/106	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
ceeabc4d-e18f-4677-905c-2a56f0f7e1f2	8bb5b1ba-251c-419f-8901-17c03e088815	IM/2024/106	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3	B	1	2024-07-01 00:00:00
4b81043b-48b7-4e47-a6c3-10b96a99f54a	e4e55c48-abc1-49ce-805f-af1a78974286	IM/2024/107	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.3	B+	1	2024-07-01 00:00:00
1abc45cf-5e55-4d57-847e-f9d31609088a	60b2a962-95e0-410d-bd10-f256a4f86274	IM/2024/107	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
a2abedc8-a1e4-42ae-8f2a-a3b4d01b86b7	2cf6504b-b3c7-46c7-9a20-a5d34b90aa81	IM/2024/107	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.7	A-	1	2024-07-01 00:00:00
d898745f-195a-4194-9d28-6caafbcd0bf5	450c374d-b688-4213-8023-615ab822cbbc	IM/2024/108	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
df68973f-e47c-4242-a562-f07c4e8cd69a	c28e533e-ef5b-48db-8319-41ccf7f3ba38	IM/2024/108	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
6d858817-4958-47b3-a886-833fba223cb5	607166d8-cf3a-4443-999f-607418248cff	IM/2024/108	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
86907036-8cda-431e-aed1-b97c3ea570d8	8cc30ad3-9ad1-4f4d-805e-dca8953e799d	IM/2024/109	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
1bc22bb5-4be5-4cb7-9cb8-95d137282e56	2714da6d-739e-454b-8dd5-078bcfdf2caf	IM/2024/109	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
023bf348-7709-4bc5-8de1-71c4c667982f	5c7c101e-f0d2-4d3e-91df-b3d6aa4eb9e8	IM/2024/109	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3	B	1	2024-07-01 00:00:00
296fa149-4a5f-4b67-85a5-ca5cf9853b4b	2c1561c0-d649-4b43-8030-44ae77cac3ab	IM/2024/110	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.3	B+	1	2024-07-01 00:00:00
3441c7a9-58c6-4bc3-81f7-f59bd892706b	67c5e36c-9ed5-4db4-a204-748ff723b4da	IM/2024/110	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
4b8d36f3-4d05-4d59-99d3-ec02a9923070	341bd356-cdf9-43ae-a870-96f58006ec40	IM/2024/110	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.7	A-	1	2024-07-01 00:00:00
094dc7be-0ed2-461c-99f0-c54cf577038f	6d64939a-1c93-430f-8b43-586b7ecf8706	IM/2024/111	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
caf9a74f-b24e-4b4e-be75-b6ed58cc8fa6	6bfae683-d331-4c28-9c25-b1ffab5a6997	IM/2024/111	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
84f3a821-cdb2-4b5f-80d8-e8b522365a73	4dcad0bf-ead7-4344-b709-d7b7e32ec4f2	IM/2024/111	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
865bcb61-101a-417b-be7a-98dfaf292243	4b6497a3-0827-4a82-a7b1-d736bcb82dc3	IM/2024/112	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
069df2a5-fcf7-4566-bc70-1f535012f2d6	2c65dd70-e2b8-4158-828e-d4a0c2a5d27b	IM/2024/112	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
c8f51fe7-eb30-40d6-a0af-12613ba555a4	fbe60472-a4fe-4ff7-9c21-6bdea7d80082	IM/2024/112	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.3	B+	1	2024-07-01 00:00:00
190d4dd7-f412-4df3-906d-d781f19e2541	eada856b-aeb7-47fb-b7b2-bcee5a8b6304	IM/2024/113	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.3	B+	1	2024-07-01 00:00:00
52308fb0-7ff0-4091-acca-74e79392fb5a	c90a7652-1bc9-4012-86bf-3875ae33e77c	IM/2024/113	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
50b36317-217f-4557-8114-29481ecd0955	007af6c3-d4d9-4993-a347-f9a90b596d8a	IM/2024/113	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
c36934cf-6a1f-4249-afbc-887a1c6b82a6	3c820788-b256-457c-938e-f66603a73dca	IM/2024/114	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
0ffe77a9-4694-48e2-ab04-79c55b0aea69	b2004175-2cf8-41dc-a8ce-af2f1657f153	IM/2024/114	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
b03b2968-f0c0-4ff7-9988-ac5d9086d8e7	5bab0967-ec0c-48ee-8026-24db09622e10	IM/2024/114	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
e7854d0e-5bee-4d27-bd9a-a2739dc16bd1	6fe317a4-7445-45ef-964b-d4dd6902d0bf	IM/2024/115	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A+	1	2024-07-01 00:00:00
3e6b7de5-42ea-488a-94b1-9a232c2dd0d2	24b15fc9-96db-4637-972a-8f88e1c983f0	IM/2024/115	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
dab208e5-29be-410e-bba1-917b04845c34	b0cde727-9d9d-415e-8298-9c9ff4a7859b	IM/2024/115	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.3	B+	1	2024-07-01 00:00:00
5da2e039-b583-4418-bbb6-9eef9d4ec2e3	da5ec437-63ae-4121-8893-b644938177a0	IM/2024/116	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	3.7	A-	1	2024-07-01 00:00:00
bcf043e1-6e4c-4f04-bd12-bca40cc8fb4f	f488957b-87ec-4541-970e-fa8c7430ccbc	IM/2024/116	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	0	Pass	1	2024-07-01 00:00:00
b8d33288-bde9-4312-b724-a417b1292ba0	9dbbcb21-4542-4d4d-a2bf-30c93b0de070	IM/2024/116	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	4	A	1	2024-07-01 00:00:00
\.


--
-- Data for Name: GradingBand; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public."GradingBand" (band_id, scheme_id, min_marks, max_marks, grade_point, letter_grade) FROM stdin;
1ce51760-1c19-4f85-844c-2ec62a223c6a	3aa307d4-63af-41eb-bf66-f22aed292674	85	100	4	A+
9eb67ec1-d3e1-4b78-b047-70821abcde94	3aa307d4-63af-41eb-bf66-f22aed292674	80	84	4	A
55a446b5-88d4-4029-ae6b-a7e4b1a5d1a5	3aa307d4-63af-41eb-bf66-f22aed292674	75	79	3.7	A-
80d8ae47-8644-4492-bb3b-879629911b75	3aa307d4-63af-41eb-bf66-f22aed292674	70	74	3.3	B+
de4441c0-ded8-4cba-becf-785d2abf9825	3aa307d4-63af-41eb-bf66-f22aed292674	65	69	3	B
5f238fa8-c194-42eb-a760-44bcd6c31c85	3aa307d4-63af-41eb-bf66-f22aed292674	60	64	2.7	B-
9caaea8d-d61e-480e-8d92-00fc77b35b38	3aa307d4-63af-41eb-bf66-f22aed292674	55	59	2.3	C+
2465af08-4416-485b-a6e0-6792e9fd56f5	3aa307d4-63af-41eb-bf66-f22aed292674	50	54	2	C
c41e1e2b-e5c8-469d-84f3-1e320965a15a	3aa307d4-63af-41eb-bf66-f22aed292674	0	49	1.7	C-
f66d388c-20b0-4766-abdd-95f5fe409bae	3aa307d4-63af-41eb-bf66-f22aed292674	40	44	1	D
7c0fcf80-4a8c-47a3-bcc8-230a8e5356bf	3aa307d4-63af-41eb-bf66-f22aed292674	0	0	0	E
969b2a2f-ff67-4de0-bf6a-d95b241ac342	3aa307d4-63af-41eb-bf66-f22aed292674	1	39	0	F
\.


--
-- Data for Name: GradingScheme; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public."GradingScheme" (scheme_id, name, version, active, academic_year_id) FROM stdin;
3aa307d4-63af-41eb-bf66-f22aed292674	Institution default	1.0	t	\N
\.


--
-- Data for Name: HOD; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public."HOD" (hod_id, department) FROM stdin;
88d65386-fb87-449c-9acd-f08e329c4568	IM
\.


--
-- Data for Name: Internship; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public."Internship" (internship_id, student_id, company, role, start_date, end_date, status, supervisor_email, supervisor_phone, description, progress, created_at, updated_at, "supervisorName") FROM stdin;
\.


--
-- Data for Name: InternshipDocument; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public."InternshipDocument" (document_id, internship_id, name, type, url, uploaded_at) FROM stdin;
\.


--
-- Data for Name: InternshipMilestone; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public."InternshipMilestone" (milestone_id, internship_id, title, description, due_date, completed, completed_date) FROM stdin;
\.


--
-- Data for Name: LectureSchedule; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public."LectureSchedule" (schedule_id, module_id, staff_id, day_of_week, start_time, end_time, location) FROM stdin;
85f4a932-31ed-4c33-98f5-cc72ee57d832	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	cd570f68-a16d-4379-af96-a07b43a2cd82	Tuesday	2000-01-01 08:00:00	2000-01-01 09:55:00	\N
d6b49222-d410-445d-bcc4-3871cb46b247	661f72d8-c8cb-435e-bd30-eeaf8ff178ec	cd570f68-a16d-4379-af96-a07b43a2cd82	Thursday	2000-01-01 08:00:00	2000-01-01 10:55:00	\N
32ba8957-7f47-461d-aa8e-735f58c9c76f	661f72d8-c8cb-435e-bd30-eeaf8ff178ec	cd570f68-a16d-4379-af96-a07b43a2cd82	Thursday	2000-01-01 13:00:00	2000-01-01 14:55:00	\N
aa558407-8b12-4007-8d75-c017a8550b1b	661f72d8-c8cb-435e-bd30-eeaf8ff178ec	cd570f68-a16d-4379-af96-a07b43a2cd82	Friday	2000-01-01 13:00:00	2000-01-01 14:55:00	\N
85f9a07b-4931-440b-876c-741f92912f82	1c7e98f4-059b-41ec-a46a-dfeca8d40b45	cd570f68-a16d-4379-af96-a07b43a2cd82	Friday	2000-01-01 08:00:00	2000-01-01 12:00:00	\N
9db8b7d3-3635-4c9c-a608-3e7242c09de1	93201c4c-500c-4f59-b835-ce643647233d	cd570f68-a16d-4379-af96-a07b43a2cd82	Monday	2000-01-01 19:00:00	2000-01-01 20:55:00	\N
b5e57881-2013-4e44-8305-df6057a2da1c	93201c4c-500c-4f59-b835-ce643647233d	cd570f68-a16d-4379-af96-a07b43a2cd82	Sunday	2000-01-01 17:00:00	2000-01-01 18:55:00	\N
15d94f4f-d21c-4e4c-85ad-92ba1d6765d8	d541c250-0aeb-485a-8327-2419bd99d254	cd570f68-a16d-4379-af96-a07b43a2cd82	Tuesday	2000-01-01 10:00:00	2000-01-01 11:55:00	\N
0bce6c6e-c384-41b0-bf58-f2519f6f9163	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	d0006f91-fbb6-4037-b2ec-9fef0e828342	Wednesday	2000-01-01 08:00:00	2000-01-01 09:55:00	\N
53c3b044-ade1-4ba8-8478-9d781d5098d9	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	d0006f91-fbb6-4037-b2ec-9fef0e828342	Thursday	2000-01-01 08:00:00	2000-01-01 09:55:00	\N
8f0738e3-d388-4a48-b5a6-4275bf7a0d1d	30a296f6-a5fa-4dcd-9739-a2249ab5bd18	d0006f91-fbb6-4037-b2ec-9fef0e828342	Monday	2000-01-01 11:00:00	2000-01-01 11:55:00	\N
3657852b-1412-41ce-94e0-73517805adeb	30a296f6-a5fa-4dcd-9739-a2249ab5bd18	d0006f91-fbb6-4037-b2ec-9fef0e828342	Tuesday	2000-01-01 08:00:00	2000-01-01 09:55:00	\N
67c54910-7de2-4e06-83a3-b9a41e09723c	37f3d7fe-f95f-4037-935c-de0251ba251a	d0006f91-fbb6-4037-b2ec-9fef0e828342	Monday	2000-01-01 08:00:00	2000-01-01 09:55:00	\N
e07d9c0a-b4e7-4d56-9932-df922e6b0b26	37f3d7fe-f95f-4037-935c-de0251ba251a	d0006f91-fbb6-4037-b2ec-9fef0e828342	Thursday	2000-01-01 11:00:00	2000-01-01 11:55:00	\N
984ea768-9019-44b6-afb9-7241b9976c83	74942921-d088-4069-9393-dba1b3e56257	d0006f91-fbb6-4037-b2ec-9fef0e828342	Friday	2000-01-01 10:00:00	2000-01-01 11:55:00	\N
12cf7f7c-c85c-4274-aa8c-0450e5124c80	33a500a8-c04b-4c90-9d8e-794f5f1d1bed	2c5ced79-0341-4185-8d51-6eac14cdf36f	Wednesday	2000-01-01 10:00:00	2000-01-01 13:00:00	\N
897e30b9-0567-4ee8-982b-b050fc5f5a62	a32527ec-65ca-4b05-a12b-253dd65c568a	2c5ced79-0341-4185-8d51-6eac14cdf36f	Thursday	2000-01-01 13:00:00	2000-01-01 15:55:00	\N
b632a527-916e-42fb-9bc4-df428d74779c	2716a46c-afac-4c67-bb6a-5fad4818ed4f	2c5ced79-0341-4185-8d51-6eac14cdf36f	Monday	2000-01-01 10:00:00	2000-01-01 13:00:00	\N
b5a3443b-a27c-43b1-a626-f22f1db0bf48	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	bb8c46fe-88e7-45c0-aedc-11bce0665734	Tuesday	2000-01-01 13:00:00	2000-01-01 15:55:00	\N
b5757ac6-e9ab-405a-a4ba-4b1eec5954a1	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	bb8c46fe-88e7-45c0-aedc-11bce0665734	Friday	2000-01-01 09:00:00	2000-01-01 11:55:00	\N
2fd8286e-032a-43d2-b2dc-c684d26838af	6137b228-aa85-450a-904f-b01ba80ce7a2	bb8c46fe-88e7-45c0-aedc-11bce0665734	Thursday	2000-01-01 09:00:00	2000-01-01 11:55:00	\N
63127bc8-c936-4574-855d-98fc1210df97	46f01733-2b23-44d5-9be0-2909af0c80b0	bb8c46fe-88e7-45c0-aedc-11bce0665734	Wednesday	2000-01-01 09:00:00	2000-01-01 13:00:00	\N
d5742a54-5a74-4a8f-80d5-30fe8b647569	46f01733-2b23-44d5-9be0-2909af0c80b0	bb8c46fe-88e7-45c0-aedc-11bce0665734	Tuesday	2000-01-01 13:00:00	2000-01-01 16:55:00	\N
483f8ed0-9118-482c-99b5-550a32e8cf48	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	599cb63f-b19a-424c-aad6-7f0d4fa66eb5	Monday	2000-01-01 08:00:00	2000-01-01 09:55:00	\N
fda9f3b7-b1f2-4192-9df9-a845d139e7db	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	599cb63f-b19a-424c-aad6-7f0d4fa66eb5	Friday	2000-01-01 13:00:00	2000-01-01 15:55:00	\N
832dbf2d-8a0c-47b0-86b8-eadd598f31ef	7842c578-5e24-4ffd-b3e2-028980270807	599cb63f-b19a-424c-aad6-7f0d4fa66eb5	Tuesday	2000-01-01 13:00:00	2000-01-01 15:55:00	\N
d3764a01-6880-4c19-b95b-f438d56984db	33923a51-708b-4165-8b07-64e2f51f9c74	b7ae9438-4c82-4c09-a90a-bad4b648e495	Tuesday	2000-01-01 13:00:00	2000-01-01 15:55:00	\N
ff9ff643-16ce-4b38-a5f9-0077961e9b34	0f3ce6ba-c933-4d94-9bb1-b4d76cf464f9	b7ae9438-4c82-4c09-a90a-bad4b648e495	Monday	2000-01-01 14:00:00	2000-01-01 16:55:00	\N
31005c1c-9c43-420e-93d6-645f7c126f97	2b72059a-e0bc-4334-a688-152358b2e78e	b7ae9438-4c82-4c09-a90a-bad4b648e495	Tuesday	2000-01-01 19:00:00	2000-01-01 20:55:00	\N
cee4f680-5d7f-49b9-876e-815ed89fa3da	d541c250-0aeb-485a-8327-2419bd99d254	b7ae9438-4c82-4c09-a90a-bad4b648e495	Tuesday	2000-01-01 10:00:00	2000-01-01 11:55:00	\N
da2ae9d0-e1a3-49c9-9f84-75ade4426229	47822656-dd0f-454c-98e5-9fc88e89c1ed	88d65386-fb87-449c-9acd-f08e329c4568	Monday	2000-01-01 08:00:00	2000-01-01 10:55:00	\N
b8b74353-a0b7-448f-b308-3af475f3c343	d8b6adc6-5106-4145-bbe0-a8e060213282	88d65386-fb87-449c-9acd-f08e329c4568	Tuesday	2000-01-01 09:00:00	2000-01-01 11:55:00	\N
e3694066-5f55-4486-a474-a229768998ff	1b33f669-35a8-4044-8ec4-8818e2646d65	8360a926-2023-4a61-a986-8ddeb3ea9ec4	Tuesday	2000-01-01 09:00:00	2000-01-01 11:55:00	\N
5b0727b2-3631-4316-93ac-e3fd269e71ed	7386b1df-3142-437d-ac02-1916002353f9	8360a926-2023-4a61-a986-8ddeb3ea9ec4	Wednesday	2000-01-01 10:00:00	2000-01-01 13:00:00	\N
8723e64f-5958-418e-b014-037d6a839fef	6e640c31-d0ac-4988-b875-bbfb3c41a434	8360a926-2023-4a61-a986-8ddeb3ea9ec4	Thursday	2000-01-01 13:00:00	2000-01-01 14:55:00	\N
5e3e7142-8744-44bb-850e-59437c165c93	6e640c31-d0ac-4988-b875-bbfb3c41a434	8360a926-2023-4a61-a986-8ddeb3ea9ec4	Friday	2000-01-01 08:00:00	2000-01-01 09:55:00	\N
9b1e4b8e-7dac-42c3-8675-5846ae554ab7	d6caf588-83d1-4158-ae08-217ab162d754	4473498f-15ef-47b3-80fe-7001c9f5ab32	Monday	2000-01-01 13:00:00	2000-01-01 15:55:00	\N
f3d0a1ba-dada-4b03-9011-bc81403d7815	7be2df4c-4f40-43cf-8e19-ceb02f2c3b8e	4473498f-15ef-47b3-80fe-7001c9f5ab32	Wednesday	2000-01-01 08:00:00	2000-01-01 09:55:00	\N
648706bd-6774-4ac8-8f1f-264e02c74b2a	d988278e-b54f-45ac-8624-a52ea082192c	4473498f-15ef-47b3-80fe-7001c9f5ab32	Thursday	2000-01-01 08:00:00	2000-01-01 09:55:00	\N
40129300-81cc-4a16-b44e-e1a3fe8822d3	d988278e-b54f-45ac-8624-a52ea082192c	4473498f-15ef-47b3-80fe-7001c9f5ab32	Friday	2000-01-01 11:00:00	2000-01-01 13:00:00	\N
1805c19e-e172-4b5d-90a1-805cce75a002	f9d98581-20ac-48dc-ad6d-a9c770d05e9b	4473498f-15ef-47b3-80fe-7001c9f5ab32	Thursday	2000-01-01 10:00:00	2000-01-01 14:55:00	\N
50a8f1cd-7a15-4b07-bd1b-58213c4a149c	9889dc2e-c81b-44ed-adfd-e75de8c6d9e8	7d5608ea-a091-4283-a9bd-fe3e463f6b86	Saturday	2000-01-01 08:00:00	2000-01-01 15:55:00	\N
d6946eb7-52df-4100-a919-0bb446d4dedf	84a9747d-2e9f-4fc6-b9e6-6d5e25af2758	e5ce552c-33c8-4719-989b-d8a6e82141fb	Sunday	2000-01-01 09:00:00	2000-01-01 12:00:00	\N
fa8891c5-52d6-43d5-8f9d-34d3db93715e	84a9747d-2e9f-4fc6-b9e6-6d5e25af2758	b751c19d-63bd-4cf0-83f2-859cd1f9b8eb	Sunday	2000-01-01 09:00:00	2000-01-01 11:55:00	\N
ddf414c4-5045-48d8-8ab2-3ded534e0dde	32d8aa6e-e42e-4f2c-8291-8fb8c64aa44c	0e551ed4-3c4f-470d-beba-3a5b30a54d83	Tuesday	2000-01-01 17:00:00	2000-01-01 20:00:00	\N
4d04891b-e01b-4101-bc24-c2c416855164	2a9ff6f9-4fa8-4d8d-8024-835067736cb0	0e551ed4-3c4f-470d-beba-3a5b30a54d83	Thursday	2000-01-01 17:00:00	2000-01-01 20:00:00	\N
f277f184-e9b2-47d5-8a54-72df78140ed0	620ca8ae-45ca-43a7-becd-3e1416e91658	fe587071-49ff-43fc-a174-3c03ea3aac9b	Thursday	2000-01-01 19:00:00	2000-01-01 20:55:00	\N
c6421485-4e3a-4f44-9f6b-c15ccdda0a33	be062d08-8118-48a6-9277-f2326b02cf89	a2fd5222-2c84-4a97-9fcd-313f5ed44106	Thursday	2000-01-01 19:00:00	2000-01-01 20:55:00	\N
0c0303da-22bd-4666-94ce-57576b0cf750	be062d08-8118-48a6-9277-f2326b02cf89	a2fd5222-2c84-4a97-9fcd-313f5ed44106	Friday	2000-01-01 13:00:00	2000-01-01 14:55:00	\N
ccc85864-3b89-4eb4-b833-e567600d9ab0	2cf878be-5af8-4edb-8b0e-073e172c8c71	40173ed9-6b85-4d99-a4c3-37f5d617984d	Sunday	2000-01-01 09:00:00	2000-01-01 10:55:00	\N
3e210f5d-4a0d-4a60-934c-e4be068a3deb	4c6050aa-4cf5-4f27-aaa6-5accbf68e9d1	5a8973b3-ba1e-4bdb-8f8f-dc176f01a054	Thursday	2000-01-01 15:00:00	2000-01-01 16:55:00	\N
d5456cb2-613c-47d9-a7e3-30a0a06c3d42	4c6050aa-4cf5-4f27-aaa6-5accbf68e9d1	f9cd265a-62cf-4348-88fa-9610e82846ac	Thursday	2000-01-01 15:00:00	2000-01-01 16:55:00	\N
1d72fcbb-4f71-4462-9659-7ae11f9a1adb	74942921-d088-4069-9393-dba1b3e56257	4d9bc966-fa7a-4de3-af0f-ec8aa47f38e9	Friday	2000-01-01 10:00:00	2000-01-01 13:00:00	\N
5b1eb69d-01af-4389-bbfc-7e246c2fabf0	9b7e45e1-4847-4f03-8abd-0772525af0de	05c49617-eaa8-49af-b650-8ae609fb38ca	Thursday	2000-01-01 13:00:00	2000-01-01 15:55:00	\N
d42e5c29-97b0-4844-b005-e37291379808	9b7e45e1-4847-4f03-8abd-0772525af0de	05c49617-eaa8-49af-b650-8ae609fb38ca	Friday	2000-01-01 08:00:00	2000-01-01 09:55:00	\N
2a1508c8-4ad4-4707-ba24-f23a36b33ccd	9b7e45e1-4847-4f03-8abd-0772525af0de	05c49617-eaa8-49af-b650-8ae609fb38ca	Wednesday	2000-01-01 08:00:00	2000-01-01 10:00:00	\N
\.


--
-- Data for Name: LmsImportSession; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public."LmsImportSession" (session_id, student_id, status, stage, progress_pct, preview_json, error_message, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: Message; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public."Message" (message_id, sender_id, recipient_id, subject, content, sent_at, read_at) FROM stdin;
7fa94768-f1f5-4de5-8624-f25663cef875	599cb63f-b19a-424c-aad6-7f0d4fa66eb5	IM/2024/001	Direct Message	Hello	2026-04-17 08:25:15.399	\N
\.


--
-- Data for Name: Module; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public."Module" (module_id, code, name, credits, level, description, active, academic_year_id, counts_toward_gpa, custom_grading_bands) FROM stdin;
9609dfe2-3a47-4dd2-a941-ad5d7a45e906	DELT 11232	English for Professionals	2	L1	Module English for Professionals	t	\N	t	\N
4d71d2ef-d1be-48db-9e48-e12d1f445329	GNCT 11212a	Personal Progress Development I	2	L1	Module Personal Progress Development I	t	\N	t	\N
a684256c-7801-47b6-9d3e-e334f334e63c	INTE 11213	Fundamentals of Computing	3	L1	Module Fundamentals of Computing	t	\N	t	\N
7e1f26b7-fb20-445e-abe3-5a43f9a2c7af	INTE 11223	Programming Concepts	3	L1	Module Programming Concepts	t	\N	t	\N
f060c389-3ffb-4733-b21d-e3b59310d723	MGTE 11233	Business Statistics and Economics	3	L1	Module Business Statistics and Economics	t	\N	t	\N
50a00c33-a365-4ebe-a7eb-127d7efda5f6	PMAT 11212	Discrete Mathematics for Computing I	2	L1	Module Discrete Mathematics for Computing I	t	\N	t	\N
187bb9de-c86f-43d2-b47c-f27de80967e7	MGTE 12253	Accounting Concepts and Costing	3	L1	Module Accounting Concepts and Costing	t	\N	t	\N
0a308fe3-8c2f-4aae-918e-9c425ecb44c2	INTE 12243	Computer Networks	3	L1	Module Computer Networks	t	\N	t	\N
9df5d19b-1a4b-4cb5-a586-d649a7cb9add	INTE 12213	Object Oriented Programming	3	L1	Module Object Oriented Programming	t	\N	t	\N
194ba375-3037-4f18-9c56-306aefe4e499	INTE 12223	Database Design and Development	3	L1	Module Database Design and Development	t	\N	t	\N
9fede30e-98ea-43e8-9a96-2e66bdb404bf	MGTE 12263	Optimization Methods in Management Science	3	L1	Module Optimization Methods in Management Science	t	\N	t	\N
58c560d6-06f3-4331-bd7d-81422a7d7139	MGTE 12273	Industry and Technology	3	L1	Module Industry and Technology	t	\N	t	\N
c08df20a-02dc-4e5c-b498-729d78cb5983	PMAT 12212	Discrete Mathematics for Computing II	2	L1	Module Discrete Mathematics for Computing II	t	\N	t	\N
6860d3ee-dd78-4fe1-8b9b-4ada56cb913e	INTE 21213	Information Systems Modelling	3	L2	Module Information Systems Modelling	t	\N	t	\N
0bbd3aa6-1e2b-4e99-af0a-f3f84cc75a10	INTE 21313	Business Information Systems	3	L2	Module Business Information Systems	t	\N	t	\N
037453b4-bc30-4640-95e3-12fdaba828fa	INTE 21323	Web Applications Development	3	L2	Module Web Applications Development	t	\N	t	\N
68dddd76-e8bd-4e40-838b-646688be7efe	INTE 21333	Event Driven Programming	3	L2	Module Event Driven Programming	t	\N	t	\N
da40a045-4e9a-408c-a5ae-d535aba296ac	MGTE 21243	Marketing Management	3	L2	Module Marketing Management	t	\N	t	\N
f82c0d24-7715-47e1-9898-dda42e472318	MGTE 21233	Operations Management	3	L2	Module Operations Management	t	\N	t	\N
aab05c64-c69e-4c65-9bb8-5b5908627608	INTE 21343	Software Engineering Concepts	3	L2	Module Software Engineering Concepts	t	\N	t	\N
4fcb0b35-242f-4aa5-b1bc-b4924a8dc664	INTE 22343	Data Structures and Algorithms	3	L2	Module Data Structures and Algorithms	t	\N	t	\N
7c24057a-3e64-4c31-a0de-9593a2bd498a	INTE 22303	Artificial Intelligence	3	L2	Module Artificial Intelligence	t	\N	t	\N
6c2848bd-f6ec-4354-98ab-929d2b016bd0	MGTE 22263	Logistics and Supply Chain Management	3	L2	Module Logistics and Supply Chain Management	t	\N	t	\N
b89a3527-0029-4474-a7e4-0c30921a850d	INTE 22283	Mobile Applications Development	3	L2	Module Mobile Applications Development	t	\N	t	\N
7a1c7fc1-0c6e-4451-8982-4a7fbd42f4d9	GNCT 24212a	Personal Progress Development II	2	L2	Module Personal Progress Development II	t	\N	t	\N
e5e670ff-b6d4-4b97-af37-7e0c31140e35	INTE 31356	Software Development Project	6	L3	Module Software Development Project	t	\N	t	\N
6b30076b-6f78-401d-abfe-bd0197844fcd	MGTE 31393	Managerial Finance	3	L3	Module Managerial Finance	t	\N	t	\N
1fee972c-6d01-436b-803d-c6d3261b6189	MGTE 31293	Computer Integrated Manufacturing	3	L3	Module Computer Integrated Manufacturing	t	\N	t	\N
842a80db-242d-4df0-b980-65e24a4bdcb6	MGTE 31403	Management of Technology	3	L3	Module Management of Technology	t	\N	t	\N
ad8c6dbd-28e0-430e-a266-d2cdeb3c937a	MGTE 31413	Warehouse Management and Industrial Shipping	3	L3	Module Warehouse Management and Industrial Shipping	t	\N	t	\N
771bd1f6-6f89-45b7-8eb3-e96fb7eac3c0	MGTE 31373	Project Management	3	L3	Module Project Management	t	\N	t	\N
30978923-a161-4550-8388-375df1c3e8ae	MGTE 31303	Procurement and Supply Management	3	L3	Module Procurement and Supply Management	t	\N	t	\N
9b185406-61c3-41e9-8858-58f97b158f61	INTE 31423	Data Analytics and Visualization	3	L3	Module Data Analytics and Visualization	t	\N	t	\N
83c5ba1c-93f2-4b83-be77-a9f49e0ccb56	INTE 31413	Information Technology Infrastructure	3	L3	Module Information Technology Infrastructure	t	\N	t	\N
294b69cc-a7ec-487d-b081-128a01509f47	INTE 31393	Information Security	3	L3	Module Information Security	t	\N	t	\N
c558a08e-c729-4369-86f2-9266c1cdc0d6	MGTE 31383	Research Methods	3	L3	Module Research Methods	t	\N	t	\N
3e6f95ea-4a25-47a6-8464-856a1685bb80	MGTE 31443	Strategic Marketing and International Trade	3	L3	Module Strategic Marketing and International Trade	t	\N	t	\N
961993da-f737-44ac-b1b5-5fa5264dca12	GNCT 32216	Internship	6	L3	Module Internship	t	\N	t	\N
90e3962b-b939-4053-b238-20cf398e4644	INTE 43216b	Research Project	6	L4	Module Research Project	t	\N	t	\N
28277cd5-9c7b-4c37-93a2-460c68cf8bb8	MGTE 43216b	Research Project	6	L4	Module Research Project	t	\N	t	\N
11421878-f187-4baf-897e-b0dea0494401	MGTE 41323	Professional Practices	3	L4	Module Professional Practices	t	\N	t	\N
69319868-4c9d-413b-b7fe-5ef4065f4856	MGTE 41333	Business Process Engineering	3	L4	Module Business Process Engineering	t	\N	t	\N
6934c7e2-1acc-4a62-a04c-f2080e7949ee	MGTE 41233	Corporate Finance	3	L4	Module Corporate Finance	t	\N	t	\N
cee0f579-1fe3-45c7-a022-9267ae7f253e	INTE 41283	Information Systems Management and Strategy	3	L4	Module Information Systems Management and Strategy	t	\N	t	\N
37611975-b014-42da-95c3-8cbd1e2843f9	MGTE 41303	Enterprise Systems	3	L4	Module Enterprise Systems	t	\N	t	\N
2fe6fe04-2630-49f5-8355-0d277ea2fb8f	MGTE 41313	Statistical Data Modeling	3	L4	Module Statistical Data Modeling	t	\N	t	\N
c7d7cf4c-0113-4ebb-9474-a7d7a884e3cd	MGTE 41343	Logistics System Analysis and Geomatics	3	L4	Module Logistics System Analysis and Geomatics	t	\N	t	\N
cb4b0bc4-fb3a-4519-826a-6a9772335779	MGTE 41363	Digital Innovations Management	3	L4	Module Digital Innovations Management	t	\N	t	\N
1c52a9bd-8940-4ff0-8208-dbaa110c5af3	MGTE 41373	Strategic Management	3	L4	Module Strategic Management	t	\N	t	\N
73f8dfec-691a-4ff2-9625-725b9cbdd9ec	MGTE 41383	Advanced operations Management	3	L4	Module Advanced operations Management	t	\N	t	\N
75c23841-de42-4b5e-b9b7-47153cfea9bc	MGTE 44273	Innovation & Entrepreneurship	3	L4	Module Innovation & Entrepreneurship	t	\N	t	\N
5e85cf1a-25cc-4a05-b54c-e5f63637a7d6	INTE 44303	Information Audit and Assurance	3	L4	Module Information Audit and Assurance	t	\N	t	\N
aad74d93-8665-4213-a1be-3d103934498d	MGTE 42213	Industrial and Systems Engineering	3	L4	Module Industrial and Systems Engineering	t	\N	t	\N
3b9b100f-2ef9-4985-bab5-f09fce4cfa2f	MGTE 42243	Advanced Planning and Scheduling	3	L4	Module Advanced Planning and Scheduling	t	\N	t	\N
bd8e82e8-7a05-4619-a3b1-b7cdfdee10eb	MGTE 42333	Business and Information Technology Law	3	L4	Module Business and Information Technology Law	t	\N	t	\N
d40cf07d-28a9-4701-9f9c-061a519eb64d	MGTE 42223	Investment Management	3	L4	Module Investment Management	t	\N	t	\N
91035b15-ccef-47c1-92ef-13eecac56045	INTE 21243	Computer Architecture and Operating Systems	3	L2	Module Computer Architecture and Operating Systems	t	\N	t	\N
00ac0409-f8ba-4a55-9c6d-16554d6a3e2f	INTE 22293	Software Architecture and Process Models	3	L2	Module Software Architecture and Process Models	t	\N	t	\N
222e7280-445c-4c6e-b515-2efe5e3c68ff	INTE 22253	Distributed Systems and Cloud Computing	3	L2	Module Distributed Systems and Cloud Computing	t	\N	t	\N
45152844-fbfc-471f-9304-1315b5a8c087	INTE 22263	Embedded Systems Development	3	L2	Module Embedded Systems Development	t	\N	t	\N
840e23cb-0bd0-4024-867e-eef72cf98a70	INTE 22313	Software Design Patterns and Frameworks	3	L2	Module Software Design Patterns and Frameworks	t	\N	t	\N
89eacd27-7707-404c-aaad-1328ad1ef28b	INTE 31233	Human Computer Interaction	3	L3	Module Human Computer Interaction	t	\N	t	\N
2760c24f-aed6-476f-b911-7738c1a11d86	INTE 31243	Software Quality Engineering	3	L3	Module Software Quality Engineering	t	\N	t	\N
172b4601-64b0-48d6-9f3b-31a241582adf	INTE 31283	Big Data and Data Warehousing	3	L3	Module Big Data and Data Warehousing	t	\N	t	\N
ebfa6454-83cf-4d90-9237-2566746d3575	INTE 31373	Machine Learning	3	L3	Module Machine Learning	t	\N	t	\N
d7a78d3c-5800-4298-809a-b692157344e3	INTE 31403	System Administration and Maintenance	3	L3	Module System Administration and Maintenance	t	\N	t	\N
fa0ae5dc-a12f-4423-a52c-21274c0e6ddb	PMAT 31212	Mathematics for Computing - 3	2	L3	Module Mathematics for Computing - 3	t	\N	t	\N
880d4408-f797-4673-bf13-f3a77c37e9b1	INTE 41393	System Integration Technologies	3	L4	Module System Integration Technologies	t	\N	t	\N
87d9c721-ff98-4942-a210-f7db026f68c1	INTE 41373	Image Processing	3	L4	Module Image Processing	t	\N	t	\N
15010796-ab46-49bf-928e-3672b2c908f1	INTE 41323	Neural Networks and Deep Learning	3	L4	Module Neural Networks and Deep Learning	t	\N	t	\N
36c68aa9-786d-4bd0-9b92-d6f9f8de9263	INTE 41383	Industrial Automation	3	L4	Module Industrial Automation	t	\N	t	\N
7a7c6fa2-ffdb-4c28-a577-8b1573f80489	INTE 41403	Advanced Databases	3	L4	Module Advanced Databases	t	\N	t	\N
240ab053-55ea-4601-882a-59f449c89dfb	INTE 41413	Internet of Things	3	L4	Module Internet of Things	t	\N	t	\N
337ce08d-1ae2-47fd-a97d-e9d32d616229	MGTE 42303	Business and Information Technology Law	3	L4	Module Business and Information Technology Law	t	\N	t	\N
fe8c8583-0fee-483c-a4d2-a165f290bd29	INTE 42353	Semantic Web and Ontological Engineering	3	L4	Module Semantic Web and Ontological Engineering	t	\N	t	\N
4d3e12fe-59f7-4025-90c8-ee6a0f644b56	INTE 42333	Complex Systems and Agent Based Modelling	3	L4	Module Complex Systems and Agent Based Modelling	t	\N	t	\N
52a8885e-f1d8-4324-8288-3e8fee958974	INTE 42343	Natural Language Processing	3	L4	Module Natural Language Processing	t	\N	t	\N
6e1a64d1-1639-4fb0-a928-be337cb524f2	ACLT 11013	Academic Literacy I	3	L1	Academic Literacy I	t	\N	t	\N
186ce288-fa25-4da9-a864-dfd369cfc125	MGTE 11243	Principles of Management & Organizational Behaviour	3	L1	Principles of Management & Organizational Behaviour	t	\N	t	\N
e9ba4e78-6501-49ea-ba85-e8c26ff7de9f	GNCT 23212	Personal Progress Development II	2	L2	Personal Progress Development II	t	\N	f	\N
92fe961a-8972-440e-a57f-13b9d1f3f0c6	INTE 22213	INTE 22213	3	L2	INTE 22213	t	\N	t	\N
200a200c-7e2d-4263-971a-32d137c5d785	GNCT 23212	Personal Progress Development II	2	L2	Personal Progress Development II	t	d0f33d92-6ff5-4627-801e-7edaceec7253	f	\N
e598ba91-9aba-4ccf-91b6-e0ed48353e8b	INTE 21213	Information Systems Modelling	3	L2	Information Systems Modelling	t	d0f33d92-6ff5-4627-801e-7edaceec7253	t	\N
ecbf469e-247b-4197-b733-f34490b94f8e	INTE 21243	Computer Architecture and Operating Systems	3	L2	Computer Architecture and Operating Systems	t	d0f33d92-6ff5-4627-801e-7edaceec7253	t	\N
dd19d0bd-311c-4aaf-92c2-3cb6c82b1902	INTE 21313	Business Information Systems	3	L2	Business Information Systems	t	d0f33d92-6ff5-4627-801e-7edaceec7253	t	\N
764cc9ac-a9d3-483e-b70a-2df938794ee4	INTE 21323	Web Application Development	3	L2	Web Application Development	t	d0f33d92-6ff5-4627-801e-7edaceec7253	t	\N
71ae9cd2-8ccd-4cc0-94a7-c416c0907810	INTE 21333	Event Driven Programming	3	L2	Event Driven Programming	t	d0f33d92-6ff5-4627-801e-7edaceec7253	t	\N
deb5e449-adac-4de7-8320-165a01f70c9b	INTE 22253	Distributed Systems and Cloud Computing	3	L2	Distributed Systems and Cloud Computing	t	d0f33d92-6ff5-4627-801e-7edaceec7253	t	\N
a5478e8b-ab12-444e-8ea0-2aea10cd4833	INTE 22263	Embedded Systems Development	3	L2	Embedded Systems Development	t	d0f33d92-6ff5-4627-801e-7edaceec7253	t	\N
41458ea3-a328-426d-81e7-91c4fc08efad	INTE 22283	Mobile Applications Development	3	L2	Mobile Applications Development	t	d0f33d92-6ff5-4627-801e-7edaceec7253	t	\N
367fc67a-ae20-4e06-a4ef-394d476c2022	INTE 22293	Software Architecture and Process Models	3	L2	Software Architecture and Process Models	t	d0f33d92-6ff5-4627-801e-7edaceec7253	t	\N
e9fd7461-8adb-4fcc-9ac9-246131368c80	INTE 22303	Artificial Intelligence	3	L2	Artificial Intelligence	t	d0f33d92-6ff5-4627-801e-7edaceec7253	t	\N
a173715a-0bb1-4429-8ecd-e25490c5ea3a	INTE 22343	Data Structures and Algorithms	3	L2	Data Structures and Algorithms	t	d0f33d92-6ff5-4627-801e-7edaceec7253	t	\N
1baee0ba-c85e-4280-a726-0779aabec687	GNCT 24212a	Personal Progress Development II	2	L2	Module Personal Progress Development II	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	f	\N
c7a44f1a-76f4-4c87-bee8-f577386acca1	GNCT 32216	Internship	6	L3	Module Internship	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	f	\N
d541c250-0aeb-485a-8327-2419bd99d254	GNCT 11212a	Personal Progress Development I	2	L1	Module Personal Progress Development I	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	f	\N
6bdf0982-3100-4747-a5e6-cc4cee603bf5	DELT 11232	English for Professionals	2	L1	Module English for Professionals	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
3dc12e90-c75d-4bcb-a2e2-84c75dfc7f91	MGTE 42243	Advanced Planning and Scheduling	3	L4	Module Advanced Planning and Scheduling	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
76cd81f0-8e51-4dd0-a414-85e33fa09b1d	INTE 11213	Fundamentals of Computing	3	L1	Module Fundamentals of Computing	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
9e882501-05ec-4007-a8cd-fbbb12d0cd3c	INTE 11223	Programming Concepts	3	L1	Module Programming Concepts	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	MGTE 11233	Business Statistics and Economics	3	L1	Module Business Statistics and Economics	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
158f2c82-5beb-42ea-810f-5126b7839904	PMAT 11212	Discrete Mathematics for Computing I	2	L1	Module Discrete Mathematics for Computing I	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
9ed34829-6b87-4259-b60b-5ec3a8b650e3	MGTE 12253	Accounting Concepts and Costing	3	L1	Module Accounting Concepts and Costing	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	INTE 12243	Computer Networks	3	L1	Module Computer Networks	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
fdeb8451-82f5-4c65-a8d1-c52c53ab6090	INTE 12213	Object Oriented Programming	3	L1	Module Object Oriented Programming	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
e0459725-a48e-45f0-823a-5aee6668ab05	INTE 12223	Database Design and Development	3	L1	Module Database Design and Development	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
4e406ae6-844d-48dc-bae6-ce5ca64026e5	MGTE 12263	Optimization Methods in Management Science	3	L1	Module Optimization Methods in Management Science	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
bb0e7c53-8c41-499d-8288-01ac3458e577	MGTE 12273	Industry and Technology	3	L1	Module Industry and Technology	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
e855c7ea-ae84-4dab-807c-1f1bc0fc968a	PMAT 12212	Discrete Mathematics for Computing II	2	L1	Module Discrete Mathematics for Computing II	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
33923a51-708b-4165-8b07-64e2f51f9c74	INTE 21213	Information Systems Modelling	3	L2	Module Information Systems Modelling	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
30a296f6-a5fa-4dcd-9739-a2249ab5bd18	INTE 21313	Business Information Systems	3	L2	Module Business Information Systems	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
9b7e45e1-4847-4f03-8abd-0772525af0de	INTE 21323	Web Applications Development	3	L2	Module Web Applications Development	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
d6caf588-83d1-4158-ae08-217ab162d754	INTE 21333	Event Driven Programming	3	L2	Module Event Driven Programming	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
32d8aa6e-e42e-4f2c-8291-8fb8c64aa44c	MGTE 21243	Marketing Management	3	L2	Module Marketing Management	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
fd5fc66b-3b53-49fe-8f30-d85efa746d72	MGTE 21233	Operations Management	3	L2	Module Operations Management	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
47822656-dd0f-454c-98e5-9fc88e89c1ed	INTE 21343	Software Engineering Concepts	3	L2	Module Software Engineering Concepts	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
6e8d1c49-594a-4096-96de-0dccc042c43f	INTE 22343	Data Structures and Algorithms	3	L2	Module Data Structures and Algorithms	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
9aae0052-0dc9-49f6-99d3-67ef1fd58ac5	INTE 22303	Artificial Intelligence	3	L2	Module Artificial Intelligence	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
8a22621c-c394-479d-b3ca-b66f895ba242	MGTE 22263	Logistics and Supply Chain Management	3	L2	Module Logistics and Supply Chain Management	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
301f7c7e-1b19-44b3-8b55-c1cba82655da	INTE 22283	Mobile Applications Development	3	L2	Module Mobile Applications Development	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
5b88af5e-6fa0-4944-9b72-8af4c8c3204f	INTE 31356	Software Development Project	6	L3	Module Software Development Project	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
50161189-c60a-484f-a09c-17d525f2382b	MGTE 31393	Managerial Finance	3	L3	Module Managerial Finance	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
255bee37-820c-49c0-b7c5-5b2b2636700a	MGTE 31293	Computer Integrated Manufacturing	3	L3	Module Computer Integrated Manufacturing	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
a32527ec-65ca-4b05-a12b-253dd65c568a	MGTE 31403	Management of Technology	3	L3	Module Management of Technology	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
7386b1df-3142-437d-ac02-1916002353f9	MGTE 31413	Warehouse Management and Industrial Shipping	3	L3	Module Warehouse Management and Industrial Shipping	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
37f3d7fe-f95f-4037-935c-de0251ba251a	MGTE 31373	Project Management	3	L3	Module Project Management	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
1b33f669-35a8-4044-8ec4-8818e2646d65	MGTE 31303	Procurement and Supply Management	3	L3	Module Procurement and Supply Management	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
f9cb4cca-2952-4050-a6ea-3f62f11f407f	INTE 31423	Data Analytics and Visualization	3	L3	Module Data Analytics and Visualization	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
2ea58353-dc87-4682-a914-e8a447521a7f	INTE 31413	Information Technology Infrastructure	3	L3	Module Information Technology Infrastructure	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
bc2fc32c-45d0-42e7-823c-18d3f44e8667	INTE 31393	Information Security	3	L3	Module Information Security	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
7842c578-5e24-4ffd-b3e2-028980270807	MGTE 31383	Research Methods	3	L3	Module Research Methods	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
2716a46c-afac-4c67-bb6a-5fad4818ed4f	MGTE 31443	Strategic Marketing and International Trade	3	L3	Module Strategic Marketing and International Trade	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
46f01733-2b23-44d5-9be0-2909af0c80b0	INTE 43216b	Research Project	6	L4	Module Research Project	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
1a915a4c-8cd4-42b2-b650-bce035a71ade	MGTE 43216b	Research Project	6	L4	Module Research Project	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
61300f27-ec14-488b-a3c3-62e21132a8f2	MGTE 41323	Professional Practices	3	L4	Module Professional Practices	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
2b72059a-e0bc-4334-a688-152358b2e78e	MGTE 41333	Business Process Engineering	3	L4	Module Business Process Engineering	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
84a9747d-2e9f-4fc6-b9e6-6d5e25af2758	MGTE 41233	Corporate Finance	3	L4	Module Corporate Finance	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
3bb01cf9-775a-4842-b10a-a353dc32afad	INTE 41283	Information Systems Management and Strategy	3	L4	Module Information Systems Management and Strategy	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
74942921-d088-4069-9393-dba1b3e56257	MGTE 41303	Enterprise Systems	3	L4	Module Enterprise Systems	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
bf100799-6b4b-4659-bc91-1670e345b1f5	MGTE 41313	Statistical Data Modeling	3	L4	Module Statistical Data Modeling	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
905af371-a76b-4bb1-a248-f2e523681137	MGTE 41343	Logistics System Analysis and Geomatics	3	L4	Module Logistics System Analysis and Geomatics	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
24a53945-eb10-4f24-b7f2-60ed6e95e9a0	MGTE 41363	Digital Innovations Management	3	L4	Module Digital Innovations Management	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
2a9ff6f9-4fa8-4d8d-8024-835067736cb0	MGTE 41373	Strategic Management	3	L4	Module Strategic Management	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
7a8b8fb5-3066-43b7-a6e2-3b171e1ccaad	MGTE 41383	Advanced operations Management	3	L4	Module Advanced operations Management	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
74843e6f-b998-4037-825b-4928747b35a7	MGTE 44273	Innovation & Entrepreneurship	3	L4	Module Innovation & Entrepreneurship	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
b1cc2594-44be-4afd-a37e-260643185ad9	INTE 44303	Information Audit and Assurance	3	L4	Module Information Audit and Assurance	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
8ffdc50b-6552-4127-9678-512ad7d9fd38	MGTE 42213	Industrial and Systems Engineering	3	L4	Module Industrial and Systems Engineering	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
51af727f-88c4-46fc-ad8d-3584ecbed151	MGTE 42333	Business and Information Technology Law	3	L4	Module Business and Information Technology Law	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
696f1830-a06b-41e6-b020-d668790e3e11	MGTE 42223	Investment Management	3	L4	Module Investment Management	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
6137b228-aa85-450a-904f-b01ba80ce7a2	INTE 21243	Computer Architecture and Operating Systems	3	L2	Module Computer Architecture and Operating Systems	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
7331463e-490e-4a04-a6e0-ff43d2c2d732	INTE 22293	Software Architecture and Process Models	3	L2	Module Software Architecture and Process Models	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
65d8e32a-1919-44d1-ac38-076ab9308760	INTE 22253	Distributed Systems and Cloud Computing	3	L2	Module Distributed Systems and Cloud Computing	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
5564fa4f-e8e9-49a8-aa70-656448739a1a	INTE 22263	Embedded Systems Development	3	L2	Module Embedded Systems Development	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
3d378d33-faf6-4c27-bbd3-336a8d9d3dbd	INTE 22313	Software Design Patterns and Frameworks	3	L2	Module Software Design Patterns and Frameworks	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
0f3ce6ba-c933-4d94-9bb1-b4d76cf464f9	INTE 31233	Human Computer Interaction	3	L3	Module Human Computer Interaction	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
d8b6adc6-5106-4145-bbe0-a8e060213282	INTE 31243	Software Quality Engineering	3	L3	Module Software Quality Engineering	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
7be2df4c-4f40-43cf-8e19-ceb02f2c3b8e	INTE 31283	Big Data and Data Warehousing	3	L3	Module Big Data and Data Warehousing	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
0b50ea16-4fca-4bc7-a85d-7692690c262f	INTE 31373	Machine Learning	3	L3	Module Machine Learning	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
2d261d7e-f29c-4619-af7e-c67a899fb2ed	INTE 31403	System Administration and Maintenance	3	L3	Module System Administration and Maintenance	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
20c9a159-4c97-4b14-9522-7dd7960ccdc4	PMAT 31212	Mathematics for Computing - 3	2	L3	Module Mathematics for Computing - 3	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
570a3ca2-f6dd-4763-9328-c2353a41b292	INTE 41393	System Integration Technologies	3	L4	Module System Integration Technologies	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
147574a7-a289-4128-90e8-560a4b036116	INTE 41373	Image Processing	3	L4	Module Image Processing	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
1c7e98f4-059b-41ec-a46a-dfeca8d40b45	INTE 41323	Neural Networks and Deep Learning	3	L4	Module Neural Networks and Deep Learning	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
e43840a6-73ce-4523-84cb-b3dbbd9cd3c7	INTE 41383	Industrial Automation	3	L4	Module Industrial Automation	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
41070666-9f6d-4d0f-b253-4bf0d36db707	INTE 41403	Advanced Databases	3	L4	Module Advanced Databases	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
5e505061-a69b-4edc-a0c4-f01eeffdb271	INTE 41413	Internet of Things	3	L4	Module Internet of Things	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
e115ba02-7d87-4bbd-872f-6d534890b08a	MGTE 42303	Business and Information Technology Law	3	L4	Module Business and Information Technology Law	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
540fbfee-12e2-49bb-94ae-717de2b14578	INTE 42353	Semantic Web and Ontological Engineering	3	L4	Module Semantic Web and Ontological Engineering	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
375acf22-2164-4c2c-a725-f2d50999ac21	INTE 42333	Complex Systems and Agent Based Modelling	3	L4	Module Complex Systems and Agent Based Modelling	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
f9d98581-20ac-48dc-ad6d-a9c770d05e9b	INTE 42343	Natural Language Processing	3	L4	Module Natural Language Processing	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
33a500a8-c04b-4c90-9d8e-794f5f1d1bed	MGTE 11243	Principles of Management & Organizational Behaviour	3	L1	Principles of Management & Organizational Behaviour	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
df501dd4-eb1e-4a25-bc0d-7bb35f4709cc	ACLT 11013	Academic Literacy I	3	L1	Academic Literacy I	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
6e61543e-4055-4cd1-8f9b-f8128eb655f8	GNCT 11212	Personal Progress Development I	2	L1	Personal Progress Development I	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	f	\N
77b302c3-deba-4d75-8ff9-8ef4ca74da56	GNCT 23212	Personal Progress Development II	2	L2	Personal Progress Development II	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	f	\N
661f72d8-c8cb-435e-bd30-eeaf8ff178ec	MGTE 31423	Advanced Optimization Methods in Management Science	3	L3	Advanced Optimization Methods in Management Science	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
93201c4c-500c-4f59-b835-ce643647233d	MGTE 44373	Statistical Techniques for Data Analysis	3	L4	Statistical Techniques for Data Analysis	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
6e640c31-d0ac-4988-b875-bbfb3c41a434	MGTE 41252	Logistics Systems and Transportation Management	2	L4	Logistics Systems and Transportation Management	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
d988278e-b54f-45ac-8624-a52ea082192c	INTE 41333	Data mining and applied analytics	3	L4	Data mining and applied analytics	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
9889dc2e-c81b-44ed-adfd-e75de8c6d9e8	MGTE 41212	Professional Practice	2	L4	Professional Practice	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
620ca8ae-45ca-43a7-becd-3e1416e91658	INTE 41272	Enterprise Architecture	2	L4	Enterprise Architecture	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
be062d08-8118-48a6-9277-f2326b02cf89	INTE 41312	Image Processing and Computer Graphics	2	L4	Image Processing and Computer Graphics	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
2cf878be-5af8-4edb-8b0e-073e172c8c71	INTE 44363	Computer Crimes and Digital Forensics	3	L4	Computer Crimes and Digital Forensics	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
4c6050aa-4cf5-4f27-aaa6-5accbf68e9d1	INTE 41302	Geographical Information Systems	2	L4	Geographical Information Systems	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	t	\N
bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	ACLT 11013	Academic Literacy I	3	L1	Academic Literacy I	t	\N	t	\N
9894f62f-df87-4476-af90-f04a6cc7bd5f	DELT 11232	English for Professionals	2	L1	English for Professionals	t	\N	t	\N
bbd0bab6-0b87-4130-a92b-5014ddee4512	GNCT 11212	Personal Progress Development I	2	L1	Personal Progress Development I	t	\N	f	\N
5ee82f64-40a2-42ff-9177-6bcbd8c2b421	INTE 11213	Fundamentals of Computing	3	L1	Fundamentals of Computing	t	\N	t	\N
6a4365ba-f8e1-41d3-8d57-37d99c05b6eb	INTE 11223	Programming Concepts	3	L1	Programming Concepts	t	\N	t	\N
45858f7a-e9f0-40ea-a8ae-f8c9bffc6871	INTE 12213	Object Oriented Programming	3	L1	Object Oriented Programming	t	\N	t	\N
e29d6743-b886-4474-95b5-359aae809049	INTE 12223	Database Design and Development	3	L1	Database Design and Development	t	\N	t	\N
14b0f2a4-f3ef-4ff2-ad38-1fd08167b4d5	INTE 12243	Computer Networks	3	L1	Computer Networks	t	\N	t	\N
885914a6-f005-4808-bde4-b67851801d16	MGTE 11233	Business Statistics and Economics	3	L1	Business Statistics and Economics	t	\N	t	\N
e5c45d37-9daa-48eb-bcf4-092d4066f9c1	MGTE 11243	Principles of Management & Organizational Behaviour	3	L1	Principles of Management & Organizational Behaviour	t	\N	t	\N
48c173ad-69c2-4b1d-a620-b3be1b7492a2	MGTE 12253	Accounting Concepts and Costing	3	L1	Accounting Concepts and Costing	t	\N	t	\N
22517233-8fda-461e-894a-57d765874c16	MGTE 12263	Optimization Methods in Management Science	3	L1	Optimization Methods in Management Science	t	\N	t	\N
1a825eee-395c-486a-b652-92e2ee82d9c1	MGTE 12273	Industry and Technology	3	L1	Industry and Technology	t	\N	t	\N
9d83de2f-d4f2-42f3-8182-cab722102acb	PMAT 11212	Discrete Mathematics for Computing I	2	L1	Discrete Mathematics for Computing I	t	\N	t	\N
e8261880-6a9a-4c26-8b4c-9b27826d496a	PMAT 12212	Discrete Mathematics for Computing II	2	L1	Discrete Mathematics for Computing II	t	\N	t	\N
\.


--
-- Data for Name: ModuleRegistration; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public."ModuleRegistration" (reg_id, student_id, module_id, semester_id, term, registration_date, status) FROM stdin;
df3b19ec-f6ad-4893-9390-905dee2f23f7	STU001	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2026-04-16 14:53:47.367	REGISTERED
479ea11e-2149-4b16-9551-8c89be028b77	STU001	9894f62f-df87-4476-af90-f04a6cc7bd5f	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2026-04-16 14:53:47.376	REGISTERED
7728ed78-55bf-43ba-9d75-fc285a3ef36b	STU001	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2026-04-16 14:53:47.385	REGISTERED
645a5c86-5a17-4af2-bcd3-3bf48157504c	STU001	5ee82f64-40a2-42ff-9177-6bcbd8c2b421	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2026-04-16 14:53:47.393	REGISTERED
accfb59c-4c7e-4bc3-b633-5ce93381861b	STU001	6a4365ba-f8e1-41d3-8d57-37d99c05b6eb	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2026-04-16 14:53:47.4	REGISTERED
c2c6444e-baa4-44d8-9cf8-22398986e749	STU001	45858f7a-e9f0-40ea-a8ae-f8c9bffc6871	b52e9840-4294-4c6b-86a9-2315f51dd27c	\N	2026-04-16 14:53:47.408	REGISTERED
a2fed819-98a5-4b8a-b9e6-6107453e6f80	STU001	e29d6743-b886-4474-95b5-359aae809049	b52e9840-4294-4c6b-86a9-2315f51dd27c	\N	2026-04-16 14:53:47.417	REGISTERED
60eb2295-08e5-463e-9d63-773695400644	STU001	14b0f2a4-f3ef-4ff2-ad38-1fd08167b4d5	b52e9840-4294-4c6b-86a9-2315f51dd27c	\N	2026-04-16 14:53:47.426	REGISTERED
4233c782-f278-4933-b742-15e3feb2eb37	STU001	885914a6-f005-4808-bde4-b67851801d16	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2026-04-16 14:53:47.433	REGISTERED
cb8b0b92-4a1c-468e-be6c-2eb56e804a07	STU001	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2026-04-16 14:53:47.442	REGISTERED
a59a3726-f890-4d73-a19e-ebb346d5a459	STU001	48c173ad-69c2-4b1d-a620-b3be1b7492a2	b52e9840-4294-4c6b-86a9-2315f51dd27c	\N	2026-04-16 14:53:47.45	REGISTERED
7587c7d5-29e7-4406-afdc-f3829b79cd79	STU001	22517233-8fda-461e-894a-57d765874c16	b52e9840-4294-4c6b-86a9-2315f51dd27c	\N	2026-04-16 14:53:47.458	REGISTERED
90bc7533-8f73-4f79-861d-858b32aee98b	STU001	1a825eee-395c-486a-b652-92e2ee82d9c1	b52e9840-4294-4c6b-86a9-2315f51dd27c	\N	2026-04-16 14:53:47.465	REGISTERED
4e3d8387-2d23-423f-8a23-1f5f42d3fc76	STU001	9d83de2f-d4f2-42f3-8182-cab722102acb	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2026-04-16 14:53:47.472	REGISTERED
a3b3787e-3d17-4962-9a0f-ca901eac4f4a	STU001	e8261880-6a9a-4c26-8b4c-9b27826d496a	b52e9840-4294-4c6b-86a9-2315f51dd27c	\N	2026-04-16 14:53:47.48	REGISTERED
3bc9b37d-3047-4a5c-9b09-5540051b336e	STU001	200a200c-7e2d-4263-971a-32d137c5d785	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2026-04-16 14:53:47.489	REGISTERED
723e0442-7e84-481f-976a-8bf3b6ef805a	STU001	e598ba91-9aba-4ccf-91b6-e0ed48353e8b	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2026-04-16 14:53:47.494	REGISTERED
b6cd52c3-da07-4613-b46d-39fdc62afda2	STU001	ecbf469e-247b-4197-b733-f34490b94f8e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2026-04-16 14:53:47.499	REGISTERED
04874f11-d6d8-40f0-93dc-5f214d0e496c	STU001	dd19d0bd-311c-4aaf-92c2-3cb6c82b1902	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2026-04-16 14:53:47.508	REGISTERED
9b3eac89-2287-4679-86ce-bdeac9969f34	STU001	764cc9ac-a9d3-483e-b70a-2df938794ee4	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2026-04-16 14:53:47.517	REGISTERED
c5920aed-5e34-43fb-a965-150b4ff86e34	STU001	71ae9cd2-8ccd-4cc0-94a7-c416c0907810	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2026-04-16 14:53:47.524	REGISTERED
e18b3e20-5095-442a-a1a5-3f8fcb071f32	STU001	deb5e449-adac-4de7-8320-165a01f70c9b	b52e9840-4294-4c6b-86a9-2315f51dd27c	\N	2026-04-16 14:53:47.535	REGISTERED
3a5cdce2-e1db-49d0-8856-4af5e8367b79	STU001	a5478e8b-ab12-444e-8ea0-2aea10cd4833	b52e9840-4294-4c6b-86a9-2315f51dd27c	\N	2026-04-16 14:53:47.541	REGISTERED
f0b198fd-ea51-4706-99e3-d065f9c0613e	STU001	41458ea3-a328-426d-81e7-91c4fc08efad	b52e9840-4294-4c6b-86a9-2315f51dd27c	\N	2026-04-16 14:53:47.548	REGISTERED
9ad34395-c790-4920-ba8c-b90b4eab224a	STU001	367fc67a-ae20-4e06-a4ef-394d476c2022	b52e9840-4294-4c6b-86a9-2315f51dd27c	\N	2026-04-16 14:53:47.554	REGISTERED
668b63d0-c65b-4a6e-af21-8cb59c7f15db	STU001	e9fd7461-8adb-4fcc-9ac9-246131368c80	b52e9840-4294-4c6b-86a9-2315f51dd27c	\N	2026-04-16 14:53:47.56	REGISTERED
18e97548-009d-4d3a-a738-e35846250daa	STU001	a173715a-0bb1-4429-8ecd-e25490c5ea3a	b52e9840-4294-4c6b-86a9-2315f51dd27c	\N	2026-04-16 14:53:47.566	REGISTERED
b7c71726-aacc-4873-a50d-2e6d7ff71a50	IM/2024/001	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
f1a35dde-9d0d-43f1-8256-143c384fd6fd	IM/2024/001	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
6d1d86b2-a6d7-4daf-94e4-d1c8160ebe3a	IM/2024/001	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
d8f9efb0-0cdd-424d-a029-c9a7ea3ccbac	IM/2024/002	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
588c8915-313e-4233-a5b5-201f83917900	IM/2024/002	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
ca42c851-aea6-44c5-b80d-75da66c02f0e	IM/2024/002	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
546bc529-8890-4bb3-ba23-8ce9bb46c0c1	IM/2024/003	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
987a2995-9d6c-4313-a690-57ae452691ed	IM/2024/003	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
8a73226d-13cc-4922-8e00-0982b322d51d	IM/2024/003	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
4c4d3c72-2d78-4fef-8dd1-dea52adcaffd	IM/2024/004	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
adc66d27-4eae-4754-8d86-329459ce92a5	IM/2024/004	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
524183c8-c03f-498a-8e63-f7fbadcbcaba	IM/2024/004	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
708ca214-93de-4b15-8c88-3447396bc5cb	IM/2024/005	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
1bff761c-3a8b-4d16-8ec0-882571a5abf1	IM/2024/005	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
0bf30ca5-bcdf-4c9a-9a77-ac25af6fc10e	IM/2024/005	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
06ad0f34-7859-412a-81d7-c8e2ceac3107	IM/2024/006	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
16581dd8-6ef1-4bf8-bfdd-6103c9ccd171	IM/2024/006	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
f09de42b-4e0d-4180-acad-73039b090feb	IM/2024/006	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
6b4cf80c-ca17-42ee-b08c-c1dc13edda7e	IM/2024/007	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
e2e80154-3a49-49b0-82f0-ecba83af6e07	IM/2024/007	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
55b606c0-cf28-4da0-9e58-18fb5409a7d4	IM/2024/007	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
d2fc97c8-c99c-4665-b75d-f337a040a07c	IM/2024/008	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
5adf3e3e-b933-4cae-b5aa-184028b37654	IM/2024/008	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
c23aa404-b2ed-4e97-97a2-6fbe9c61faa4	IM/2024/008	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
ad00f950-aa62-483e-aab8-87072b209f9e	IM/2024/009	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
0b071cae-25a5-4807-b9b4-d2bb2d1d701f	IM/2024/009	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
88d9b944-022a-4e2f-ab4d-2f08d8ddb565	IM/2024/009	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
851da9a4-1b11-42b8-81e4-45616b3dddf5	IM/2024/010	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
e4e08742-272b-47d1-baec-883fa175f878	IM/2024/010	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
ff9e61bf-0b20-464d-9767-653fcc43c962	IM/2024/010	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
a901cc7f-6a46-4881-9b7c-98d2df1f62b4	IM/2024/011	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
5155f53d-ebbe-447a-961b-7cdda95c8c5d	IM/2024/011	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
8ebadb7c-9cd7-44c2-8e6d-d63dca1c7623	IM/2024/011	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
04b4d37d-cfe8-484b-85f0-5b9182548cf2	IM/2024/012	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
db2cff30-1fbb-426c-ab31-4d2bd94a341e	IM/2024/012	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
50ccff5f-07e2-42de-a563-945563bb4eb9	IM/2024/012	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
de403076-9d40-40d7-87a3-301e59e78528	IM/2024/013	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
c58e877f-d708-451c-ba66-18f981d34c58	IM/2024/013	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
15c8cd98-848d-41a0-a849-92900c0934e3	IM/2024/013	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
bfc325a6-efe5-4481-855d-06880ac8746c	IM/2024/014	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
886f41fa-67b5-43cc-9b1b-ccf7e30bc462	IM/2024/014	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
dbd77fdb-753e-4c14-a978-cb066a37bff5	IM/2024/014	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
cc7c20e4-9c8b-47ee-9b33-a419aff65b9a	IM/2024/015	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
3a278252-0da9-4a22-b5c9-3ac77b123788	IM/2024/015	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
3d63b3ff-a11e-4b10-9386-a19d0137b4a9	IM/2024/015	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
5c93e4b2-2c3b-4490-96ae-613e018280fc	IM/2024/016	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
33e2821b-8d7c-4794-bb37-611cc10a1730	IM/2024/016	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
ec90f9dd-1f58-4eff-b2f8-d28e277c26cf	IM/2024/016	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
49b7e155-9125-4102-a08d-cfcd95e45840	IM/2024/017	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
b1a98fce-7aad-4fcf-8a4e-22321cebc713	IM/2024/017	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
0e4af62f-5220-4bff-afa7-b5e053bf3d69	IM/2024/017	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
5284cedc-a771-461f-9f75-eefde7ede20b	IM/2024/018	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
df33fa61-2433-434b-bc8f-ee63ff07fd08	IM/2024/018	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
5bc57089-fa50-45d0-877f-cf0a997aef3e	IM/2024/018	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
8450716d-149e-4fde-b223-960ec822ad5c	IM/2024/019	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
44bb7eac-f466-4709-b786-b9cdbc52253e	IM/2024/019	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
b0cc794c-8e09-4719-985b-aa523c6c18ba	IM/2024/019	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
2fadabd8-bfb1-4332-b4e5-eaca25f1029d	IM/2024/020	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
52f3880b-e39c-4eb5-8c3a-36e619b0941c	IM/2024/020	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
2e038e07-6a3b-4de1-84b5-5d80ebf0474d	IM/2024/020	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
335b6f72-d683-46ea-aaa0-e5c736e9a0b2	IM/2024/021	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
d6d884bc-6065-4eae-9d23-2e53f0a43b8d	IM/2024/021	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
406a4a37-5f14-40e0-b388-9ab09ef63fb1	IM/2024/021	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
dec55110-5a52-4beb-a808-0c923311d822	IM/2024/022	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
7f2dc44e-7396-46fd-a33a-0fea56aafa48	IM/2024/022	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
9b1ccc39-edbd-4162-b1a2-d3999ecda6d4	IM/2024/022	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
004001b7-4ed2-43fd-82db-1a1e091d0322	IM/2024/023	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
3ac895f0-583b-492a-b181-aed44f5ced12	IM/2024/023	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
a6495886-9fc4-4add-9845-5785a96c95a6	IM/2024/023	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
72547468-186e-4e5b-b837-542a9477853a	IM/2024/024	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
55b1d3aa-5649-43f3-9a18-2f71c5eb63e3	IM/2024/024	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
c42ff46f-cb8d-455f-b45c-226b192d7e39	IM/2024/024	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
280988cd-81af-4d3c-acb2-da680eb86796	IM/2024/025	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
b36c2128-a380-45b9-b0fc-4b450f065ab8	IM/2024/025	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
f81c3f86-32d1-45fe-902a-c1c339e67cdd	IM/2024/025	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
71b98566-a291-4652-ac3c-9b3e0a33a142	IM/2024/026	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
3f5cd620-6c77-4ee1-af65-a8b5cedca93b	IM/2024/026	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
537e7b64-cec0-4ad2-be32-bf30ae016fcb	IM/2024/026	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
ff257821-f5fc-4154-8c74-70c019acc6e0	IM/2024/027	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
e6f6b134-783a-48c6-8eb6-c7b6563ca0d7	IM/2024/027	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
786d1bc4-d589-4f91-bacc-45cb240e630a	IM/2024/027	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
192e8897-fe6f-443a-a5e8-e1c0ca191fa4	IM/2024/028	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
fcdb85cf-806f-4932-bdf8-e83bbd785d91	IM/2024/028	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
fc990bf7-b445-4a0c-9fdc-d47218cab726	IM/2024/028	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
0021fe73-4a99-4c37-a455-cff90f3b08b1	IM/2024/029	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
a57ec67d-9094-4226-ba04-fce5288889ed	IM/2024/029	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
6c3a143f-18b7-4efe-9ebc-acc4c2f2a113	IM/2024/029	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
f1229f64-5a77-4d22-9b64-0c6418555556	IM/2024/030	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
338d2654-0209-4f76-ac70-0a96fffa9e04	IM/2024/030	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
f387c401-de57-4a84-9492-7633129b6a2c	IM/2024/030	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
625988e9-c70a-4dfd-8974-c73888996488	IM/2024/031	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
875271d7-68e0-44cb-b90d-ec95a53f6b78	IM/2024/031	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
9fc57e99-5de4-42d2-98d3-4a6092bdab66	IM/2024/031	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
0392df56-6223-42e8-9bb1-f1306d5f7037	IM/2024/032	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
469190bd-7837-4c34-9929-b8cfe49d5c4b	IM/2024/032	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
9252ec03-5d1c-486b-a731-b7f00ad80cd6	IM/2024/032	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
efb89250-d533-4809-9640-81a415caebee	IM/2024/033	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
6c7630ab-71ea-4866-afaf-d41103e9896d	IM/2024/033	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
70e7c1d5-b45a-4f7a-a9f6-524dee1270e3	IM/2024/033	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
2198254f-30cc-4045-a781-fdbc3883f762	IM/2024/034	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
f7e95f9c-bac9-4f79-9d95-49730e201c7a	IM/2024/034	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
0c694bf3-699a-4897-b138-5d3cc20b0bac	IM/2024/034	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
d293737b-d2cf-45ed-b443-24885caea3b1	IM/2024/035	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
e4aee917-4677-4e20-b428-76574a97fa06	IM/2024/035	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
adc6c511-0cc1-4120-a7da-c798086c01a8	IM/2024/035	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
316250f8-bd3f-45d2-8bb5-8c9618b16b98	IM/2024/036	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
fbccd34e-b785-4e9c-86eb-7aaa99d3c5af	IM/2024/036	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
1b3e37e8-1ed3-42eb-b6ec-fe846b802d7d	IM/2024/036	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
66df8398-3193-49e1-bac7-5c6bb936f3c4	IM/2024/037	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
7a1c66cc-8e0e-4b6d-80b2-60d3eb77d0ac	IM/2024/037	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
0bf0f2c8-31b9-44f1-aca7-7b645afb535f	IM/2024/037	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
5b2258fa-5b60-421e-be68-26d36825295e	IM/2024/038	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
1bdd8129-c263-46ec-a0bf-3c9949f0ece2	IM/2024/038	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
595a5549-5560-4bf4-9c84-4bf771dc9582	IM/2024/038	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
19ed0bce-294d-424a-a5da-efe56fa577ec	IM/2024/039	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
b9ec7a35-cddc-435e-a650-c32b41d3dce2	IM/2024/039	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
40c0a2de-2c8f-4611-9177-836fdc9f129c	IM/2024/039	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
f57d9653-02e6-4625-81ca-eea4878b649e	IM/2024/040	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
9009a70c-ae4a-4762-ba44-d28a208bf85c	IM/2024/040	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
d70ffe2e-14f6-4636-9903-76916791cd46	IM/2024/040	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
7f00319b-eefd-46a9-9f56-29e33979396c	IM/2024/041	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
9794e25e-774c-482f-b2bc-309ee9927fe1	IM/2024/041	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
878c4eca-6590-4d41-a01b-15e0d6264f85	IM/2024/041	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
8b00dddf-5bfe-4388-a047-246e10101899	IM/2024/042	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
d58a1617-bd56-4196-8922-72aeaa033d82	IM/2024/042	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
72677372-d5d6-4497-85bc-597f57a4f109	IM/2024/042	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
51f5e17b-949f-4fe2-83b6-19eb891e48c8	IM/2024/043	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
78528a6b-e68c-466f-8019-e5eaabc864cf	IM/2024/043	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
ebb32efd-39c7-4694-bf14-7408c00ccc03	IM/2024/043	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
b813d5a8-1e23-4a1e-9965-e9226d88837b	IM/2024/044	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
1f1a4d63-a8e1-4af1-8c01-8e3b7ef3e7f3	IM/2024/044	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
c9d0cd97-aa52-4bf0-bdc4-d7ada8e90289	IM/2024/044	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
32224aa0-707f-4cfb-a1ea-57fe2d9ba9ca	IM/2024/045	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
ba6e29d5-cf84-4dec-943f-0f5ed0454c4c	IM/2024/045	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
e79e6781-ef80-4e29-bc63-a2f1f25dac4a	IM/2024/045	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
8624b2b8-194e-4b57-9e88-2e17b23f50ca	IM/2024/046	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
e8d5a4f8-a807-47bd-aaa7-a330fc549c6b	IM/2024/046	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
5944e1f4-5ef6-4fde-a99d-486d4321ab6c	IM/2024/046	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
74d03f91-db6b-4154-a39b-02a9967c1a8a	IM/2024/047	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
74148c81-c92e-4847-a6f9-a0ef2a08529d	IM/2024/047	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
06f7dc6a-ec34-433f-bf29-436d303d878c	IM/2024/047	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
494e6f08-8069-4b13-973d-b4cbf727ae3e	IM/2024/048	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
9b002e95-b8e4-426a-aed8-b63f2d7ebcad	IM/2024/048	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
ac069297-d6d3-4372-a079-d29bcbfc41e9	IM/2024/048	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
e5509052-dcad-4c37-bf4c-0e0910c0968b	IM/2024/049	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
c5ef3356-bd3f-4bd0-aca7-0e68479d7315	IM/2024/049	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
d4b597f1-9c2f-4c6a-a362-dfc8b4bca024	IM/2024/049	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
7b022d02-fb70-4ea1-99f4-6b20100ba493	IM/2024/050	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
09b17213-be4e-450b-9e9b-2cb4b7e0934d	IM/2024/050	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
45a1ea27-5c80-4b57-9abc-84c5ebe1474c	IM/2024/050	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
2cd101e2-48ac-4cde-9557-fb9bbb8de61b	IM/2024/051	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
1314023c-0660-4d95-a0f9-840513811ff1	IM/2024/051	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
d4a1042a-1d8e-4aa3-9fae-63c1240b5866	IM/2024/051	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
f4a21a05-c54c-4f78-88bb-c6b8f59e7620	IM/2024/052	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
777ff588-a997-4be7-be38-035937781727	IM/2024/052	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
68f0c2cf-712f-413e-8430-e57315eb5169	IM/2024/052	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
19e26ddf-3819-4ac3-b796-8da7214afeff	IM/2024/053	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
7904ad72-f040-44f3-85ee-5695adab2291	IM/2024/053	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
eaf716b4-048d-4cb0-9ca0-22fe40743b7e	IM/2024/053	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
94b9e8c2-dab0-4909-b5a3-bd928f165aad	IM/2024/054	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
0e78b51e-1449-490e-8d3a-e15ee353320a	IM/2024/054	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
d1073735-6381-4e94-80e3-51870209137b	IM/2024/054	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
f7a2958b-5cd6-4f47-9559-563af57c628f	IM/2024/055	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
4ec68c0d-465a-49c5-a2bc-4a3d23f7ba14	IM/2024/055	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
414cf806-bb0a-4c93-a20d-28296cdab0fa	IM/2024/055	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
4197ad0e-2c9a-4b21-a934-2c04f51ecdb2	IM/2024/056	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
7dadace6-5403-4594-87cd-c98452f5b604	IM/2024/056	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
ec497545-7fe1-482d-9c66-8cd33627bfbb	IM/2024/056	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
7402c3e4-d4e3-415d-952a-a9e62b09f88b	IM/2024/057	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
568ebdd6-163b-4854-98ac-d3d1c0d47c7a	IM/2024/057	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
2d9a4924-e021-4265-b543-3792bf5fd2a7	IM/2024/057	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
e3134159-7fec-474d-b0f2-76541e9522e0	IM/2024/058	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
25b29182-20e1-48d9-8c69-5bbcfdbb65c4	IM/2024/058	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
77ba9b2b-5bfb-4c09-849c-7d66506682a3	IM/2024/058	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
e58c2abf-a40e-46f1-b055-59616e243746	IM/2024/059	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
15b412d5-8166-4944-a2fe-41e8b2b588bd	IM/2024/059	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
72802daa-8ca7-40ac-a922-bb1e9c4979f8	IM/2024/059	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
54d9eb64-34b7-4d6e-aebe-4ae39d90e050	IM/2024/060	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
bcdba615-02ee-4b7f-bc0c-14108dff91f7	IM/2024/060	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
39874302-313c-4c31-89b4-232d0bde47c5	IM/2024/060	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
6c60093f-6b36-4eef-89f2-161fce170504	IM/2024/061	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
b099ee5b-47d6-49f3-9b76-04394a62540c	IM/2024/061	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
24ce6093-e524-4e49-9e35-cf0300b31445	IM/2024/061	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
e37417b6-0c0b-41f9-82aa-de335b51e32f	IM/2024/062	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
512962c0-fdd5-4e65-a93e-77acf9045a67	IM/2024/062	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
54ca1219-c95d-4017-9c05-dc731a96348f	IM/2024/062	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
28709cb1-2b9d-47cb-a21e-9e2e7ea73a53	IM/2024/063	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
a9b4f0a8-c9b8-44c6-856c-03293ccfad95	IM/2024/063	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
2ebef29d-738f-486a-afc5-e9f3537407b2	IM/2024/063	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
e1fc4631-e038-4d47-b82a-fe09c48ce34b	IM/2024/064	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
b8fcf5d4-6342-43ee-be2d-74a5150e0013	IM/2024/064	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
b20fb1ac-45ce-4a9a-af4c-fbb83445a1b0	IM/2024/064	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
d5872aec-fe1c-4230-b585-009efb808415	IM/2024/065	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
02dbf357-57bb-4864-aa8c-5b6d39cffdc5	IM/2024/065	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
650140a5-43a6-4ebf-909d-698c3477e4f2	IM/2024/065	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
0166c01e-4e4e-479c-9ffd-2fbe476dea70	IM/2024/066	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
1d15eedb-25fa-4c0e-b5f7-6ca17785bb4b	IM/2024/066	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
15eb09f3-6573-4028-ba1c-6dd1a910f0bb	IM/2024/066	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
76804adf-8555-4a41-bcfc-fe03aa8a14cb	IM/2024/067	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
ec013b01-e6fc-4d1a-8265-13bed552fa77	IM/2024/067	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
8aa40185-bd72-4c18-9f17-9862378daa6e	IM/2024/067	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
e4b334b1-dfe5-447e-a26e-051e2ac38e4b	IM/2024/068	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
ff6f6dc2-7791-42a8-b3a8-ca437b60dd9b	IM/2024/068	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
d08df97a-b5e0-49c3-9f91-3bd0786ba5ca	IM/2024/068	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
fbad68bc-d181-41f2-bf5b-8f36fe77c6f9	IM/2024/069	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
4b14f899-026a-4f21-bd83-e56341a36290	IM/2024/069	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
4ee362ad-76b4-489e-83b8-b88d7746b421	IM/2024/069	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
cf18d29b-8b4f-45bd-a2a5-9306f976ba48	IM/2024/070	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
030debd4-70d5-48be-b6ff-ba6075a2b679	IM/2024/070	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
06b51fe1-51d8-4b96-ab34-7eaaf0a44012	IM/2024/070	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
fcb7974b-c460-4857-9ffc-73f68cd0cb1e	IM/2024/071	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
a5a40e90-8e22-464e-9b33-0f1321847fa1	IM/2024/071	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
1f494b17-5e1a-4fce-be12-4e20ea9c15a2	IM/2024/071	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
4d22249f-4549-4d52-8b2f-55d56794c522	IM/2024/072	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
cd15bae9-f2cf-4dbe-b3f9-5f8abee2afc5	IM/2024/072	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
9a48cbc7-c0be-4000-a1cd-a2e00d72ecc1	IM/2024/072	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
dc030b24-79ef-455b-b7fd-91ef44bcc31b	IM/2024/073	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
a0e791a2-b8d4-4b64-a871-b7f338805dbe	IM/2024/073	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
592b1654-a68c-4f7c-a6ab-c6a3d25e192b	IM/2024/073	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
9ec7f19f-b48e-45fa-9bd4-59d221da45f2	IM/2024/074	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
fd4fc94a-4535-458e-beb2-8069281f718b	IM/2024/074	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
fa472feb-7316-4083-a9cb-3d957cd51e03	IM/2024/074	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
38c4d66c-84be-4094-bfd5-7bfd3b02c159	IM/2024/075	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
e4f7b69e-239b-4917-b9c9-fa581e5cb659	IM/2024/075	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
a092088c-7df4-4bcc-86f7-4c7f70ef5931	IM/2024/075	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
cfbf6fe9-aca5-4040-88c5-1985b6fcb617	IM/2024/076	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
b5511369-a6a8-4902-be92-0b7876f135aa	IM/2024/076	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
637baea4-5993-42b5-9e85-16c7c62fd1bc	IM/2024/076	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
878cbeae-2090-40ec-91d9-1a87991210cf	IM/2024/077	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
5186089f-f89f-4ab3-a887-7ef5d273c757	IM/2024/077	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
836e2ab9-72d1-4084-a61c-b46c9e633764	IM/2024/077	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
1d09888b-3aca-4042-badd-ba74dfb13bce	IM/2024/078	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
a8cc50d7-06fb-4fef-bbd2-f963ab1a0a5a	IM/2024/078	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
c2f51a08-8381-406a-8000-92ffc62fd2a0	IM/2024/078	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
89f6a8b4-d31e-4627-bdc3-b2526795feb9	IM/2024/079	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
3f0462d4-eae8-41a4-958f-986a8df195d2	IM/2024/079	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
b1b7a7d7-710d-45d7-9780-809a0dd24ca9	IM/2024/079	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
2c0bac19-cdea-4c5f-ac42-402e4ecc4ccf	IM/2024/080	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
cdce9158-1fc8-4a85-bca3-561b447062ec	IM/2024/080	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
1cc3b73e-266d-43cd-8879-ae1c13bb2fc8	IM/2024/080	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
ea1e0553-2710-4158-a89f-dbd2333bea25	IM/2024/081	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
5eb75d29-f843-4ad7-a58c-879311d039f1	IM/2024/081	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
ec602703-8b95-4724-acf2-0cd2fc5a6fc6	IM/2024/081	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
48383504-f2b5-46ea-b218-0eb4bbfc66f7	IM/2024/082	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
81f319d9-b9f3-4980-8753-4aad5f9c533a	IM/2024/082	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
120f2d41-a989-4fdf-a816-bb7166feb290	IM/2024/082	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
ecc2b1c5-dc64-4417-a82a-e11bda45cdae	IM/2024/083	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
70148122-19aa-4b99-b3e6-bb6c4cb69073	IM/2024/083	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
768c3d5c-8749-4023-b5a7-bc6bc9a130e2	IM/2024/083	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
8a1c0d1d-7fa0-4387-9c32-9753c7bd845b	IM/2024/084	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
4110670f-47fb-4841-ab72-d35a5cc63f52	IM/2024/084	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
45c45162-4b16-4102-815a-93fefd90b301	IM/2024/084	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
bf5cbc18-4052-45c6-8a90-bef01e282a66	IM/2024/085	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
c59bda00-0f52-4f2e-bb15-a4dc103142fe	IM/2024/085	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
b9142ac9-b991-40a4-916f-a65f26674822	IM/2024/085	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
2df61f7f-fae9-4962-b52f-b4a02615ba44	IM/2024/086	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
1fedfbc1-ba37-4c71-b288-cc1e72239de0	IM/2024/086	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
a319598c-a8ca-4eac-8654-73c674b6a505	IM/2024/086	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
bbe69be4-a0fb-4d20-8cc7-d8b430ea2356	IM/2024/087	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
bcf65584-fb43-42f0-8e82-83595277d5c0	IM/2024/087	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
65c93b82-220e-45c3-af6d-4fd1739df8dc	IM/2024/087	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
3183869f-492f-4999-8d8d-d8a6c319c663	IM/2024/088	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
82c5ee39-d706-4796-969d-627a70992768	IM/2024/088	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
717c66b6-4d6c-4deb-bd42-8f3ebbe0846d	IM/2024/088	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
0824ae07-dce5-4a86-b773-654b29e8d575	IM/2024/089	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
b1bd699f-0dc6-483a-ba28-928ee3914fd6	IM/2024/089	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
c5588589-bce3-4aed-b59b-bc46398c7a40	IM/2024/089	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
b3910357-fd60-4a89-a287-7fade313d00e	IM/2024/090	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
b33424ce-ee9a-4e13-96e1-d388b434e949	IM/2024/090	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
8b6183bb-4c95-4d96-893f-961ecc95e5b5	IM/2024/090	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
e39467e7-b3a9-4d4e-92ac-cc6f6705d954	IM/2024/091	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
48cc98f2-1c73-4b92-9a2f-9b7f76d52b35	IM/2024/091	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
cf095e51-900d-44ff-a0a9-488cfbe5af2a	IM/2024/091	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
4a5df47f-aa6d-4b28-999a-104cd483c20e	IM/2024/092	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
b19c8244-1ab0-45f2-b87c-3935818b2568	IM/2024/092	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
07cbc317-452b-4564-a8bd-83f8a8230cc3	IM/2024/092	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
35f2ce02-b902-4ea1-9bce-c84223558d02	IM/2024/093	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
d4712eef-8ba0-4624-9508-a341e1c6a51b	IM/2024/093	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
605e094c-f216-4af6-974d-3a344c6a75bb	IM/2024/093	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
acc7ff31-6286-416d-b7e2-0279614bc7c0	IM/2024/094	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
bd7757c0-0b03-4b7d-b234-cd5c099c6bae	IM/2024/094	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
2f20883a-5015-489f-9bf4-cd30928b88b0	IM/2024/094	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
c5c50544-0f0d-488b-826a-a983c523b5af	IM/2024/095	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
ba8072cc-ab93-4a68-957f-33b9a73f0841	IM/2024/095	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
f5fdcd61-1562-4aba-b458-f40b795f5652	IM/2024/095	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
0e2315ba-4bdd-4382-ba8c-e66c19d246f0	IM/2024/096	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
a49f7ace-46f7-4f3e-add8-20f5af005b2f	IM/2024/096	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
337306db-2bd0-4521-85b6-b11d046d82a6	IM/2024/096	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
e7b4510f-faf8-4a0a-b351-91ff4297e01c	IM/2024/097	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
89969076-bf80-47ae-84b5-fa2b7fffaba8	IM/2024/097	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
bfac6d71-4a48-45c0-8a05-ac1fe37303e0	IM/2024/097	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
4638e8a9-fc8e-4473-ba07-9c70578647f5	IM/2024/098	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
a2d0bdf0-9725-483a-8972-01425fe895ce	IM/2024/098	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
91170d1b-691c-4270-a0a6-c5c4e9fc19ff	IM/2024/098	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
d064475c-0ef4-4a67-9c0e-6b6e479426eb	IM/2024/099	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
d413e909-9c33-4e1f-aece-ae2f7ad151f9	IM/2024/099	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
46a5a0b8-a59c-4312-b5c5-6624e04eabf0	IM/2024/099	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
c283c164-661a-42b5-8e63-004d3236e1ec	IM/2024/100	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
e30975d5-91c1-4924-b322-d8a81f0296e4	IM/2024/100	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
db549e00-81dc-4352-8eba-1277d6ab4836	IM/2024/100	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
105b44cd-a913-4a0b-b49a-516fea3d60d8	IM/2024/101	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
e883ea94-e895-4090-8c06-6511a664e7d0	IM/2024/101	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
5ff3a27d-f4cd-4562-b8c5-2ec09fee79c5	IM/2024/101	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
a3943543-a90f-4ebc-8c29-aef4759a7c0a	IM/2024/102	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
0e8f3673-f254-4a59-8e95-e3ef3e9f8c63	IM/2024/102	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
0a8dc5e9-9db5-4e0d-87aa-517fecf8f46d	IM/2024/102	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
bdad5f7d-cccb-4a7f-b7de-2ac545eb33db	IM/2024/103	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
49da3d33-1c65-4f55-9e69-3b5872ef14c6	IM/2024/103	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
4bc3f86f-fe84-49d3-8ba4-1e4795bdf174	IM/2024/103	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
25852f72-d592-4e79-b5c8-8a4c7eb345ad	IM/2024/104	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
7f228ae0-addd-4485-8c74-733c73bb2713	IM/2024/104	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
d1a4adda-cde9-4838-84af-96a22de2c5e6	IM/2024/104	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
9f65ade4-8d4d-4b8e-81e6-d1e1ca473945	IM/2024/105	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
28f04ec5-45b5-480d-9e15-26d6737a1dab	IM/2024/105	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
bc8fb5af-f8e9-476c-b22f-46420042749a	IM/2024/105	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
b2a3a070-295f-4583-bf57-9bae6fb1edaf	IM/2024/106	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
61832885-2ce2-4c47-94c8-0770385fe685	IM/2024/106	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
8bb5b1ba-251c-419f-8901-17c03e088815	IM/2024/106	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
e4e55c48-abc1-49ce-805f-af1a78974286	IM/2024/107	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
60b2a962-95e0-410d-bd10-f256a4f86274	IM/2024/107	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
2cf6504b-b3c7-46c7-9a20-a5d34b90aa81	IM/2024/107	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
450c374d-b688-4213-8023-615ab822cbbc	IM/2024/108	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
c28e533e-ef5b-48db-8319-41ccf7f3ba38	IM/2024/108	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
607166d8-cf3a-4443-999f-607418248cff	IM/2024/108	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
8cc30ad3-9ad1-4f4d-805e-dca8953e799d	IM/2024/109	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
2714da6d-739e-454b-8dd5-078bcfdf2caf	IM/2024/109	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
5c7c101e-f0d2-4d3e-91df-b3d6aa4eb9e8	IM/2024/109	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
2c1561c0-d649-4b43-8030-44ae77cac3ab	IM/2024/110	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
67c5e36c-9ed5-4db4-a204-748ff723b4da	IM/2024/110	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
341bd356-cdf9-43ae-a870-96f58006ec40	IM/2024/110	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
6d64939a-1c93-430f-8b43-586b7ecf8706	IM/2024/111	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
6bfae683-d331-4c28-9c25-b1ffab5a6997	IM/2024/111	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
4dcad0bf-ead7-4344-b709-d7b7e32ec4f2	IM/2024/111	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
4b6497a3-0827-4a82-a7b1-d736bcb82dc3	IM/2024/112	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
2c65dd70-e2b8-4158-828e-d4a0c2a5d27b	IM/2024/112	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
fbe60472-a4fe-4ff7-9c21-6bdea7d80082	IM/2024/112	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
eada856b-aeb7-47fb-b7b2-bcee5a8b6304	IM/2024/113	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
c90a7652-1bc9-4012-86bf-3875ae33e77c	IM/2024/113	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
007af6c3-d4d9-4993-a347-f9a90b596d8a	IM/2024/113	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
3c820788-b256-457c-938e-f66603a73dca	IM/2024/114	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
b2004175-2cf8-41dc-a8ce-af2f1657f153	IM/2024/114	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
5bab0967-ec0c-48ee-8026-24db09622e10	IM/2024/114	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
6fe317a4-7445-45ef-964b-d4dd6902d0bf	IM/2024/115	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
24b15fc9-96db-4637-972a-8f88e1c983f0	IM/2024/115	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
b0cde727-9d9d-415e-8298-9c9ff4a7859b	IM/2024/115	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
da5ec437-63ae-4121-8893-b644938177a0	IM/2024/116	bba2e7cd-babb-44de-81d0-4c09a3c1ef9e	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
f488957b-87ec-4541-970e-fa8c7430ccbc	IM/2024/116	bbd0bab6-0b87-4130-a92b-5014ddee4512	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
9dbbcb21-4542-4d4d-a2bf-30c93b0de070	IM/2024/116	e5c45d37-9daa-48eb-bcf4-092d4066f9c1	3382c9f4-30d9-46ef-91bc-45467677518a	\N	2024-02-01 00:00:00	REGISTERED
65355d75-fa66-4d84-bfa8-9b2647328ada	16f172bf-5f54-46f0-aa41-a0a1de2b8f4b	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
66c0bf07-8cd2-4352-b14e-5f601662c684	16f172bf-5f54-46f0-aa41-a0a1de2b8f4b	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
50a11672-48c8-48fe-b344-f2b5565a1f43	16f172bf-5f54-46f0-aa41-a0a1de2b8f4b	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
e51ae4d7-fcad-4f78-a9a5-6435b35ce69b	16f172bf-5f54-46f0-aa41-a0a1de2b8f4b	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
8d1e9e3f-7db8-4103-874f-ad99f3a25389	16f172bf-5f54-46f0-aa41-a0a1de2b8f4b	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
75e89d7b-059e-4043-a75e-3eea77dd8cc1	16f172bf-5f54-46f0-aa41-a0a1de2b8f4b	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
cc075d9d-5b52-4453-b82a-f3bbd9b760c6	16f172bf-5f54-46f0-aa41-a0a1de2b8f4b	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
c00a40a2-fb64-457d-bdd0-5a362444566c	16f172bf-5f54-46f0-aa41-a0a1de2b8f4b	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
456dc285-18dd-48a4-b25c-d07f50455581	16f172bf-5f54-46f0-aa41-a0a1de2b8f4b	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
9357c404-d63a-406c-baf6-f2ddf8e7ccaa	16f172bf-5f54-46f0-aa41-a0a1de2b8f4b	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
b4877acf-d660-4921-8e1a-31eca415ef08	16f172bf-5f54-46f0-aa41-a0a1de2b8f4b	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
67181d66-9f64-44cd-a630-18d79e44c644	16f172bf-5f54-46f0-aa41-a0a1de2b8f4b	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
c4e6d225-5a4f-473a-89ec-385267aac134	16f172bf-5f54-46f0-aa41-a0a1de2b8f4b	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
ef80280c-565d-4dbe-bfaa-c5c8ad936d43	IM/2024/110	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
65917e99-b5a5-4e6d-80f9-9926a1168517	IM/2024/110	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
b23200b4-1c80-4a62-82fe-738170c623e1	IM/2024/110	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
1a35673c-fa0f-49a4-b0a6-d76d31c1088c	IM/2024/110	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
99126c90-027f-4318-a311-ad4fcc8f5260	IM/2024/110	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
8048acf1-8059-439c-bddc-f3660fe67493	IM/2024/110	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
674afdf5-5a00-4776-99ea-ffe725981680	IM/2024/110	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
d92bd45c-5bf4-4348-a4c0-bb6b96134dcc	IM/2024/110	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
708e2607-a739-44ff-9133-daa101137b04	IM/2024/110	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
beb4fe22-bb88-4ab6-aa6b-9f76e080081c	IM/2024/110	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
363d6fba-e40a-4ccc-aa6b-0f7e678bce2d	IM/2024/110	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
ee776a7d-2247-4e61-a3d8-58c0ec872da9	IM/2024/110	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
ebd63c67-194d-4e5d-8f03-a10dd2911aec	IM/2024/110	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
5ef0e68e-b8e1-4c79-93f8-03cafc99cb10	IM/2024/022	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
469216d9-d50d-444b-9d8b-b5303d5cd457	IM/2024/022	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
f6e71ddc-90d2-4c55-bd43-10469f00e65e	IM/2024/022	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
97cfdfdb-4a26-4a4f-a6f7-f6884378f947	IM/2024/022	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
29aa5480-05b2-4439-b3ec-a1142fffd95f	IM/2024/022	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
03e14f06-6324-44e2-911a-60d5dad4958d	IM/2024/022	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
382c0327-d798-488d-a9af-21af5ccc60d6	IM/2024/022	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
59e2383f-48ad-4b21-bfeb-05aeaf12a99b	IM/2024/022	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
8c26620c-5e0a-4ccf-a3c8-871094269ed2	IM/2024/022	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
37d51d62-2073-4d78-a633-3c106798d07d	IM/2024/022	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
bc457732-4e15-4f21-87cb-22e63a23a430	IM/2024/022	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
efab63ce-19a2-42bc-b5c0-b3fd048c8db4	IM/2024/022	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
c405c069-580e-4e50-a91a-224cb77b9e5f	IM/2024/022	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
0746d12c-f8a7-4bab-80e4-cd7d6ad5d43b	IM/2024/111	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
d126cf5f-b41e-440e-a866-d9860f09409c	IM/2024/111	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
8303e9d9-ba9b-40a4-8ca7-d4fec4b93110	IM/2024/111	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
9c0dc9a7-b668-412c-a514-a5c2025213c4	IM/2024/111	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
8fa70d8d-8d06-47b1-a027-fe1d2fdf2ee4	IM/2024/111	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
e80c01f8-f0a7-4bed-bde1-0abc738dcb6a	IM/2024/111	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
ba22c15d-e5b8-48bc-8a0f-9f74e1ff59a3	IM/2024/111	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
9c16dce1-cc40-4a96-85f3-a0c0df3a3e95	IM/2024/111	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
2cf18879-cb3d-4abd-971c-dc63326b0de3	IM/2024/111	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
2012c5d0-e37b-4010-bed1-695bbf56e509	IM/2024/111	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
1a4aba9d-bf08-426a-975b-f3da2947c560	IM/2024/111	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
c7ef53bc-1f21-49c7-89da-a65873cb5a11	IM/2024/111	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
b1014d16-a36a-4363-8599-a390d7a856c6	IM/2024/111	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
c2194ea3-689d-42d3-a31e-6d9a142c6f24	IM/2024/112	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
07e1ae5e-ae5f-4907-a695-6227ba8c1903	IM/2024/112	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
96b30501-ab72-4ce8-8e9c-45767b709811	IM/2024/112	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
de7e8464-aada-4cf4-97bc-88437991c51c	IM/2024/112	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
5eb15154-e5f5-4308-a318-3bb7078844dc	IM/2024/112	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
67be655f-45cb-4dab-ac6b-7ef68efc00bd	IM/2024/112	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
f1d62b8b-2c6c-4492-9342-f7af6a9e6a95	IM/2024/112	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
9280cbb7-c9b6-49e7-923f-446681566b9d	IM/2024/112	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
43ef8abe-2622-43ff-9fb8-750595fffca0	IM/2024/112	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
ff36bd9d-5461-48e7-b6d9-054e84fe88e9	IM/2024/112	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
497293b2-137b-46ee-bb10-3bd2f4160f74	IM/2024/112	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
284fb063-823a-406b-804a-2be54edc312d	IM/2024/112	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
161c3421-ddaf-49ec-b73d-b3bd1e5d424b	IM/2024/112	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
edf61433-f2f6-41eb-a752-33f2babe0f1b	IM/2024/069	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
9e8a5e09-5707-4a95-9256-2ec4c13a8b3f	IM/2024/069	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
604797b4-579f-4649-b119-557c2fba8717	IM/2024/069	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
8719504e-1979-4ad1-8b98-80a5a4584377	IM/2024/069	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
b248de89-1201-458f-887f-410183982a02	IM/2024/069	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
36d8d696-1aef-4b5a-a848-8b2dd777e511	IM/2024/069	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
a23bb8a1-8c7b-447a-9e68-1444267a1c61	IM/2024/069	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
ad91649b-4e1d-43a9-ae52-b15b411b7989	IM/2024/069	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
20580d88-980f-485f-acb5-a25b644f80ac	IM/2024/069	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
c892dc3a-eb3d-4312-a931-8952300159c1	IM/2024/069	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
e10741ac-059e-4ed5-a42d-c3c50bd86d8f	IM/2024/069	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
9ff4a711-26e8-400e-8f0b-5848c9654bcf	IM/2024/069	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
6c534922-610c-4445-8576-462209687f0e	IM/2024/069	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
9b965b4c-14c2-451d-96b9-833dc797026b	IM/2024/070	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
2bb0bd68-a53d-40c7-bab1-03f8349e8c9d	IM/2024/070	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
9cd63c11-2b47-4448-9805-30a61698e8b5	IM/2024/070	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
c850b9b5-9e6c-4bcd-8044-f224842e75c9	IM/2024/070	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
0861486f-f5c0-456b-9a6a-77d613ceb861	IM/2024/070	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
72b2dbaa-a9e9-4b1b-844d-c517a5709e91	IM/2024/070	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
0e31ab29-211d-40c5-ab00-18702e867d24	IM/2024/070	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
62d641d8-2616-4ecf-8e76-36d4299eaa29	IM/2024/070	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
52473571-683f-42ec-8bc6-7bff16407896	IM/2024/070	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
c0fddf69-d01f-4384-8cd7-36b6cec5d9ac	IM/2024/070	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
7b379b60-726c-4d59-859c-af4f21290258	IM/2024/070	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
3bb7cab8-03b9-4ff3-b994-6e1bb2caffed	IM/2024/070	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
ff9b9779-822c-4dab-a8ea-d4cde94cbe4f	IM/2024/070	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
ea722e23-96b0-46bb-8b4b-508e0dffbae2	IM/2024/071	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
ac44b84e-c110-48dc-9992-03f4aefe2e83	IM/2024/071	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
22abf980-4021-4396-b42a-15770a96af81	IM/2024/071	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
a468221b-7f41-4a23-be25-d863f8ed5908	IM/2024/071	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
e5f9b2f3-1131-4572-aa47-7c5141c4eda6	IM/2024/071	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
efbe9aa0-3767-4b00-af64-b0ce9326d466	IM/2024/071	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
1481a47d-d04d-4cf7-afa0-d3f9856fe106	IM/2024/071	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
ad1c6884-b794-4467-8286-b83af6dcfd69	IM/2024/071	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
ed56d1fe-1f0e-46e6-b86b-9c735c626bb8	IM/2024/071	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
4e86203f-0151-447e-9536-50c383ab1fe4	IM/2024/071	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
ca571a28-bdc9-4ffe-a40f-17afe0f3c2ad	IM/2024/071	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
b4d24021-b7c1-48a5-8c71-a564101c5a1e	IM/2024/071	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
2b13c8af-9996-4d5a-85a4-8f7ddbfc918a	IM/2024/071	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
cefceca6-3c66-4734-aa48-152130b64137	IM/2024/072	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
71d42d4e-007a-4a5c-a5e7-b89bc3b36aaf	IM/2024/072	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
2032d5ea-4d45-4c7f-bddf-4b1135d8e844	IM/2024/072	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
8157e165-bca3-473a-a89b-b9033451d1a9	IM/2024/072	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
6927f8a4-54ff-4235-bbf2-a5ae066a4546	IM/2024/072	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
b27964fc-8925-488b-a5d7-1d6cd2973c20	IM/2024/072	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
b5fcd929-2718-4422-9e83-f8f204a44533	IM/2024/072	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
4963a008-4f68-4bb2-95be-93322fc3421a	IM/2024/072	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
64e1324a-00aa-4a13-9301-3c4fc9879bb8	IM/2024/072	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
a40ce94e-97ff-476a-9b29-32d21f0cb771	IM/2024/072	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
11311ccd-957d-4b1b-aee5-fef9f311bde9	IM/2024/072	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
d1fa78ed-5db2-42b3-995b-546600b2aa91	IM/2024/072	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
881ccfc5-c518-4396-9004-dfb92631f083	IM/2024/072	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
a0d0e5c4-e706-4dbc-8b92-af68cb26de49	IM/2024/073	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
7486d5d2-18c9-48cf-a9d1-832cdb5c5d52	IM/2024/073	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
b6813df4-671f-4055-97f4-c63d47503c21	IM/2024/073	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
1d8de82f-21be-4a9c-8a63-9efc51b37072	IM/2024/073	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
6e940dbb-6558-4a85-89f1-57e1b9a2a9ae	IM/2024/073	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
ef0bcd0a-1d8d-47ed-9b47-3fd2a90bccd1	IM/2024/073	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
c5f53b9b-37b4-4d7e-bd9e-a4aa183a6135	IM/2024/073	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
3a5aa96d-a934-483b-984a-448b46fa1475	IM/2024/073	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
2b6dc208-55ad-4cd1-983c-6de245127772	IM/2024/073	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
90ad92c8-e5fa-4afe-9745-44c6954f5dfa	IM/2024/073	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
04105425-0274-4748-8a0e-cbf890947056	IM/2024/073	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
a67c2530-27ae-4edd-9e1c-ba33dc46a22a	IM/2024/073	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
c6447fba-509d-4774-a09d-079a712655a6	IM/2024/073	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
9af67001-2c0f-4ee1-bab0-c38b7b29d8a3	IM/2024/074	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
f1b0a677-7ce9-4e17-a944-4079d50629b8	IM/2024/074	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
372b5934-82d0-47c3-a65e-7238895ae943	IM/2024/074	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
6c3d5c8a-ea95-4b13-9dc5-49506f03bf50	IM/2024/074	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
f880d8d3-6dac-4a1a-aae9-0c425ade128b	IM/2024/074	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
2a5e38d1-c695-4701-b621-4a4732728ffa	IM/2024/074	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
d7318cbd-e354-4380-82ca-a538f6358bf9	IM/2024/074	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
3036893c-e373-432c-9210-5807defd942e	IM/2024/074	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
7943bb12-9570-4352-9fb6-ad1c07af3f0f	IM/2024/074	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
4d021f6a-dc9c-4cbd-9de9-0b34d030e4f7	IM/2024/074	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
b879fcd4-e22c-480b-a879-cc18c74f2db3	IM/2024/074	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
4f73f0ac-32fe-44df-bb26-0069f8057f43	IM/2024/074	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
aaba551f-1cb8-4781-9d6a-b14be4fe192d	IM/2024/074	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
7ebedc49-28b8-4763-9475-4eddb9452032	IM/2024/075	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
962dd694-89fc-4685-8512-986c91a7003c	IM/2024/075	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
648d0c71-5ce5-4325-80bc-42349ad7c94f	IM/2024/075	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
74cf230a-4004-4a1d-98b1-ae66a8331ef7	IM/2024/075	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
ce466093-d045-42b0-a67d-7df400cc1da7	IM/2024/075	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
5eef40ce-c716-4fb2-baaf-20a04f564dc9	IM/2024/075	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
53f5eac6-4bc9-4674-994f-f2f426e9d17a	IM/2024/075	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
e2145fc5-d5f3-4483-9732-d206c81cb82f	IM/2024/075	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
95eae4e0-867f-421b-9620-76d4a721f880	IM/2024/075	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
cba5d299-cbdd-48b2-b502-6dc797a2893f	IM/2024/075	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
be5a0b4c-daaa-4d38-bc2e-633cb37fc8bd	IM/2024/075	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
fb792248-1e84-4240-8869-0d23cde03d3f	IM/2024/075	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
2a25ec81-4103-4c5c-b5c6-c2b83b8b8043	IM/2024/075	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
d82fce68-aa39-436f-b64c-b145393aa497	IM/2024/076	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
69c70061-008b-48b0-9aa2-797595d5e52c	IM/2024/076	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
0d00c7e5-905d-4505-9622-34f5442a35a1	IM/2024/076	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
0e9d2b05-75be-4426-ba5a-1239fccf161e	IM/2024/076	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
05d198cf-49a5-4539-880e-dd45593e4b6d	IM/2024/076	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
eca83ed4-d44a-47fa-8119-529e40dbca93	IM/2024/076	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
f7c6950d-59f5-4704-a97b-1261fc0fea75	IM/2024/076	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
46aa5283-9f9b-4a4c-a701-103954c826d5	IM/2024/076	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
a8983419-01f4-4183-b641-3415f3418966	IM/2024/076	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
47d5cf99-8d66-4027-bed0-c4998b234c48	IM/2024/076	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
8d933600-9ebd-45df-ba1f-733adea3ceac	IM/2024/076	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
b71041d6-e1ac-47d2-b8fb-18813a015080	IM/2024/076	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
189540c6-fad8-4907-b062-16b46083f4b6	IM/2024/076	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
2d6f4fc0-cda2-472f-8497-38fcad6686a9	IM/2024/077	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
13b56a28-b0e7-4f4a-be6d-b305ef1851ac	IM/2024/077	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
e6624336-2903-4770-b590-6a54565b4722	IM/2024/077	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
eb11e9fa-f2bd-4d7e-b2ac-9266882357f8	IM/2024/077	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
57c8a461-61b3-4727-8710-5777e8d8a30c	IM/2024/077	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
d34418a5-7cbf-4435-a53f-9914f1108e70	IM/2024/077	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
a4671c77-aac1-4799-bd68-1f59a458f57a	IM/2024/077	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
39eb987c-026d-4046-8a15-a4b9bc73a170	IM/2024/077	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
e1e265c1-4888-4a54-aae9-ba65cea6549e	IM/2024/077	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
90946ea6-8fc7-4d6e-afc0-d96a667d6591	IM/2024/077	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
38a9f705-cb7d-4f32-a0a1-188fdb381fc9	IM/2024/077	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
c2b66c3c-5704-479a-89d3-62585f49feee	IM/2024/077	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
9b840f8c-fa5b-49b2-be9c-19cd2360d322	IM/2024/077	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
020a027d-fd0e-4ed1-abb5-b4b025bc9667	IM/2024/078	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
e6c8d044-0638-47b3-b348-c4bf0c368d84	IM/2024/078	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
fc369edd-4040-4205-8500-8b26a8075643	IM/2024/078	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
6dac7968-6cd6-46ca-a865-d74d5334193e	IM/2024/078	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
9a34456a-3304-4f4f-8dab-17bf6bc64a63	IM/2024/078	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
37019e6f-7298-4b6c-a0a8-76e9637fa089	IM/2024/078	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
daf83e8d-7536-4a01-836e-f57fc8bc2c7b	IM/2024/078	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
42ac8b97-dd7f-4bf7-86e1-90c01be8b688	IM/2024/078	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
4079f2d9-e07b-455b-9d65-66fd450b9053	IM/2024/078	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
4b51d32c-04ef-4107-886d-35d51e1ced0f	IM/2024/078	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
1b9743f2-245e-4d1f-8809-1ee22d5828a1	IM/2024/078	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
edc992bc-77db-4580-9f49-f88dd9af0eb7	IM/2024/078	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
ffeb31f0-0109-4e43-baba-5efe230475cb	IM/2024/078	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
bf0382cf-0124-485f-b74c-0cb10935476f	IM/2024/079	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
639b211d-676c-4dc5-913f-5b09403c5638	IM/2024/079	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
4d9a49da-b53e-4b3e-8223-810234168b5c	IM/2024/079	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
c3100af8-055d-4f7b-9d70-9a22662ea876	IM/2024/079	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
a59cf6f1-4c3b-41b8-9b77-f0c590d8daff	IM/2024/079	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
cfcbea86-bb20-473d-bda1-d8f0c0524d40	IM/2024/079	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
aa64e1ba-48a0-4588-b41a-1324c8279708	IM/2024/079	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
67f14585-9a8a-4e8d-ba87-7288b90d7205	IM/2024/079	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
1c814838-f232-40c9-b82a-4127760b6d2b	IM/2024/079	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
235b8cc7-a977-4448-8df9-13dba8a85434	IM/2024/079	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
96a41554-37e7-4035-8f46-a78542f47829	IM/2024/079	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
fa944094-ed4e-4756-b353-da631dff899c	IM/2024/079	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
41b4d300-ceac-4df9-8e68-48de0e31c486	IM/2024/079	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
4ca88ce9-5ad2-423f-a863-9270fc143829	IM/2024/080	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
a06dc5b9-acf6-4ec8-8f40-7bc20be53ff4	IM/2024/080	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
21e29adb-f6c2-4839-bd4d-c148529eefdc	IM/2024/080	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
817750ad-a1a2-43a0-9e95-2156bde25315	IM/2024/080	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
ad157d3f-e790-4687-8dff-57e6365c7036	IM/2024/080	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
d39fae24-eeea-4375-b8a1-7b9ec8209ad3	IM/2024/080	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
b307c2fa-b847-464f-a4ee-06c50c756207	IM/2024/080	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
db2f440a-f894-4f71-abbd-b6a0189e8726	IM/2024/080	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
b1164ef5-24e1-403b-bfad-1fcee9ee9046	IM/2024/080	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
41433fcc-1146-4e4a-93c3-5a4ca5582f9a	IM/2024/080	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
3c9ffd17-aafe-4e8f-86d4-acca26aed1ed	IM/2024/080	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
aee1833e-5adf-4fda-a91b-3aa748b0bffe	IM/2024/080	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
b61658c9-b635-480b-b0b3-adfadffa3b6e	IM/2024/080	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
e6ab1092-48a6-49b8-b52f-82a42cf36ab7	IM/2024/081	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
f5db7b7b-f41f-4733-8c0f-aa25bc48ef0d	IM/2024/081	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
d299917b-0daf-45af-9cbc-77af0adc2271	IM/2024/081	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
ecf04b37-f802-45da-881f-fe151f2d96b4	IM/2024/081	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
88e8a2f8-1502-43db-a3b5-6100c73dd6ab	IM/2024/081	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
864fddc7-b805-47ff-9df7-140acd8a322a	IM/2024/081	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
adf31527-6a88-4ae3-ad48-22fb9dbd31db	IM/2024/081	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
6932e636-0ee1-47c9-b785-bc006bb866d0	IM/2024/081	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
9e8dc48c-5e2d-43d3-8abe-6e7663ad05fc	IM/2024/081	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
980be9d0-8045-4579-9326-9aeb18d171ec	IM/2024/081	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
aea225aa-f2fe-4c02-97e3-1384b9fe1895	IM/2024/081	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
9bbad01a-df2c-45d0-a928-983f4bb5d1ea	IM/2024/081	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
cf7bd0ab-0c56-40fe-8c70-481380c02fd4	IM/2024/081	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
d119bfb6-c192-477d-aad8-1e66212510c7	IM/2024/082	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
75a6d155-a476-4964-b785-79a833ee0ac2	IM/2024/082	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
dca08e82-e31d-414f-bdfb-b19a8e69f4f3	IM/2024/082	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
bf83e9b2-406a-482f-b444-d38e22980d16	IM/2024/082	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
2f0ccd48-1a1e-4cf5-ac73-ccec40c8f167	IM/2024/082	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
5a583518-c6ad-4da9-b6e5-8137901f13dd	IM/2024/082	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
89c07626-ce6d-4bb1-89c6-a46836bbe568	IM/2024/082	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
2221cfa8-92ec-4906-82ee-a29ddc929b63	IM/2024/082	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
de979c6b-22d7-42c4-987d-0592bed4cc65	IM/2024/082	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
bec149fe-791e-452a-8874-2f10d89af968	IM/2024/082	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
487e27ef-ef2f-4fe0-8f99-6016091dae09	IM/2024/082	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
5721ab82-9e5b-4142-80e3-7c64b0b6f60d	IM/2024/082	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
a7a1228e-aa95-4d50-9269-017a6416075f	IM/2024/082	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
16730144-2468-4c75-bafd-82cde1c8ef9b	IM/2024/083	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
26ba42ba-bdd5-4552-ba93-0f5171e9cdd8	IM/2024/083	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
327c808a-38a2-4563-8d69-ad00107b0521	IM/2024/083	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
4cf0a1c5-d627-417a-a0d0-5f4bc331953d	IM/2024/083	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
d0213e51-6147-45ba-8fdb-fd0875e18485	IM/2024/083	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
0cecbed5-6cc1-4a3a-9edc-0fa0be9c0c6b	IM/2024/083	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
9980a241-0840-4eab-813d-a39763470b72	IM/2024/083	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
42484607-0245-439d-8a26-cfaeb7879409	IM/2024/083	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
001c030a-18c4-42fe-82ab-a0641fca7be5	IM/2024/083	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
bfe1cb04-e67e-4e7d-93e6-bb56a7b7afd2	IM/2024/083	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
66700bd7-1bca-4cf4-89ba-99f37d7e5304	IM/2024/083	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
7799fbdf-ddf4-46bc-9c6d-648d5b99ce2d	IM/2024/083	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
f68f874b-690a-4c32-a72a-1fdec548494e	IM/2024/083	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
7914cdd5-db08-4f66-87d9-e543bd7923dc	IM/2024/023	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
155c392b-699a-4587-9cf7-fa339d968792	IM/2024/023	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
6effc7ea-218c-4298-a859-da984c2c50aa	IM/2024/023	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
2c47a3b2-7dc2-4e50-b238-10445a1e8d7a	IM/2024/023	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
a6fe25e0-b2a3-4282-9f6c-91126f118e8d	IM/2024/023	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
a398b2bf-8c79-447b-81f4-b2bd419a8ed6	IM/2024/023	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
83f74d84-64aa-427f-a7b5-31ce258661a5	IM/2024/023	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
6b271956-db09-4bb4-bf8b-b1f0f9b9eed0	IM/2024/023	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
11a7ce02-1107-4280-b750-5a2ee79b311d	IM/2024/023	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
f31c40e5-1b81-4023-bd06-17dd6cb19dfe	IM/2024/023	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
ee696cd5-890f-405a-b465-95c7eb4a6451	IM/2024/023	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
96777306-b6d8-4be1-8bcc-8be8730b61e4	IM/2024/023	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
ed9a25cc-bc7c-4888-8deb-15b3082e32e9	IM/2024/023	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
df2b4783-6e9b-4d60-8111-6ea906b698e7	IM/2024/024	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
1c14be1b-d48a-48c4-a24e-3c6249f16351	IM/2024/024	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
14ccde4b-281e-4175-887b-1c2f2bf2a13f	IM/2024/024	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
f135a4f2-73ba-4d0f-98ff-969c95ab951d	IM/2024/024	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
9246bb2e-c3c1-4580-af52-c211e11283e9	IM/2024/024	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
aa689982-5db3-4e0d-9395-645a5b8c94a4	IM/2024/024	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
f3c41199-41e0-4bd4-ae5d-571d53af0b71	IM/2024/024	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
85e86773-fad3-4519-882f-25023bb7c723	IM/2024/024	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
9db69816-33de-4af9-8348-1c21f434a5e3	IM/2024/024	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
b919e21b-e2e1-4f0e-867c-57e149553b75	IM/2024/024	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
a951a924-d393-46da-bdc2-edb0771bac75	IM/2024/024	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
eab27596-12ef-42c7-a9ce-3cb3de83bdb5	IM/2024/024	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
cb5a287b-e71b-4202-a2bf-21afc2c200b0	IM/2024/024	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
08fb1bef-df6f-4161-bb10-963434321df0	IM/2024/040	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
8ab52611-56aa-46c2-87eb-67e894c1da18	IM/2024/040	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
a0c287f1-b2dd-4fd9-8e07-798fb51f8e98	IM/2024/040	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
ef8da7e9-aa05-4162-ae67-9500601a1a22	IM/2024/040	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
41dd4606-bc8c-4974-9514-ac91fb1b0013	IM/2024/040	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
04823bb1-82e6-414e-b4a3-a5416858d85d	IM/2024/040	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
cedb51b2-65f8-4f1c-99f3-aa13a5e47414	IM/2024/040	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
21b54b96-5cee-4f2d-82c7-5e5963e6e0d7	IM/2024/040	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
ad3d3f3f-0a39-4d84-b363-b325d16e0bbf	IM/2024/040	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
b43513b5-4ee3-41b0-8f48-e95ef588a990	IM/2024/040	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
1e4ec29e-8d98-4fb3-9462-4565e968f3ee	IM/2024/040	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
1e1b1b52-afbb-43b1-bb9c-396793e346b3	IM/2024/040	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
946c0d39-dc1b-4985-b9b5-db3e1753597e	IM/2024/040	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
4c05c163-3f38-4dc6-9b14-57fe1e7939ff	IM/2024/041	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
ba54adf6-fe5f-491c-9012-9c6aa87605c2	IM/2024/041	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
c3da47d9-da4f-4ada-a718-0a2a489e535e	IM/2024/041	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
85cca4f2-9e31-4d40-a632-fc8f41a4b507	IM/2024/041	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
628d3f10-1fc7-4230-8f2b-824b38c72a57	IM/2024/041	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
0a14a7ef-b0b1-4307-8a8b-018734c7499e	IM/2024/041	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
f693eec8-165b-4150-938e-046eefe9bd7d	IM/2024/041	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
ca238b97-0dd7-460a-9bc7-e4eded8cc8a1	IM/2024/041	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
a16794ed-6ff6-4890-87d4-144d3836c51f	IM/2024/041	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
174f9297-c0ec-40d0-83ca-cd8c60ada4df	IM/2024/041	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
023275b9-7581-45b8-8c8c-6b61500ed71b	IM/2024/041	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
7ae84f73-2d71-4f0c-9960-377b6052ed1f	IM/2024/041	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
c861c0f0-73ba-44a7-8356-89dd9570bfc9	IM/2024/041	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
c6bf36d1-df4a-4135-97de-206f223f6b10	IM/2024/042	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
4b2497ff-0b23-499a-ae41-18204c5d7e83	IM/2024/042	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
dbad0b59-978a-4eae-8622-cd09a7fbbb81	IM/2024/042	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
1748251a-3f76-4a6d-9de9-9b7cd597fc99	IM/2024/042	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
c88d7b5c-272a-4e9f-8559-b91ef70627fb	IM/2024/042	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
57ba8257-1ff2-4030-937b-aaf13cfd75ef	IM/2024/042	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
87741cca-8725-463a-8777-9a3f2f757278	IM/2024/042	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
6e1fe95d-47a4-413b-999d-51424a8ace31	IM/2024/042	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
44a52963-ccd2-407c-aa25-c5f957356011	IM/2024/042	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
e04846b7-eb9a-4684-922d-f294308fd1fa	IM/2024/042	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
b91554d1-c16a-4315-9854-2648b04000bb	IM/2024/042	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
2a18e287-0c62-4aad-9cf0-daa692ff676e	IM/2024/042	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
b1806243-d077-4059-977d-6e910b4a1fb7	IM/2024/042	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
ea399df3-872e-4949-884d-d6cf630afa2e	IM/2024/043	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
2441301c-0c3e-48be-960f-2032d2892eb1	IM/2024/043	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
2e415f0a-508a-4598-a7d1-41f88e74ec9b	IM/2024/043	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
13c0ef52-93f9-4c0e-9308-7f5bfac0668c	IM/2024/043	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
2934d15e-f9dd-48fb-925d-ecdeb241ffc6	IM/2024/043	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
c1a5c367-2f7d-4c6c-94b3-e8b6c503bca7	IM/2024/043	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
9d735b98-5609-475b-9ae4-8a73ecaf87ee	IM/2024/043	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
43ff9e27-cef7-4e1c-b5c7-37ca5623ad5b	IM/2024/043	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
80a65cbc-fdb4-4feb-badb-86a21f4f4895	IM/2024/043	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
dac51689-e839-4739-9091-3e8b4d7b7b61	IM/2024/043	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
77599efb-e8e6-44c3-8df6-65d569dd9e88	IM/2024/043	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
aee548a3-0c5d-4b0c-8b1b-8495910ccad0	IM/2024/043	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
038950b9-f7fb-4ad3-a249-be01caf846ad	IM/2024/043	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
1bcaaa9f-7c50-4a8c-a409-65a25a8bfd85	IM/2024/044	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
2b987bd8-0f13-4512-8207-acd669a67e01	IM/2024/044	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
356a60d9-3790-41e2-b69c-73050ba970d8	IM/2024/044	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
25d47d2f-4b0c-4d32-bce0-3d2d1d063ab3	IM/2024/044	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
271b841d-f6f3-4beb-aec6-734e1a72bd13	IM/2024/044	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
3b09fdbd-7f8f-43d1-9191-a11b50c269ae	IM/2024/044	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
98f1328a-bde6-4e23-9e6b-a30d9c0ee0e3	IM/2024/044	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
ec90d2fe-81c8-488f-b6c6-3d43d1020112	IM/2024/044	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
d31d14bc-07ee-4b1e-b520-fe0dec75719b	IM/2024/044	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
edea6ced-8190-4b9c-9d90-1299488975f6	IM/2024/044	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
aa4c30a2-8ed5-458d-b1e9-34b3af764c2f	IM/2024/044	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
0bb73ed8-d198-477c-b675-86b7184a4c62	IM/2024/044	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
28719234-e300-4474-97fa-a73570201c32	IM/2024/044	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
9dd0487a-403e-4cc8-9711-ca7a605ddb8b	IM/2024/045	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
0f61b5c9-1b97-4dd1-86da-5192bb7489c2	IM/2024/045	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
dc79a40e-9504-4c11-9100-f4dc31464c6f	IM/2024/045	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
8cc9ec2a-06ae-4c1f-bad1-480a2c491fe0	IM/2024/045	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
a886c6d3-d17f-4956-914a-3e0f11dde2a5	IM/2024/045	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
633fd5c5-3904-4179-abd2-8dc6e975abe1	IM/2024/045	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
96e08941-43d3-4507-afcc-16b2c57deb05	IM/2024/045	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
30c84959-8046-46d7-84d3-8e7604dfcded	IM/2024/045	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
91933db0-c16d-41ba-8dd6-ddfd8a68f621	IM/2024/045	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
356fe15c-9f21-4ba3-a09d-5e6dd6450de4	IM/2024/045	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
0c2738df-84b1-4aa6-b135-94d2af1a3123	IM/2024/045	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
97658b44-5613-4545-b5b5-778000b9e76c	IM/2024/045	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
9efd8f66-8bcc-4d9f-aa99-10d2554cdf12	IM/2024/045	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
51d29bbc-8cb0-4174-b984-29ce5cc68e0a	IM/2024/046	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
7fe84409-1700-4871-a134-490e940304af	IM/2024/046	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
c79ad72c-e5d4-44fe-aa41-6353cb46e80a	IM/2024/046	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
b3d98657-4fa6-4351-95e4-25de494bc2c9	IM/2024/046	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
988afec9-4dcb-4cf3-af77-281b0f958d4d	IM/2024/046	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
8da947ea-daeb-4c03-900b-73fd0f311bd0	IM/2024/046	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
5018a028-f994-411b-8d39-071db701a06d	IM/2024/046	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
54b7d503-6092-4f55-8bd8-e84373b68311	IM/2024/046	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
043f2fcd-957d-4fd1-923b-9d74f62b7b32	IM/2024/046	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
a1045028-bd42-4ab9-80ff-a333717cf215	IM/2024/046	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
d2fb30b3-7442-4f27-b481-54a3a5a8dec0	IM/2024/046	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
0528eec0-f7f3-4f32-a117-82ab28bc3c32	IM/2024/046	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
ef5bfcef-3924-4de1-b026-5c4cab2863f4	IM/2024/046	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
d6c41fec-5763-4d2e-8129-28e241038df7	IM/2024/047	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
398a4c30-b66b-4686-9bb1-2efa7be82b30	IM/2024/047	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
d51b8a50-635b-4c1c-9c92-97b8c23d134d	IM/2024/047	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
4e2fdbbf-0a90-49fd-9451-51f18bee8fb9	IM/2024/047	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
b1fd62e2-93c9-407e-b7d2-c730dcaa70f7	IM/2024/047	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
3190d835-48af-4819-af51-5b2afd364920	IM/2024/047	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
090bcf78-604d-4922-b014-7d98a7231504	IM/2024/047	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
d1999581-a7a3-401b-8474-f45729931068	IM/2024/047	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
d11e1b68-dbca-41eb-b905-cb42e6e28070	IM/2024/047	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
e4fcab76-78bd-40cf-ab0f-7a7b935bba2e	IM/2024/047	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
6ef3c2f0-7bf0-4623-847a-6261e907cd05	IM/2024/047	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
7333d655-2847-4c63-adf7-4af8e3b1c8d7	IM/2024/047	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
58f19dc2-ffdd-48ef-93d9-1eab719ba2ae	IM/2024/047	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
fb9fe504-1139-4f9c-82a1-52554617d971	IM/2024/048	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
6929225f-dfa8-4d4c-b5fd-4cbe90dd6a1b	IM/2024/048	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
25354357-a460-44b9-a126-eb09db54533a	IM/2024/048	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
56179b23-043c-4b89-815d-bd79e94ac322	IM/2024/048	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
0ca38a22-a1fa-4812-9366-0dd822545e79	IM/2024/048	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
1262ecd9-b18b-4e06-8019-acd4b3fd5cf5	IM/2024/048	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
175bbe9a-58bc-4a0f-894f-51203d2d592a	IM/2024/048	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
d18a4e7a-0f3d-4807-aa45-1aa56816bb8d	IM/2024/048	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
92718741-8642-42f4-9c2e-60ca93b5aa64	IM/2024/048	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
9c638deb-a9cd-4a0c-96b4-be64a11ea34c	IM/2024/048	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
5fc58237-e2f9-4d0c-b71a-e30baf777008	IM/2024/048	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
b5fbe8f2-a00b-48aa-bdfe-1a792d689323	IM/2024/048	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
394001ad-b8a7-45d7-b0ad-f576ba9633bd	IM/2024/048	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
c6113892-3b7d-4104-be9a-a3b86d785aae	IM/2024/049	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
eb6ebcf1-a340-4226-9259-35a4253b765e	IM/2024/049	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
86dc8047-9a58-4379-ba60-bcfeb631fdfe	IM/2024/049	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
089ee950-1dea-455a-ab00-5949bf512a59	IM/2024/049	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
58b0a99c-58d0-4b97-98dd-697b323d803a	IM/2024/049	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
eb51d609-a8e9-49bb-9a01-2e7a132e283b	IM/2024/049	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
855aecbe-e291-4544-9878-12b3a1517dd6	IM/2024/049	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
dfe737b4-83d1-41e1-97aa-b86d143b40bb	IM/2024/049	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
94e07708-25d2-49d6-b5eb-19e494509482	IM/2024/049	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
68801981-7768-45bf-b2e7-75e4ed98465a	IM/2024/049	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
09c1df20-4a2f-4eb7-bb2e-9d6fa52c7af5	IM/2024/049	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
0ef48496-ad65-46b8-9be7-96baab7ba020	IM/2024/049	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
dfbd4480-71ad-4bc9-b5e9-7358362f7435	IM/2024/049	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
181183ae-4ca1-4c69-bb17-042e81f5174c	IM/2024/050	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
08307f38-be61-4692-b02b-154d80f63c2e	IM/2024/050	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
e9b356ed-f10d-4767-b4fd-1ced816f3b13	IM/2024/050	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
4e9773bd-6cc7-41db-87af-8afb171b6d81	IM/2024/050	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
a3ac976c-0248-4ad4-b96d-457075077a7f	IM/2024/050	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
e9d07c32-32cd-465e-b834-1aaa73ea8639	IM/2024/050	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
581ffd20-b7cb-4ff8-ac2d-40819f9203f9	IM/2024/050	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
1f947eef-72d8-4aee-8305-5dc0cd447c4c	IM/2024/050	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
ff3b520d-3b66-4bb3-8179-883c0b0900ef	IM/2024/050	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
c5d6c44d-fe6c-4cf6-8f0d-3a4644f738b5	IM/2024/050	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
45c5a7ad-1851-4790-8e33-9ea284f0d1ee	IM/2024/050	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
4b34c331-47d5-483f-813e-4736f4dd250e	IM/2024/050	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
be43175c-74da-4ec5-9190-c3fefae601b1	IM/2024/050	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
58cc18ca-76db-41ef-ada3-33e800bcec16	IM/2024/051	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
6cf2e99e-bfeb-469a-9431-fe76d5f0d4ad	IM/2024/051	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
178d1699-86d7-4b92-a663-d96362496379	IM/2024/051	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
52bd30c7-d9e3-4703-85b2-6adf28896fad	IM/2024/051	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
20c242ac-6b7c-4fae-8e03-f776a4d3ad89	IM/2024/051	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
e5dd959b-c45f-4209-ad76-f94ce87f0ed8	IM/2024/051	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
0dae6e34-7656-4967-bc53-6924ee1a04eb	IM/2024/051	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
058643ae-5075-4bfb-bec8-496544a23ec2	IM/2024/051	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
7df0eeaa-dea0-4731-b183-9a6b465fd2d6	IM/2024/051	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
add7091c-9506-45c5-a252-e4493d332ffe	IM/2024/051	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
02510466-d4f9-4bf6-9c91-41ebf94f1f45	IM/2024/051	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
43aa6e0c-fdea-4ce9-98dd-fe3a68e3f37a	IM/2024/051	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
1c5998ab-00ed-4ae1-b5f9-8e9fe8258339	IM/2024/051	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
9baaecdb-5591-459e-b7ac-152f01d0fcce	IM/2024/052	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
8bde075b-e405-4d43-9425-a9f46f612bd7	IM/2024/052	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
b61c92d0-633e-4d31-9239-c185fd32c936	IM/2024/052	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
dd938c77-9ab5-4b75-ba91-dcb79998882c	IM/2024/052	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
12e6458b-4b9e-4f76-94c8-827c777e61cd	IM/2024/052	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
6bbfef24-bcee-45a4-9a3c-52a0a8477bda	IM/2024/052	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
9149b353-8f7a-4649-bb8e-d836be3641e8	IM/2024/052	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
eaea3a37-13dc-4512-8157-98198d1c8a47	IM/2024/052	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
5cb37c78-a8f8-4331-ac87-edd5b9b1f994	IM/2024/052	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
959c73c1-0bd8-4968-a757-bd6db8715f33	IM/2024/052	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
acb41afa-acda-4c70-b1a7-ebda9613d7f9	IM/2024/052	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
b12e93a8-61c5-4fbf-ae5b-f45d9d6bea8b	IM/2024/052	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
0606cd55-7b85-4e4a-a5a7-88cb87931318	IM/2024/052	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
94df419c-bd9b-46d6-b941-f6a5b7df0ab8	IM/2024/053	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
18602c6e-b934-483d-8587-5b1fbba96074	IM/2024/053	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
ed1bf073-d1bb-4395-9bbd-3616d3572bc3	IM/2024/053	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
9030e007-0553-40d3-b954-4958b3539d40	IM/2024/053	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
28ef372b-5b2b-4e10-b9b4-159abae887c2	IM/2024/053	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
de1dbea4-323e-4e20-b5c2-739e6140b10f	IM/2024/053	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
ea972dcc-fe85-4a8f-ae4f-b00c8471f785	IM/2024/053	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
ca438163-8236-41e6-a88f-3dcc7fa1d244	IM/2024/053	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
4b782c7e-b7c2-460e-98b8-107f4ad2b286	IM/2024/053	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
ed364a84-efea-4217-b328-1fefbec9c8de	IM/2024/053	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
e31d0d10-4ac3-4ff8-b292-1e1cbee9e272	IM/2024/053	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
001217be-22af-4551-9150-566fe04eeb42	IM/2024/053	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
7a1f790a-6e63-4d55-806b-ccdfadc6e53b	IM/2024/053	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
6100aa69-c069-4b43-8d60-a45aa33f84f9	IM/2024/054	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
8165f7e2-405a-492e-ba4a-647f75590b92	IM/2024/054	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
d9b9d708-99d2-4852-b160-90495ab4f5b5	IM/2024/054	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
0b057130-dd1f-4635-91dc-b7b2a8a3f58c	IM/2024/054	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
4fd1e179-514f-41bf-8566-24a59f07d448	IM/2024/054	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
332ac977-be0f-4367-9d9e-413faa5ab809	IM/2024/054	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
f0026c87-bf98-490e-b87c-7ffe260d5edc	IM/2024/054	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
78019230-5200-47b6-8e8b-08c1e5dd45c3	IM/2024/054	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
71a79bfe-0eda-4ce0-8e4b-a3e41baf4194	IM/2024/054	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
c4911508-6a12-4d48-aa93-793323267df8	IM/2024/054	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
dcf3ac91-3310-4153-8fba-af70526130d9	IM/2024/054	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
71110f58-0ffa-4502-ae2e-458a0234f9aa	IM/2024/054	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
db8863e3-9cbc-43f7-8441-377e94249de6	IM/2024/054	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
43b178cd-916a-41ec-a1e2-9db724939fc7	IM/2024/055	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
b96c606e-e6ea-4386-af3e-b81edbc0ca42	IM/2024/055	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
ff685865-8c60-406c-be98-41f47372c701	IM/2024/055	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
ef6439e0-2774-474c-8ac9-6027a7bfa36d	IM/2024/055	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
74300ab2-309e-490c-a1c9-5121611a761d	IM/2024/055	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
0866cb6b-d02b-4958-b55c-0b7a4331df0a	IM/2024/055	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
14f1175d-75dd-4c8e-b08d-f07c8045a28c	IM/2024/055	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
a688dc76-a748-45ae-918c-1b3c90e43769	IM/2024/055	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
7f8ec598-3155-4e28-ae03-e1c757995840	IM/2024/055	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
19af0b8d-2c1e-45fc-823e-1c3660d75cfc	IM/2024/055	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
a4ca9326-ccf1-428a-a91b-7762399cbe8c	IM/2024/055	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
97069a98-d3c7-4900-9b75-8113c5988ede	IM/2024/055	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
ea558cbb-ec7e-4afd-ae02-262e5ed82499	IM/2024/055	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
864c8d9a-d01c-466c-b81e-8469d0c7e6f2	IM/2024/056	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
0f61317b-e36b-4133-9339-35b623e87af6	IM/2024/056	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
781d5a2e-5d5c-4dc9-b184-9bbeb0270e27	IM/2024/056	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
db002bb5-51c9-4047-99f0-03eae2f467d4	IM/2024/056	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
a3d21ebc-15ca-4175-a8f0-41cc33c07e3a	IM/2024/056	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
f699273b-2955-4394-bb5f-ac8fc4a76eb3	IM/2024/056	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
d52037d3-166a-469d-babd-0a27e4483649	IM/2024/056	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
c2c891fd-a4bd-43d0-bc3c-9b4410eab478	IM/2024/056	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
7261cff9-4cd2-4df8-8ceb-635d31212173	IM/2024/056	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
fc09c651-2e4a-4d8e-aaaf-abe8e0971502	IM/2024/056	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
d0f0deb7-8773-42cb-a51a-fac16f83764b	IM/2024/056	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
ad70d5e0-a1e9-48df-9701-a8dc84d678e3	IM/2024/056	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
4211c12b-1c46-40a8-9919-d2b8f36a9a60	IM/2024/056	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
a7822604-2525-4061-8796-a0d00fd9620a	IM/2024/057	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
5f4b0795-1cf1-4748-abdd-40edf0af8170	IM/2024/057	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
3300e6d6-74da-4186-a3f7-83022d8ae89e	IM/2024/057	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
1a5e1c6a-b313-4c75-a4e2-2cfebe56b779	IM/2024/057	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
7901be8d-4e5a-4fce-a791-5a540e0ae966	IM/2024/057	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
d749052c-04cd-4543-9ea9-70de8e5dc966	IM/2024/057	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
f646ce8b-fc52-48b5-980b-16c3c479764f	IM/2024/057	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
a84b6421-b0d4-4d91-91c3-a9268c7b163a	IM/2024/057	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
669324ea-09e6-41c6-8150-2f6532d100b0	IM/2024/057	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
b5a8106e-7bf3-4f3e-847b-7b8a988028f2	IM/2024/057	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
2df6baf5-a767-4b5f-a219-1b8282a79c5f	IM/2024/057	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
6224a3be-1d43-47d4-a5fa-645cfb06935d	IM/2024/057	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
8418ef3d-7fd6-4f2d-8e02-ea9ae338958d	IM/2024/057	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
c8d23ed7-3c16-49ea-8b2a-262252efe5c6	IM/2024/058	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
bb26c727-5b41-4c02-bad6-5f1c996481cc	IM/2024/058	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
b2bf6542-d05d-4ec6-9e24-2120cd1903d8	IM/2024/058	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
fd2bfd7b-3e0a-49d6-a016-5111e74561e0	IM/2024/058	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
491fbe4b-1d18-460d-824d-46640482e732	IM/2024/058	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
62c2042e-9bf3-4dc0-9633-38599113e581	IM/2024/058	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
898f5a23-6f78-451d-a01f-9f946ece9ae8	IM/2024/058	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
d5177bb8-2c70-4b88-929d-d9100bdbe33a	IM/2024/058	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
08a5578f-ddd1-4023-96ac-5839a336bf77	IM/2024/058	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
1a944c40-7b3e-4259-bcb5-ae95e2b0f7b6	IM/2024/058	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
e9053123-1054-471f-8f43-b29a9d75fe89	IM/2024/058	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
172a74ef-f288-4ba1-b6e3-a83ce72bb099	IM/2024/058	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
8efa3df2-ff9c-4d6d-a02e-3e95e1e354d1	IM/2024/058	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
56ad0e7c-a935-46d1-a1f3-f2ccc46f6343	IM/2024/059	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
bcd2562c-127c-4d55-a1e8-b1a01c163855	IM/2024/059	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
23fc9cce-3dc1-4bc6-81e7-9778571cb304	IM/2024/059	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
e0ab1872-a004-42f0-ab50-5e6dec0e7325	IM/2024/059	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
d70f1921-106a-40e6-b44c-681c9f84ba37	IM/2024/059	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
d4752757-5192-4cd8-801b-22f685e672a1	IM/2024/059	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
d02750aa-2b4d-4af9-90cd-1a126c2277f7	IM/2024/059	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
30bf6f64-4840-4785-952a-af71f4fae42f	IM/2024/059	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
0a50e198-8d0e-4bd0-b7c9-2f851bcd966f	IM/2024/059	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
8d145678-88d7-411b-8257-2ef6d480cf70	IM/2024/059	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
bf7457af-a1d4-4a6f-8430-b5a78e671921	IM/2024/059	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
1d0c8c9c-e4d7-463c-ae9a-ebfb044963b4	IM/2024/059	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
33a9a6d0-b08d-4463-8382-f4773da793c0	IM/2024/059	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
f4c1aacd-d5d4-4879-a3e1-641f33727bc1	IM/2024/060	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
8081c529-8c9b-48fd-8301-eb1fe3bf428b	IM/2024/060	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
2bf23b2e-9d34-4d11-b779-8276b9e26a3f	IM/2024/060	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
37e3eb58-3dc3-4128-b8c9-87ac80fc5fea	IM/2024/060	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
1d32dae3-40cf-48a7-b772-a2ab5bd4c611	IM/2024/060	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
2a76ae59-00cd-4a52-beb3-3bec2afcd5aa	IM/2024/060	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
877354db-9726-477a-bd11-edc8a5614860	IM/2024/060	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
d0fe031e-b175-45aa-8c7a-f1db69334bc5	IM/2024/060	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
101fb32c-30c8-4ae8-936b-ee288b2b94ec	IM/2024/060	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
fefeeebf-459a-4816-80e2-c3ac78589b6e	IM/2024/060	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
336f3d1d-2b00-4f50-b417-710039f38e66	IM/2024/060	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
6fd89cd4-e0a0-4c5e-a2d6-fe9a9ac26046	IM/2024/060	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
85a3c9c6-f684-4a6f-8529-43dda1324146	IM/2024/060	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
2de2c800-3525-4fbb-af30-f5ba632920da	IM/2024/061	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
92dd24c0-394c-4455-97b1-a125aea09510	IM/2024/061	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
d0e80941-86e7-4b5a-b8e5-7662801a3277	IM/2024/061	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
8d454d9b-9a5d-4796-973f-4a25916ab949	IM/2024/061	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
2d2bca87-abba-487c-bf64-9d1a3d7d56e5	IM/2024/061	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
52adadd9-c948-4c9f-bc69-555c4070b6b5	IM/2024/061	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
79194397-414b-45ad-9b3c-36930b7ee43d	IM/2024/061	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
e02fa365-78ea-41f7-8733-71304e988c56	IM/2024/061	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
de2d0b32-25f2-4f71-abd3-f014785ec422	IM/2024/061	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
f604f1fe-9c9a-48c1-994e-0b32635ea5cf	IM/2024/061	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
73ed46a2-7dbe-4a92-a91c-03f6ee223614	IM/2024/061	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
85bd661c-e348-457d-8779-f061b7db15bc	IM/2024/061	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
607e828e-eb5e-49f9-9431-c6ba31a52f3e	IM/2024/061	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
41efb8fb-9a09-44d1-9f1a-7ee093c4fdbb	IM/2024/062	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
e37e6452-bd51-42bf-ab52-85b7cd730114	IM/2024/062	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
55f3d93f-928d-49e1-9771-2140e06b9e99	IM/2024/062	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
a69f84b9-b0b7-4977-bb7f-917e78ce0045	IM/2024/062	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
2c7f27cd-2bd4-4e3c-968a-8b5286cafa44	IM/2024/062	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
a54ed33a-66c3-4ee5-8bc0-f6e2b1f68b0c	IM/2024/062	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
245e5e6b-1f52-41c7-b5ca-09b91e3f59fa	IM/2024/062	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
54449e08-e94c-40e2-a2d6-cf9d044bb679	IM/2024/062	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
7244cc98-8a86-4bdc-856b-f9c61b502a23	IM/2024/062	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
5827b11c-d2dd-4a31-9a65-4c501139c9ef	IM/2024/062	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
c4b70c6d-4f2c-4997-a66f-3e8f0dde6990	IM/2024/062	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
86a79b67-0729-4b96-935d-9d1008afd4c9	IM/2024/062	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
0fed3e2c-d568-494b-b1a6-9c9af0da577b	IM/2024/062	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
fb410bb7-cf05-4b33-8078-da562fabeb98	IM/2024/063	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
f26b60be-326f-43d8-afe1-4ab76659c52a	IM/2024/063	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
17339200-4a22-4f70-8a36-7da20271c913	IM/2024/063	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
9cad2499-bc40-4be0-904e-aef6a983d847	IM/2024/063	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
b40985de-5d34-4234-9125-ec5247724ffb	IM/2024/063	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
995c2ad7-1517-46c5-970c-a16d7db2381b	IM/2024/063	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
58ffcca0-5bc3-4c8e-99eb-b99dad26fd15	IM/2024/063	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
3e20b6af-3794-4e4f-bf5b-5aa5ead889ad	IM/2024/063	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
271393fa-591a-4439-91cc-8fa30014af9e	IM/2024/063	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
046e2006-ef4a-43f6-b55a-845989996c2b	IM/2024/063	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
244d884a-6e84-404f-aece-b581a9f3478a	IM/2024/063	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
bcdfb9f3-f863-48e8-b74a-dc44a1eb8df4	IM/2024/063	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
0fb916d0-1d10-4bb5-abc3-d3a704736016	IM/2024/063	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
c8b2bf99-686c-48c4-bad2-e549e185d60b	IM/2024/064	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
36aba47a-46c7-4165-a3a3-f5ded6ef4c1d	IM/2024/064	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
e928640f-98aa-434b-adb8-8c3286cf692a	IM/2024/064	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
27bcb942-2c83-4212-909b-f57aa23167cd	IM/2024/064	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
208328a1-3102-4f2a-83b5-005a4968a5ae	IM/2024/064	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
c194d2c9-9aa3-4cb2-bf10-551395e284ac	IM/2024/064	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
b5414edd-1065-4e79-a559-5afaad6e9827	IM/2024/064	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
c8322d5f-ceb7-417f-80af-299731233a42	IM/2024/064	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
7ae43284-615e-4dd7-b470-e2f32fe5d357	IM/2024/064	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
47952502-5705-4f91-a25c-829181e8d8b9	IM/2024/064	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
5f80c858-43a5-4481-aa09-06fe8cc0333d	IM/2024/064	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
51294591-ed3e-422e-a229-da98bcd851ac	IM/2024/064	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
b11ac2c3-8d63-4041-a330-abec17c0b47d	IM/2024/064	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
1542b6d7-2498-4db4-87e7-7e480ff0f86d	IM/2024/065	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
004f8dfd-3b4e-4a2a-98c0-d3dddb90361d	IM/2024/065	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
6fc1ca0e-4a2a-4404-b219-cd58cd358847	IM/2024/065	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
1adacab6-422c-4703-b1f5-6880eeda7895	IM/2024/065	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
116f3610-691e-4f17-80eb-e86adda592d5	IM/2024/065	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
cfa7e631-bb05-429d-a971-d7e352475a53	IM/2024/065	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
a1eb995f-a239-4bd6-b19a-30eca41c3b2a	IM/2024/065	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
9fe03692-b62f-477b-ab37-f999a8e5982d	IM/2024/065	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
360e8aea-dff1-49a2-ba86-e5d0e00ef7ed	IM/2024/065	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
4e69b333-af67-4918-aa18-edc5e7050674	IM/2024/065	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
697b8b1b-34e2-46ed-b300-dcbc6e6a6580	IM/2024/065	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
8f6b2695-54cc-4c26-907e-f92aeae0cf81	IM/2024/065	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
d50ceae6-104b-4df7-a535-5b113bae1e1f	IM/2024/065	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
8b0f96f3-b204-455c-bc4f-75acae86d48f	IM/2024/066	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
477e323b-9abf-488c-9bf8-f05de04eae1e	IM/2024/066	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
ad9345e9-8031-4736-af01-7167de56a2e0	IM/2024/066	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
ade8f9c1-76ec-4098-8ffb-fb637856007b	IM/2024/066	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
4f513f22-61a8-4bcf-8d47-0d5a3f8634e5	IM/2024/066	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
29c5e51f-6e0b-4fa4-8714-4b9d9bec9ea8	IM/2024/066	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
8a163d49-d9fc-42ab-a9ff-4b5ca347421c	IM/2024/066	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
d242c848-2ba2-4489-892b-de5e242ac302	IM/2024/066	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
1f863b02-7b7c-484d-9a29-66f3fdcabd56	IM/2024/066	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
c132f365-1ba1-4f81-b8a8-faa9be727b7d	IM/2024/066	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
7dc3c50f-dcd0-4332-bb94-7eb62a2631e3	IM/2024/066	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
87333d6a-4b15-4dc6-9043-c923afadaa72	IM/2024/066	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
16f7c408-ab03-4843-87a5-bf2ef3a3dc5a	IM/2024/066	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
694e8065-b7ce-4986-9a83-3ca27babd1f9	IM/2024/067	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
a0755940-4046-4158-bd77-6e9f909bec72	IM/2024/067	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
90b7c62d-a2b0-4b4a-b603-9dd479a44fe9	IM/2024/067	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
6eab1834-b70b-4971-b7ad-4ff00f0758ec	IM/2024/067	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
bf219f8c-1764-47fc-8771-042abc628e53	IM/2024/067	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
ce116f60-e406-407b-9ba1-ad7fc079b2cc	IM/2024/067	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
300094fc-10eb-4d12-975f-610d4e06fcd2	IM/2024/067	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
dd343a5a-a885-412e-a654-3e46dd0ef136	IM/2024/067	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
608aade2-a31a-4aa0-8575-7148e2574f0f	IM/2024/067	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
461bc5f9-4313-4014-91fd-878084c7f88b	IM/2024/067	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
4cdb88ba-7d99-48ea-8805-0db5e5e0a940	IM/2024/067	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
23f4d262-cb29-4c2f-8ffd-0a69073d1544	IM/2024/067	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
86f9277b-25c0-49f3-9023-bd49fc54eaed	IM/2024/067	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
dbcfdfee-8b6b-4a19-b252-7cd07f7d30f3	IM/2024/068	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
5e0c5436-8bc5-4f97-8433-e10d0b39b934	IM/2024/068	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
ee961edf-5a4c-4334-bb54-3a800c727752	IM/2024/068	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
723d7496-5c70-446a-92a0-6a141f72c7dc	IM/2024/068	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
97ae6c8c-a06e-41e8-9192-a6311716b0b5	IM/2024/068	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
ae22eec6-6431-4264-8d28-bec3d4bad8a6	IM/2024/068	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
5cd5ac7a-864d-4ed3-bedc-1ccc7c1c8404	IM/2024/068	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
8c561a6d-1e04-49aa-a99a-16faf5780481	IM/2024/068	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
b84a2c72-2246-4828-a55e-6235adeb09f3	IM/2024/068	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
18b36766-42b0-4610-8c86-751d6dcfa76f	IM/2024/068	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
65a788d6-7271-4d21-afd3-8eefb14108aa	IM/2024/068	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
3c199b40-97d3-4b81-84c3-d6006b664772	IM/2024/068	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
440c38f9-5789-4449-ac16-7ee646b8f5ad	IM/2024/068	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
bef786a3-74b9-4d33-a80b-bf876532d235	IM/2024/084	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
4014f6a0-85d0-4b37-bdfc-5368e383b237	IM/2024/084	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
68158dd9-aa03-4033-aa5d-2a8bdb96b2de	IM/2024/084	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
012fd662-a099-45b0-a547-041be109cfaa	IM/2024/084	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
c2b80cf0-3a27-45c1-a6d0-809902da7708	IM/2024/084	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
a8e893b3-71c9-4e33-8770-d87f8853b028	IM/2024/084	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
32098978-6907-4ae5-bf01-d8d811291886	IM/2024/084	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
0fba7fcc-c5c8-4ac7-a883-cea86bc0a426	IM/2024/084	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
d9a08915-9569-4aff-8844-a0bc3ad28650	IM/2024/084	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
4cb6733d-a951-4ce3-b8ed-ed87b2c47e04	IM/2024/084	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
f7c78ba3-e33b-44b3-83c6-99e745fd09fd	IM/2024/084	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
130ca637-e552-4e37-ab94-cbf6827e44dd	IM/2024/084	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
8170efef-1048-433d-af32-12cbe75dd921	IM/2024/084	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
5d8ed8b2-4a47-42f0-bc78-9732fe14c716	IM/2024/116	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
4e79b89a-2c19-42bb-8bf1-9aca3b2e2ef5	IM/2024/116	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
47ec3ebc-6a43-4e9e-bc88-ca86e8d1806a	IM/2024/116	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
3ed36c9a-b0e9-4ace-a654-d5b1866d2157	IM/2024/116	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
61e099c6-cce1-436c-b748-b2196b04e92e	IM/2024/116	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
cf4de5a3-e67b-42e1-9516-c37573f38807	IM/2024/116	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
cf150251-e92d-4a3f-a8af-b8cdf1f79593	IM/2024/116	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
0e3a00f7-7f16-4f07-bb79-2682dfcba365	IM/2024/116	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
a3a829de-fa42-4e32-bbe0-fad462490627	IM/2024/116	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
cd298c39-ad03-4539-a0c3-34c7a57219d6	IM/2024/116	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
5f463168-a416-429e-87f6-bfe87937883a	IM/2024/116	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
77e5d4f3-5c91-4ecc-9685-9b1354d8b8a4	IM/2024/116	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
a1e51f13-efe6-4b8a-89c7-84d68fd6226a	IM/2024/116	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
a841aa9f-0ebf-4a14-91d2-43c37b94cbb5	IM/2024/113	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
4f68b8c2-c2c2-44ed-a27c-0d395678df9e	IM/2024/113	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
7ba9a12e-ef8c-483c-bb78-ac0b43b76f98	IM/2024/113	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
29582766-8135-44f8-88ff-510169296296	IM/2024/113	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
cc7faf6e-aabb-4bc1-8715-1eb34d056e8b	IM/2024/113	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
1152f358-bd2c-4664-88d1-b427d5a11f8b	IM/2024/113	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
4f1ae8ed-1727-4253-a7b4-757a6432fdab	IM/2024/113	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
72ac6e5f-63e3-4098-92a4-7b34016ca433	IM/2024/113	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
78f99b83-5176-4031-8b32-51eee02fd24a	IM/2024/113	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
5f77e375-03d0-49f9-97cf-02bcc79774b1	IM/2024/113	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
72e6e693-2233-4062-bcfe-004a5651d1f6	IM/2024/113	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
3206020f-96e9-4d22-b54a-90df1da6119e	IM/2024/113	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
607c8f79-8dcc-4d1e-bebd-fc7d7c8e1a86	IM/2024/113	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
b7609b08-03a1-477e-955c-c24f90165fe1	IM/2024/114	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
2f29ff51-49ab-48e4-a5b1-e7a3f0587304	IM/2024/114	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
cc35f0e7-ee0b-429c-aa9a-6a27e2763c88	IM/2024/114	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
8c6fa61e-2653-476e-83ef-0047833771cc	IM/2024/114	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
c91452a3-6a2e-40dd-a8e9-60de7c43044a	IM/2024/114	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
076366eb-89c4-4313-8ee2-f3cc381281fd	IM/2024/114	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
6e7b3e87-8188-443e-87c5-d6e396b7b4ca	IM/2024/114	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
92011ac4-67fc-4798-84a1-e50a6b6f0013	IM/2024/114	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
8bf1f8db-fc0a-4958-ba5f-24a51c5b2a8f	IM/2024/114	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
22fe910b-2727-4e36-916b-dead570967c2	IM/2024/114	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
95b451ec-ee53-4009-ac8f-ceb9c4e0a539	IM/2024/114	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
c5808a33-b3c8-4454-8361-35098888a8c5	IM/2024/114	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
5985e34d-9412-4252-9808-855d52fc26d5	IM/2024/114	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
07b6d3a7-0daf-453a-b3ef-0945d4e613b0	IM/2024/115	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
a14d07cc-2c40-4791-a868-f467274ea626	IM/2024/115	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
b1c91850-a4ef-47a6-b14c-8307a7153ecc	IM/2024/115	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
f2613b52-f962-4768-9abb-ff0479d995eb	IM/2024/115	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
a0d0dc45-1b10-4dc2-a66c-4022903538f1	IM/2024/115	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
6dffa325-1ff9-42df-b36c-06239fee20ac	IM/2024/115	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
3a6fb95b-9f13-4725-b56a-e7318350395d	IM/2024/115	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
226ea17c-560e-409d-a178-3317f2d03f3c	IM/2024/115	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
e778d0aa-ea8d-4247-8778-3a6b78e60b6d	IM/2024/115	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
38adb339-7da3-4579-a744-6301c74a61d6	IM/2024/115	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
25d760af-5f78-4d40-863c-bcb98780443f	IM/2024/115	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
48fb86b4-c6c7-4888-9b65-0a6256a3fb85	IM/2024/115	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
3c4a7d07-0273-4082-ada9-8e259df433f3	IM/2024/115	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
37edccd3-e7bf-44e5-90d1-ab249a648ab5	IM/2024/011	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
d5999451-0928-46c9-9a06-fa8006eb3e3e	IM/2024/011	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
0dd4bd35-3b00-4d48-a1ed-55b088b5f7c5	IM/2024/011	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
930aca02-aff6-4a89-9b09-b57995c3bb77	IM/2024/011	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
0c70ef8f-caf9-4289-9682-b87c16ed7724	IM/2024/011	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
381f51d0-3225-4a3d-9e7a-87e640e3a023	IM/2024/011	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
c322da19-3d27-498c-8d23-1f315e62ef8f	IM/2024/011	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
1edad785-e076-4c7e-9c83-92b089483541	IM/2024/011	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
44adc4b6-480a-429c-a7ec-819717627cc8	IM/2024/011	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
a7b963e0-95ef-4ebd-a6a6-78ae5f586202	IM/2024/011	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
e800ba64-0a5c-4233-8636-a19a4e921453	IM/2024/011	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
486273b3-5407-4503-91cc-1a28eb1b91b0	IM/2024/011	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
aa1a12b2-335f-4582-9a41-a6745d60ebba	IM/2024/011	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
26080126-1476-49ca-9b99-3f89499bf443	IM/2024/012	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
b8fec8d3-83d5-46a0-a534-0632b28fd597	IM/2024/012	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
c5232b04-0476-40af-b4af-a1968864e070	IM/2024/012	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
bbb55d25-0c81-4941-98a6-e897c078c8f7	IM/2024/012	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
083aea3a-1549-474d-9a81-ed385bae60c5	IM/2024/012	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
c063b259-6de6-4b62-b27d-b7926bb02da5	IM/2024/012	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
db7583a1-40a9-4444-8ee9-42e6aadc8392	IM/2024/012	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
51428ca4-23e6-493e-a79a-11748641750b	IM/2024/012	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
65a5485a-8856-451e-bef1-7c0ecdef4e19	IM/2024/012	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
c7a0ab34-9cb4-42da-bcc8-7c8ac82bc145	IM/2024/012	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
387d4324-4798-448c-a017-f58dc848b675	IM/2024/012	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
94ad587f-8db9-4f7d-bbff-68b41cf90265	IM/2024/012	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
c1822863-b3eb-47e4-baa6-8ffee3f652a6	IM/2024/012	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
43f387d8-3fbc-4956-9a08-bd3eab8515e0	IM/2024/013	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
3dafbffc-2de2-4d37-81df-67dbb26dbef2	IM/2024/013	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
09d73a3e-2d5a-4b32-bf58-484a66fcff55	IM/2024/013	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
2a95374d-790d-4160-b792-68c94d24698f	IM/2024/013	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
54fb611d-310f-4210-8330-d2a4b7d4a9d0	IM/2024/013	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
7ee3ec79-5a76-4c53-b8e4-e967481b510c	IM/2024/013	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
fbdedc08-0738-4f46-8a4d-6ff77c1579f6	IM/2024/013	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
8811515d-b80a-4a66-b5a4-c92deec9037d	IM/2024/013	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
3f4cfb53-f698-483b-a790-847ca2fb43f6	IM/2024/013	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
9c4b83b9-affb-4096-b1ca-8287ceb8931c	IM/2024/013	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
96627bd2-66e0-4ac9-81c0-442545d125b2	IM/2024/013	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
3ed8509a-cab8-4ab4-b13c-12dc87c3bb99	IM/2024/013	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
90e56b75-c414-4e37-85f6-d9f49bf07697	IM/2024/013	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
d2350321-4fa2-4269-937d-48f425b04e66	IM/2024/014	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
b6a56f3a-ec74-4fb5-9c57-f4923f4047ad	IM/2024/014	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
3d85b70a-2964-4cec-9068-7f261421b114	IM/2024/014	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
4cc32bd8-01e4-4efd-9739-94886bdf9f9a	IM/2024/014	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
714ce26d-b6ad-4c33-880c-4c3a5a17ed7e	IM/2024/014	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
88de0e32-da94-4974-ad6e-e131134c953a	IM/2024/014	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
8811b0e5-57ea-4969-9856-8a9bf83a1c43	IM/2024/014	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
66678f6c-4094-4881-83b1-dc4b038b0df4	IM/2024/014	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
9c209691-5d57-4424-875f-d2b80e3f357d	IM/2024/014	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
bd78f751-940f-4c46-b68c-da519c14d79d	IM/2024/014	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
7246d6ea-b88a-40a9-a0c2-678f559955ec	IM/2024/014	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
5c935f80-3182-439a-9dcb-381a5dcd7120	IM/2024/014	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
a0f56331-233d-404a-9b55-ff2417eb360e	IM/2024/014	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
3aa98841-861a-4e41-9586-19da4796e59d	IM/2024/015	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
0608546f-0989-44a1-9f42-080cea09eef9	IM/2024/015	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
6605a96f-0077-44a7-bf37-4a81c9e399a8	IM/2024/015	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
b3a6d8c6-6c33-4c80-9603-63921488719e	IM/2024/015	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
a1d1e4ba-d3ad-4055-9853-f14a3d399c26	IM/2024/015	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
abd11790-f06a-4888-8dcf-8ff7f66ce1f6	IM/2024/015	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
ee94c378-05fe-4fd9-909a-0e82b377214e	IM/2024/015	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
a716a982-c46a-41b0-a098-73db561658c8	IM/2024/015	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
4c0402bb-8c0e-4c80-a835-ac1dc3e723cb	IM/2024/015	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
675ec49d-5a46-4738-af7e-c1e1999ec63e	IM/2024/015	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
67eb896a-86d3-4073-9492-5e4d424d5f30	IM/2024/015	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
5d5a7d2c-188f-400a-b502-61782a87e297	IM/2024/015	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
02d5e63b-f961-49fc-823a-58ae65c30970	IM/2024/015	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
aae50583-94c1-4a01-af32-fbb74e4e8ebc	IM/2024/016	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
dbc3a94e-3b20-4c20-ba9f-127954fb16b7	IM/2024/016	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
90ad37ba-d977-4357-9ba9-6364b362686a	IM/2024/016	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
ba44505a-f4bd-4c92-875a-ed4e04c45035	IM/2024/016	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
b7701beb-0359-4556-8e7a-2fc1b402f7cb	IM/2024/016	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
66cc8ed7-bde1-45b9-ab74-5c3863cf5581	IM/2024/016	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
4a637603-1afd-49e0-92ea-813f331204b4	IM/2024/016	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
554d7832-1661-4cbd-80d1-9b7b24d08694	IM/2024/016	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
fa746fe8-cd8b-4622-ac60-e79f69cf9b6f	IM/2024/016	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
aa6222d3-d937-47ac-9f4a-4d3122e11430	IM/2024/016	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
71bc9f40-fcaf-4254-b5b8-5f0f7a12f766	IM/2024/016	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
0c726a23-7a81-4f9b-9e99-6f85276f60f7	IM/2024/016	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
bf3e6866-0059-4a82-8bca-b43719449de4	IM/2024/016	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
1651bafd-bf76-4f4e-a2b9-49dbe5668c25	IM/2024/017	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
30b7f0c5-a9a8-4102-828c-6cd36db2e377	IM/2024/017	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
113e7fe9-4332-44a7-84fb-f8578e2f6a53	IM/2024/017	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
bfbade3e-b2a7-4144-9d1b-fa4879db105c	IM/2024/017	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
de45fa46-ffad-4b1e-9311-8ce4efab37d9	IM/2024/017	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
b30a48b6-438d-444b-982c-19587156a09c	IM/2024/017	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
b7851354-163b-4066-94ac-d1ce0e29c6fb	IM/2024/017	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
e6e59c82-182c-487e-8b06-4a026be61ee9	IM/2024/017	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
28d75937-b0d1-42de-b9f1-0e52e0e4d401	IM/2024/017	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
d8080623-bbd0-4425-8d03-04cdf09be14f	IM/2024/017	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
23ba4f9c-a656-4eff-9e74-bada7a5ac7cb	IM/2024/017	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
63db316a-4729-45c5-97d2-2c97352ead4c	IM/2024/017	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
6e428c48-ff2c-4bac-a98c-ecf1a04d6a0c	IM/2024/017	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
5858a4d5-3725-4543-a8e0-d5505c78a342	IM/2024/018	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
ec2edfa5-6911-4b71-8d0f-15f012e0cd35	IM/2024/018	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
db0d8ba4-c2bd-49b7-8677-6d351a486cb2	IM/2024/018	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
60c6073f-7e91-45dd-81f2-3d08f4c258de	IM/2024/018	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
cd8614b6-a5e5-4355-b33d-c7ba8b1a3ec4	IM/2024/018	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
576cd767-b803-4fe1-8941-18d1b02ea348	IM/2024/018	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
5167f18f-b496-4f71-8867-9b5365e9c854	IM/2024/018	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
8a4d365a-78b5-43a5-9e50-1b71e7dbdfcc	IM/2024/018	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
1ecbf537-98aa-4fb4-b526-9a5d9e557710	IM/2024/018	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
6282d3d2-bc79-4758-9d99-c040db7cdd48	IM/2024/018	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
c59bf956-55bf-46fc-bbdc-4c2cefbb99fa	IM/2024/018	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
0eafe1ae-21b5-43ce-924c-b8e622ff2ff8	IM/2024/018	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
072c7c06-093f-4f2a-80d7-97c79fdcd96b	IM/2024/018	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
2ef7cd8c-fd5a-49ac-b850-638c850a7582	IM/2024/019	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
86a3065c-c221-4833-83fe-fc54e8e5d807	IM/2024/019	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
9c46584e-6b95-4b0b-bcc3-e42d03e52496	IM/2024/019	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
a0849a99-929b-4d96-8612-2468e77ce872	IM/2024/019	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
c638ab40-b0c1-4026-aa68-3fd8a0933996	IM/2024/019	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
46bd738f-92df-4509-9858-48e304bc84e8	IM/2024/019	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
83f8a66e-a4f1-496f-a55a-98da1da571a5	IM/2024/019	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
fa500bff-973f-4744-9611-804d7df0a095	IM/2024/019	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
794d6dba-9692-4a9c-971f-3cbbff207efd	IM/2024/019	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
c87a6471-45d5-4e9e-b64f-0e864e8a7f40	IM/2024/019	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
9d80e349-bc9c-4d7b-ad4a-6d0018b404a4	IM/2024/019	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
e39d5623-d0c6-4c9e-bb07-ea3ec127522d	IM/2024/019	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
613e40ed-464f-4e05-9e17-5fc58d490a2c	IM/2024/019	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
a1b25d2e-c452-4d46-87cf-da1784195de2	IM/2024/020	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
98de5d21-6696-44fb-b2ce-98032ec82c87	IM/2024/020	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
2545a8e4-132d-4b49-83fd-ae88f16be7b4	IM/2024/020	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
f0b5d428-e478-4533-ad2c-ae60e229a8d7	IM/2024/020	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
96bf3114-e615-4b4d-987e-5e70a3bc93e9	IM/2024/020	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
83347cce-3242-4ab1-afcf-08f5ccf0bf3b	IM/2024/020	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
0f797b02-35e3-42d8-afbe-8d8f760e8951	IM/2024/020	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
b5e1d853-8d13-4ca7-970a-a66f2f1f81a9	IM/2024/020	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
9376ea37-6c81-466a-92c4-d804da81065b	IM/2024/020	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
35b43391-e9b7-41de-bd8a-25b43df20363	IM/2024/020	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
c1f343fb-aae0-4a2c-94fc-766b31b4044b	IM/2024/020	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
6d0cbfd2-c39c-4fdd-ad3d-2492b1fe6659	IM/2024/020	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
ec718407-cad7-4ea7-876e-18394bf9bf53	IM/2024/020	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
4c5b2114-70d7-4c28-ab61-55c55cc178a5	IM/2024/021	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
460c32bc-d10f-42b6-b838-5de16b8c94e1	IM/2024/021	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
b67508df-28e7-41b8-a96f-fd24ac5f1c8e	IM/2024/021	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
fb74c55e-cbe8-45ab-ae5e-c89d757dc5ab	IM/2024/021	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
01659f29-8875-47a6-861b-1cb9b75a7577	IM/2024/021	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
4ac57468-b8a8-45dd-bf44-1b7d6429a5a3	IM/2024/021	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
f3248527-8793-428b-bc11-05bda4f21dff	IM/2024/021	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
4a711ef9-9ed9-40ef-b0f6-a2d9f1689bb1	IM/2024/021	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
80b38042-8cb0-44f8-9ca9-344faf5719ed	IM/2024/021	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
f0e96bbb-a5cd-42ce-9f15-90cf16626c62	IM/2024/021	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
87067efd-b02a-49bb-9ac4-0b6d6dec4f3c	IM/2024/021	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
f07cf5c4-7fc4-4633-9921-26b73e42ab9d	IM/2024/021	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
07a3aadb-2ed7-42da-8892-20abd1c34106	IM/2024/021	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
1402626d-9c6e-4d73-9a14-da6c2a9e4396	IM/2024/025	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
634f5c97-c278-4c09-a780-888009c8309f	IM/2024/025	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
d3204eca-a29f-4095-ad73-bd264394eb3b	IM/2024/025	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
c227f740-7e85-4b56-9a37-2da279567225	IM/2024/025	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
c0866378-fb28-4375-8c2a-e87e8a7ac169	IM/2024/025	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
8ac70229-2a96-48e3-a564-075233811b9e	IM/2024/025	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
913a8d36-f399-419f-8963-44366f1e8e2f	IM/2024/025	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
7906b492-0dfd-47bb-b16e-a77055db115c	IM/2024/025	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
0ee89378-10d1-40ce-8c47-cf1fe8974f57	IM/2024/025	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
2a01dda1-223a-49a0-b992-2fed7c6526ac	IM/2024/025	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
0bd262f7-d994-428f-836d-845f910346aa	IM/2024/025	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
2da783d2-7529-4431-9125-1a012ad5b2ad	IM/2024/025	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
45bbf099-28b0-4125-908c-0bce8400c2d4	IM/2024/025	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
40674a64-944e-4847-b962-1d698927c019	IM/2024/085	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
76760239-feff-4e0b-88f9-ac6976791498	IM/2024/085	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
b08a2272-4ce2-496c-802f-a9288aa58834	IM/2024/085	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
a45c7da9-3bd8-4a7c-84a5-cd2e92955eb4	IM/2024/085	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
ade6864a-0be0-454c-bec9-17cdabae959b	IM/2024/085	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
cc46e452-7b6e-42c6-8456-5e2cc09498d8	IM/2024/085	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
522efdc5-06bb-4c8a-9a33-804adea5a7bc	IM/2024/085	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
6bf1ec9d-e923-4f33-b73a-18896d0f4961	IM/2024/085	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
d47aa956-608f-4c73-8aa3-93f8cfc2a23f	IM/2024/085	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
cd8d63b0-838a-4143-b53e-92ab71226f4c	IM/2024/085	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
7dac6d6f-291f-48d5-b8a7-b6752ca3498f	IM/2024/085	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
f7b41a73-5f20-4fc2-b20b-427df3913a1e	IM/2024/085	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
934bdd4f-5ef4-4ad5-b12e-12662ece1413	IM/2024/085	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
3c51c07c-3eba-4a6c-9c72-1d15397a89d6	IM/2024/086	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
60364f86-b17f-4cdd-8ace-4d1c6246300f	IM/2024/086	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
f3f60f39-b9e1-407f-bb15-1d3355602150	IM/2024/086	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
a2a79561-c15a-450b-83c8-c154b84fce06	IM/2024/086	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
7dbbe9af-6f6b-455e-ba44-c8f6add1a42c	IM/2024/086	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
0dda2986-6d07-4c46-92dd-b241515daac3	IM/2024/086	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
765d56f1-18e2-4179-b2cb-07c4dfab427d	IM/2024/086	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
7d24ea07-6a10-4460-8ef7-246ea00b6a8e	IM/2024/086	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
14ae42e5-7b68-4026-8fad-a7ed53921427	IM/2024/086	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
16fd27fa-fd8c-4dd2-85dd-9951c736db5a	IM/2024/086	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
c57c4796-1e47-4a40-a016-a1d4dcf15a04	IM/2024/086	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
ffc4731f-63b3-4786-bd97-fc1127401933	IM/2024/086	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
ee172e2e-6ebd-4ef5-b82b-af4a89d71646	IM/2024/086	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
b79e58e3-57ff-47c2-b66e-c64077809d74	IM/2024/087	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
d6fdb928-579d-489c-b28f-5af4dd73a167	IM/2024/087	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
3bd5cb6e-c41e-424e-9614-8c7fe4212453	IM/2024/087	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
ecbd9198-b74d-4e87-ba3a-18cd46d40164	IM/2024/087	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
33f4fb8b-eb3d-4c67-a5cb-9f988b9aab41	IM/2024/087	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
1abad485-efc5-4d2b-a1fa-a1449473175c	IM/2024/087	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
6ae6a7f5-c0a0-4572-a3b7-ae9c2176bf20	IM/2024/087	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
ce5f2f34-829e-4dad-8282-c49f328df1fc	IM/2024/087	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
77b62247-aab1-4a44-a1cf-8057aea0098e	IM/2024/087	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
c6249661-9153-4852-b8aa-7f4dfa372089	IM/2024/087	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
e1412954-d597-45d6-b547-491ea583c199	IM/2024/087	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
3e871a41-234c-4f74-8d42-4e7c1334f20d	IM/2024/087	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
b2607f2d-fa00-4341-9d55-705480e0c8cd	IM/2024/087	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
a65f5159-0970-4025-9d71-d249df863446	IM/2024/106	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
f521d61b-053d-4fd6-8df1-165ba45cea29	IM/2024/106	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
b3a858f4-75ca-403b-a2d4-b4a16c084e75	IM/2024/106	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
0c8b349e-8fcd-4522-ad42-db38d788887a	IM/2024/106	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
29fae859-31f8-4bdb-a9bf-d05352cbad3c	IM/2024/106	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
9322e786-953b-465c-8898-dbfc74502881	IM/2024/106	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
4f2a2761-b99f-4900-ab7b-f0fd90bf0a45	IM/2024/106	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
65446bd4-f374-4aa3-939a-64f08a1a7bb1	IM/2024/106	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
85044502-0382-4a33-a334-5d97fb956096	IM/2024/106	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
8e300ae0-eb21-4a89-9670-e49bb2fa59fa	IM/2024/106	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
8043c57a-e873-4fda-b1cd-c41ee76ffeca	IM/2024/106	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
ee30afcb-a2d9-4f03-b04c-f544b4ac2bc2	IM/2024/106	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
277287f8-fd46-4d07-86a2-97b37d5bab84	IM/2024/106	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
27cb9377-e1b8-4dc5-b494-4d838810c535	IM/2024/107	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
4e1068a2-1f7d-4677-8bab-6d4d4f785529	IM/2024/107	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
fa662fb9-cd87-48ae-b86a-1bc3b4474deb	IM/2024/107	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
33f30d2b-2913-4f16-a77a-5e6ee2a721ad	IM/2024/107	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
2a2a940c-eb47-4817-bea6-4ed9faa4f9b2	IM/2024/107	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
2cb0530c-2384-4ee2-92d2-85e954c50f25	IM/2024/107	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
d6acff62-7f06-4c73-a7bc-34adf402b25f	IM/2024/107	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
e0950ac0-918b-43cb-ad69-b55b687162d2	IM/2024/107	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
51d8b462-2a86-43df-b43b-ec83cdc490b3	IM/2024/107	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
7338c5d9-d684-4778-9c4e-2632057b6647	IM/2024/107	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
c3ece1cc-d69b-40ea-8e8d-26d262c85226	IM/2024/107	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
4e15cbd2-0bba-4eb1-9499-202eda623316	IM/2024/107	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
35828a9f-c096-4624-914a-dd85fc924f71	IM/2024/107	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
bcc7e9c9-76e6-4545-9718-98074e3deba8	IM/2024/001	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
4ec0afa7-1374-407e-b81a-91be8aa64bf0	IM/2024/001	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
dff58d9a-1a3f-45f9-aec5-340c0867caea	IM/2024/001	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
b83e6e1c-3eab-40e0-930e-9540cbd71e11	IM/2024/001	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
ff2fc577-44f8-4157-90fd-edef783c1e5b	IM/2024/001	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
1ff47bb4-c3f0-49eb-91ea-19e433f3e233	IM/2024/001	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
ba9fe9d7-7d00-4a40-a8a9-52361ba95b9e	IM/2024/001	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
3deb4437-5c10-4c4e-beca-947ac22e5341	IM/2024/001	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
2cefc80b-b990-459a-b1c7-5029c13af203	IM/2024/001	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
ad59c328-ee6c-43ca-ae8d-5289b2757ffb	IM/2024/001	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
ed006e67-ee6d-4d41-9867-2dae48e497e2	IM/2024/001	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
fadd57b5-d07f-41a7-81ef-6ecf366f5009	IM/2024/001	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
c25c0129-c364-4466-892d-5008a8402fa8	IM/2024/001	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
ab3a0473-c940-43b4-b6a6-481894aacd52	IM/2024/002	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
d34be89f-bd06-43f2-a83f-7e970f5f3990	IM/2024/002	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
18186d9e-49f1-4207-bf1a-21710bc45979	IM/2024/002	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
1dddd710-911f-4f10-aec4-335eca07aedb	IM/2024/002	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
6ac2ed41-8277-44f0-80ec-e0ee4426094e	IM/2024/002	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
bca16236-196b-40c0-bf12-ef02cc03ff5e	IM/2024/002	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
3ed135be-f571-470f-a9b4-025cb2ee470c	IM/2024/002	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
60207f1f-ab72-47d5-ac16-14d22ebd2188	IM/2024/002	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
8a15d630-e6aa-4d30-be30-2dd2dc971701	IM/2024/002	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
5570eb67-0973-4e1d-bcd9-5f02b99e04dc	IM/2024/002	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
e68525d2-27dc-48ea-89ad-4d4d58f3cfd6	IM/2024/002	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
bc3835bc-ae06-41fc-959e-147fe153b3ac	IM/2024/002	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
5c69e29b-298a-46c2-856a-148b0a6103a2	IM/2024/002	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
3fdbb4f2-10a5-475a-964d-fba795892b2d	IM/2024/003	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
0f549a7f-f978-494d-9c6b-59c73b342cc9	IM/2024/003	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
af777fb0-09df-4a1a-9355-84129e77dc3a	IM/2024/003	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
95d3f550-0655-4b4a-8398-cc633f7b07f0	IM/2024/003	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
57dc2b6a-ef72-45c2-8761-05f46b6f74e9	IM/2024/003	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
595404f8-b542-4097-ab57-ccdd89700288	IM/2024/003	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
96f14987-19c5-464a-93ad-7df3868abb50	IM/2024/003	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
aa9c0111-6698-49af-b925-fd895d7a2c61	IM/2024/003	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
aa62587f-c9ab-4e39-8a48-0cdaf859d5bb	IM/2024/003	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
7a459e64-b290-4d2d-baa8-9d4330417cdd	IM/2024/003	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
1eb6836a-b8e1-4d9e-8d38-f48166e3560d	IM/2024/003	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
de98c027-b429-46b5-a2c3-8f0625bd5c4e	IM/2024/003	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
9c054e52-59e9-433d-886d-2034df181031	IM/2024/003	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
67d34ceb-8dc7-4a88-bbc8-03799069f866	IM/2024/004	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
a8965ce0-b6ae-4138-8b68-dd9ba5168911	IM/2024/004	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
902c0c1a-4353-4b2f-80fc-d4a8d7e50e57	IM/2024/004	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
61b54f56-c77e-41f9-8743-4472263fc86b	IM/2024/004	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
f941499a-0f2c-4022-9863-d038b6210d89	IM/2024/004	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
2c410156-5aef-4c8e-9de4-ece49b8318a5	IM/2024/004	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
24351b20-7731-4b87-8c73-8f5cf10c03e1	IM/2024/004	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
3fd760b2-7d27-406d-8ede-97962e198122	IM/2024/004	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
1f90f522-3425-47e0-94e4-f662bb0bf878	IM/2024/004	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
2f54b587-92b2-4d72-b52d-12fbb18903c6	IM/2024/004	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
15d70143-ce0f-4ff5-9452-bccdf155c1ce	IM/2024/004	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
6b20b797-10ec-447c-bce2-a0d098cc8851	IM/2024/004	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
827698f9-010b-4448-b8b2-753136f885c8	IM/2024/004	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
b914950b-97ee-494f-bf2a-e2abefc91672	IM/2024/005	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
763fb898-3427-465f-beb2-8acba00e90d3	IM/2024/005	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
fc03a62e-7ab6-4e80-9531-c43cf2539fbb	IM/2024/005	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
d04b6cc5-5342-4cb5-8968-c94289f98673	IM/2024/005	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
72a93af8-d0d1-44a9-83ad-5a1b26059c4b	IM/2024/005	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
7b56e53a-9f1e-4539-85e8-50a0001e2da7	IM/2024/005	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
70e7277c-408c-405c-872c-d4773b7e96b7	IM/2024/005	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
ecc4ead5-44fa-495e-98d8-bc803816cc9c	IM/2024/005	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
db4c1b23-9287-42e0-a373-6a410a985568	IM/2024/005	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
1c8b98b6-84f9-4354-a294-cce190e608cb	IM/2024/005	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
05869a40-babf-4bfb-8d20-7951afe8b56c	IM/2024/005	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
33c621f1-988d-4f47-8d0e-5b618ac64366	IM/2024/005	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
d17c96fb-eddc-4a5b-9df0-ca4336634cda	IM/2024/005	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
e89b03c1-b9d6-4bf5-9223-bf3f4663a21a	IM/2024/006	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
fa7cc7a4-49b9-4b4c-a7c2-23900ace022d	IM/2024/006	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
8df075ca-8b63-4a9f-884d-fa48f0540786	IM/2024/006	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
ba080656-8e75-42d3-a410-a7b0c4bcbbcc	IM/2024/006	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
c0bf041c-1782-4f8a-b895-6ed42dd6b189	IM/2024/006	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
a3163f57-e9c0-4edf-b90a-287117c37c39	IM/2024/006	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
eab2afd9-5ad5-4294-ac7d-9836bf784f47	IM/2024/006	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
c699f96a-cd8a-4e8c-858b-95a3b8c4a87a	IM/2024/006	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
77fee02d-f470-4f02-98c6-7083efa7c16a	IM/2024/006	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
266c6802-bf08-45b8-bc00-5efa906ac081	IM/2024/006	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
2333489e-3cc9-4b5c-9e64-2349d780bb3a	IM/2024/006	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
a080262b-c334-4491-9fbe-0b325854786f	IM/2024/006	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
308cd0b8-d9f8-4a05-a112-49ee47df3ab2	IM/2024/006	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
8baa1a14-8727-4554-9767-8efaacc252ae	IM/2024/007	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
7ad71b1d-a098-48d4-a44e-6be91f4b812c	IM/2024/007	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
75c14547-eb7a-48c6-91a1-209cf42b6f69	IM/2024/007	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
73a39345-21bf-4cac-b872-9054149724ca	IM/2024/007	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
c9cf4319-7bf7-4d63-975e-533f0447d211	IM/2024/007	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
3bfe4d42-a54f-4799-95c7-969785a14afc	IM/2024/007	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
3e3ad632-dd30-4df7-aefc-4c40751ce432	IM/2024/007	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
811928cf-cf02-42e1-977d-4fd7f33bee63	IM/2024/007	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
84b1b6d6-a56d-4607-be90-ec455a509bde	IM/2024/007	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
1bf9ac8e-823c-48ec-bf7b-812e956adf51	IM/2024/007	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
407ad81b-d1cf-4e5f-9f63-908593ea2ee6	IM/2024/007	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
835633ae-3b82-4542-82b0-dc93003ac7a1	IM/2024/007	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
612bada3-3d4b-41d7-8b8b-4f040db9d606	IM/2024/007	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
a3c21cc1-e71a-4e59-bbd5-4529862bf3c2	IM/2024/008	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
af0925f5-dcf4-49b5-b743-9930af1b2f3f	IM/2024/008	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
9071af89-b5e2-40fc-856a-464acb829f0b	IM/2024/008	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
8d27514a-df12-466a-b000-4eb591b486f6	IM/2024/008	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
02b64cad-eda2-48b2-bd18-759d4c4eab25	IM/2024/008	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
0cbee1a0-d834-4eba-a81b-5cbc482953c4	IM/2024/008	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
2774fe2b-eb88-4c9c-a494-3241a6c507a9	IM/2024/008	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
139d8667-1f43-4035-89f3-04d5b330dc5c	IM/2024/008	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
901159f9-fe3a-4f40-a3be-b18e8151e981	IM/2024/008	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
abeed21a-a19a-4705-8d28-4bbedad80a2a	IM/2024/008	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
de7aad96-1817-4b38-aaaf-429e05712b67	IM/2024/008	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
2f1e518a-c154-4450-8cdf-76924dfa19d1	IM/2024/008	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
2a252b09-11bd-4f9d-ac47-839eba73a668	IM/2024/008	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
3c724d1c-0770-44b6-8547-99bd2194d55c	IM/2024/009	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
60c96a8a-e130-4b39-b04f-5e7749819acb	IM/2024/009	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
4c4b0241-8bc2-43e1-af2d-f10308d3c87f	IM/2024/009	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
bfde9c21-ef3f-4973-b29e-fa9e980626a4	IM/2024/009	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
129192d9-47ae-4d53-8d00-07e5e5a66ca6	IM/2024/009	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
1c4f0850-03d3-4103-920c-a1247ca7cb84	IM/2024/009	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
9e2aab0e-849d-4144-86a0-97afac013a58	IM/2024/009	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
f6ceaa3b-1e01-4d24-9218-a38976fbd45d	IM/2024/009	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
457d73f7-ed8a-4722-aae2-33bf0114a4ad	IM/2024/009	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
a7362801-a14e-4cd2-ada0-175f0d834fe3	IM/2024/009	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
342ca1fe-2729-4fee-a346-69c7bf8faf72	IM/2024/009	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
8f2519f7-c4a9-4fc9-8743-1418d46424ba	IM/2024/009	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
d1800e02-092b-40c7-9f3e-8773a2848f98	IM/2024/009	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
b1eeb113-6901-4cb1-8dc5-0aaeca6c69ec	IM/2024/010	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
54d385de-2cfd-4c2d-8056-6fa1e1ef5d99	IM/2024/010	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
38f815a0-0167-45df-a8d1-29b439d226be	IM/2024/010	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
bbf7f710-faeb-43ff-87c3-45163fa3b7e8	IM/2024/010	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
4561670f-7573-4c58-ad5b-8d6c2e4f7b35	IM/2024/010	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
9aa63889-e05d-4fe0-95e8-771b20306be4	IM/2024/010	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
ee0f1c7d-74bb-4b96-8259-47f89b2cd6c3	IM/2024/010	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
347e8d72-92f1-4fcc-9ee0-0373417e6cb8	IM/2024/010	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
51bc9226-a7cb-41a6-81da-f46f94e550cd	IM/2024/010	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
53ca21ac-2236-4dcb-9b3a-06d066665026	IM/2024/010	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
4ff6c774-22b8-4390-a4b4-109901e177be	IM/2024/010	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
36cb8168-75d3-4dfd-9e32-d6a4e09d38e3	IM/2024/010	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
228c652f-1143-4d29-bfff-478eb3298696	IM/2024/010	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
594bd6f6-4491-4b74-89a0-75144b6cab30	IM/2024/108	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
61a0faf0-0c55-4dd6-bbdf-b13ffb84badf	IM/2024/108	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
b825fb6a-df07-49b3-a597-af8d95b4b4a9	IM/2024/108	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
14d129d6-a6b1-48f5-a205-1cdab71a7fb7	IM/2024/108	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
096ffb82-5e82-47af-9f43-96ba16150e01	IM/2024/108	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
f604ba71-6139-4546-9aee-2253a8338d5d	IM/2024/108	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
3183e4d3-4ef6-464e-bc55-fbf989ebe77e	IM/2024/108	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
a1c012b5-e6d9-48e5-adff-50b954895b3f	IM/2024/108	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
4e9f86d0-0277-42a6-a76b-b3dd7a6749e0	IM/2024/108	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
a1457f8f-5edf-4218-b3a1-f489074f7525	IM/2024/108	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
16169682-74af-4c84-8720-3510f2bb6cca	IM/2024/108	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
63c546f4-9f51-4566-862f-09966bc44518	IM/2024/108	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
aa2a93e9-9adb-4ae9-8085-b3c91d20f425	IM/2024/108	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
0afda810-ecac-4c2a-9780-4efc97d1e029	IM/2024/109	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
fd6071f0-5e70-4db5-907c-8008f828a535	IM/2024/109	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
86cec3dd-4118-4066-a90b-11ca4bacd338	IM/2024/109	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
bf229afd-461e-4123-8f30-2e3ea150392c	IM/2024/109	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
020a3a4b-1ead-46c8-aaa9-fdc8c34bde38	IM/2024/109	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
7083874a-3a99-45d9-903f-3fc7b98703fe	IM/2024/109	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
9e43be24-f639-493d-bd92-8496ef3a66fe	IM/2024/109	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
8827a8b7-b77f-418c-852a-1e49bcedc5c7	IM/2024/109	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
b9990130-ac39-400b-98a0-f792fcb78ae0	IM/2024/109	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
2954191f-b064-4a76-88d2-a3866ac0d831	IM/2024/109	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
51e30c4a-8f3e-4b2e-ba6c-022fef28d0f6	IM/2024/109	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
277904c9-a4b6-49d9-8ce2-183b1bd7bb45	IM/2024/109	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
1a1869a5-7130-4f55-a42d-6b68a6e20005	IM/2024/109	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
e43f2643-e730-4446-b479-f1675c5bf1b3	IM/2024/026	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
70461c0e-8eff-4328-98b9-87a102fe92d2	IM/2024/026	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
449cec4d-ab01-46f6-83ad-992339962d1a	IM/2024/026	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
616a5f99-bd0b-489f-be8b-b3dc520763f4	IM/2024/026	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
71b2baf4-352a-4690-a5cc-d9f7ee442fcf	IM/2024/026	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
fef1aa62-5833-47f5-9eb0-17f803c24fa6	IM/2024/026	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
10c43977-2ffe-4adc-85cc-42af68751035	IM/2024/026	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
9efcd66d-10e8-41fc-817d-1f7ec3a9ab0c	IM/2024/026	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
6373428a-3950-499e-a86e-27581905a3ad	IM/2024/026	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
70ebcbab-dd74-4087-94ab-630252b3b0bc	IM/2024/026	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
fd78d686-4893-48a2-a97c-60da8dc0ed2b	IM/2024/026	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
e010aa21-8f8b-4f6a-8b6d-bb28bee678fa	IM/2024/026	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
12dfc702-6475-4e4c-b24c-77bab11f2f34	IM/2024/026	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
52db1c40-c572-450a-8497-cea306272c94	IM/2024/027	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
b94d2578-41c1-4e03-bb5b-4fce63f59c22	IM/2024/027	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
7ccb76e6-f5a0-45c1-9408-de4609d0d2a9	IM/2024/027	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
666d3011-b621-413a-ab60-8f6906693feb	IM/2024/027	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
e46b9401-e29a-402b-a14d-ebf4d2e77d4a	IM/2024/027	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
7a0a0c75-151b-4099-8b86-0823378a4588	IM/2024/027	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
891a07a5-1fa9-4d91-b219-09f7ee748555	IM/2024/027	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
aed65b14-1ce3-43b6-b484-7d7eaec3a2eb	IM/2024/027	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
bb3ab274-0855-46f6-9727-e99a891c8527	IM/2024/027	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
fa7add6e-3e00-4a91-9442-743550fecbf2	IM/2024/027	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
e337f7f4-b7c0-4567-bb68-1ff37c1c2994	IM/2024/027	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
673f50de-36c8-4d8b-831a-71c763b62d90	IM/2024/027	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
93c80342-5fb4-4669-a7b3-d52c9970d7ca	IM/2024/027	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
8036b3fc-39aa-4cd6-81a2-b166dfe96864	IM/2024/028	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
442447c6-17f7-4546-b9e8-0b47e08be1f9	IM/2024/028	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
ea2c436d-91f7-47a0-927e-ec8fc0748818	IM/2024/028	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
d6704451-602e-495a-ba59-4ac5aa0b94dc	IM/2024/028	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
ad3b7a27-66b5-44d1-8bc8-1751047edbfc	IM/2024/028	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
24e9acb2-d633-4f35-b2a9-9c7f6ab1331b	IM/2024/028	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
47f7fee5-2f41-4bf2-ba86-7e47285ae29f	IM/2024/028	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
600476f8-c7de-43ed-9072-ec88e8b300bd	IM/2024/028	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
1a2d371f-9906-4d89-ac39-133440f1d4dc	IM/2024/028	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
46f932df-4cd9-4d46-9045-edf2b03b5d3b	IM/2024/028	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
6797e5e8-8648-4610-8815-bfbf3cbc10d6	IM/2024/028	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
1b423b19-ff0b-4c02-9d92-f07f08272db8	IM/2024/028	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
a003c939-46fd-45e6-aef2-bcb27017e824	IM/2024/028	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
eb0e8462-0ef5-4e25-b177-8cb50961bbef	IM/2024/029	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
2a7a0e07-1cfe-43a7-8f2d-226ad0c9b7ef	IM/2024/029	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
2e329e50-2999-4ae3-8e6a-e6c8e2ebbff3	IM/2024/029	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
2b72082c-ef3f-4536-a631-da180c03b591	IM/2024/029	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
4a3e5947-93c1-4163-b367-9c59de78c87f	IM/2024/029	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
c745506f-8e77-4ffc-8b5c-0bbf1575072e	IM/2024/029	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
e05088dd-b1a7-4441-bafd-69bbdc412fed	IM/2024/029	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
65f4f836-e297-40b9-a526-7b6f7f9baf1a	IM/2024/029	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
cdc7e76c-dd62-4c54-bcd1-161c6f9baa3a	IM/2024/029	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
9563a26d-a5ae-4b69-8516-2a5aec3571ed	IM/2024/029	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
5a01571c-a86b-44a4-b56a-c1b316fde259	IM/2024/029	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
36333ae4-20ab-4e93-aa4a-ab9c5103f8f1	IM/2024/029	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
0d59f242-c727-4c19-a943-2a561b33a9f3	IM/2024/029	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
664b972d-60ad-4c28-b2c0-0d9e268ab632	IM/2024/030	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
f5e9bc49-d142-449f-a86c-08981856de8d	IM/2024/030	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
bf8bce06-0b3c-40bb-8489-bfce93cb30cb	IM/2024/030	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
93a645bc-848d-49dd-84c3-5eadaf712db2	IM/2024/030	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
db5e6c54-6d6f-44de-a7d8-8f0b2bebd9b2	IM/2024/030	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
8f352f65-6721-4a0c-8e29-72f2323258be	IM/2024/030	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
8b2d62ce-7a3b-4cce-b53e-994cf3a4931c	IM/2024/030	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
b7aa57e4-8c6f-443b-a6c7-465c1603ed17	IM/2024/030	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
9c3fffd9-e0d1-4aa4-8770-a7c1bf996952	IM/2024/030	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
cfeabb2e-b6bc-4f7b-8a76-3719226ecd91	IM/2024/030	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
51acca0a-53c9-444a-b502-0cab97f07db3	IM/2024/030	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
bdefbf79-093a-4685-acf0-ec9f47175276	IM/2024/030	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
1fdcf108-5a36-4523-bbcc-2a91438acee7	IM/2024/030	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
9d66a502-22c7-48b9-9e36-4cc65f80e374	IM/2024/031	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
843b916a-0c5e-457a-b357-0beab99aa323	IM/2024/031	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
01e6f799-02ec-4749-abc0-1bb77298e9a0	IM/2024/031	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
40e2eb5e-f35b-405c-9cb4-de768f0fe360	IM/2024/031	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
1ff50480-be08-4c82-900c-ff02a0d0fa6a	IM/2024/031	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
a896ccf1-e975-4bac-8bd1-69e4513bc6b7	IM/2024/031	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
1f0a1a00-2a75-446d-8da4-fd1c7370d3ab	IM/2024/031	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
ce32a5dc-2bb1-48ce-b3ce-760d2a48be6d	IM/2024/031	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
baf74221-e067-4742-a7d8-44ff4d3c28c3	IM/2024/031	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
99d61a4c-cf0a-4755-87e5-67d9b5550888	IM/2024/031	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
6de00629-2ff3-44ad-831e-6c42934a7544	IM/2024/031	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
44514bb9-07ca-4a09-8bb9-e2204a3bcd5f	IM/2024/031	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
079aa8c2-c601-4786-accd-d2c40b5a7c1d	IM/2024/031	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
76270661-0300-4d26-b8d7-036516dee11b	IM/2024/032	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
3dde3579-892d-4c52-adec-614a09d21412	IM/2024/032	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
b4a2418a-28ba-46fc-ad69-4fac1ecb670f	IM/2024/032	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
badd693e-dee4-4309-9997-7ac8d7795b39	IM/2024/032	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
486be0ee-d146-4ecb-a7cc-b3ac1b62a6c2	IM/2024/032	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
36904b45-4614-4ec2-9f49-6735a4cd9e84	IM/2024/032	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
b35d4b7d-7215-4785-96fc-051b38bdc766	IM/2024/032	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
02d97b9c-97ec-41e9-b204-8a67e7e911e4	IM/2024/032	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
bfa640c8-35d3-47bb-8419-f67ce02310c1	IM/2024/032	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
472a6890-2958-495e-91dd-0763def14eec	IM/2024/032	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
afe2ae7d-3912-4418-98d4-77b1b458275b	IM/2024/032	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
b285265e-80ad-470f-a0cd-9a8f37f2d391	IM/2024/032	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
54c767fa-d514-4d8d-b309-019c922fe4d2	IM/2024/032	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
28ec0953-bb7a-4381-8f2c-f00a495d3546	IM/2024/033	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
7c26bd1a-ec8d-4784-b261-cf6c6f104b6b	IM/2024/033	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
24682e55-5ad0-481b-a72c-97b7225f519a	IM/2024/033	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
1a33af1c-3253-41fe-8f48-72fbea104965	IM/2024/033	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
fb48d262-2d7c-4da4-8f2c-de7a2e455620	IM/2024/033	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
ed105c32-27bc-4701-af26-59f516d16eef	IM/2024/033	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
19b78a8e-d88a-473a-bd8e-1621947bab01	IM/2024/033	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
11367208-9981-40a4-91b8-bd2c386011e8	IM/2024/033	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
eef52692-89f0-42dc-950f-03d7485848bf	IM/2024/033	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
7d52bdf6-c2fa-48ff-8fe7-8a678a5af6a3	IM/2024/033	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
4cb92bae-f620-4969-8a32-f80bedb61756	IM/2024/033	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
33d60cd1-2a95-412b-8cf7-ec8a54a45752	IM/2024/033	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
93f01689-c24d-42c7-a57b-c3f914f3e3f8	IM/2024/033	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
60740414-f190-4e44-a171-d6de5408f54d	IM/2024/034	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
f3d8fe8e-0cf9-4362-a7a4-2ad5817b67c5	IM/2024/034	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
a95f03c2-9d7f-4b2a-9500-36bdc0adbc10	IM/2024/034	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
2990ccf8-b8bd-44a8-89c3-815ced6110a8	IM/2024/034	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
e5e1c2f3-b068-4389-8d98-0274f90128cf	IM/2024/034	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
c7db1658-4d72-4da8-b124-43bd4f8cb8bd	IM/2024/034	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
9d29d1fd-3b61-4b0e-968f-f32275d51d09	IM/2024/034	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
6e8618ac-6b7b-4466-93f8-ed15ce6d4abb	IM/2024/034	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
a6465685-fb93-43cc-b1ca-e6b48934a9b5	IM/2024/034	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
a0d588cc-9b65-45f9-9a8d-5d77a4bb36cc	IM/2024/034	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
5ba43897-5328-4cd9-affb-268ac3ce9cc1	IM/2024/034	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
4810915d-f0fe-4d98-af05-1a02475a05fe	IM/2024/034	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
b3fac09f-2752-4974-9044-dd20ab4f71c7	IM/2024/034	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
0f5dfa9c-8aec-4112-8163-a5b38e6e71b2	IM/2024/035	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
665c739a-0579-471a-ba11-535ccc5a3d87	IM/2024/035	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
4c93e8b6-1220-4a68-a6f0-4df232f97d6a	IM/2024/035	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
7dfa815f-f5f9-4b14-a814-15e0581fcdef	IM/2024/035	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
9709c2b6-29bc-4f42-9fdf-912b7b2566ca	IM/2024/035	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
f780367b-aa0e-4649-9669-2034774f380a	IM/2024/035	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
72f491f3-a493-46a3-a0e3-939c024696e8	IM/2024/035	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
2d59d560-08b6-4883-bad5-febf3a77886d	IM/2024/035	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
6d0fc563-9ab5-42b5-983e-6d333e8db171	IM/2024/035	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
3384bd10-a1b3-46ae-b226-fb449d1944a5	IM/2024/035	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
4f0f9cd0-65cd-48f5-b3f3-f5f8a6958953	IM/2024/035	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
d2ea6feb-4aaf-4368-a4b4-ed4d423e0630	IM/2024/035	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
44a8bdf1-a7aa-44c1-95ab-56c88a97caff	IM/2024/035	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
6ad98983-d5be-485f-8849-619741bb359f	IM/2024/036	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
594bdfea-c98b-4637-a2c1-761f8aad0345	IM/2024/036	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
1633e08f-b7ed-4465-a453-996d98d8e2f5	IM/2024/036	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
b60f9d6f-2552-4340-bd13-58cb4490fcbe	IM/2024/036	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
49898f19-9425-4a55-a241-588f9a28fd10	IM/2024/036	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
56288e97-cae1-411d-b0da-a1c2954b6cfa	IM/2024/036	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
6557a31e-8eb0-4d0e-b9bc-8233502c5245	IM/2024/036	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
c7b3dc81-b1b9-44e9-8184-e4cae542106f	IM/2024/036	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
a5419577-6f11-42b5-bfc8-1644476ef570	IM/2024/036	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
1cb7371a-8d06-4d27-ad01-8d01b7fcc049	IM/2024/036	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
13e7d96c-35b5-4d00-9586-c9110049a2a2	IM/2024/036	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
275707a7-6a85-4a7a-8a77-79fa0cbb2069	IM/2024/036	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
dc22e744-3113-43b1-9fcd-b64f98ccd2b0	IM/2024/036	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
70a6db21-c775-449e-aa9e-bca7c300fbb0	IM/2024/037	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
4ad7bec9-793e-4ebf-9a4e-727fe598666a	IM/2024/037	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
b416f6f8-f844-400b-a195-f3120738f56c	IM/2024/037	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
43fcc09f-7e53-4964-a711-1ce90e6a6668	IM/2024/037	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
eec2f02e-0d73-423a-ae02-33d5ba4be5db	IM/2024/037	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
7c73e757-ed6b-409b-a9da-c5631d482070	IM/2024/037	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
f4897e3e-3b39-4d15-a2d3-f194ad3d2434	IM/2024/037	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
9a37ec27-4922-4ad1-9a70-60bbe26e3ffe	IM/2024/037	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
6d3d689f-deae-4581-9218-e3646bf8d7af	IM/2024/037	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
29773f87-150f-4e80-aff2-04ea273b3f43	IM/2024/037	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
d05f72d4-9aaf-4ccd-8280-db8adac3e563	IM/2024/037	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
d454a861-a29c-4b28-b6cb-1cc17d412187	IM/2024/037	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
b2ba8e2f-7be3-4592-bf11-e527f50fac0a	IM/2024/037	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
719c3f78-6e1f-4bf2-8808-00d89bf229bc	IM/2024/038	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
dff74ca0-1c03-4bf4-9e5a-50c0ae1502eb	IM/2024/038	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
abd6a92b-df0c-4d7d-8f07-92bf075d01d0	IM/2024/038	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
87477351-d7a6-4685-a0be-a9db05d86dd6	IM/2024/038	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
190bf3d4-92dc-4bfa-b175-efb2d85396bc	IM/2024/038	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
8424aae6-bfde-4354-9833-fcaa066f59b3	IM/2024/038	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
f4fbefde-340f-42a6-a5ea-47d8524fcbf9	IM/2024/038	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
7a735534-d152-47a3-a442-b3dbeb02cf35	IM/2024/038	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
539fce34-777a-415c-9f47-f500b1a79905	IM/2024/038	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
d61ef0d8-4e19-4792-95a9-6927f227e50f	IM/2024/038	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
3c548834-2d01-47d3-8cea-dc3db280fc22	IM/2024/038	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
3f769517-a30b-4e14-8804-bea5c608e613	IM/2024/038	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
4586f3fb-f462-4e56-990e-ded0bce9b82d	IM/2024/038	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
2c646a4d-8de2-4a50-ac38-6e049498c808	IM/2024/039	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
99fdf8db-0a97-4393-90a9-ca5d1eeb9c1b	IM/2024/039	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
b5c534ad-3deb-4c74-ba84-8aee9dc9867d	IM/2024/039	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
d8eb9bd2-223e-4de1-a450-e92172c41151	IM/2024/039	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
e47f0f1a-8098-4d48-984b-7a70c6389c0b	IM/2024/039	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
949b61d3-b0f3-4338-b69b-1019dbef89a2	IM/2024/039	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
a1ad9f83-3dd1-403c-9ce2-43a72cee4ab4	IM/2024/039	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
2e8313e2-05e2-4e5e-80ea-b64bf740be1d	IM/2024/039	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
835bc76a-6baf-4559-9c32-99fad38b9673	IM/2024/039	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
819d172e-3e25-4638-b1b0-6d93e8de0e8e	IM/2024/039	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
945db436-0629-4d9b-a33c-4a998dd26167	IM/2024/039	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
9d7044d0-c46e-4ed4-9af0-bf4e4708ef85	IM/2024/039	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
70b6a70d-07e3-4b36-91e8-ca701e7be1d4	IM/2024/039	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
c442c1ce-0fff-4172-ae59-7b4719fd6673	IM/2024/088	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
0b2cf4b7-9512-4cdf-9ab2-083590e6e184	IM/2024/088	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
ed9619f6-a60b-45f7-9cf0-a75481a5825a	IM/2024/088	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
8c348936-9906-4eab-bc07-066c0179f4ea	IM/2024/088	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
f9704b23-14e6-42f0-985d-3380b41218c7	IM/2024/088	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
84f71acc-1139-4bde-9705-a834d12f5d80	IM/2024/088	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
47c939e8-044c-4f68-8571-2d8402097439	IM/2024/088	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
faf75024-adf3-402e-beaf-c685350d8044	IM/2024/088	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
7c656f12-07de-49ef-bdf8-65ee3b3c6f9e	IM/2024/088	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
81deaa7a-3979-43de-976d-430abfff9fa0	IM/2024/088	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
d0f25a2c-de88-4bd6-a6df-bcade055e756	IM/2024/088	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
71091eca-9c5e-4a26-a519-353d0dedf34a	IM/2024/088	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
33baab7d-9a92-4354-8258-6245967200b5	IM/2024/088	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
c3d41d6b-15f5-49a9-aeaa-8f6a069711ba	IM/2024/089	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
8b63507a-0032-4a55-ac0a-05ca6ea3f14f	IM/2024/089	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
4dd023e7-b6da-4b56-9661-24111795b792	IM/2024/089	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
ba0fadf1-6f68-45ec-a82c-9cdecca4be19	IM/2024/089	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
55f87f0a-71c6-425d-8ba6-4089c15b8d81	IM/2024/089	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
9a46d190-43e6-41cb-940c-d80b20a85eb6	IM/2024/089	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
9a4dfb94-2462-4b59-9ec1-682af17b2697	IM/2024/089	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
014047c8-6b39-4ea5-9f10-e991271857f1	IM/2024/089	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
bfac7296-2293-4100-8100-8e3a6dcdd889	IM/2024/089	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
2d6e4d4b-300f-4858-9fd9-838ccfaf5d12	IM/2024/089	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
59c6b27e-5318-448d-be74-53a6456a82fc	IM/2024/089	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
a99dd1da-c959-48d9-9d87-e23bf19a497f	IM/2024/089	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
8f724805-08f8-4f8c-97da-1a251804521a	IM/2024/089	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
8e03fd30-938d-49e9-bb33-e48a367f0a4a	IM/2024/090	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
6f98f997-eda9-4fc8-b62f-63b4013f2bbb	IM/2024/090	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
84140de7-4af0-4a30-aa34-03bea1f1d7ea	IM/2024/090	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
06ea46bc-881e-4638-9427-808d98acae2a	IM/2024/090	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
922eec4f-599f-46a6-bcc9-b326d43da232	IM/2024/090	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
41ba4a0b-71db-48c5-8cfa-23103598006d	IM/2024/090	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
e40bc519-da8d-4713-ba9b-2dd1ee0f595f	IM/2024/090	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
18988910-8948-429a-995d-e906fb1100ac	IM/2024/090	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
9efb9ad7-e4dd-45fd-aa8b-af3b4a9bc131	IM/2024/090	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
3ab9d0d4-988c-4b8f-913e-9566c2fcca51	IM/2024/090	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
3e349019-c387-4038-af09-8fc6d60603b6	IM/2024/090	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
a23e0f9c-59b8-438f-980d-46fe7fa658c9	IM/2024/090	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
552c0b28-7642-4970-b51b-5c8a955ad737	IM/2024/090	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
03fa7941-4377-4c36-b415-72ccbb96709a	IM/2024/091	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
bbb7e4ae-c929-45b2-9f5e-18cf0166b3ef	IM/2024/091	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
3d8227ea-7054-4c6d-a75d-56e4c6a61a12	IM/2024/091	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
9409871b-dfaa-4a28-a386-af0c6777c70d	IM/2024/091	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
643f45d1-a64f-4c54-b87e-b63b55acd38e	IM/2024/091	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
71ba279f-5d87-43cb-837b-4430c4fa149d	IM/2024/091	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
3dd53ec5-86fe-4915-8f51-c07a75224569	IM/2024/091	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
fa87c99a-2efb-40b5-adc5-16413cccb452	IM/2024/091	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
f8c1224a-5056-4682-855f-80f6a131697c	IM/2024/091	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
e5c427e9-8354-43b4-9897-1832f9c4a257	IM/2024/091	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
589cc989-244e-4fa5-ba6b-c63a84587bed	IM/2024/091	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
d6e173b5-c537-4b11-8b30-3c824c7ca01b	IM/2024/091	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
36592772-4eda-4835-94d8-8fc46ffd4ff5	IM/2024/091	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
9dbe96fc-87b0-428a-bd4c-2f6e0f2d8706	IM/2024/092	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
abbb0bc0-1e8d-4928-8ced-61ceba809d36	IM/2024/092	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
0a09b00b-62d1-4cac-bcfc-866355db3fa9	IM/2024/092	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
c508ede3-817d-4591-ac90-b1061c4f0bfd	IM/2024/092	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
cfa981f2-9508-45b6-acd2-cb8fa924ebf7	IM/2024/092	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
c2fed426-0621-408e-8fa8-b5b080655df1	IM/2024/092	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
42a3ebc3-6be2-46b9-b2e6-9336d00211a2	IM/2024/092	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
b1dd30ff-a9e4-4b34-adae-56cfefdf6f57	IM/2024/092	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
27f41ad7-b3ca-4122-939e-75fe628911bd	IM/2024/092	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
79980809-feb4-4378-900b-b59f6c0415e2	IM/2024/092	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
ffd5080d-bd3a-4901-8aee-619f634f636f	IM/2024/092	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
701ff7ec-5b88-4b47-b815-f34b4dc09081	IM/2024/092	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
49dd8abe-ca09-4d5f-bd1c-ca57f99f42bb	IM/2024/092	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
bcc244b8-51a8-4e27-ac9a-59a1ef9df794	IM/2024/093	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
c35c894e-c1e3-473a-ac98-63b0d55cce8a	IM/2024/093	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
dd488fdb-76ee-43a8-aa6e-f91ddb481ec6	IM/2024/093	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
14855424-d6a9-48ed-b7f8-75ef6d5d1b63	IM/2024/093	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
542c2045-b944-44e2-9ed8-a5adbd11da82	IM/2024/093	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
ab720855-ccd1-40a8-9f24-abae351ad818	IM/2024/093	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
a5dc46d2-cc2f-4f16-8ff2-f44929cdbcf4	IM/2024/093	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
e59ce990-7e68-4d25-8867-ad9ee911e101	IM/2024/093	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
e4b6c2da-25d4-4486-9eb8-3558766f65f3	IM/2024/093	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
cc965ddf-1654-4536-95bf-843e8384ab53	IM/2024/093	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
95b72397-fed9-474f-8968-03e166cae9b3	IM/2024/093	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
0e8a9d78-5981-421f-8228-581a920c2eba	IM/2024/093	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
5c72e5fc-ed79-4d54-ac56-d8a6cc976709	IM/2024/093	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
bd34ed44-8094-4a9f-98e0-f4044cda6c56	IM/2024/094	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
9f34915d-45d8-47d8-9665-4df5955250ef	IM/2024/094	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
272d1662-148e-497e-a2c9-7724063249c0	IM/2024/094	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
1d644b57-b311-4e67-9e86-12d90bc7bfed	IM/2024/094	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
8d49cfb8-f099-4076-b939-b6a40725b1d5	IM/2024/094	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
72967f8f-b8f1-48c2-a2b6-338181292e34	IM/2024/094	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
6436803f-1df1-4ddc-be3f-0b5b88a5280f	IM/2024/094	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
7f3b961d-7b2e-4249-b377-32d951d62a9a	IM/2024/094	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
a9561cc1-0df5-49f8-8f72-60b965ed306f	IM/2024/094	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
36fd051c-e148-42e0-aae2-4a5f34a1b090	IM/2024/094	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
54fd244b-133c-42a8-903a-b68b60e573bc	IM/2024/094	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
1d93a15e-9d3c-4be6-8f44-ef4d6a49902e	IM/2024/094	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
ce710e15-acca-46fc-8114-f203d647b486	IM/2024/094	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
50a94bb7-fa3e-46b0-81df-18d9d4381354	IM/2024/095	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
c9d83a75-1bfc-4e87-a32f-d0ed9e1c1ca7	IM/2024/095	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
79bca72f-9ea8-4a4b-931b-8ef33b2e134b	IM/2024/095	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
da8cf128-b423-491d-96ff-54b7ac4f088d	IM/2024/095	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
6e8d172b-94b5-4fd8-8f49-031a9f3aa5b9	IM/2024/095	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
eb813c5e-8527-4510-8d4a-d821d7927831	IM/2024/095	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
99b30aa2-b1df-408e-aa73-a6b729c970d3	IM/2024/095	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
289338ab-a0b2-4969-b824-06f1da889fa5	IM/2024/095	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
7e10ba9b-c319-430b-a877-57f07775ed7e	IM/2024/095	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
3dd437fc-6bc2-43d5-905d-f4dbf42843a2	IM/2024/095	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
f63009a2-8af4-4817-a9ad-f0dc244e0292	IM/2024/095	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
eda99bb6-b272-418e-9284-747870aa5850	IM/2024/095	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
d1168d3d-56fc-4ae4-aebc-f7999ff09355	IM/2024/095	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
33e421aa-df1b-45d6-9ed7-bbc348f72c90	IM/2024/096	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
3a378e50-fc8b-429c-982e-415bc3ec3b95	IM/2024/096	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
ee097126-0264-4fb9-9d1a-065c2222e3dd	IM/2024/096	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
21d52591-5841-46dc-9bd2-d1ebbcff824a	IM/2024/096	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
68dc97ca-cdff-4f33-b4c2-7ee10315042e	IM/2024/096	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
cb965dc2-eb29-4bb5-83e6-6ccba134dd65	IM/2024/096	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
229e28c6-c607-4ab8-bf49-86747e4194c8	IM/2024/096	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
178a8584-9144-45a8-bcf5-9d5b82a17309	IM/2024/096	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
38d01ee6-0caa-48ba-8de7-a4a5850b9984	IM/2024/096	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
41781a59-46f4-4541-98fc-d83fbdb1b1d2	IM/2024/096	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
c2b5bd21-cf4f-480c-b437-4e853a613848	IM/2024/096	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
655ed2e5-e5a9-4fb2-8281-0ebb6ad75d44	IM/2024/096	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
13709bf3-8270-412d-9c4b-dd45a966c9f3	IM/2024/096	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
95334ae8-89ca-4d3d-aaea-aaec42f123b3	IM/2024/097	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
3bc6e0fa-6e1a-4931-923a-c9e607f11573	IM/2024/097	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
9522cd92-f497-457a-b202-1b85d9853dde	IM/2024/097	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
ec98ac92-4555-4db4-ab04-1095f4dcddca	IM/2024/097	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
c5b107c5-e723-4f4f-94dd-fc1ca69db2a8	IM/2024/097	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
113a6b41-cca3-4125-9784-6a42a4eda3c4	IM/2024/097	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
8d053c99-77cc-44ac-b812-28ea431acf51	IM/2024/097	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
d155fb91-6318-4903-af28-bcadb7df3f96	IM/2024/097	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
a91bc4bb-669a-4946-a42d-e47662c3c3c3	IM/2024/097	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
df64afde-1cbf-4f58-8d98-676349036e07	IM/2024/097	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
fc1e0d05-7fe4-477c-9a7e-90d11473528d	IM/2024/097	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
71f1acc4-6305-4af2-a7c4-7eb96b82e28e	IM/2024/097	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
71786850-02cf-487b-9407-e5178d4aa8e5	IM/2024/097	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
d929447a-e41d-4a23-8b94-efcdf41839ef	IM/2024/098	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
5b3e387d-f498-4ac1-9a9c-1760ce8f8a4d	IM/2024/098	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
bb4db487-c324-4237-a925-011c2a784121	IM/2024/098	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
e1b5f40e-5a95-4beb-84a3-b39c62e16a9c	IM/2024/098	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
3536a34e-c7e0-43e1-abc2-3bd1425c63e5	IM/2024/098	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
44d7d342-74f9-4ff5-943c-8e442214cb61	IM/2024/098	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
a8b5352b-61c0-4a92-821f-37951d4edac4	IM/2024/098	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
e60e4120-cefd-450c-acbd-4b7ce0a55f64	IM/2024/098	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
980097ac-ae2e-4b60-9de6-4093b35e1b5a	IM/2024/098	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
00f20e5f-a75d-4fdc-b3b7-14739bfb04f9	IM/2024/098	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
80baa71d-4941-4b4e-a60e-f4b862b2e9ba	IM/2024/098	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
a86981e6-f6b1-485d-bd2f-6d173d735558	IM/2024/098	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
4bb8b1c0-39d9-42a0-bb54-b5a5731a42ca	IM/2024/098	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
29c7bdee-647f-4bf0-b85f-48ba7f57405e	IM/2024/099	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
4068641a-dfb7-45d1-b691-222830bb28b0	IM/2024/099	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
8a188c7c-f059-4910-9982-097b0fdb3004	IM/2024/099	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
712fc8b7-57ae-4cab-8544-2c67059ced58	IM/2024/099	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
fc978585-eb9d-4e15-9691-2af6c1d341b3	IM/2024/099	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
99145cda-9add-48d1-9a34-ad0a6c4bf7bd	IM/2024/099	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
339a03ef-02e3-4b51-bd36-7cef1f590e5f	IM/2024/099	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
da8ebaea-d70a-4af5-b652-dead5fffa229	IM/2024/099	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
3ad445e9-122d-4dfb-871c-41a7a310fce3	IM/2024/099	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
4efb9b15-c3f7-466b-afbd-28b61ac5a3d8	IM/2024/099	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
151c5681-a708-47a4-bb8e-1baede259e92	IM/2024/099	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
d8dbf403-6864-486e-846c-a94e4886a773	IM/2024/099	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
4bed4c78-fda5-4865-a297-357ca7c35ffc	IM/2024/099	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
30cd8798-f784-4041-89f7-840d4dc569a4	IM/2024/100	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
de4a43ff-8f66-4d5a-82b6-e012ec4c25a4	IM/2024/100	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
82f5f1c6-bc1c-4dad-863e-d5c30c988de2	IM/2024/100	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
f7f89330-2c21-4a05-b9bb-c392fefc71e5	IM/2024/100	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
9f85dd24-bc3e-4637-85a4-bf69d1500400	IM/2024/100	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
0a54b541-c193-49ef-80ac-aa014a32b8ea	IM/2024/100	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
4f134cd1-96bd-4131-bd43-b979e48bf2e8	IM/2024/100	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
a6f06572-e7ea-40e9-9afb-73469dcab9b7	IM/2024/100	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
50fb3199-dec9-4d9d-ba7f-8941802eb921	IM/2024/100	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
501b4511-d902-44cb-8c20-ecb902150f0a	IM/2024/100	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
ee308fe7-d593-4c43-8d35-bcb6a4fd31c9	IM/2024/100	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
76feab5f-e81f-4bf7-b4bf-838f0c5cbccf	IM/2024/100	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
3a8bb745-0d06-42fb-a246-407ea9f2ffc5	IM/2024/100	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
99e7b059-ef6d-4c4f-a61c-0ebeb6c9478d	IM/2024/101	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
02cd0b12-8740-428e-879c-ab2e9b2d1089	IM/2024/101	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
a45323f6-8a1c-4475-8f44-6fe45873232e	IM/2024/101	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
b28da1fe-b59a-4be6-8c54-b8fb2897d8fb	IM/2024/101	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
df6b9b82-9965-4009-91b5-ad636745ed4f	IM/2024/101	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
7fa029d5-8519-40ae-b117-f00b04e5865d	IM/2024/101	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
ebe2d637-772c-4d29-b525-7809ce6697c4	IM/2024/101	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
5324074c-be8e-4bd4-97d8-0cfbaca1f75b	IM/2024/101	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
dce0e550-7028-485e-af54-3934dc4977f4	IM/2024/101	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
34e1ac2a-eef6-4c7e-a5ed-1e04ce88bb9d	IM/2024/101	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
2d6720da-8c5a-4f18-ad26-204a8dcf0645	IM/2024/101	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
fe4c1dd8-4bcc-4d25-a584-13650aef26b3	IM/2024/101	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
ab9cf492-cf0e-4249-ad0e-f526897a55cf	IM/2024/101	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
fb193507-fc1c-4ecd-bb5d-7f749df10925	IM/2024/102	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
10beb589-ab23-4360-84d2-a004eede3d65	IM/2024/102	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
9cc950f2-5490-4875-8ba8-3858c1ae7026	IM/2024/102	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
92e79411-9314-4f90-bbed-01e50663aaa1	IM/2024/102	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
fcef9fb2-aa93-491c-9fbe-3ecbf5fdd134	IM/2024/102	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
629f168b-4e05-4cfd-b7aa-f59317edd07d	IM/2024/102	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
5d3a658f-34ae-433b-b8fb-982ff9970f20	IM/2024/102	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
581fa6e3-d9f4-4cd4-b278-c267da5924f9	IM/2024/102	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
6424d0c3-1cb8-49b4-9aa4-f7360f03ac43	IM/2024/102	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
2bbffe32-8d42-433c-9ea8-17b05c346e4c	IM/2024/102	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
8661d270-cccb-4de5-aed4-454950aa4b44	IM/2024/102	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
436617f3-4439-4df0-8bb6-2b1c103717fd	IM/2024/102	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
73fffb1b-1ae3-486f-a919-fc99eed57963	IM/2024/102	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
3d5a324e-216b-49f1-835b-ed1b2ac3a0b4	IM/2024/103	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
ee5f37f9-2a35-4e3f-ba4b-0e49538db7eb	IM/2024/103	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
a410dcaa-6ef6-4ca4-a89c-84b000b225f1	IM/2024/103	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
65ef79ed-a329-4f09-aebb-8dd2fdef5132	IM/2024/103	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
d523f72c-64b5-4eba-85a7-71ee60591f65	IM/2024/103	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
237f79a1-5b26-4425-af78-510decb1278c	IM/2024/103	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
c081d66d-e227-4894-a677-31f50bcdca31	IM/2024/103	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
f580d198-8846-4d3d-a11d-61332e81495a	IM/2024/103	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
63e131b6-3608-4f7e-909b-b0027e54d7df	IM/2024/103	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
72508258-ae12-446b-9afc-6f205b3165f8	IM/2024/103	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
01bdcc05-2068-4d1c-a05d-b07f63617e57	IM/2024/103	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
4816dffc-3e04-4b54-aa05-c1ae5e4dd315	IM/2024/103	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
fe1a5444-9b17-4193-b2cd-37ea01f0bf1b	IM/2024/103	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
60cfd568-5ab2-4fc6-86ba-ff576edfb62b	IM/2024/104	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
687b402e-4d05-4b9b-9ec0-d2c0bd87095a	IM/2024/104	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
ef93631a-3b88-4920-a126-9c54d8e6364f	IM/2024/104	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
0bea57f2-fb3c-4944-823a-8a904ba4873c	IM/2024/104	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
b19a2b25-418e-44bb-8214-dd942a8ab0d3	IM/2024/104	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
a87e8b27-05a0-4a7a-b2e3-cb49ba566719	IM/2024/104	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
76990b3e-c7b2-4147-aeb1-098bf1c7e9d3	IM/2024/104	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
d167014a-9d9a-4dd2-ac0a-97f782ee0d60	IM/2024/104	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
92d2a2d5-9d3d-4738-a9e3-935be255f49a	IM/2024/104	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
41e41a18-6e7e-44a0-bd0d-89460015f75b	IM/2024/104	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
72d7a9a7-873e-4fb7-8cd0-916fa4263fd9	IM/2024/104	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
0d0ab6a7-832d-49c6-aea1-3d7c7c9eae74	IM/2024/104	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
8f37b2fc-0a93-4cb7-bdf7-cecff42c6384	IM/2024/104	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
830f95df-a0e1-45de-9620-ff086455c50d	IM/2024/105	158f2c82-5beb-42ea-810f-5126b7839904	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
b0fa44ac-b4fb-41d9-8993-45865b2fd4a5	IM/2024/105	4e406ae6-844d-48dc-bae6-ce5ca64026e5	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
ff9682fb-4e6d-43ce-8b0f-f4f2c6c2c156	IM/2024/105	6bdf0982-3100-4747-a5e6-cc4cee603bf5	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
87ab2188-6cb3-48ae-8f4c-226138cf4760	IM/2024/105	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
838e1f66-1651-4a41-ad08-fb809359ae46	IM/2024/105	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
0684a2e1-32a5-4d41-a6de-3dd489275d82	IM/2024/105	9ed34829-6b87-4259-b60b-5ec3a8b650e3	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
c7a2b91d-aeff-4489-b943-d4ee944b599f	IM/2024/105	bb0e7c53-8c41-499d-8288-01ac3458e577	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
c3fb97a5-93fa-4250-ac38-d6646480096d	IM/2024/105	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
46894e02-cd1c-473e-b614-c9c528fc6987	IM/2024/105	d541c250-0aeb-485a-8327-2419bd99d254	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
6cac8ce6-4738-4832-9f45-465488214528	IM/2024/105	e0459725-a48e-45f0-823a-5aee6668ab05	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
fad9b319-79e3-450e-a2b0-2bdfa28e142c	IM/2024/105	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	3c445cf7-457e-4538-8599-596fea4ac9c1	\N	2026-04-17 04:07:38	REGISTERED
bffc0abe-c838-4c04-bfa3-32761fc25d67	IM/2024/105	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
48e7f582-6edb-4082-ac22-72b3ecbe2f98	IM/2024/105	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	c3cc4391-4716-4e1b-9b8e-08497c48c754	\N	2026-04-17 04:07:38	REGISTERED
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public."Notification" (notification_id, user_id, type, title, content, sent_at, read_at) FROM stdin;
\.


--
-- Data for Name: ProgramIntake; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public."ProgramIntake" (intake_id, program_id, academic_year_id, min_students, max_students, status) FROM stdin;
6d4120d1-47b9-4df8-9711-0e7876837336	ca7dfed6-55a9-46c5-bee1-7034852ea30b	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	30	100	OPEN
f2e74ceb-ee19-490e-8e78-e1242fa416d0	65bd1828-487f-486b-be24-4f7e7c5e5ee2	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	30	100	OPEN
c9b628e9-9edf-49b2-9aa5-f3d6ceb63008	ca7dfed6-55a9-46c5-bee1-7034852ea30b	d0f33d92-6ff5-4627-801e-7edaceec7253	50	150	OPEN
72c5e08d-ebda-4cbf-94df-31c3a4eb859c	65bd1828-487f-486b-be24-4f7e7c5e5ee2	d0f33d92-6ff5-4627-801e-7edaceec7253	50	150	OPEN
20aa71a7-16c2-4130-910c-f4e4a488d584	24bcdfbd-b096-438c-b69e-ad906fbdaf00	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	0	150	OPEN
\.


--
-- Data for Name: ProgramStructure; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public."ProgramStructure" (structure_id, program_id, specialization_id, module_id, semester_id, academic_level, semester_number, module_type, credits, academic_year_id) FROM stdin;
d7b9309d-a3ab-4505-8239-97adaf9f02c7	ca7dfed6-55a9-46c5-bee1-7034852ea30b	\N	9609dfe2-3a47-4dd2-a941-ad5d7a45e906	\N	L1	1	CORE	\N	\N
5e906967-acb5-4cd8-8bb7-b3e65ddb7190	ca7dfed6-55a9-46c5-bee1-7034852ea30b	\N	4d71d2ef-d1be-48db-9e48-e12d1f445329	\N	L1	1	CORE	\N	\N
6964d43b-b541-40c4-8f42-fe6bb48f17da	ca7dfed6-55a9-46c5-bee1-7034852ea30b	\N	a684256c-7801-47b6-9d3e-e334f334e63c	\N	L1	1	CORE	\N	\N
917fc627-abc4-47b8-9560-8ec49bb0e0ca	ca7dfed6-55a9-46c5-bee1-7034852ea30b	\N	7e1f26b7-fb20-445e-abe3-5a43f9a2c7af	\N	L1	1	CORE	\N	\N
023d4f17-7b68-4cc5-be42-6bad0398465e	ca7dfed6-55a9-46c5-bee1-7034852ea30b	\N	f060c389-3ffb-4733-b21d-e3b59310d723	\N	L1	1	CORE	\N	\N
restored-8010b97d-ee8e-4713-9f17-176dbf8194fd	ca7dfed6-55a9-46c5-bee1-7034852ea30b	\N	33923a51-708b-4165-8b07-64e2f51f9c74	\N	L2	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-8fcdbcbb-a505-4545-8109-b114c1c9929e	ca7dfed6-55a9-46c5-bee1-7034852ea30b	\N	30a296f6-a5fa-4dcd-9739-a2249ab5bd18	\N	L2	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-df45f5e4-479b-40db-8e50-688cef8f42b0	ca7dfed6-55a9-46c5-bee1-7034852ea30b	\N	9b7e45e1-4847-4f03-8abd-0772525af0de	\N	L2	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-7d4fce03-bb6d-4ab3-a4ed-25c04effcd42	ca7dfed6-55a9-46c5-bee1-7034852ea30b	\N	d6caf588-83d1-4158-ae08-217ab162d754	\N	L2	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-a69d336d-bc34-4149-82bc-d2d4bfeb9f74	ca7dfed6-55a9-46c5-bee1-7034852ea30b	\N	32d8aa6e-e42e-4f2c-8291-8fb8c64aa44c	\N	L2	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-07d18226-2f13-4813-aee8-44ad9e648f47	ca7dfed6-55a9-46c5-bee1-7034852ea30b	\N	fd5fc66b-3b53-49fe-8f30-d85efa746d72	\N	L2	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-96fac49e-52ab-4d14-9b4d-ba62fcb9bdc2	ca7dfed6-55a9-46c5-bee1-7034852ea30b	\N	47822656-dd0f-454c-98e5-9fc88e89c1ed	\N	L2	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-cad85095-ab99-4a78-8545-4d735451e7a9	ca7dfed6-55a9-46c5-bee1-7034852ea30b	\N	6e8d1c49-594a-4096-96de-0dccc042c43f	\N	L2	2	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-56bc470e-7c9d-4acb-aa00-bd0faebcff80	ca7dfed6-55a9-46c5-bee1-7034852ea30b	\N	9aae0052-0dc9-49f6-99d3-67ef1fd58ac5	\N	L2	2	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-b3b4cf5a-c713-4d21-8765-8423d2cca4be	ca7dfed6-55a9-46c5-bee1-7034852ea30b	\N	8a22621c-c394-479d-b3ca-b66f895ba242	\N	L2	2	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-3150b7d9-0c48-4355-b2c4-9e070673ab6e	ca7dfed6-55a9-46c5-bee1-7034852ea30b	\N	301f7c7e-1b19-44b3-8b55-c1cba82655da	\N	L2	2	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-efe3902e-fb5d-46eb-a1c7-fe5a676c497c	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	905af371-a76b-4bb1-a248-f2e523681137	\N	L4	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-2fca75d3-59bc-4255-a0ea-fc33bc3bed63	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	905af371-a76b-4bb1-a248-f2e523681137	\N	L4	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-df8cebde-2d91-4ff1-9dfd-5db221046fdb	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	905af371-a76b-4bb1-a248-f2e523681137	\N	L4	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-681d3d36-f8c6-41a3-8706-611377aaf370	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	24a53945-eb10-4f24-b7f2-60ed6e95e9a0	\N	L4	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-94341821-4f9c-4099-8d06-9156d1739e87	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	24a53945-eb10-4f24-b7f2-60ed6e95e9a0	\N	L4	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-13b39c62-0b61-4bdf-ae9d-defec663da72	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	24a53945-eb10-4f24-b7f2-60ed6e95e9a0	\N	L4	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-b3557ad9-503f-4c9a-b783-0a80d3d9d897	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	2a9ff6f9-4fa8-4d8d-8024-835067736cb0	\N	L4	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-1263ed14-fed5-4bf0-bf70-34f3fba00df6	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	2a9ff6f9-4fa8-4d8d-8024-835067736cb0	\N	L4	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-d0d54b7e-a6f4-459c-b238-4dd0f2ed7213	ca7dfed6-55a9-46c5-bee1-7034852ea30b	\N	1baee0ba-c85e-4280-a726-0779aabec687	\N	L2	2	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-57b6f42c-8f79-4185-b38c-89b6c7051008	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	5b88af5e-6fa0-4944-9b72-8af4c8c3204f	\N	L3	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-85e9ebdb-e111-4c36-b5c1-8a8bff494e66	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	5b88af5e-6fa0-4944-9b72-8af4c8c3204f	\N	L3	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-c0ffa3fe-56de-49ee-915b-d7379c85acfe	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	5b88af5e-6fa0-4944-9b72-8af4c8c3204f	\N	L3	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-07c2f469-d4e8-44d9-a4fd-070476efc0d0	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	50161189-c60a-484f-a09c-17d525f2382b	\N	L3	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-27c95e45-66d9-40a8-9325-4d6d28fb1a3c	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	50161189-c60a-484f-a09c-17d525f2382b	\N	L3	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-ac6b61c2-dfa2-475f-85cb-931e5ba5a60a	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	50161189-c60a-484f-a09c-17d525f2382b	\N	L3	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-0e5bdf0c-3e48-4315-b8ab-015a6c9a11c6	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	255bee37-820c-49c0-b7c5-5b2b2636700a	\N	L3	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-7adf2610-4d59-404b-8e4a-175758e5b38d	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	255bee37-820c-49c0-b7c5-5b2b2636700a	\N	L3	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-9933f8ac-4185-4c9e-8b5d-b5599a65c174	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	255bee37-820c-49c0-b7c5-5b2b2636700a	\N	L3	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-4faceef0-375c-4f90-8388-9288c2ee0c5b	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	a32527ec-65ca-4b05-a12b-253dd65c568a	\N	L3	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-70eb896c-6b67-4ab5-99d5-c04e51605805	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	a32527ec-65ca-4b05-a12b-253dd65c568a	\N	L3	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-2bbee49d-7e8a-44c1-b383-2e42f806037a	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	a32527ec-65ca-4b05-a12b-253dd65c568a	\N	L3	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
5e2730c9-1b38-4f1b-9cfe-a624e5ae6008	ca7dfed6-55a9-46c5-bee1-7034852ea30b	\N	50a00c33-a365-4ebe-a7eb-127d7efda5f6	\N	L1	1	CORE	\N	\N
restored-3fb229e5-5516-4b79-a92b-5667be0b33de	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	7386b1df-3142-437d-ac02-1916002353f9	\N	L3	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-81795715-8b3d-44bb-aa7e-ad70027a3b7b	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	7386b1df-3142-437d-ac02-1916002353f9	\N	L3	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-9b9a22f1-d266-40a3-ad50-650520fd5876	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	7386b1df-3142-437d-ac02-1916002353f9	\N	L3	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-236242bd-0cb2-498a-b50c-2c2b85161d5e	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	37f3d7fe-f95f-4037-935c-de0251ba251a	\N	L3	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-75ac5531-91d8-4817-8476-e0deb1922ea3	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	37f3d7fe-f95f-4037-935c-de0251ba251a	\N	L3	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-059ef0cb-d3e8-41e0-af6d-66fed6d0ee9c	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	37f3d7fe-f95f-4037-935c-de0251ba251a	\N	L3	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-f42923f2-ca1b-489c-9a0a-76a7434bc8bd	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	1b33f669-35a8-4044-8ec4-8818e2646d65	\N	L3	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-18d04137-4852-4d0e-8b4d-2459fa2849b3	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	1b33f669-35a8-4044-8ec4-8818e2646d65	\N	L3	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-b9ac5704-3d4e-4c72-83b7-d3aef3c04791	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	1b33f669-35a8-4044-8ec4-8818e2646d65	\N	L3	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-f57dad8f-2e13-43e1-a516-e1a419649407	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	f9cb4cca-2952-4050-a6ea-3f62f11f407f	\N	L3	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-a814edce-526c-4b52-b964-35a1ba537a9e	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	f9cb4cca-2952-4050-a6ea-3f62f11f407f	\N	L3	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-957e562f-66e0-424f-8466-5f7fac8a8268	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	f9cb4cca-2952-4050-a6ea-3f62f11f407f	\N	L3	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-e4dcb68e-dd6f-4659-8764-5b9cece10a4d	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	2ea58353-dc87-4682-a914-e8a447521a7f	\N	L3	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-fa8ca0e0-23d3-48d8-9f28-6b3b79a76370	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	2ea58353-dc87-4682-a914-e8a447521a7f	\N	L3	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-3377f2c4-35e7-4308-9ed5-0c1432890f69	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	2ea58353-dc87-4682-a914-e8a447521a7f	\N	L3	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-1f65ed00-ae59-4af3-b68b-63d555ca49d5	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	bc2fc32c-45d0-42e7-823c-18d3f44e8667	\N	L3	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-0d6476b8-976a-49f6-a2de-5210bfcd09fe	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	bc2fc32c-45d0-42e7-823c-18d3f44e8667	\N	L3	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-e0893326-c555-4291-8c9a-55b7dcc0000e	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	bc2fc32c-45d0-42e7-823c-18d3f44e8667	\N	L3	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-d4ab7852-bebc-4f91-a01e-91d85aa9e285	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	7842c578-5e24-4ffd-b3e2-028980270807	\N	L3	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-9342a6a6-c3dd-42b7-99a1-ef8270a29224	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	7842c578-5e24-4ffd-b3e2-028980270807	\N	L3	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-7bd2b5cc-4d9e-4531-8817-c9badefd696c	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	7842c578-5e24-4ffd-b3e2-028980270807	\N	L3	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-65bf600b-8a64-4afa-b2f6-cc367c346ffb	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	2716a46c-afac-4c67-bb6a-5fad4818ed4f	\N	L3	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-33be3d78-a88c-42d2-bf9d-6f82a4a83dbc	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	2716a46c-afac-4c67-bb6a-5fad4818ed4f	\N	L3	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-730b61ef-2337-4308-9831-c480f2f2cfc2	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	2716a46c-afac-4c67-bb6a-5fad4818ed4f	\N	L3	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-c201ea18-d580-495c-993c-6dc2ca48048b	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	c7a44f1a-76f4-4c87-bee8-f577386acca1	\N	L3	2	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-1e962033-e673-4516-a0b5-ce64bfa00a2c	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	c7a44f1a-76f4-4c87-bee8-f577386acca1	\N	L3	2	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-39885f73-66ac-4977-9a12-fba6b0f12e6f	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	c7a44f1a-76f4-4c87-bee8-f577386acca1	\N	L3	2	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-4ef40fbc-7651-49cf-81f9-0944d35665c3	ca7dfed6-55a9-46c5-bee1-7034852ea30b	\N	46f01733-2b23-44d5-9be0-2909af0c80b0	\N	L4	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-d5b8f5d4-29e9-4cf1-bcb3-4154b1121ecd	ca7dfed6-55a9-46c5-bee1-7034852ea30b	\N	1a915a4c-8cd4-42b2-b650-bce035a71ade	\N	L4	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-3424a275-5903-44e2-aa3b-59ed36674227	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	61300f27-ec14-488b-a3c3-62e21132a8f2	\N	L4	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-dcaa7c97-aa90-4796-b3c6-bc72a5be71ca	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	61300f27-ec14-488b-a3c3-62e21132a8f2	\N	L4	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-4cac2f0b-d8c8-4331-af40-a8b06f06989a	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	61300f27-ec14-488b-a3c3-62e21132a8f2	\N	L4	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-5764bf17-714e-4aa7-8fa3-2e532081ba2e	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	2b72059a-e0bc-4334-a688-152358b2e78e	\N	L4	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-126bd196-4656-4e7d-96a0-b4e62b2a208c	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	2b72059a-e0bc-4334-a688-152358b2e78e	\N	L4	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-87c1a153-2fd6-40a8-9efa-62940464ea8e	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	2b72059a-e0bc-4334-a688-152358b2e78e	\N	L4	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-e388bf6c-2ab2-4e44-9096-7c1a0696949a	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	84a9747d-2e9f-4fc6-b9e6-6d5e25af2758	\N	L4	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-64d3cfb8-5679-40ff-a4bd-4a8c0f4d6787	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	84a9747d-2e9f-4fc6-b9e6-6d5e25af2758	\N	L4	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-8e299fbe-7ff8-48d6-9fb9-ccac9aff6bfd	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	84a9747d-2e9f-4fc6-b9e6-6d5e25af2758	\N	L4	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-51fd8e33-00ee-4a53-b797-09ed7519abf4	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	3bb01cf9-775a-4842-b10a-a353dc32afad	\N	L4	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-58ada64c-1cac-4d4e-b207-7fd41138f25c	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	3bb01cf9-775a-4842-b10a-a353dc32afad	\N	L4	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-10dba751-3874-403b-898f-9171c32ba919	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	3bb01cf9-775a-4842-b10a-a353dc32afad	\N	L4	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-3ac55434-5ea0-4eba-865c-98cb7ff8c201	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	74942921-d088-4069-9393-dba1b3e56257	\N	L4	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-01db290c-89e4-42fd-9488-69d6772171e9	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	74942921-d088-4069-9393-dba1b3e56257	\N	L4	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-6310316c-ae54-4fc5-8569-dbe20a91c061	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	74942921-d088-4069-9393-dba1b3e56257	\N	L4	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-1cb95ef6-1293-4b47-aafa-a37fc2b61e03	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	bf100799-6b4b-4659-bc91-1670e345b1f5	\N	L4	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-afac5326-ad2c-4dd3-ad92-bfa78d688653	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	bf100799-6b4b-4659-bc91-1670e345b1f5	\N	L4	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-22311962-a5ae-40a3-8623-acf7db9c04e8	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	bf100799-6b4b-4659-bc91-1670e345b1f5	\N	L4	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-7e95e9a5-90cd-44f3-989f-361ea0fb4e84	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	2a9ff6f9-4fa8-4d8d-8024-835067736cb0	\N	L4	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-902ced0b-6142-486e-bdd6-1b805ac56b93	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	7a8b8fb5-3066-43b7-a6e2-3b171e1ccaad	\N	L4	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-f988f6b6-3d8c-4504-a226-f1184481501e	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	7a8b8fb5-3066-43b7-a6e2-3b171e1ccaad	\N	L4	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-977c7add-16e3-4926-9db3-a7656e9eb3a4	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	7a8b8fb5-3066-43b7-a6e2-3b171e1ccaad	\N	L4	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-c1c34330-3451-408d-bacd-4dcb0eef2efa	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	74843e6f-b998-4037-825b-4928747b35a7	\N	L4	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-d91b2d2e-62a1-4ff7-b8b2-a5df76eb8960	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	74843e6f-b998-4037-825b-4928747b35a7	\N	L4	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-05f8753f-e5c8-45c2-a3ab-749053f29a4f	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	74843e6f-b998-4037-825b-4928747b35a7	\N	L4	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-ea715932-12bd-4472-894a-4c5f744f4fb4	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	b1cc2594-44be-4afd-a37e-260643185ad9	\N	L4	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-21841c4e-8de8-457b-80ab-74b808206fc0	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	b1cc2594-44be-4afd-a37e-260643185ad9	\N	L4	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-57b7f0a5-e972-4543-bebf-d1f9a08bbb28	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	b1cc2594-44be-4afd-a37e-260643185ad9	\N	L4	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-6cba1d68-37af-43f8-b4d6-e544039e9598	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	8ffdc50b-6552-4127-9678-512ad7d9fd38	\N	L4	2	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-cf63d099-0837-4874-bad8-16e95587d412	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	8ffdc50b-6552-4127-9678-512ad7d9fd38	\N	L4	2	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-3c50f9ef-8047-4e46-93d3-8c249ff33c99	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	8ffdc50b-6552-4127-9678-512ad7d9fd38	\N	L4	2	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-1d4829a8-b7d9-4a75-8c94-cda4f105a54d	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	3dc12e90-c75d-4bcb-a2e2-84c75dfc7f91	\N	L4	2	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-03797c2c-1eeb-4a0f-9da0-fbe59cb7b4e1	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	3dc12e90-c75d-4bcb-a2e2-84c75dfc7f91	\N	L4	2	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-58ac50e9-ceb9-4f06-b5a0-fc57aa703e83	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	3dc12e90-c75d-4bcb-a2e2-84c75dfc7f91	\N	L4	2	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-9b55f642-791c-4ace-b195-e7d025ba6d6d	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	51af727f-88c4-46fc-ad8d-3584ecbed151	\N	L4	2	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-c7a995d1-b156-464a-b6d3-fcd6be9858e1	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	51af727f-88c4-46fc-ad8d-3584ecbed151	\N	L4	2	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-7c17c35d-77de-4543-a602-e163941df399	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	51af727f-88c4-46fc-ad8d-3584ecbed151	\N	L4	2	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-121cb8c9-b09b-4f98-976e-6895e937ee54	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	696f1830-a06b-41e6-b020-d668790e3e11	\N	L4	2	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-79114cb6-6eeb-4d0e-bf49-8c0990eb3702	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	696f1830-a06b-41e6-b020-d668790e3e11	\N	L4	2	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-b9af564d-2d5c-444d-a48e-d27daa494ecc	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	696f1830-a06b-41e6-b020-d668790e3e11	\N	L4	2	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-c098dfeb-bb28-40e5-a54f-c8178795547c	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	33923a51-708b-4165-8b07-64e2f51f9c74	\N	L2	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-6aae9a90-002f-44bc-af18-4d328ba7a14f	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	30a296f6-a5fa-4dcd-9739-a2249ab5bd18	\N	L2	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-eeb63af9-1ce2-41d3-bdd3-a72cf57c994f	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	9b7e45e1-4847-4f03-8abd-0772525af0de	\N	L2	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-4bb42b29-efb6-48ca-9cc9-a83cba73e456	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	d6caf588-83d1-4158-ae08-217ab162d754	\N	L2	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-89cc4f0e-0005-44dd-961b-9af1e9cd26dd	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	6137b228-aa85-450a-904f-b01ba80ce7a2	\N	L2	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-6371f27c-38a4-4a1e-ae36-2c4dd7b16a6f	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	7331463e-490e-4a04-a6e0-ff43d2c2d732	\N	L2	2	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-ddd1ff08-a500-4ec5-9383-6daed68b02e4	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	6e8d1c49-594a-4096-96de-0dccc042c43f	\N	L2	2	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-8c9ae0cc-62eb-4cfd-83b1-0e344b8d6d44	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	65d8e32a-1919-44d1-ac38-076ab9308760	\N	L2	2	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-145e3420-02ac-49e9-a7a7-dce393f7a5f2	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	5564fa4f-e8e9-49a8-aa70-656448739a1a	\N	L2	2	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-f8fe1fc1-6043-4b11-8879-76af01179388	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	9aae0052-0dc9-49f6-99d3-67ef1fd58ac5	\N	L2	2	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-805182b8-d9d5-4fcc-9927-10475f55a368	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	3d378d33-faf6-4c27-bbd3-336a8d9d3dbd	\N	L2	2	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-f9a46ac0-05af-4c3e-8da0-8b89222c186a	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	301f7c7e-1b19-44b3-8b55-c1cba82655da	\N	L2	2	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-34ff33ff-add6-41b7-b055-41636e767732	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	1baee0ba-c85e-4280-a726-0779aabec687	\N	L2	2	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-5a3566f4-30fd-41b0-9306-c3720bfe1eda	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	0f3ce6ba-c933-4d94-9bb1-b4d76cf464f9	\N	L3	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-66dcf8d4-2e1a-4604-893d-d7c406a9aa4e	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	bc2fc32c-45d0-42e7-823c-18d3f44e8667	\N	L3	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-cc8ab537-00e3-4eee-9f0f-1f778126a0be	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	5b88af5e-6fa0-4944-9b72-8af4c8c3204f	\N	L3	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-408d3de2-2a5f-409f-aa4a-1e96aa3bb47a	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	37f3d7fe-f95f-4037-935c-de0251ba251a	\N	L3	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-ba720351-6b7f-4adf-829c-e6d9b49dbf22	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	d8b6adc6-5106-4145-bbe0-a8e060213282	\N	L3	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-45548b34-317c-46a6-993f-6f25a7020fb9	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	7be2df4c-4f40-43cf-8e19-ceb02f2c3b8e	\N	L3	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-d2a66c99-1689-4164-a2f7-99edf26fec54	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	0b50ea16-4fca-4bc7-a85d-7692690c262f	\N	L3	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-dcc65b16-2be6-4da7-bada-d059efbb4588	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	2d261d7e-f29c-4619-af7e-c67a899fb2ed	\N	L3	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-5cf2a983-1cc4-49d5-95fc-e360fd5e24dd	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	7842c578-5e24-4ffd-b3e2-028980270807	\N	L3	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-c14f6226-b63f-4034-9c7c-7ef327d0d83b	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	20c9a159-4c97-4b14-9522-7dd7960ccdc4	\N	L3	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-fe4800e2-6ce5-4e53-963b-74401420cc65	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	c7a44f1a-76f4-4c87-bee8-f577386acca1	\N	L3	2	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-16939db4-4762-4528-9282-5dd1b9c7a1a2	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	46f01733-2b23-44d5-9be0-2909af0c80b0	\N	L4	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-eb1c8308-9732-41b7-bca8-f9e0363a4000	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	bf100799-6b4b-4659-bc91-1670e345b1f5	\N	L4	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-61ed081b-9613-4aec-b89d-91887111ddf6	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	61300f27-ec14-488b-a3c3-62e21132a8f2	\N	L4	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-7ddcb3d3-6290-4812-99e0-2712340d70da	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	570a3ca2-f6dd-4763-9328-c2353a41b292	\N	L4	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-48210572-b5c9-4ce6-b0f0-8b10d705e2c2	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	147574a7-a289-4128-90e8-560a4b036116	\N	L4	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-96f3a186-d80d-465e-bda3-9cb6e75e5dcc	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	1c7e98f4-059b-41ec-a46a-dfeca8d40b45	\N	L4	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-39c86a80-44c4-4a3e-a6c1-e5d337654eb9	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	e43840a6-73ce-4523-84cb-b3dbbd9cd3c7	\N	L4	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-ee5b55eb-ba30-4b67-9d18-0293facd0d9e	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	41070666-9f6d-4d0f-b253-4bf0d36db707	\N	L4	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-53843ec0-1f60-4f75-8a83-32eae92b70a7	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	5e505061-a69b-4edc-a0c4-f01eeffdb271	\N	L4	1	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
4653e5b1-1d14-4397-8b8a-c91cbc4cf4d9	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	c08df20a-02dc-4e5c-b498-729d78cb5983	\N	L1	2	CORE	\N	\N
restored-c283f080-9286-4422-b717-e71369914a54	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	e115ba02-7d87-4bbd-872f-6d534890b08a	\N	L4	2	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-303c97d5-2c30-4a86-9bf9-6f90fe0d614f	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	540fbfee-12e2-49bb-94ae-717de2b14578	\N	L4	2	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-2cef791c-40f0-4975-9a83-6703b7acb146	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	375acf22-2164-4c2c-a725-f2d50999ac21	\N	L4	2	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-d64bd0a4-9793-4fb5-8ca0-a42bfc5e7b73	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	f9d98581-20ac-48dc-ad6d-a9c770d05e9b	\N	L4	2	ELECTIVE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-15cf3c7f-8772-4b84-803c-6e41c1d50ca3	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	6bdf0982-3100-4747-a5e6-cc4cee603bf5	\N	L1	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-8098f6f0-67e5-467f-ac21-cadc85b805e8	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	d541c250-0aeb-485a-8327-2419bd99d254	\N	L1	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-d7d625cf-8ad6-4d04-85bb-c23a75cbf1e7	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	\N	L1	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-7e0ffe76-8399-430a-a119-d4993c659793	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	\N	L1	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-20deb2fa-63a7-413f-af1a-b0e0e555bd71	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	\N	L1	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-0725167c-d12e-4f9b-b9af-eee9dcb2660a	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	158f2c82-5beb-42ea-810f-5126b7839904	\N	L1	1	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-01b66895-7fc4-46b1-b099-115d8daf158b	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	9ed34829-6b87-4259-b60b-5ec3a8b650e3	\N	L1	2	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-edebf522-276d-44d8-9138-6deff17d6b78	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	bbfbd1a3-9fce-4752-b8e7-bddb9c2a192d	\N	L1	2	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-555dc070-2ef4-4b2b-9093-e4318b9849ed	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	fdeb8451-82f5-4c65-a8d1-c52c53ab6090	\N	L1	2	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-2b8d255b-4e46-4777-957f-62a509fd9b41	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	e0459725-a48e-45f0-823a-5aee6668ab05	\N	L1	2	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-dae47b27-d18d-491c-931c-39bbea968051	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	4e406ae6-844d-48dc-bae6-ce5ca64026e5	\N	L1	2	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-d276b26f-b297-4503-98d2-5d2bb5b5616e	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	bb0e7c53-8c41-499d-8288-01ac3458e577	\N	L1	2	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
restored-ca3fd959-9f7c-4c42-bceb-faac38dcfb6b	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	e855c7ea-ae84-4dab-807c-1f1bc0fc968a	\N	L1	2	CORE	\N	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
4fa7c291-3166-48fc-956e-e3a6346153d9	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	9609dfe2-3a47-4dd2-a941-ad5d7a45e906	\N	L1	1	CORE	\N	\N
60be9124-d2fe-4616-8e87-02b667b179c6	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	4d71d2ef-d1be-48db-9e48-e12d1f445329	\N	L1	1	CORE	\N	\N
53a0915e-034a-4e79-afec-d1e47a7f0a0f	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	a684256c-7801-47b6-9d3e-e334f334e63c	\N	L1	1	CORE	\N	\N
fd3536de-5bc5-419f-ac1e-5be2a495ccc6	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	7e1f26b7-fb20-445e-abe3-5a43f9a2c7af	\N	L1	1	CORE	\N	\N
cd11ff47-4f1a-4a6e-b441-1dc0ffb6deb7	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	f060c389-3ffb-4733-b21d-e3b59310d723	\N	L1	1	CORE	\N	\N
bca03627-d574-4178-a2a8-418d569f3846	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	50a00c33-a365-4ebe-a7eb-127d7efda5f6	\N	L1	1	CORE	\N	\N
305ac759-0fb7-4535-a458-c1fc725e14ff	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	187bb9de-c86f-43d2-b47c-f27de80967e7	\N	L1	2	CORE	\N	\N
f6407507-a6dc-4e01-9ef5-59dcca2ee6ef	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	0a308fe3-8c2f-4aae-918e-9c425ecb44c2	\N	L1	2	CORE	\N	\N
79072c2f-a92c-4509-801d-34e2da409fef	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	9df5d19b-1a4b-4cb5-a586-d649a7cb9add	\N	L1	2	CORE	\N	\N
8ef20bae-df2b-4f63-a223-92caf196dfce	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	194ba375-3037-4f18-9c56-306aefe4e499	\N	L1	2	CORE	\N	\N
5017b6f8-0ee3-4569-8085-6d2a644c4412	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	9fede30e-98ea-43e8-9a96-2e66bdb404bf	\N	L1	2	CORE	\N	\N
1f1cee79-5314-4353-8ffc-3a83d3fb7920	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	58c560d6-06f3-4331-bd7d-81422a7d7139	\N	L1	2	CORE	\N	\N
f5146901-d667-44f6-9002-3fae3a1e5ba0	ca7dfed6-55a9-46c5-bee1-7034852ea30b	\N	187bb9de-c86f-43d2-b47c-f27de80967e7	\N	L1	2	CORE	\N	\N
43788e3f-c485-41a3-91a9-dad41f6a767e	ca7dfed6-55a9-46c5-bee1-7034852ea30b	\N	0a308fe3-8c2f-4aae-918e-9c425ecb44c2	\N	L1	2	CORE	\N	\N
c072e919-2944-46e9-a8d1-d73d36ce0d6a	ca7dfed6-55a9-46c5-bee1-7034852ea30b	\N	9df5d19b-1a4b-4cb5-a586-d649a7cb9add	\N	L1	2	CORE	\N	\N
c3cd404b-2016-43a8-aa46-3fa9d4a970b0	ca7dfed6-55a9-46c5-bee1-7034852ea30b	\N	194ba375-3037-4f18-9c56-306aefe4e499	\N	L1	2	CORE	\N	\N
bb3941b7-f494-417d-91b2-3c0f31fa9e88	ca7dfed6-55a9-46c5-bee1-7034852ea30b	\N	9fede30e-98ea-43e8-9a96-2e66bdb404bf	\N	L1	2	CORE	\N	\N
22790fb8-cf7c-47ac-8ac6-bf7a44d429bc	ca7dfed6-55a9-46c5-bee1-7034852ea30b	\N	58c560d6-06f3-4331-bd7d-81422a7d7139	\N	L1	2	CORE	\N	\N
e52af00c-56b3-4a85-9b2a-526da5008fe0	ca7dfed6-55a9-46c5-bee1-7034852ea30b	\N	c08df20a-02dc-4e5c-b498-729d78cb5983	\N	L1	2	CORE	\N	\N
5c780c17-1d0b-4d69-a249-d0e2dabee07e	ca7dfed6-55a9-46c5-bee1-7034852ea30b	\N	6860d3ee-dd78-4fe1-8b9b-4ada56cb913e	\N	L2	1	CORE	\N	\N
ced94af6-cdc1-4465-b6c1-e6d381d80173	ca7dfed6-55a9-46c5-bee1-7034852ea30b	\N	0bbd3aa6-1e2b-4e99-af0a-f3f84cc75a10	\N	L2	1	CORE	\N	\N
4e3896a9-2fd7-4f09-b91d-269d82eb9c9d	ca7dfed6-55a9-46c5-bee1-7034852ea30b	\N	037453b4-bc30-4640-95e3-12fdaba828fa	\N	L2	1	CORE	\N	\N
7809ba92-73be-47f0-bcfe-fa35a8caf136	ca7dfed6-55a9-46c5-bee1-7034852ea30b	\N	68dddd76-e8bd-4e40-838b-646688be7efe	\N	L2	1	CORE	\N	\N
54c9b86f-1dea-4a19-b320-b7009c03e5af	ca7dfed6-55a9-46c5-bee1-7034852ea30b	\N	da40a045-4e9a-408c-a5ae-d535aba296ac	\N	L2	1	CORE	\N	\N
e157164b-19e1-4b73-a2d6-70c2ddb9a70e	ca7dfed6-55a9-46c5-bee1-7034852ea30b	\N	f82c0d24-7715-47e1-9898-dda42e472318	\N	L2	1	CORE	\N	\N
77bd2415-068c-4c22-b664-ff94822d6bf0	ca7dfed6-55a9-46c5-bee1-7034852ea30b	\N	aab05c64-c69e-4c65-9bb8-5b5908627608	\N	L2	1	CORE	\N	\N
e7c296e8-d93c-427f-ac07-ec33538ee645	ca7dfed6-55a9-46c5-bee1-7034852ea30b	\N	4fcb0b35-242f-4aa5-b1bc-b4924a8dc664	\N	L2	2	CORE	\N	\N
27faf0bf-854d-42f7-876f-d8d08185a360	ca7dfed6-55a9-46c5-bee1-7034852ea30b	\N	7c24057a-3e64-4c31-a0de-9593a2bd498a	\N	L2	2	CORE	\N	\N
8f39d856-f54f-4c99-92d9-e442beb8a8ca	ca7dfed6-55a9-46c5-bee1-7034852ea30b	\N	6c2848bd-f6ec-4354-98ab-929d2b016bd0	\N	L2	2	CORE	\N	\N
fe03b20f-925e-445a-9752-871699fc8519	ca7dfed6-55a9-46c5-bee1-7034852ea30b	\N	b89a3527-0029-4474-a7e4-0c30921a850d	\N	L2	2	CORE	\N	\N
b56f697e-c80e-4ce4-9501-63001d0001be	ca7dfed6-55a9-46c5-bee1-7034852ea30b	\N	7a1c7fc1-0c6e-4451-8982-4a7fbd42f4d9	\N	L2	2	CORE	\N	\N
0ac7dc65-a08c-4df5-9396-33d383dd0d93	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	c08df20a-02dc-4e5c-b498-729d78cb5983	\N	L1	2	CORE	\N	\N
020bf73a-7246-4803-ad28-0ade4889da62	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	00ac0409-f8ba-4a55-9c6d-16554d6a3e2f	\N	L2	2	CORE	\N	\N
27bd56f8-3102-4967-9eb8-65a39b6c795a	ca7dfed6-55a9-46c5-bee1-7034852ea30b	\N	90e3962b-b939-4053-b238-20cf398e4644	\N	L4	1	CORE	\N	\N
0e6b160c-b0fc-4088-b9d8-1011d76d6fe1	ca7dfed6-55a9-46c5-bee1-7034852ea30b	\N	28277cd5-9c7b-4c37-93a2-460c68cf8bb8	\N	L4	1	CORE	\N	\N
cb635f9b-aff4-43a1-b333-d340a07f1dc6	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	9609dfe2-3a47-4dd2-a941-ad5d7a45e906	\N	L1	1	CORE	\N	\N
95282e1c-f33b-4bcd-b7cf-e43be33a5cf1	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	4d71d2ef-d1be-48db-9e48-e12d1f445329	\N	L1	1	CORE	\N	\N
7a7819a3-2186-41e1-a6b3-8ae3c7403b6e	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	a684256c-7801-47b6-9d3e-e334f334e63c	\N	L1	1	CORE	\N	\N
8a0fa69d-cba3-41bf-b244-d8d2fc8f391a	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	7e1f26b7-fb20-445e-abe3-5a43f9a2c7af	\N	L1	1	CORE	\N	\N
dd277cb0-aa26-498c-8c48-ebca1a0b8645	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	f060c389-3ffb-4733-b21d-e3b59310d723	\N	L1	1	CORE	\N	\N
fdc8fda5-daa3-42f1-be3e-4c3b38945a09	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	50a00c33-a365-4ebe-a7eb-127d7efda5f6	\N	L1	1	CORE	\N	\N
cbef5cf6-fca0-446a-89ec-25ffc906d0ca	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	187bb9de-c86f-43d2-b47c-f27de80967e7	\N	L1	2	CORE	\N	\N
ade44db3-f03b-4b2f-9753-8982c2c59fb1	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	0a308fe3-8c2f-4aae-918e-9c425ecb44c2	\N	L1	2	CORE	\N	\N
ebf242ee-c26a-48b8-9a22-76e73dba9890	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	9df5d19b-1a4b-4cb5-a586-d649a7cb9add	\N	L1	2	CORE	\N	\N
c07c3a4c-5656-484f-a7dd-f14b42e58e9d	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	194ba375-3037-4f18-9c56-306aefe4e499	\N	L1	2	CORE	\N	\N
be3653d0-1690-4cc4-90b3-9a7516d4af2e	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	9fede30e-98ea-43e8-9a96-2e66bdb404bf	\N	L1	2	CORE	\N	\N
08e3da94-8755-49fb-8e86-7bc568d45353	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	58c560d6-06f3-4331-bd7d-81422a7d7139	\N	L1	2	CORE	\N	\N
fa1c26c3-5a0c-4b5d-8e71-c9bde2f8daea	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	6860d3ee-dd78-4fe1-8b9b-4ada56cb913e	\N	L2	1	CORE	\N	\N
a7a2063b-437d-4698-a745-9954fa015541	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	0bbd3aa6-1e2b-4e99-af0a-f3f84cc75a10	\N	L2	1	CORE	\N	\N
277cf48d-2015-4fa3-bab2-52f22f4058ef	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	037453b4-bc30-4640-95e3-12fdaba828fa	\N	L2	1	CORE	\N	\N
e8a32ffa-f873-43ac-925c-8df30ef42572	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	68dddd76-e8bd-4e40-838b-646688be7efe	\N	L2	1	CORE	\N	\N
410a0858-8ad8-4518-b93c-f2daf6ec5a65	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	91035b15-ccef-47c1-92ef-13eecac56045	\N	L2	1	CORE	\N	\N
f43f1659-f977-47a4-a9e1-f2aee3575243	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	4fcb0b35-242f-4aa5-b1bc-b4924a8dc664	\N	L2	2	CORE	\N	\N
1b6bcd8f-747b-478c-b1f4-5339e63c4409	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	222e7280-445c-4c6e-b515-2efe5e3c68ff	\N	L2	2	CORE	\N	\N
3ddeae18-ccf9-4e42-ab05-578a2f088e3f	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	45152844-fbfc-471f-9304-1315b5a8c087	\N	L2	2	CORE	\N	\N
d00e2a15-8134-4148-951a-979c69376852	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	7c24057a-3e64-4c31-a0de-9593a2bd498a	\N	L2	2	CORE	\N	\N
e9a18e0e-58ba-493f-b9b2-307a13b9ff86	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	840e23cb-0bd0-4024-867e-eef72cf98a70	\N	L2	2	CORE	\N	\N
2f08ff9c-27bb-453a-9083-e7e6670d4436	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	b89a3527-0029-4474-a7e4-0c30921a850d	\N	L2	2	CORE	\N	\N
b14028de-6e96-458b-9950-30328e69a9f8	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	7a1c7fc1-0c6e-4451-8982-4a7fbd42f4d9	\N	L2	2	CORE	\N	\N
a3f0d77a-e688-47f9-84b6-ee3f49ee1e6c	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	89eacd27-7707-404c-aaad-1328ad1ef28b	\N	L3	1	CORE	\N	\N
f5060af9-7310-44a7-802e-8fb476deca3d	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	294b69cc-a7ec-487d-b081-128a01509f47	\N	L3	1	CORE	\N	\N
255b8743-4435-47a1-9d8c-02e738d8f881	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	e5e670ff-b6d4-4b97-af37-7e0c31140e35	\N	L3	1	CORE	\N	\N
d1bf8f44-4d13-431a-a3bb-c75fdf9a13c0	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	771bd1f6-6f89-45b7-8eb3-e96fb7eac3c0	\N	L3	1	CORE	\N	\N
d087b404-6f05-4212-857b-928f952da933	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	2760c24f-aed6-476f-b911-7738c1a11d86	\N	L3	1	ELECTIVE	\N	\N
fdab1e13-7706-4f92-8dba-8d25c6787f52	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	172b4601-64b0-48d6-9f3b-31a241582adf	\N	L3	1	ELECTIVE	\N	\N
8408f050-d212-4852-8bb8-d587e196aee1	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	ebfa6454-83cf-4d90-9237-2566746d3575	\N	L3	1	ELECTIVE	\N	\N
b28e89b0-0b1c-4182-86a4-f93ead2a7aea	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	d7a78d3c-5800-4298-809a-b692157344e3	\N	L3	1	ELECTIVE	\N	\N
2f71c350-8baa-4f53-ba76-81227d449d21	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	c558a08e-c729-4369-86f2-9266c1cdc0d6	\N	L3	1	ELECTIVE	\N	\N
42f8135f-44ff-4851-9d48-01896d6df572	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	fa0ae5dc-a12f-4423-a52c-21274c0e6ddb	\N	L3	1	ELECTIVE	\N	\N
f3908424-e5f3-4f3d-80d9-0eec31ba3391	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	961993da-f737-44ac-b1b5-5fa5264dca12	\N	L3	2	CORE	\N	\N
904f938b-b772-4176-9eef-8e4da5db3d63	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	90e3962b-b939-4053-b238-20cf398e4644	\N	L4	1	CORE	\N	\N
ba9e8446-cabe-4ec5-b729-a36008ef05d6	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	2fe6fe04-2630-49f5-8355-0d277ea2fb8f	\N	L4	1	CORE	\N	\N
8eeffd15-e84b-40c9-915b-e5c4d6746372	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	11421878-f187-4baf-897e-b0dea0494401	\N	L4	1	CORE	\N	\N
3a017a6d-23cf-4790-8c77-73b19c3bdc83	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	880d4408-f797-4673-bf13-f3a77c37e9b1	\N	L4	1	CORE	\N	\N
e67caa1a-5ca8-41fb-9a07-6d0ab966cc0f	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	87d9c721-ff98-4942-a210-f7db026f68c1	\N	L4	1	ELECTIVE	\N	\N
69320be5-d5df-41f4-b8a7-49f3a3b91f72	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	15010796-ab46-49bf-928e-3672b2c908f1	\N	L4	1	ELECTIVE	\N	\N
147a9a1a-0750-4a31-9ecf-c58c05a27b72	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	36c68aa9-786d-4bd0-9b92-d6f9f8de9263	\N	L4	1	ELECTIVE	\N	\N
f696dcd7-9b2f-4e86-b671-9f82b78688a9	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	7a7c6fa2-ffdb-4c28-a577-8b1573f80489	\N	L4	1	ELECTIVE	\N	\N
9aebe6d0-7632-4b4e-af9f-0594bf329bba	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	240ab053-55ea-4601-882a-59f449c89dfb	\N	L4	1	ELECTIVE	\N	\N
2e7788f9-233e-4818-8afa-6ffd2f364b35	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	337ce08d-1ae2-47fd-a97d-e9d32d616229	\N	L4	2	CORE	\N	\N
6d544ca9-66af-4f1a-a5fe-e47a31a7d617	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	fe8c8583-0fee-483c-a4d2-a165f290bd29	\N	L4	2	ELECTIVE	\N	\N
6e8991d9-1e26-4369-9fc7-7bcf1f4b738d	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	4d3e12fe-59f7-4025-90c8-ee6a0f644b56	\N	L4	2	ELECTIVE	\N	\N
10d81391-ad8f-4d9f-9fd0-28eab94761d2	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	52a8885e-f1d8-4324-8288-3e8fee958974	\N	L4	2	ELECTIVE	\N	\N
1d6738cc-856c-4b42-82e1-5103a5509cf6	ca7dfed6-55a9-46c5-bee1-7034852ea30b	\N	6e1a64d1-1639-4fb0-a928-be337cb524f2	\N	L1	1	CORE	\N	d0f33d92-6ff5-4627-801e-7edaceec7253
456bd340-9b48-4b6d-ab2a-2892d8eb1ff6	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	6e1a64d1-1639-4fb0-a928-be337cb524f2	\N	L1	1	CORE	\N	d0f33d92-6ff5-4627-801e-7edaceec7253
ba6193d3-f4dc-42aa-b448-f2d2a7e087bc	ca7dfed6-55a9-46c5-bee1-7034852ea30b	\N	186ce288-fa25-4da9-a864-dfd369cfc125	\N	L1	1	CORE	\N	d0f33d92-6ff5-4627-801e-7edaceec7253
f0d3844e-d20f-4140-98f8-1796f90177de	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	186ce288-fa25-4da9-a864-dfd369cfc125	\N	L1	1	CORE	\N	d0f33d92-6ff5-4627-801e-7edaceec7253
67b5c55e-380f-46e3-8f0f-b0083445c3c5	ca7dfed6-55a9-46c5-bee1-7034852ea30b	\N	e9ba4e78-6501-49ea-ba85-e8c26ff7de9f	\N	L2	1	CORE	\N	d0f33d92-6ff5-4627-801e-7edaceec7253
31b8bd1a-cffb-4013-841e-2a372e787d03	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	e9ba4e78-6501-49ea-ba85-e8c26ff7de9f	\N	L2	1	CORE	\N	d0f33d92-6ff5-4627-801e-7edaceec7253
64f35c82-519b-4e60-af42-9360b09a245b	ca7dfed6-55a9-46c5-bee1-7034852ea30b	\N	92fe961a-8972-440e-a57f-13b9d1f3f0c6	\N	L2	2	CORE	\N	d0f33d92-6ff5-4627-801e-7edaceec7253
92f1fd11-8230-46fd-aafd-b740800627ae	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	92fe961a-8972-440e-a57f-13b9d1f3f0c6	\N	L2	2	CORE	\N	d0f33d92-6ff5-4627-801e-7edaceec7253
bfadd625-ed7b-4d2a-ae8e-d9f971b3877c	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	9609dfe2-3a47-4dd2-a941-ad5d7a45e906	\N	L1	1	CORE	\N	\N
9ea84762-89a7-4994-be24-60628f93d032	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	4d71d2ef-d1be-48db-9e48-e12d1f445329	\N	L1	1	CORE	\N	\N
10af2556-65dc-401a-bb5b-8f984f2fea2a	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	a684256c-7801-47b6-9d3e-e334f334e63c	\N	L1	1	CORE	\N	\N
08a973c7-9d1d-41b8-b375-f8655a5a5ad4	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	7e1f26b7-fb20-445e-abe3-5a43f9a2c7af	\N	L1	1	CORE	\N	\N
62d27c1e-e911-4a31-b9fe-f54d7f80236e	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	f060c389-3ffb-4733-b21d-e3b59310d723	\N	L1	1	CORE	\N	\N
dbc78747-1f58-4786-8884-02010f9afd84	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	50a00c33-a365-4ebe-a7eb-127d7efda5f6	\N	L1	1	CORE	\N	\N
d2835c96-6bb1-4ca2-845a-440ae329659d	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	187bb9de-c86f-43d2-b47c-f27de80967e7	\N	L1	2	CORE	\N	\N
195bddbd-af09-41a8-a363-c1c5d67f8025	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	0a308fe3-8c2f-4aae-918e-9c425ecb44c2	\N	L1	2	CORE	\N	\N
62610992-40c4-4415-98eb-ec197d1d18ec	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	9df5d19b-1a4b-4cb5-a586-d649a7cb9add	\N	L1	2	CORE	\N	\N
fbee7241-169a-4f02-9e42-613627bfc815	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	194ba375-3037-4f18-9c56-306aefe4e499	\N	L1	2	CORE	\N	\N
83044416-fee4-4083-b8af-3cfcbab166f4	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	9fede30e-98ea-43e8-9a96-2e66bdb404bf	\N	L1	2	CORE	\N	\N
ee066d81-f402-4df7-9ef0-b932e8893ff3	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	58c560d6-06f3-4331-bd7d-81422a7d7139	\N	L1	2	CORE	\N	\N
4979c09a-cde4-4215-af5f-970a38d5640c	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	c08df20a-02dc-4e5c-b498-729d78cb5983	\N	L1	2	CORE	\N	\N
9e36681a-68fc-400e-8826-c8f2e77ab82d	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	6e1a64d1-1639-4fb0-a928-be337cb524f2	\N	L1	1	CORE	\N	d0f33d92-6ff5-4627-801e-7edaceec7253
456ce560-e26a-4bf7-844c-4caa631be58e	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	186ce288-fa25-4da9-a864-dfd369cfc125	\N	L1	1	CORE	\N	d0f33d92-6ff5-4627-801e-7edaceec7253
19dab695-a2df-427a-951c-0decb6fad3c3	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	e5e670ff-b6d4-4b97-af37-7e0c31140e35	\N	L3	1	CORE	\N	\N
77e02a30-1b2c-414d-8119-504bde4cc7fe	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	e5e670ff-b6d4-4b97-af37-7e0c31140e35	\N	L3	1	CORE	\N	\N
a99ae7f6-1430-4441-bdf7-46b133881faa	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	e5e670ff-b6d4-4b97-af37-7e0c31140e35	\N	L3	1	CORE	\N	\N
c4f38ec9-4fd2-48f4-89f6-d750b57a27b0	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	6b30076b-6f78-401d-abfe-bd0197844fcd	\N	L3	1	CORE	\N	\N
93fc28f6-3b90-4e18-859c-c3a7df82870b	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	6b30076b-6f78-401d-abfe-bd0197844fcd	\N	L3	1	CORE	\N	\N
614bf727-a1c3-4151-824a-d296b531e780	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	6b30076b-6f78-401d-abfe-bd0197844fcd	\N	L3	1	CORE	\N	\N
25cb3fbe-c9c4-45cb-aec4-f6863ee67b1b	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	1fee972c-6d01-436b-803d-c6d3261b6189	\N	L3	1	CORE	\N	\N
168749a1-c7dc-4d41-849f-1b2990939769	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	1fee972c-6d01-436b-803d-c6d3261b6189	\N	L3	1	ELECTIVE	\N	\N
1028d6b1-eb0a-4746-b5fe-26b99a6b4a29	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	1fee972c-6d01-436b-803d-c6d3261b6189	\N	L3	1	ELECTIVE	\N	\N
d46eab06-ce9f-4868-902b-3f757abbf7b6	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	842a80db-242d-4df0-b980-65e24a4bdcb6	\N	L3	1	CORE	\N	\N
2397db8d-8deb-4e01-ace3-c7d3d2b889d3	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	842a80db-242d-4df0-b980-65e24a4bdcb6	\N	L3	1	ELECTIVE	\N	\N
80e7396b-d4ad-4c3f-a735-a12dde320ab9	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	842a80db-242d-4df0-b980-65e24a4bdcb6	\N	L3	1	ELECTIVE	\N	\N
2c587122-7a73-4ab8-ac38-2c49ec14a7ca	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	ad8c6dbd-28e0-430e-a266-d2cdeb3c937a	\N	L3	1	ELECTIVE	\N	\N
4db8c082-fb68-42a9-a969-a789640329fd	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	ad8c6dbd-28e0-430e-a266-d2cdeb3c937a	\N	L3	1	CORE	\N	\N
81cd6cde-c830-47ff-ba62-6ad8ccfbb645	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	ad8c6dbd-28e0-430e-a266-d2cdeb3c937a	\N	L3	1	ELECTIVE	\N	\N
8626a690-5f0b-434e-903b-453951f1145b	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	771bd1f6-6f89-45b7-8eb3-e96fb7eac3c0	\N	L3	1	CORE	\N	\N
dd50c4f6-3172-4067-8db8-e7ee6b99f548	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	771bd1f6-6f89-45b7-8eb3-e96fb7eac3c0	\N	L3	1	CORE	\N	\N
b5b07f86-1665-468d-8912-8e7264e7ceab	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	771bd1f6-6f89-45b7-8eb3-e96fb7eac3c0	\N	L3	1	CORE	\N	\N
6f3d10f7-2e47-4214-9f9b-8472e62ad8c8	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	30978923-a161-4550-8388-375df1c3e8ae	\N	L3	1	ELECTIVE	\N	\N
1160318b-6d92-42f8-8a2b-6e1526169eca	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	30978923-a161-4550-8388-375df1c3e8ae	\N	L3	1	CORE	\N	\N
26688f2d-b319-448b-bf12-6740e0a463ad	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	30978923-a161-4550-8388-375df1c3e8ae	\N	L3	1	ELECTIVE	\N	\N
9b0c8f8f-dc5e-4af8-8f3a-8a207e4bf895	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	9b185406-61c3-41e9-8858-58f97b158f61	\N	L3	1	ELECTIVE	\N	\N
0f7742a2-00b7-43e6-9293-eb342385c81f	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	9b185406-61c3-41e9-8858-58f97b158f61	\N	L3	1	ELECTIVE	\N	\N
a24f6906-05d6-4970-85c2-911ff93c2852	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	9b185406-61c3-41e9-8858-58f97b158f61	\N	L3	1	CORE	\N	\N
8864a595-808e-483d-a6c8-826fe015ef25	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	83c5ba1c-93f2-4b83-be77-a9f49e0ccb56	\N	L3	1	ELECTIVE	\N	\N
ac6ac842-4115-4f5b-a480-4bd4382e10df	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	83c5ba1c-93f2-4b83-be77-a9f49e0ccb56	\N	L3	1	ELECTIVE	\N	\N
fcaea760-91be-4a3b-8f08-115611a0c403	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	83c5ba1c-93f2-4b83-be77-a9f49e0ccb56	\N	L3	1	CORE	\N	\N
635f12cc-6dc3-4b38-8451-f4708acc961a	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	294b69cc-a7ec-487d-b081-128a01509f47	\N	L3	1	ELECTIVE	\N	\N
28c9cb63-9e1c-4bf8-9ecc-43ae432ccb2a	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	294b69cc-a7ec-487d-b081-128a01509f47	\N	L3	1	ELECTIVE	\N	\N
5f30b57f-c576-488c-82aa-91735cf9d1e7	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	294b69cc-a7ec-487d-b081-128a01509f47	\N	L3	1	CORE	\N	\N
78b270b0-4d7b-4df5-9241-b0e47fad675f	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	c558a08e-c729-4369-86f2-9266c1cdc0d6	\N	L3	1	ELECTIVE	\N	\N
aa494bc4-189b-4091-9f33-d6c57ca18dd7	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	c558a08e-c729-4369-86f2-9266c1cdc0d6	\N	L3	1	ELECTIVE	\N	\N
1379e30c-1354-4c7a-a559-0298bd1c8b93	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	c558a08e-c729-4369-86f2-9266c1cdc0d6	\N	L3	1	ELECTIVE	\N	\N
4559e39c-1fcd-436e-a030-64112800961b	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	3e6f95ea-4a25-47a6-8464-856a1685bb80	\N	L3	1	ELECTIVE	\N	\N
6b4c6d00-fe1e-4d91-b7fd-5e37efabe1d5	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	3e6f95ea-4a25-47a6-8464-856a1685bb80	\N	L3	1	ELECTIVE	\N	\N
7d27f8a4-f55e-4852-9c28-8404d0aae5f0	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	3e6f95ea-4a25-47a6-8464-856a1685bb80	\N	L3	1	ELECTIVE	\N	\N
b1ded7c6-a3f8-4eec-a862-2fcfe5ad0ff8	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	961993da-f737-44ac-b1b5-5fa5264dca12	\N	L3	2	CORE	\N	\N
ff92dc5d-174f-4e71-b651-0d29f31ad85d	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	961993da-f737-44ac-b1b5-5fa5264dca12	\N	L3	2	CORE	\N	\N
b59dab51-55db-44d3-8521-c7070122c0e3	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	961993da-f737-44ac-b1b5-5fa5264dca12	\N	L3	2	CORE	\N	\N
5ff3dbd3-7e28-4f58-9b26-2f24db436897	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	11421878-f187-4baf-897e-b0dea0494401	\N	L4	1	CORE	\N	\N
fba541f5-be82-489d-a3cb-ee170d18ff18	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	11421878-f187-4baf-897e-b0dea0494401	\N	L4	1	CORE	\N	\N
1e69cac0-792c-49d6-a3ab-f6cf7852b918	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	11421878-f187-4baf-897e-b0dea0494401	\N	L4	1	CORE	\N	\N
f1b9c335-e584-4916-baf9-bdee7ac3019c	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	69319868-4c9d-413b-b7fe-5ef4065f4856	\N	L4	1	CORE	\N	\N
b82efc1c-d86e-4d0c-9216-b68ae8f83596	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	69319868-4c9d-413b-b7fe-5ef4065f4856	\N	L4	1	ELECTIVE	\N	\N
965b72cf-ad99-45c6-be99-ea4c73254022	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	69319868-4c9d-413b-b7fe-5ef4065f4856	\N	L4	1	ELECTIVE	\N	\N
c11ba1b4-0e70-4727-be1a-65e3d49cc8ac	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	6934c7e2-1acc-4a62-a04c-f2080e7949ee	\N	L4	1	ELECTIVE	\N	\N
08d36407-fbd4-47b1-a659-fec07c01c5f8	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	6934c7e2-1acc-4a62-a04c-f2080e7949ee	\N	L4	1	ELECTIVE	\N	\N
0a9fa6cf-ca3a-4a19-a6e2-3edd1c27a772	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	6934c7e2-1acc-4a62-a04c-f2080e7949ee	\N	L4	1	ELECTIVE	\N	\N
fccc0184-a5ee-4e45-b79f-d9480cbe7956	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	cee0f579-1fe3-45c7-a022-9267ae7f253e	\N	L4	1	ELECTIVE	\N	\N
c79cdefe-3b03-479c-9f71-6e63f151759d	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	cee0f579-1fe3-45c7-a022-9267ae7f253e	\N	L4	1	ELECTIVE	\N	\N
fbdca9f4-61fb-42b3-bd15-ceadeff07ebc	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	cee0f579-1fe3-45c7-a022-9267ae7f253e	\N	L4	1	CORE	\N	\N
9bac5bd0-358b-429f-89f2-56257203521a	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	37611975-b014-42da-95c3-8cbd1e2843f9	\N	L4	1	ELECTIVE	\N	\N
a473266e-26c6-4ed4-87d8-8dd8c2464736	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	37611975-b014-42da-95c3-8cbd1e2843f9	\N	L4	1	ELECTIVE	\N	\N
99f48efb-bafa-458b-a4c1-61c3edb93ad1	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	37611975-b014-42da-95c3-8cbd1e2843f9	\N	L4	1	CORE	\N	\N
37ca84c2-59cf-4d3c-b24e-9f9448d56dbe	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	2fe6fe04-2630-49f5-8355-0d277ea2fb8f	\N	L4	1	CORE	\N	\N
39dbc359-6c7d-4b80-82b8-723a2c8c2543	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	2fe6fe04-2630-49f5-8355-0d277ea2fb8f	\N	L4	1	CORE	\N	\N
cb9e5e95-31f6-41b4-8cc8-5ea8ecca5f77	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	2fe6fe04-2630-49f5-8355-0d277ea2fb8f	\N	L4	1	CORE	\N	\N
e0c66782-dac4-42af-868c-0a5203d2c74a	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	c7d7cf4c-0113-4ebb-9474-a7d7a884e3cd	\N	L4	1	ELECTIVE	\N	\N
044f1a57-9b8a-4d76-9b39-dae74385b861	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	c7d7cf4c-0113-4ebb-9474-a7d7a884e3cd	\N	L4	1	CORE	\N	\N
7e9c5448-6ab0-43a7-a603-a5412c190412	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	c7d7cf4c-0113-4ebb-9474-a7d7a884e3cd	\N	L4	1	ELECTIVE	\N	\N
0a74b571-2dfe-471a-8cde-210cffab1877	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	cb4b0bc4-fb3a-4519-826a-6a9772335779	\N	L4	1	ELECTIVE	\N	\N
e4fe8651-a22e-401e-b38f-1dec950e0add	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	cb4b0bc4-fb3a-4519-826a-6a9772335779	\N	L4	1	ELECTIVE	\N	\N
0152f689-9c10-4865-85b9-097919f94eba	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	cb4b0bc4-fb3a-4519-826a-6a9772335779	\N	L4	1	ELECTIVE	\N	\N
69d8bea6-9566-4438-8921-5ca735df4d42	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	1c52a9bd-8940-4ff0-8208-dbaa110c5af3	\N	L4	1	ELECTIVE	\N	\N
ad22e8e8-4f26-490e-9343-020d96c49d4d	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	1c52a9bd-8940-4ff0-8208-dbaa110c5af3	\N	L4	1	ELECTIVE	\N	\N
e11fb34a-54eb-4a4b-983a-7a212ae24bbb	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	1c52a9bd-8940-4ff0-8208-dbaa110c5af3	\N	L4	1	ELECTIVE	\N	\N
da50e62a-92b1-49f0-93fb-629c11a877f7	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	73f8dfec-691a-4ff2-9625-725b9cbdd9ec	\N	L4	1	ELECTIVE	\N	\N
e485f47f-eb9b-424f-a8c7-4071793a9fd8	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	73f8dfec-691a-4ff2-9625-725b9cbdd9ec	\N	L4	1	ELECTIVE	\N	\N
d34878c9-4960-4e35-ab83-189ebc9b9ed5	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	73f8dfec-691a-4ff2-9625-725b9cbdd9ec	\N	L4	1	ELECTIVE	\N	\N
7e94cde4-3141-46c4-a3a8-5b834d198342	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	75c23841-de42-4b5e-b9b7-47153cfea9bc	\N	L4	1	ELECTIVE	\N	\N
f8860dae-af5a-4195-9e91-7e97f9fe741c	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	75c23841-de42-4b5e-b9b7-47153cfea9bc	\N	L4	1	ELECTIVE	\N	\N
8e4ee061-654a-4cfe-82ae-d52420738c65	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	75c23841-de42-4b5e-b9b7-47153cfea9bc	\N	L4	1	ELECTIVE	\N	\N
75653ffd-d405-4ba4-a578-19cc029a054f	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	5e85cf1a-25cc-4a05-b54c-e5f63637a7d6	\N	L4	1	ELECTIVE	\N	\N
412db711-6881-4b53-b456-9d21d410735f	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	5e85cf1a-25cc-4a05-b54c-e5f63637a7d6	\N	L4	1	ELECTIVE	\N	\N
6d503d51-2fed-430a-871a-9ef80b51384e	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	5e85cf1a-25cc-4a05-b54c-e5f63637a7d6	\N	L4	1	ELECTIVE	\N	\N
98a7a9d6-cb24-431b-8aee-870ae30386d7	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	aad74d93-8665-4213-a1be-3d103934498d	\N	L4	2	CORE	\N	\N
582bd9f4-6ee2-46de-a1c5-d479c71f17cb	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	aad74d93-8665-4213-a1be-3d103934498d	\N	L4	2	ELECTIVE	\N	\N
b4809ee2-0d85-4b8d-9d06-d5be8d1c5777	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	aad74d93-8665-4213-a1be-3d103934498d	\N	L4	2	ELECTIVE	\N	\N
03c49dee-7184-46ed-9fb9-3c6f0ef5869d	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	3b9b100f-2ef9-4985-bab5-f09fce4cfa2f	\N	L4	2	ELECTIVE	\N	\N
2d44ea22-054a-443a-b435-0d3eb66cdcce	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	3b9b100f-2ef9-4985-bab5-f09fce4cfa2f	\N	L4	2	ELECTIVE	\N	\N
5aa17961-e61b-480e-967d-6adad2bac1c1	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	3b9b100f-2ef9-4985-bab5-f09fce4cfa2f	\N	L4	2	ELECTIVE	\N	\N
208118b0-3312-49b0-b6a1-9b40229cb5e3	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	bd8e82e8-7a05-4619-a3b1-b7cdfdee10eb	\N	L4	2	ELECTIVE	\N	\N
a760e981-2453-4df4-8f06-308f70bcab43	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	bd8e82e8-7a05-4619-a3b1-b7cdfdee10eb	\N	L4	2	ELECTIVE	\N	\N
53bfb62c-f0ae-408f-b428-507cf175d82e	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	bd8e82e8-7a05-4619-a3b1-b7cdfdee10eb	\N	L4	2	ELECTIVE	\N	\N
8ac27c4e-eb0d-4002-b939-94395d9d0beb	ca7dfed6-55a9-46c5-bee1-7034852ea30b	874bac7f-3644-4aeb-a328-02a809c017f2	d40cf07d-28a9-4701-9f9c-061a519eb64d	\N	L4	2	ELECTIVE	\N	\N
9d4f1656-29a6-460f-9857-3740778c40d3	ca7dfed6-55a9-46c5-bee1-7034852ea30b	b1ba53c1-064a-447e-b26c-a897b5f3299d	d40cf07d-28a9-4701-9f9c-061a519eb64d	\N	L4	2	ELECTIVE	\N	\N
4925802f-9825-47fb-8d23-16bad3104c87	ca7dfed6-55a9-46c5-bee1-7034852ea30b	0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	d40cf07d-28a9-4701-9f9c-061a519eb64d	\N	L4	2	ELECTIVE	\N	\N
\.


--
-- Data for Name: Ranking; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public."Ranking" (ranking_id, student_id, degree_path_id, rank, gpa, weighted_average, created_at) FROM stdin;
\.


--
-- Data for Name: Semester; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public."Semester" (semester_id, academic_year_id, label, start_date, end_date) FROM stdin;
3382c9f4-30d9-46ef-91bc-45467677518a	d0f33d92-6ff5-4627-801e-7edaceec7253	Semester 1	2024-02-01 00:00:00	2024-06-30 00:00:00
b52e9840-4294-4c6b-86a9-2315f51dd27c	d0f33d92-6ff5-4627-801e-7edaceec7253	Semester 2	2024-08-01 00:00:00	2024-12-31 00:00:00
c3cc4391-4716-4e1b-9b8e-08497c48c754	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	Semester 2	2026-07-03 12:00:00	2027-01-01 00:00:00
3c445cf7-457e-4538-8599-596fea4ac9c1	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	Semester 1	2026-01-01 00:00:00	2026-07-02 12:00:00
\.


--
-- Data for Name: Specialization; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public."Specialization" (specialization_id, code, name, active, description, program_id, academic_year_id) FROM stdin;
874bac7f-3644-4aeb-a328-02a809c017f2	BSE	Business Systems Engineering	t	\N	ca7dfed6-55a9-46c5-bee1-7034852ea30b	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
b1ba53c1-064a-447e-b26c-a897b5f3299d	OSCM	Operations and Supply Chain Management	t	\N	ca7dfed6-55a9-46c5-bee1-7034852ea30b	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
0e1e586c-10ab-4a82-ac31-66bd0fb5f7c3	IS	Information Systems	t	\N	ca7dfed6-55a9-46c5-bee1-7034852ea30b	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
\.


--
-- Data for Name: Staff; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public."Staff" (staff_id, staff_number, staff_type, department) FROM stdin;
fdd458a5-efdd-4565-957a-ebbdbcc09e3c	ADM000	ADMIN	Registry
d49ffbb9-cc8a-4944-abbc-dca2887b0843	LEC001	ACADEMIC	Computing
ADMIN001	ADM001	ADMIN	Registry
cd570f68-a16d-4379-af96-a07b43a2cd82	IM_707C081135	ACADEMIC	IM
d0006f91-fbb6-4037-b2ec-9fef0e828342	IM_D27B950869	ACADEMIC	IM
2c5ced79-0341-4185-8d51-6eac14cdf36f	IM_5FBB94A875	ACADEMIC	IM
bb8c46fe-88e7-45c0-aedc-11bce0665734	IM_25296376F4	ACADEMIC	IM
599cb63f-b19a-424c-aad6-7f0d4fa66eb5	IM_921E1B58BB	ACADEMIC	IM
b7ae9438-4c82-4c09-a90a-bad4b648e495	IM_DB4B9A11D2	ACADEMIC	IM
88d65386-fb87-449c-9acd-f08e329c4568	IM_0EC21DCA02	ACADEMIC	IM
8360a926-2023-4a61-a986-8ddeb3ea9ec4	IM_6451313F95	ACADEMIC	IM
4473498f-15ef-47b3-80fe-7001c9f5ab32	IM_43A1C0C37D	ACADEMIC	IM
7d5608ea-a091-4283-a9bd-fe3e463f6b86	IM_DAD5D9DD79	ACADEMIC	IM
e5ce552c-33c8-4719-989b-d8a6e82141fb	IM_AE1A74DC90	ACADEMIC	IM
b751c19d-63bd-4cf0-83f2-859cd1f9b8eb	IM_1DC8B3F71A	ACADEMIC	IM
0e551ed4-3c4f-470d-beba-3a5b30a54d83	IM_CEDFCF4DEE	ACADEMIC	IM
fe587071-49ff-43fc-a174-3c03ea3aac9b	IM_0C19EBFF73	ACADEMIC	IM
a2fd5222-2c84-4a97-9fcd-313f5ed44106	IM_3C2DE93B4A	ACADEMIC	IM
40173ed9-6b85-4d99-a4c3-37f5d617984d	IM_8E85553C4D	ACADEMIC	IM
5a8973b3-ba1e-4bdb-8f8f-dc176f01a054	IM_6621DC6040	ACADEMIC	IM
f9cd265a-62cf-4348-88fa-9610e82846ac	IM_B954D537AF	ACADEMIC	IM
4d9bc966-fa7a-4de3-af0f-ec8aa47f38e9	IM_A001181D26	ACADEMIC	IM
05c49617-eaa8-49af-b650-8ae609fb38ca	IM_BAE6C969FC	ACADEMIC	IM
\.


--
-- Data for Name: StaffAssignment; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public."StaffAssignment" (assignment_id, staff_id, program_id, module_id, role, assigned_at, active, academic_year_id) FROM stdin;
0c5d3bdc-9314-4b2c-8688-1983656b2dce	cd570f68-a16d-4379-af96-a07b43a2cd82	\N	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	LECTURER	2026-04-16 15:16:36.584	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
a43425d8-e963-4623-976c-d3dd398f40e9	cd570f68-a16d-4379-af96-a07b43a2cd82	\N	661f72d8-c8cb-435e-bd30-eeaf8ff178ec	LECTURER	2026-04-16 15:16:36.584	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
1dff6185-a7d8-4ca6-a408-7401145a3369	cd570f68-a16d-4379-af96-a07b43a2cd82	\N	1c7e98f4-059b-41ec-a46a-dfeca8d40b45	LECTURER	2026-04-16 15:16:36.584	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
aa28ba26-f961-4bf1-89d4-d0fd5a257fe0	cd570f68-a16d-4379-af96-a07b43a2cd82	\N	93201c4c-500c-4f59-b835-ce643647233d	LECTURER	2026-04-16 15:16:36.584	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
9decc11c-71f7-4377-8a96-2b8df09993d7	cd570f68-a16d-4379-af96-a07b43a2cd82	\N	d541c250-0aeb-485a-8327-2419bd99d254	LECTURER	2026-04-16 15:16:36.584	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
f8245cd5-aa46-4394-9fcb-d3412af0b329	d0006f91-fbb6-4037-b2ec-9fef0e828342	\N	e83d9cb9-04a4-4cf1-8ff3-a3629994cc3d	LECTURER	2026-04-16 15:16:36.584	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
c4e85048-809f-4f53-9f5e-328721742edc	d0006f91-fbb6-4037-b2ec-9fef0e828342	\N	30a296f6-a5fa-4dcd-9739-a2249ab5bd18	LECTURER	2026-04-16 15:16:36.584	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
80f85e2e-8223-4f80-8780-f1c68773f785	d0006f91-fbb6-4037-b2ec-9fef0e828342	\N	37f3d7fe-f95f-4037-935c-de0251ba251a	LECTURER	2026-04-16 15:16:36.584	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
5bc412a6-16ee-4673-8173-30f644467be6	d0006f91-fbb6-4037-b2ec-9fef0e828342	\N	74942921-d088-4069-9393-dba1b3e56257	LECTURER	2026-04-16 15:16:36.584	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
1816cf64-251d-429d-a321-bce692e22e9a	2c5ced79-0341-4185-8d51-6eac14cdf36f	\N	33a500a8-c04b-4c90-9d8e-794f5f1d1bed	LECTURER	2026-04-16 15:16:36.584	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
07a42daf-94af-4258-a75f-199298a9609a	2c5ced79-0341-4185-8d51-6eac14cdf36f	\N	a32527ec-65ca-4b05-a12b-253dd65c568a	LECTURER	2026-04-16 15:16:36.584	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
69608ccb-8110-4241-bece-a97ca2168102	2c5ced79-0341-4185-8d51-6eac14cdf36f	\N	2716a46c-afac-4c67-bb6a-5fad4818ed4f	LECTURER	2026-04-16 15:16:36.584	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
42a47f2c-8cfc-4bc0-b70f-e60b203f27d4	bb8c46fe-88e7-45c0-aedc-11bce0665734	\N	76cd81f0-8e51-4dd0-a414-85e33fa09b1d	LECTURER	2026-04-16 15:16:36.584	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
05dae04c-3e78-49fc-8924-985cff3ca46d	bb8c46fe-88e7-45c0-aedc-11bce0665734	\N	6137b228-aa85-450a-904f-b01ba80ce7a2	LECTURER	2026-04-16 15:16:36.584	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
9ac57df1-1ab2-415e-8e5d-5b5bed31694f	bb8c46fe-88e7-45c0-aedc-11bce0665734	\N	46f01733-2b23-44d5-9be0-2909af0c80b0	LECTURER	2026-04-16 15:16:36.584	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
6b1d12ff-89d7-438f-9d4a-d72ed68f4155	599cb63f-b19a-424c-aad6-7f0d4fa66eb5	\N	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	LECTURER	2026-04-16 15:16:36.584	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
c54d52f5-b813-400f-9127-3b8181550727	599cb63f-b19a-424c-aad6-7f0d4fa66eb5	\N	7842c578-5e24-4ffd-b3e2-028980270807	LECTURER	2026-04-16 15:16:36.584	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
32a5a6aa-d0eb-435b-b379-de57ae3c6e64	b7ae9438-4c82-4c09-a90a-bad4b648e495	\N	33923a51-708b-4165-8b07-64e2f51f9c74	LECTURER	2026-04-16 15:16:36.584	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
59961a17-2b36-48d1-b22a-ac4afa61e51b	b7ae9438-4c82-4c09-a90a-bad4b648e495	\N	0f3ce6ba-c933-4d94-9bb1-b4d76cf464f9	LECTURER	2026-04-16 15:16:36.584	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
03c7b957-53ac-4add-a8c2-7d00d0553473	b7ae9438-4c82-4c09-a90a-bad4b648e495	\N	2b72059a-e0bc-4334-a688-152358b2e78e	LECTURER	2026-04-16 15:16:36.584	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
4c5666c1-7aad-4bba-9754-8682e46e62a7	b7ae9438-4c82-4c09-a90a-bad4b648e495	\N	d541c250-0aeb-485a-8327-2419bd99d254	LECTURER	2026-04-16 15:16:36.584	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
4df1afb2-de86-4bbf-90bd-e972868c5c7e	88d65386-fb87-449c-9acd-f08e329c4568	\N	47822656-dd0f-454c-98e5-9fc88e89c1ed	LECTURER	2026-04-16 15:16:36.584	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
1719de35-2d5f-4a67-9d34-d5140a591cb1	88d65386-fb87-449c-9acd-f08e329c4568	\N	d8b6adc6-5106-4145-bbe0-a8e060213282	LECTURER	2026-04-16 15:16:36.584	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
60d619e3-2aec-4e25-9a06-ee2c2352af9f	8360a926-2023-4a61-a986-8ddeb3ea9ec4	\N	1b33f669-35a8-4044-8ec4-8818e2646d65	LECTURER	2026-04-16 15:16:36.584	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
10c69d16-5374-44d9-af2b-101d398c56f1	8360a926-2023-4a61-a986-8ddeb3ea9ec4	\N	7386b1df-3142-437d-ac02-1916002353f9	LECTURER	2026-04-16 15:16:36.584	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
6e0f2040-ac9a-46be-9140-3564e207ba72	8360a926-2023-4a61-a986-8ddeb3ea9ec4	\N	6e640c31-d0ac-4988-b875-bbfb3c41a434	LECTURER	2026-04-16 15:16:36.584	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
48ab857b-9be3-4091-9da0-9ca30d019fc5	4473498f-15ef-47b3-80fe-7001c9f5ab32	\N	d6caf588-83d1-4158-ae08-217ab162d754	LECTURER	2026-04-16 15:16:36.584	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
c8991f7c-363d-4356-8492-ff8bf418259b	4473498f-15ef-47b3-80fe-7001c9f5ab32	\N	7be2df4c-4f40-43cf-8e19-ceb02f2c3b8e	LECTURER	2026-04-16 15:16:36.584	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
4a7cc7a6-d7c6-488f-af9f-98e481f6f3df	4473498f-15ef-47b3-80fe-7001c9f5ab32	\N	d988278e-b54f-45ac-8624-a52ea082192c	LECTURER	2026-04-16 15:16:36.584	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
c50617bb-2e59-4f1d-84dd-6d9cf333a42f	4473498f-15ef-47b3-80fe-7001c9f5ab32	\N	f9d98581-20ac-48dc-ad6d-a9c770d05e9b	LECTURER	2026-04-16 15:16:36.584	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
bef37f7c-ecfa-4f6b-8571-b7f736be9927	7d5608ea-a091-4283-a9bd-fe3e463f6b86	\N	9889dc2e-c81b-44ed-adfd-e75de8c6d9e8	LECTURER	2026-04-16 15:16:36.584	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
e144f3bc-6aa2-4717-b5b9-54ec32d03aa8	e5ce552c-33c8-4719-989b-d8a6e82141fb	\N	84a9747d-2e9f-4fc6-b9e6-6d5e25af2758	LECTURER	2026-04-16 15:16:36.584	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
296bc5f1-0eda-42ce-8a54-401537766e41	b751c19d-63bd-4cf0-83f2-859cd1f9b8eb	\N	84a9747d-2e9f-4fc6-b9e6-6d5e25af2758	LECTURER	2026-04-16 15:16:36.584	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
94a479b3-e255-47de-b8cb-b76dcee26d96	0e551ed4-3c4f-470d-beba-3a5b30a54d83	\N	32d8aa6e-e42e-4f2c-8291-8fb8c64aa44c	LECTURER	2026-04-16 15:16:36.584	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
9a166e4e-055c-4a42-bbcd-a6663236cb23	0e551ed4-3c4f-470d-beba-3a5b30a54d83	\N	2a9ff6f9-4fa8-4d8d-8024-835067736cb0	LECTURER	2026-04-16 15:16:36.584	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
cc10f07c-abdc-482a-8d15-e8e8d2397f02	fe587071-49ff-43fc-a174-3c03ea3aac9b	\N	620ca8ae-45ca-43a7-becd-3e1416e91658	LECTURER	2026-04-16 15:16:36.584	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
78313da6-7547-4555-a5d8-58fcf599a2d8	a2fd5222-2c84-4a97-9fcd-313f5ed44106	\N	be062d08-8118-48a6-9277-f2326b02cf89	LECTURER	2026-04-16 15:16:36.584	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
9b78caec-7a5a-4c03-9dff-476b1bdab682	40173ed9-6b85-4d99-a4c3-37f5d617984d	\N	2cf878be-5af8-4edb-8b0e-073e172c8c71	LECTURER	2026-04-16 15:16:36.584	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
25a1f617-d108-472b-bda9-f6cd50a5df41	5a8973b3-ba1e-4bdb-8f8f-dc176f01a054	\N	4c6050aa-4cf5-4f27-aaa6-5accbf68e9d1	LECTURER	2026-04-16 15:16:36.584	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
a956dcff-b6eb-4cff-a858-f4efa93ca195	f9cd265a-62cf-4348-88fa-9610e82846ac	\N	4c6050aa-4cf5-4f27-aaa6-5accbf68e9d1	LECTURER	2026-04-16 15:16:36.584	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
85985a9b-5e1d-4243-8ef8-e2cff25db094	4d9bc966-fa7a-4de3-af0f-ec8aa47f38e9	\N	74942921-d088-4069-9393-dba1b3e56257	LECTURER	2026-04-16 15:16:36.584	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
8589aed4-6fe0-402e-84e8-db6b5915a727	05c49617-eaa8-49af-b650-8ae609fb38ca	\N	9b7e45e1-4847-4f03-8abd-0772525af0de	LECTURER	2026-04-16 15:16:36.584	t	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c
\.


--
-- Data for Name: Student; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public."Student" (student_id, admission_year, current_gpa, academic_class, degree_path_id, specialization_id, advisor_id, current_level, enrollment_status, pathway_locked, pathway_preference_1_id, pathway_preference_2_id, pathway_selection_date, metadata, onboarding_completed_at, graduation_status, graduated_at) FROM stdin;
STU001	2023	2.38	\N	ca7dfed6-55a9-46c5-bee1-7034852ea30b	\N	\N	Level 2	ENROLLED	f	\N	\N	\N	\N	\N	NOT_GRADUATED	\N
16f172bf-5f54-46f0-aa41-a0a1de2b8f4b	2024	0	\N	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	\N	\N	NOT_GRADUATED	\N
IM/2024/110	2024	3.7	First Class	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/022	2024	3.72	First Class	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Biology"}	\N	NOT_GRADUATED	\N
IM/2024/111	2024	3.58	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/112	2024	3.59	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/069	2024	3.49	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/070	2024	3.55	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/071	2024	3.41	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/072	2024	3.59	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/073	2024	3.75	First Class	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/074	2024	3.67	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/075	2024	3.71	First Class	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/076	2024	3.76	First Class	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/077	2024	3.65	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/078	2024	3.64	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/079	2024	3.82	First Class	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/080	2024	3.71	First Class	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/081	2024	3.72	First Class	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/082	2024	3.72	First Class	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/083	2024	3.64	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/023	2024	3.64	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Biology"}	\N	NOT_GRADUATED	\N
IM/2024/024	2024	3.65	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Biology"}	\N	NOT_GRADUATED	\N
IM/2024/040	2024	3.71	First Class	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/041	2024	3.72	First Class	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/042	2024	3.72	First Class	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/043	2024	3.64	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/044	2024	3.65	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/045	2024	3.56	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/046	2024	3.52	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/047	2024	3.65	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/048	2024	3.44	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/049	2024	3.39	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/050	2024	3.7	First Class	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/051	2024	3.58	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/052	2024	3.59	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/053	2024	3.75	First Class	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/054	2024	3.67	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/055	2024	3.71	First Class	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/056	2024	3.76	First Class	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/057	2024	3.65	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/058	2024	3.64	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/059	2024	3.82	First Class	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/116	2024	3.76	First Class	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science", "lms_import_skipped": true, "pathwayPreferences": {"source": "student_pathway_preferences", "interests": ["programming", "data", "security"], "reasoning": "I wanna become a solutions architect one day in the industry", "strengths": ["analytical", "technical"], "workStyle": "independent", "careerGoals": ["software_engineer", "entrepreneur"], "submittedAt": "2026-04-17T07:55:06.589Z", "learningStyle": "hands_on", "additionalNotes": "", "industryInterest": []}, "lms_import_skipped_at": "2026-04-16T16:12:06.130Z"}	2026-04-16 16:12:03.848	NOT_GRADUATED	\N
IM/2024/115	2024	3.71	First Class	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science", "lms_import_skipped": true, "lms_import_skipped_at": "2026-04-17T17:00:10.005Z"}	2026-04-17 17:00:01.341	NOT_GRADUATED	\N
IM/2024/114	2024	3.49	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science", "lms_import_skipped": true, "lms_import_skipped_at": "2026-04-17T21:04:14.301Z"}	2026-04-17 21:04:11.956	NOT_GRADUATED	\N
IM/2024/060	2024	3.71	First Class	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/061	2024	3.72	First Class	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/062	2024	3.72	First Class	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/063	2024	3.64	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/064	2024	3.65	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/065	2024	3.56	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/066	2024	3.52	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/067	2024	3.65	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/068	2024	3.47	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/084	2024	3.65	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/113	2024	3.75	First Class	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/011	2024	3.58	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Biology"}	\N	NOT_GRADUATED	\N
IM/2024/012	2024	3.59	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Biology"}	\N	NOT_GRADUATED	\N
IM/2024/013	2024	3.75	First Class	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Biology"}	\N	NOT_GRADUATED	\N
IM/2024/014	2024	3.67	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Biology"}	\N	NOT_GRADUATED	\N
IM/2024/015	2024	3.71	First Class	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Biology"}	\N	NOT_GRADUATED	\N
IM/2024/016	2024	3.76	First Class	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Biology"}	\N	NOT_GRADUATED	\N
IM/2024/017	2024	3.65	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Biology"}	\N	NOT_GRADUATED	\N
IM/2024/018	2024	3.64	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Biology"}	\N	NOT_GRADUATED	\N
IM/2024/019	2024	3.82	First Class	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Biology"}	\N	NOT_GRADUATED	\N
IM/2024/020	2024	3.71	First Class	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Biology"}	\N	NOT_GRADUATED	\N
IM/2024/021	2024	3.72	First Class	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Biology"}	\N	NOT_GRADUATED	\N
IM/2024/025	2024	3.56	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Biology"}	\N	NOT_GRADUATED	\N
IM/2024/085	2024	3.56	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/086	2024	3.52	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/087	2024	3.65	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/106	2024	3.52	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/107	2024	3.65	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/001	2024	3.72	First Class	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Biology"}	\N	NOT_GRADUATED	\N
IM/2024/002	2024	3.72	First Class	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Biology"}	\N	NOT_GRADUATED	\N
IM/2024/003	2024	3.64	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Biology"}	\N	NOT_GRADUATED	\N
IM/2024/004	2024	3.65	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Biology"}	\N	NOT_GRADUATED	\N
IM/2024/005	2024	3.51	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Biology"}	\N	NOT_GRADUATED	\N
IM/2024/006	2024	3.36	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Biology"}	\N	NOT_GRADUATED	\N
IM/2024/007	2024	3.65	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Biology"}	\N	NOT_GRADUATED	\N
IM/2024/008	2024	3.47	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Biology"}	\N	NOT_GRADUATED	\N
IM/2024/009	2024	3.49	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Biology"}	\N	NOT_GRADUATED	\N
IM/2024/010	2024	3.7	First Class	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Biology"}	\N	NOT_GRADUATED	\N
IM/2024/108	2024	3.47	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/109	2024	3.49	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/026	2024	3.52	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Biology"}	\N	NOT_GRADUATED	\N
IM/2024/027	2024	3.47	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Biology"}	\N	NOT_GRADUATED	\N
IM/2024/028	2024	3.35	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Biology"}	\N	NOT_GRADUATED	\N
IM/2024/029	2024	3.49	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Biology"}	\N	NOT_GRADUATED	\N
IM/2024/030	2024	3.7	First Class	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Biology"}	\N	NOT_GRADUATED	\N
IM/2024/031	2024	3.58	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Biology"}	\N	NOT_GRADUATED	\N
IM/2024/032	2024	3.59	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Biology"}	\N	NOT_GRADUATED	\N
IM/2024/033	2024	3.75	First Class	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Biology"}	\N	NOT_GRADUATED	\N
IM/2024/034	2024	3.67	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Biology"}	\N	NOT_GRADUATED	\N
IM/2024/035	2024	3.71	First Class	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Biology"}	\N	NOT_GRADUATED	\N
IM/2024/036	2024	3.76	First Class	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/037	2024	3.65	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/038	2024	3.64	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/039	2024	3.82	First Class	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/088	2024	3.47	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/089	2024	3.49	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/090	2024	3.7	First Class	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/091	2024	3.58	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/092	2024	3.49	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/093	2024	3.75	First Class	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/094	2024	3.67	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/095	2024	3.71	First Class	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/096	2024	3.76	First Class	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/097	2024	3.65	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/098	2024	3.64	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/099	2024	3.82	First Class	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/100	2024	3.71	First Class	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/101	2024	3.72	First Class	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/102	2024	3.72	First Class	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/103	2024	3.64	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/104	2024	3.65	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
IM/2024/105	2024	3.56	Second Upper	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	Level 1	ENROLLED	f	\N	\N	\N	{"seed_cohort": "im2024_l1_118", "alevel_stream": "Physical Science"}	\N	NOT_GRADUATED	\N
\.


--
-- Data for Name: StudentAIFeedbackSnapshot; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public."StudentAIFeedbackSnapshot" (snapshot_id, student_id, feedback_json, prompt_context_hash, gpa_at_generation, transcript_fingerprint, latest_released_grade_at, generated_at, expires_at, source_version, status, error_message, invalidation_reason) FROM stdin;
eaa1803d-7e26-47a9-9f1c-385d525b9b97	IM/2024/116	{"riskAreas": ["Relative dip in performance in Object Oriented Programming (B+) compared to other technical subjects", "Accounting Concepts and Costing (B+) is slightly below the student's average grade profile", "Initial struggle with Discrete Mathematics I (C+), though successfully remediated in the subsequent module"], "strengths": ["High proficiency in Database Design and Management Science (A+ grades)", "Significant upward trend in Mathematics, moving from a C+ in Discrete Maths I to an A in Discrete Maths II", "Strong foundational skills in Computing Fundamentals and Business Statistics"], "goalGuidance": ["Maintain the current GPA above 3.70 to ensure First Class honors eligibility throughout the degree", "Consider focusing on data-driven specializations given the high performance in Databases and Statistics"], "next30DayPlan": ["Conduct a self-directed review of OOP principles and design patterns", "Research Level 2 module prerequisites to ensure alignment with desired specialization", "Reflect on Semester 2 feedback to identify specific areas for improvement in Accounting and Programming"], "confidenceNotes": {"summary": "The assessment is based on a complete Level 1 transcript showing consistent high performance and successful navigation of foundational challenges.", "modelUsed": true}, "overallAssessment": "The student has demonstrated exceptional academic performance in their first year, maintaining a 3.76 GPA and a First Class standing. They show a balanced aptitude for both technical computing and management-oriented modules.", "recommendedActions": ["Review Object Oriented Programming (INTE 12213) concepts to ensure a stronger foundation for advanced software development modules in Level 2", "Explore specialization options within the MIT program that align with high-performing areas like Management Science and Databases", "Maintain the effective study habits that led to the improvement in Mathematics"], "advisorEscalationSignals": ["None - The student is currently exceeding academic benchmarks and showing positive growth trends"]}	f05048d799e1ed96574e5682fca4f05a1abd494c760bbeb9e237fef6cfa64b33	3.76	491575ee8b87699ee29a8fc40cc0fc01c0c62935612824e1c0244db715e4b2e3	2024-12-20 00:00:00	2026-04-17 02:40:56.959	2026-05-17 02:40:56.959	v1	READY	\N	EXPIRED
5f07de8f-d7ea-42fb-b1c3-5b9ba48cbab2	IM/2024/116	{"riskAreas": ["Heavy credit load in the current semester with multiple technical modules (INTE 11223, INTE 11213, PMAT 11212)", "Potential registration anomaly or duplication regarding GNCT 11212 and GNCT 11212a", "Increased mathematical rigor in upcoming Discrete Mathematics modules"], "strengths": ["High current GPA (3.85) exceeding the First Class threshold", "Strong performance in core management (A in MGTE 11243)", "Proactive academic goal setting", "Successful completion of Academic Literacy with an A- grade"], "goalGuidance": ["The 3.90 GPA target is highly achievable but requires near-perfect grades (mostly A) in the remaining 13+ credits of Semester 1.", "Focus on high-credit modules (3 credits) like INTE 11213 and INTE 11223 to maximize GPA impact."], "next30DayPlan": ["Review mid-semester progress for all 'REGISTERED' status modules in Semester 1.", "Establish a consistent study schedule for Programming Concepts (INTE 11223).", "Consult with a lecturer regarding the specific requirements for Discrete Mathematics I (PMAT 11212)."], "confidenceNotes": {"summary": "Assessment based on current 3.85 GPA, transcript history of 6 earned credits, and a heavy 16-credit registration load for the current semester.", "modelUsed": true}, "overallAssessment": "The student is demonstrating exceptional academic performance in their first year, maintaining a 3.85 GPA and a First Class standing. They have successfully completed foundational modules with high grades, though the upcoming semester load is significantly more technical.", "recommendedActions": ["Verify the necessity of GNCT 11212a registration with the academic office to ensure no credit duplication.", "Prioritize study time for PMAT 11212 (Discrete Mathematics) as it often presents a higher difficulty curve for Level 1 students.", "Engage in peer programming or lab sessions for INTE 11223 to ensure the 'A' grade required for the GPA goal."], "advisorEscalationSignals": ["Any grade below a B+ in technical modules (INTE or PMAT codes)", "Failure to resolve the duplicate registration for GNCT 11212a", "GPA dropping below 3.70 in the next results release"]}	862d5b5906d02227d955c5a5e742f571698b0481103d3139bf9264e61a4d9139	3.85	69c33ac7e38e1d105f12347484096e8d5e7c5aa2be1a3b019ec6cf4d99054df8	2024-07-01 00:00:00	2026-04-17 16:58:18.871	2026-05-17 16:58:18.871	v1	READY	\N	GPA_CHANGED
86534dea-4240-4905-90ea-8de352aac8c0	IM/2024/116	{"riskAreas": ["Weak performance in foundational computing modules (INTE 11213: C, INTE 11223: B-)", "Significant gap between current GPA (3.1) and target GPA (3.9)", "Heavy technical workload in Semester 2 (OOP, Database Design, Networks) which may be challenging given Semester 1 results"], "strengths": ["Excellent performance in Management (MGTE 11243: A)", "Strong communication and literacy skills (ACLT 11013: A-)", "Successful completion of personal development requirements (GNCT 11212: Pass)"], "goalGuidance": ["The target GPA of 3.9 is mathematically difficult to achieve from a 3.1 baseline in Level 1; it requires near-perfect grades in all future modules.", "Focus on mastering 'Object Oriented Programming' and 'Database Design' as they build upon the modules where the student previously struggled."], "next30DayPlan": ["Review 'Programming Concepts' fundamentals before starting 'Object Oriented Programming' (INTE 12213).", "Create a dedicated study schedule for Discrete Mathematics (PMAT 11212).", "Attend office hours for 'Fundamentals of Computing' to clarify concepts that led to the C grade."], "confidenceNotes": {"summary": "Assessment based on Semester 1 transcript performance and Semester 2 registration data. The 99% progress on the GPA goal appears to be a data anomaly given the current 3.1 GPA.", "modelUsed": true}, "overallAssessment": "The student is performing well in management and literacy subjects but is struggling with core technical computing modules. There is a significant discrepancy between the current GPA of 3.1 and the ambitious target of 3.9, especially following a decline from a previous high of 3.76.", "recommendedActions": ["Enroll in peer tutoring or supplemental instruction for technical INTE modules.", "Prioritize PMAT 11212 (Discrete Mathematics) as it is a critical foundation for future computing success.", "Consult with the department regarding the GPA decline to identify specific learning barriers in technical subjects."], "advisorEscalationSignals": ["GPA dropped significantly from 3.76 to 3.1.", "Received a 'C' grade in a core prerequisite module (INTE 11213)."]}	df536cf11f30cc90c5f2df915990b55b33874a54535c265354dcfe32f0586e2d	3.1	2e5613960c1a52fbacc27c2b58070d0f1f470bf410353dfbc7ec2b4ad18eeb57	2026-04-17 20:44:06.689	2026-04-17 20:58:37.228	2026-05-17 20:58:37.228	v1	READY	\N	GPA_CHANGED
df39b99a-38cb-4e19-abdb-4bebb90b780b	IM/2024/116	{"riskAreas": ["Significant GPA drop of 0.66 points from the previous record", "Underperformance in core technical prerequisites (C in Fundamentals of Computing, B- in Programming Concepts)", "Ambitious GPA target (3.9) is mathematically challenging given the current 3.1 baseline and recent performance trends"], "strengths": ["Excellent performance in Management (A grade in MGTE 11243)", "Strong academic literacy and communication skills (A- in ACLT 11013)", "Proactive registration for a full credit load across Semester 1 and 2"], "goalGuidance": ["To reach a 3.9 GPA, the student must achieve straight 'A' grades in all upcoming modules, including high-difficulty subjects like Object Oriented Programming and Discrete Mathematics.", "The current progress of 99% on the GPA goal seems misaligned with the actual GPA gap; the student should recalibrate expectations or seek intensive support."], "next30DayPlan": ["Review foundational concepts from 'Programming Concepts' to prepare for 'Object Oriented Programming' in Semester 2.", "Complete all pending assignments for 'Discrete Mathematics for Computing I' and 'Business Statistics'.", "Schedule a meeting with an academic advisor to discuss the feasibility of the 3.9 GPA target."], "confidenceNotes": {"summary": "Analysis based on transcript trends showing a divergence between management success and technical computing struggles.", "modelUsed": true}, "overallAssessment": "The student is currently maintaining a 3.1 GPA (Second Lower), which reflects a significant decline from a previous high of 3.76 (First Class). While the student excels in management and literacy subjects, there is a noticeable struggle in core technical computing modules.", "recommendedActions": ["Prioritize 'Discrete Mathematics' and 'Object Oriented Programming' as these build on previous weak areas.", "Utilize peer tutoring or lab assistance for technical modules where grades were 'C' or 'B-'.", "Consult with the department regarding the GPA drop to identify if external factors are impacting academic performance."], "advisorEscalationSignals": ["GPA drop from First Class (3.76) to Second Lower (3.10).", "Core module grade of 'C' in 'Fundamentals of Computing' (INTE 11213).", "Potential for further decline if technical gaps in Semester 1 are not addressed before Semester 2 technical modules begin."]}	df536cf11f30cc90c5f2df915990b55b33874a54535c265354dcfe32f0586e2d	3.1	2e5613960c1a52fbacc27c2b58070d0f1f470bf410353dfbc7ec2b4ad18eeb57	2026-04-17 20:44:06.689	2026-04-17 21:02:05.5	2026-05-17 21:02:05.5	v1	READY	\N	USER_REEVALUATE
5a6b9629-a055-4d89-b6cb-5af967df05c6	IM/2024/116	{"riskAreas": ["Monitor upcoming assessment-heavy modules to avoid sudden GPA dips."], "strengths": ["Steady completion of released modules", "Clear academic continuity across semesters"], "goalGuidance": ["Keep your active goals measurable and tied to module outcomes each semester."], "next30DayPlan": ["Week 1: audit current module workload and deadlines.", "Week 2: complete two targeted revision sessions in lowest-confidence topics.", "Week 3: validate progress with a self-test and refine plan.", "Week 4: prepare advisor check-in with evidence of progress."], "confidenceNotes": {"summary": "Fallback generated because AI response was unavailable.", "modelUsed": false}, "overallAssessment": "Your academic performance is stable and you are making progress toward your degree requirements.", "recommendedActions": ["Review feedback from your latest released modules and identify one improvement area.", "Allocate weekly focused study blocks for weaker modules."], "advisorEscalationSignals": ["Multiple failing/near-failing results in released grades", "Noticeable sustained GPA decline over consecutive periods"]}	df536cf11f30cc90c5f2df915990b55b33874a54535c265354dcfe32f0586e2d	3.1	2e5613960c1a52fbacc27c2b58070d0f1f470bf410353dfbc7ec2b4ad18eeb57	2026-04-17 20:44:06.689	2026-04-17 21:03:38.789	2026-05-17 21:03:38.789	v1	READY	\N	USER_REEVALUATE
bfec64c8-b1be-4dc1-9321-25f02331aa65	IM/2024/116	{"riskAreas": ["Monitor upcoming assessment-heavy modules to avoid sudden GPA dips."], "strengths": ["Steady completion of released modules", "Clear academic continuity across semesters"], "goalGuidance": ["Keep your active goals measurable and tied to module outcomes each semester."], "next30DayPlan": ["Week 1: audit current module workload and deadlines.", "Week 2: complete two targeted revision sessions in lowest-confidence topics.", "Week 3: validate progress with a self-test and refine plan.", "Week 4: prepare advisor check-in with evidence of progress."], "confidenceNotes": {"summary": "Fallback generated because AI response was unavailable.", "modelUsed": false}, "overallAssessment": "Your academic performance is stable and you are making progress toward your degree requirements.", "recommendedActions": ["Review feedback from your latest released modules and identify one improvement area.", "Allocate weekly focused study blocks for weaker modules."], "advisorEscalationSignals": ["Multiple failing/near-failing results in released grades", "Noticeable sustained GPA decline over consecutive periods"]}	df536cf11f30cc90c5f2df915990b55b33874a54535c265354dcfe32f0586e2d	3.1	2e5613960c1a52fbacc27c2b58070d0f1f470bf410353dfbc7ec2b4ad18eeb57	2026-04-17 20:44:06.689	2026-04-17 21:03:43.847	2026-05-17 21:03:43.847	v1	READY	\N	USER_REEVALUATE
bb57642d-2e89-4bca-ac94-d185089d172e	IM/2024/114	{"riskAreas": ["Monitor upcoming assessment-heavy modules to avoid sudden GPA dips."], "strengths": ["Steady completion of released modules", "Clear academic continuity across semesters"], "goalGuidance": ["Keep your active goals measurable and tied to module outcomes each semester."], "next30DayPlan": ["Week 1: audit current module workload and deadlines.", "Week 2: complete two targeted revision sessions in lowest-confidence topics.", "Week 3: validate progress with a self-test and refine plan.", "Week 4: prepare advisor check-in with evidence of progress."], "confidenceNotes": {"summary": "Fallback generated because AI response was unavailable.", "modelUsed": false}, "overallAssessment": "Your academic performance is stable and you are making progress toward your degree requirements.", "recommendedActions": ["Review feedback from your latest released modules and identify one improvement area.", "Allocate weekly focused study blocks for weaker modules."], "advisorEscalationSignals": ["Multiple failing/near-failing results in released grades", "Noticeable sustained GPA decline over consecutive periods"]}	5c7d208ffb579d7ef4517e3ab8c0724c1cfd6532253fe7c79758b63298896f15	4	c769b8bb46293f018049a0477ab5d1d186bef5265a8d41bbfb52b2bc278e8749	2024-07-01 00:00:00	2026-04-17 21:04:19.954	2026-05-17 21:04:19.954	v1	READY	\N	EXPIRED
9868711c-abd3-4876-99c0-f036e3466c7c	IM/2024/114	{"riskAreas": ["Monitor upcoming assessment-heavy modules to avoid sudden GPA dips."], "strengths": ["Steady completion of released modules", "Clear academic continuity across semesters"], "goalGuidance": ["Keep your active goals measurable and tied to module outcomes each semester."], "next30DayPlan": ["Week 1: audit current module workload and deadlines.", "Week 2: complete two targeted revision sessions in lowest-confidence topics.", "Week 3: validate progress with a self-test and refine plan.", "Week 4: prepare advisor check-in with evidence of progress."], "confidenceNotes": {"summary": "Fallback generated because AI response was unavailable.", "modelUsed": false}, "overallAssessment": "Your academic performance is stable and you are making progress toward your degree requirements.", "recommendedActions": ["Review feedback from your latest released modules and identify one improvement area.", "Allocate weekly focused study blocks for weaker modules."], "advisorEscalationSignals": ["Multiple failing/near-failing results in released grades", "Noticeable sustained GPA decline over consecutive periods"]}	5c7d208ffb579d7ef4517e3ab8c0724c1cfd6532253fe7c79758b63298896f15	4	c769b8bb46293f018049a0477ab5d1d186bef5265a8d41bbfb52b2bc278e8749	2024-07-01 00:00:00	2026-04-17 21:04:40.467	2026-05-17 21:04:40.467	v1	READY	\N	USER_REEVALUATE
126f4b07-c3a5-4f7e-803f-144d360b98eb	IM/2024/114	{"riskAreas": ["Monitor upcoming assessment-heavy modules to avoid sudden GPA dips."], "strengths": ["Steady completion of released modules", "Clear academic continuity across semesters"], "goalGuidance": ["Keep your active goals measurable and tied to module outcomes each semester."], "next30DayPlan": ["Week 1: audit current module workload and deadlines.", "Week 2: complete two targeted revision sessions in lowest-confidence topics.", "Week 3: validate progress with a self-test and refine plan.", "Week 4: prepare advisor check-in with evidence of progress."], "confidenceNotes": {"summary": "Fallback generated because AI response was unavailable.", "modelUsed": false}, "overallAssessment": "Your academic performance is stable and you are making progress toward your degree requirements.", "recommendedActions": ["Review feedback from your latest released modules and identify one improvement area.", "Allocate weekly focused study blocks for weaker modules."], "advisorEscalationSignals": ["Multiple failing/near-failing results in released grades", "Noticeable sustained GPA decline over consecutive periods"]}	5c7d208ffb579d7ef4517e3ab8c0724c1cfd6532253fe7c79758b63298896f15	4	c769b8bb46293f018049a0477ab5d1d186bef5265a8d41bbfb52b2bc278e8749	2024-07-01 00:00:00	2026-04-17 21:04:50.264	2026-05-17 21:04:50.264	v1	READY	\N	USER_REEVALUATE
2098bbb7-be9a-4b7e-8fe1-ebae7753f9c9	IM/2024/114	{"riskAreas": ["Monitor upcoming assessment-heavy modules to avoid sudden GPA dips."], "strengths": ["Steady completion of released modules", "Clear academic continuity across semesters"], "goalGuidance": ["Keep your active goals measurable and tied to module outcomes each semester."], "next30DayPlan": ["Week 1: audit current module workload and deadlines.", "Week 2: complete two targeted revision sessions in lowest-confidence topics.", "Week 3: validate progress with a self-test and refine plan.", "Week 4: prepare advisor check-in with evidence of progress."], "confidenceNotes": {"summary": "Fallback generated because AI response was unavailable.", "modelUsed": false}, "overallAssessment": "Your academic performance is stable and you are making progress toward your degree requirements.", "recommendedActions": ["Review feedback from your latest released modules and identify one improvement area.", "Allocate weekly focused study blocks for weaker modules."], "advisorEscalationSignals": ["Multiple failing/near-failing results in released grades", "Noticeable sustained GPA decline over consecutive periods"]}	5c7d208ffb579d7ef4517e3ab8c0724c1cfd6532253fe7c79758b63298896f15	4	c769b8bb46293f018049a0477ab5d1d186bef5265a8d41bbfb52b2bc278e8749	2024-07-01 00:00:00	2026-04-17 21:06:05.018	2026-05-17 21:06:05.018	v1	READY	\N	USER_REEVALUATE
12f3e139-f81b-41ad-8b17-0d4f31fa45a2	IM/2024/114	{"riskAreas": ["Monitor upcoming assessment-heavy modules to avoid sudden GPA dips."], "strengths": ["Steady completion of released modules", "Clear academic continuity across semesters"], "goalGuidance": ["Keep your active goals measurable and tied to module outcomes each semester."], "next30DayPlan": ["Week 1: audit current module workload and deadlines.", "Week 2: complete two targeted revision sessions in lowest-confidence topics.", "Week 3: validate progress with a self-test and refine plan.", "Week 4: prepare advisor check-in with evidence of progress."], "confidenceNotes": {"summary": "Fallback generated because AI response was unavailable.", "modelUsed": false}, "overallAssessment": "Your academic performance is stable and you are making progress toward your degree requirements.", "recommendedActions": ["Review feedback from your latest released modules and identify one improvement area.", "Allocate weekly focused study blocks for weaker modules."], "advisorEscalationSignals": ["Multiple failing/near-failing results in released grades", "Noticeable sustained GPA decline over consecutive periods"]}	5c7d208ffb579d7ef4517e3ab8c0724c1cfd6532253fe7c79758b63298896f15	4	c769b8bb46293f018049a0477ab5d1d186bef5265a8d41bbfb52b2bc278e8749	2024-07-01 00:00:00	2026-04-17 21:06:45.24	2026-05-17 21:06:45.24	v1	READY	\N	USER_REEVALUATE
4b2722bf-f2cd-49a4-add7-9352ad1c9c22	IM/2024/114	{"riskAreas": ["Monitor upcoming assessment-heavy modules to avoid sudden GPA dips."], "strengths": ["Steady completion of released modules", "Clear academic continuity across semesters"], "goalGuidance": ["Keep your active goals measurable and tied to module outcomes each semester."], "next30DayPlan": ["Week 1: audit current module workload and deadlines.", "Week 2: complete two targeted revision sessions in lowest-confidence topics.", "Week 3: validate progress with a self-test and refine plan.", "Week 4: prepare advisor check-in with evidence of progress."], "confidenceNotes": {"summary": "Fallback generated because AI response was unavailable.", "modelUsed": false}, "overallAssessment": "Your academic performance is stable and you are making progress toward your degree requirements.", "recommendedActions": ["Review feedback from your latest released modules and identify one improvement area.", "Allocate weekly focused study blocks for weaker modules."], "advisorEscalationSignals": ["Multiple failing/near-failing results in released grades", "Noticeable sustained GPA decline over consecutive periods"]}	5c7d208ffb579d7ef4517e3ab8c0724c1cfd6532253fe7c79758b63298896f15	4	c769b8bb46293f018049a0477ab5d1d186bef5265a8d41bbfb52b2bc278e8749	2024-07-01 00:00:00	2026-04-17 21:06:51.017	2026-05-17 21:06:51.017	v1	READY	\N	USER_REEVALUATE
164e7de1-513c-465e-95ec-e70afdefe5b7	IM/2024/114	{"riskAreas": ["Potential duplicate registration for Personal Progress Development (GNCT 11212 and GNCT 11212a)", "Heavy Semester 1 workload with pending grades in challenging technical subjects like Discrete Mathematics and Programming Concepts", "Transitioning from foundational literacy to technical computing modules (INTE series)"], "strengths": ["Perfect GPA (4.0) in graded modules", "Strong performance in core management (A+ in MGTE 11243)", "Successful completion of Academic Literacy requirements", "High credit load management capability"], "goalGuidance": ["Aim to maintain the First Class threshold (GPA > 3.7) as technical difficulty increases", "Focus on mastering 'Programming Concepts' (INTE 11223) as it is a prerequisite for 'Object Oriented Programming' in Semester 2"], "next30DayPlan": ["Confirm registration details for Semester 1 pending modules", "Establish a study schedule focusing on Discrete Mathematics and Programming logic", "Attend all practical sessions for Fundamentals of Computing (INTE 11213)"], "confidenceNotes": {"summary": "Assessment based on current 4.0 GPA and registration data. High confidence in academic potential, moderate concern regarding administrative registration anomalies.", "modelUsed": true}, "overallAssessment": "Excellent academic start with a perfect 4.0 GPA in the initial foundational modules. The student is currently maintaining First Class standing, demonstrating strong competency in both management and academic literacy.", "recommendedActions": ["Verify the registration status of GNCT 11212a with the registrar to avoid credit duplication or administrative errors", "Prioritize PMAT 11212 (Discrete Mathematics) and INTE 11223 (Programming Concepts) as these are high-attrition foundational courses", "Utilize academic support for Business Statistics (MGTE 11233) to ensure the 4.0 GPA is maintained across diverse subject areas"], "advisorEscalationSignals": ["If the student fails to resolve the GNCT 11212a duplicate registration", "If the GPA drops below 3.50 after the release of Semester 1 technical module grades"]}	5c7d208ffb579d7ef4517e3ab8c0724c1cfd6532253fe7c79758b63298896f15	4	c769b8bb46293f018049a0477ab5d1d186bef5265a8d41bbfb52b2bc278e8749	2024-07-01 00:00:00	2026-04-18 02:15:29.856	2026-05-18 02:15:29.856	v1	READY	\N	USER_REEVALUATE
cd27ee88-1831-4a34-b529-c4357a09f369	IM/2024/116	{"riskAreas": ["Underperformance in core technical modules: Fundamentals of Computing (C) and Programming Concepts (B-)", "Significant GPA decline of 0.66 points from the previous record", "High credit load in current registrations which may overwhelm technical recovery efforts"], "strengths": ["Excellent performance in Management (Grade A)", "Strong academic literacy skills (Grade A-)", "Consistent completion of registered modules"], "goalGuidance": ["The target GPA of 3.9 is currently unrealistic given the 3.1 baseline and recent C/B- grades in core subjects.", "To reach a 3.9, the student would need near-perfect grades in all remaining credits, which is a high-pressure requirement.", "Recommend adjusting the immediate goal to 3.3 or 3.5 to ensure steady improvement."], "next30DayPlan": ["Identify and meet with a peer tutor for Programming Concepts.", "Review the syllabus for upcoming Semester 2 technical modules like Object Oriented Programming.", "Meet with an advisor to discuss the feasibility of the 3.9 GPA target and create a modular grade plan."], "confidenceNotes": {"summary": "Assessment based on transcript trends showing a divergence between management and technical proficiency.", "modelUsed": true}, "overallAssessment": "The student is currently in the Second Lower division with a GPA of 3.1. There is a concerning downward trend from an initial 3.76 GPA. While the student excels in management and literacy subjects, performance in core technical computing modules is significantly weaker.", "recommendedActions": ["Seek academic support or tutoring for technical modules (INTE series).", "Prioritize Discrete Mathematics (PMAT 11212) as it is foundational for future computing modules.", "Review study techniques for technical vs. theoretical subjects, as there is a clear performance gap."], "advisorEscalationSignals": ["GPA drop of more than 0.5 points in a single period.", "Core degree module grade of 'C' (INTE 11213).", "Significant mismatch between current performance and stated GPA goals."]}	df536cf11f30cc90c5f2df915990b55b33874a54535c265354dcfe32f0586e2d	3.1	2e5613960c1a52fbacc27c2b58070d0f1f470bf410353dfbc7ec2b4ad18eeb57	2026-04-17 20:44:06.689	2026-04-18 02:43:08.266	2026-05-18 02:43:08.266	v1	READY	\N	USER_REEVALUATE
9a1ad59c-dd47-4a7b-9a83-5ed108afdf68	IM/2024/116	{"riskAreas": ["Weak performance in core IT modules: INTE 11223 Programming Concepts (B-, 2.7) and INTE 11213 Fundamentals of Computing (C, 2.0), which could impact progression in advanced computing courses.", "Heavy Semester 2 registration load (10+ modules including OOP, Networks, Database), risking overload and GPA dilution.", "Significant gap between current 3.1 GPA (across 12 credits) and 3.9 target, requiring near-perfect scores in remaining modules.", "Multiple unregistered or pending grades in Semester 1 modules (e.g., MGTE 11233, DELT 11232), potentially affecting credit accumulation."], "strengths": ["Outstanding performance in MGTE 11243 (A, 4.0 GPA points), demonstrating strong aptitude for management concepts.", "Strong result in ACLT 11013 (A-, 3.7 GPA points), indicating good academic literacy and communication skills.", "GPA history peak of 3.76 (First Class) shows potential for high achievement with consistent effort.", "Nearly complete progress (99%) on 3.9 GPA goal, reflecting motivation and goal-oriented mindset."], "goalGuidance": ["To hit 3.9 GPA target by 2026-05-04, prioritize A/A- grades (3.7+) in all Semester 2 core modules; current trajectory needs ~0.8 GPA uplift.", "Break goal into module-level targets: Aim for 4.0 in non-core (e.g., MGTE) and 3.5+ in IT modules to offset Semester 1 weaknesses.", "Monitor progress quarterly; 99% current progress suggests strong tracking—leverage this for weekly check-ins."], "next30DayPlan": ["Week 1: Self-assess weak Semester 1 modules (INTE 11223/11213); complete online tutorials on programming basics (e.g., Python/C++).", "Week 2: Review syllabi for Semester 2 registrations (INTE 12213, MGTE 12263); gather resources and set weekly study hours (15+).", "Week 3: Track mock GPA calculations; aim to identify 2-3 high-impact study habits via PPD journal.", "Week 4: Schedule advisor meeting; complete any pending Semester 1 assessments (e.g., MGTE 11233) and log goal progress."], "confidenceNotes": {"summary": "High confidence; analysis directly derived from complete transcript (5 modules, 12 GPA credits), registrations (15 entries), and goal data. GPA calculations verified (37.2/12=3.1). Minor uncertainty on pending Semester 1 grades.", "modelUsed": true}, "overallAssessment": "Student116 L1 has a solid foundation with a current GPA of 3.1 (Second Lower) after Semester 1, excelling in management and literacy modules but struggling in core IT fundamentals. With a heavy Semester 2 load and an ambitious 3.9 GPA goal (99% progress), focused improvement in computing skills is essential to avoid risks and sustain momentum.", "recommendedActions": ["Enroll in tutoring or workshops for Programming Concepts and Fundamentals of Computing to build foundational IT skills.", "Form study groups for Semester 2 cores like INTE 12213 (OOP), INTE 12243 (Networks), and INTE 12223 (Database).", "Meet with academic advisor to review course load and drop non-essential modules if overload is evident.", "Utilize PPD I (GNCT 11212) resources for time management and personal development to balance heavy registrations.", "Practice past exams for PMAT modules (Discrete Math) to strengthen quantitative skills."], "advisorEscalationSignals": ["GPA drops below 3.0 in next assessment or any core IT module grade <2.5.", "Goal progress stalls below 95% or deadline approaches without module-level plans.", "Withdrawal/failure in >2 Semester 2 modules or total credits lag (target 30+ by end of Level 1).", "Signs of overload: Missed deadlines or enrollment status change."]}	df536cf11f30cc90c5f2df915990b55b33874a54535c265354dcfe32f0586e2d	3.1	2e5613960c1a52fbacc27c2b58070d0f1f470bf410353dfbc7ec2b4ad18eeb57	2026-04-17 20:44:06.689	2026-04-18 04:46:41.32	2026-05-18 04:46:41.32	v1	READY	\N	USER_REEVALUATE
96ec34bd-6fbf-4508-b679-e02eda4bc854	IM/2024/116	{"riskAreas": ["Programming Concepts at B- is decent but has room to climb with more practice.", "Fundamentals of Computing at C suggests focusing a bit more on core computing basics.", "Current Second Lower classification – small tweaks can elevate you quickly."], "strengths": ["Outstanding performance in Principles of Management & Organizational Behaviour with a perfect A – that's leadership potential shining through!", "Strong A- in Academic Literacy I, showing great writing and communication skills.", "Solid progress in Personal Progress Development I with a Pass, keeping you on track personally.", "Proven ability to hit First Class GPA levels recently – you've got the capability!"], "goalGuidance": ["Your 3.9 GPA target is ambitious and achievable with your past 3.76 high – aim for A's in upcoming modules like Object Oriented Programming and Database Design to pull up the average.", "Track progress weekly by calculating GPA after each assignment, and adjust study time for weaker areas like computing fundamentals."], "next30DayPlan": ["Days 1-7: Spend 30 mins daily reviewing Fundamentals of Computing notes and redo 2 practice problems.", "Days 8-14: Create flashcards for key terms in Programming Concepts and test yourself daily.", "Days 15-21: Outline a study schedule for your Semester 2 registrations, blocking 1 hour/day for Discrete Mathematics.", "Days 22-30: Meet with a peer or tutor once for English for Professionals prep, and log your weekly GPA mock calculation."], "confidenceNotes": {"summary": "Comprehensive analysis of transcript, registrations, and GPA goal; balanced encouragement with actionable IT/management focus.", "modelUsed": true}, "overallAssessment": "Hey Student116 L1, you're making a strong start in your MIT Common Foundation program at Level 1! With a current GPA of 3.1 and a recent high of 3.76, you've shown you can excel, especially in management and literacy subjects. Let's build on those wins to push toward your 3.9 goal.", "recommendedActions": ["Review notes from Programming Concepts and Fundamentals of Computing weekly to reinforce basics before Semester 2.", "Join study groups for technical modules like Discrete Mathematics for Computing and Computer Networks.", "Schedule office hours with lecturers for Optimization Methods and Accounting Concepts to stay ahead.", "Use free online resources like Khan Academy for math refreshers in Business Statistics and Economics."], "advisorEscalationSignals": []}	df536cf11f30cc90c5f2df915990b55b33874a54535c265354dcfe32f0586e2d	3.1	2e5613960c1a52fbacc27c2b58070d0f1f470bf410353dfbc7ec2b4ad18eeb57	2026-04-17 20:44:06.689	2026-04-18 04:50:05.02	2026-05-18 04:50:05.02	v1	READY	\N	USER_REEVALUATE
\.


--
-- Data for Name: SystemSetting; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public."SystemSetting" (setting_id, key, value, description, category, updated_at) FROM stdin;
713996f2-df5d-4562-9e93-f06fc58af9d7	pathway_demand_mit	65	Current demand percentage for MIT pathway	ACADEMIC	2026-04-16 14:53:46.571
7bd6ce71-7366-4e06-81a3-3ed34cbb8199	threshold_first_class	3.7	\N	GPA	2026-04-18 05:34:13.304
f34286f1-21eb-4ac9-8324-8d5e3ee7df05	threshold_second_upper	3.3	\N	GPA	2026-04-18 05:34:13.314
a574fe69-b267-4019-9d70-33dba3266869	threshold_second_lower	3	\N	GPA	2026-04-18 05:34:13.33
f037ae85-675e-4b40-ac1e-e233e25b6051	threshold_third_class	2.5	\N	GPA	2026-04-18 05:34:13.34
468a7ca7-2c64-4f00-9f91-31fec8691e48	gpa_academic_class_thresholds	{"firstClass":3.7,"secondUpper":3.3,"secondLower":3,"thirdPass":2.5}	\N	GPA	2026-04-18 05:34:13.349
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public."User" (user_id, email, username, password_hash, status, created_at, last_login_date, address, avatar, bio, emergency_contact, github, linkedin, phone, role, "firstName", "lastName") FROM stdin;
16f172bf-5f54-46f0-aa41-a0a1de2b8f4b	student@sees.com	student	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:47.342	\N	\N	\N	\N	\N	\N	\N	\N	student	John	Student
ADMIN001	admin@kln.ac.lk	admin_kln	$2b$10$hoTY1XXV0oyfoQYgCfsL1eJmCUrHPvCX2GGdsHrFFB07D2AvZ9Fw6	ACTIVE	2026-04-16 14:53:47.35	\N	\N	\N	\N	\N	\N	\N	\N	student	System	Administrator
STU001	bandara-im22053@stu.kln.ac.lk	bandara	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:47.356	\N	\N	\N	\N	\N	\N	\N	\N	student	buddhika	Bandara
IM/2024/001	student-im24001@stu.kln.ac.lk	im2024001	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:47.588	\N	\N	\N	\N	\N	\N	\N	\N	student	Student001	L1
IM/2024/002	student-im24002@stu.kln.ac.lk	im2024002	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:47.689	\N	\N	\N	\N	\N	\N	\N	\N	student	Student002	L1
IM/2024/003	student-im24003@stu.kln.ac.lk	im2024003	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:47.792	\N	\N	\N	\N	\N	\N	\N	\N	student	Student003	L1
IM/2024/004	student-im24004@stu.kln.ac.lk	im2024004	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:47.887	\N	\N	\N	\N	\N	\N	\N	\N	student	Student004	L1
IM/2024/005	student-im24005@stu.kln.ac.lk	im2024005	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:47.947	\N	\N	\N	\N	\N	\N	\N	\N	student	Student005	L1
IM/2024/006	student-im24006@stu.kln.ac.lk	im2024006	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:48.017	\N	\N	\N	\N	\N	\N	\N	\N	student	Student006	L1
IM/2024/007	student-im24007@stu.kln.ac.lk	im2024007	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:48.094	\N	\N	\N	\N	\N	\N	\N	\N	student	Student007	L1
IM/2024/008	student-im24008@stu.kln.ac.lk	im2024008	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:48.202	\N	\N	\N	\N	\N	\N	\N	\N	student	Student008	L1
IM/2024/009	student-im24009@stu.kln.ac.lk	im2024009	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:48.305	\N	\N	\N	\N	\N	\N	\N	\N	student	Student009	L1
IM/2024/010	student-im24010@stu.kln.ac.lk	im2024010	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:48.405	\N	\N	\N	\N	\N	\N	\N	\N	student	Student010	L1
IM/2024/011	student-im24011@stu.kln.ac.lk	im2024011	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:48.505	\N	\N	\N	\N	\N	\N	\N	\N	student	Student011	L1
IM/2024/012	student-im24012@stu.kln.ac.lk	im2024012	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:48.609	\N	\N	\N	\N	\N	\N	\N	\N	student	Student012	L1
IM/2024/013	student-im24013@stu.kln.ac.lk	im2024013	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:48.725	\N	\N	\N	\N	\N	\N	\N	\N	student	Student013	L1
IM/2024/014	student-im24014@stu.kln.ac.lk	im2024014	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:48.833	\N	\N	\N	\N	\N	\N	\N	\N	student	Student014	L1
IM/2024/015	student-im24015@stu.kln.ac.lk	im2024015	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:48.942	\N	\N	\N	\N	\N	\N	\N	\N	student	Student015	L1
IM/2024/016	student-im24016@stu.kln.ac.lk	im2024016	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:49.03	\N	\N	\N	\N	\N	\N	\N	\N	student	Student016	L1
IM/2024/017	student-im24017@stu.kln.ac.lk	im2024017	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:49.113	\N	\N	\N	\N	\N	\N	\N	\N	student	Student017	L1
IM/2024/018	student-im24018@stu.kln.ac.lk	im2024018	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:49.204	\N	\N	\N	\N	\N	\N	\N	\N	student	Student018	L1
IM/2024/019	student-im24019@stu.kln.ac.lk	im2024019	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:49.302	\N	\N	\N	\N	\N	\N	\N	\N	student	Student019	L1
IM/2024/020	student-im24020@stu.kln.ac.lk	im2024020	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:49.393	\N	\N	\N	\N	\N	\N	\N	\N	student	Student020	L1
IM/2024/021	student-im24021@stu.kln.ac.lk	im2024021	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:49.492	\N	\N	\N	\N	\N	\N	\N	\N	student	Student021	L1
IM/2024/022	student-im24022@stu.kln.ac.lk	im2024022	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:49.584	\N	\N	\N	\N	\N	\N	\N	\N	student	Student022	L1
IM/2024/023	student-im24023@stu.kln.ac.lk	im2024023	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:49.68	\N	\N	\N	\N	\N	\N	\N	\N	student	Student023	L1
IM/2024/024	student-im24024@stu.kln.ac.lk	im2024024	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:49.77	\N	\N	\N	\N	\N	\N	\N	\N	student	Student024	L1
IM/2024/025	student-im24025@stu.kln.ac.lk	im2024025	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:49.879	\N	\N	\N	\N	\N	\N	\N	\N	student	Student025	L1
IM/2024/026	student-im24026@stu.kln.ac.lk	im2024026	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:49.959	\N	\N	\N	\N	\N	\N	\N	\N	student	Student026	L1
IM/2024/027	student-im24027@stu.kln.ac.lk	im2024027	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:50.042	\N	\N	\N	\N	\N	\N	\N	\N	student	Student027	L1
IM/2024/028	student-im24028@stu.kln.ac.lk	im2024028	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:50.118	\N	\N	\N	\N	\N	\N	\N	\N	student	Student028	L1
IM/2024/029	student-im24029@stu.kln.ac.lk	im2024029	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:50.212	\N	\N	\N	\N	\N	\N	\N	\N	student	Student029	L1
IM/2024/030	student-im24030@stu.kln.ac.lk	im2024030	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:50.306	\N	\N	\N	\N	\N	\N	\N	\N	student	Student030	L1
IM/2024/031	student-im24031@stu.kln.ac.lk	im2024031	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:50.402	\N	\N	\N	\N	\N	\N	\N	\N	student	Student031	L1
IM/2024/032	student-im24032@stu.kln.ac.lk	im2024032	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:50.5	\N	\N	\N	\N	\N	\N	\N	\N	student	Student032	L1
IM/2024/033	student-im24033@stu.kln.ac.lk	im2024033	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:50.599	\N	\N	\N	\N	\N	\N	\N	\N	student	Student033	L1
IM/2024/034	student-im24034@stu.kln.ac.lk	im2024034	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:50.699	\N	\N	\N	\N	\N	\N	\N	\N	student	Student034	L1
IM/2024/035	student-im24035@stu.kln.ac.lk	im2024035	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:50.805	\N	\N	\N	\N	\N	\N	\N	\N	student	Student035	L1
IM/2024/036	student-im24036@stu.kln.ac.lk	im2024036	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:50.9	\N	\N	\N	\N	\N	\N	\N	\N	student	Student036	L1
IM/2024/037	student-im24037@stu.kln.ac.lk	im2024037	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:50.985	\N	\N	\N	\N	\N	\N	\N	\N	student	Student037	L1
IM/2024/038	student-im24038@stu.kln.ac.lk	im2024038	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:51.083	\N	\N	\N	\N	\N	\N	\N	\N	student	Student038	L1
d49ffbb9-cc8a-4944-abbc-dca2887b0843	lecturer@sees.com	lecturer	$2b$10$cWwrXGCCevVY6XnmyoDjcuIhHbQiFWU.1qs1h0JGd6YzfoRCvtSE.	ACTIVE	2026-04-16 14:53:47.286	2026-04-17 04:59:04.343	\N	\N	\N	\N	\N	\N	\N	student	Dr. Alan	Turing
IM/2024/039	student-im24039@stu.kln.ac.lk	im2024039	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:51.188	\N	\N	\N	\N	\N	\N	\N	\N	student	Student039	L1
IM/2024/040	student-im24040@stu.kln.ac.lk	im2024040	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:51.292	\N	\N	\N	\N	\N	\N	\N	\N	student	Student040	L1
IM/2024/041	student-im24041@stu.kln.ac.lk	im2024041	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:51.396	\N	\N	\N	\N	\N	\N	\N	\N	student	Student041	L1
IM/2024/042	student-im24042@stu.kln.ac.lk	im2024042	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:51.495	\N	\N	\N	\N	\N	\N	\N	\N	student	Student042	L1
IM/2024/043	student-im24043@stu.kln.ac.lk	im2024043	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:51.601	\N	\N	\N	\N	\N	\N	\N	\N	student	Student043	L1
IM/2024/044	student-im24044@stu.kln.ac.lk	im2024044	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:51.704	\N	\N	\N	\N	\N	\N	\N	\N	student	Student044	L1
IM/2024/045	student-im24045@stu.kln.ac.lk	im2024045	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:51.809	\N	\N	\N	\N	\N	\N	\N	\N	student	Student045	L1
IM/2024/046	student-im24046@stu.kln.ac.lk	im2024046	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:51.911	\N	\N	\N	\N	\N	\N	\N	\N	student	Student046	L1
IM/2024/047	student-im24047@stu.kln.ac.lk	im2024047	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:52.003	\N	\N	\N	\N	\N	\N	\N	\N	student	Student047	L1
IM/2024/048	student-im24048@stu.kln.ac.lk	im2024048	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:52.089	\N	\N	\N	\N	\N	\N	\N	\N	student	Student048	L1
IM/2024/049	student-im24049@stu.kln.ac.lk	im2024049	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:52.173	\N	\N	\N	\N	\N	\N	\N	\N	student	Student049	L1
IM/2024/050	student-im24050@stu.kln.ac.lk	im2024050	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:52.284	\N	\N	\N	\N	\N	\N	\N	\N	student	Student050	L1
IM/2024/051	student-im24051@stu.kln.ac.lk	im2024051	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:52.41	\N	\N	\N	\N	\N	\N	\N	\N	student	Student051	L1
IM/2024/052	student-im24052@stu.kln.ac.lk	im2024052	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:52.476	\N	\N	\N	\N	\N	\N	\N	\N	student	Student052	L1
IM/2024/053	student-im24053@stu.kln.ac.lk	im2024053	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:52.545	\N	\N	\N	\N	\N	\N	\N	\N	student	Student053	L1
IM/2024/054	student-im24054@stu.kln.ac.lk	im2024054	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:52.605	\N	\N	\N	\N	\N	\N	\N	\N	student	Student054	L1
IM/2024/055	student-im24055@stu.kln.ac.lk	im2024055	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:52.665	\N	\N	\N	\N	\N	\N	\N	\N	student	Student055	L1
IM/2024/056	student-im24056@stu.kln.ac.lk	im2024056	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:52.728	\N	\N	\N	\N	\N	\N	\N	\N	student	Student056	L1
IM/2024/057	student-im24057@stu.kln.ac.lk	im2024057	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:52.794	\N	\N	\N	\N	\N	\N	\N	\N	student	Student057	L1
IM/2024/058	student-im24058@stu.kln.ac.lk	im2024058	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:52.878	\N	\N	\N	\N	\N	\N	\N	\N	student	Student058	L1
IM/2024/059	student-im24059@stu.kln.ac.lk	im2024059	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:52.942	\N	\N	\N	\N	\N	\N	\N	\N	student	Student059	L1
IM/2024/060	student-im24060@stu.kln.ac.lk	im2024060	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:53.005	\N	\N	\N	\N	\N	\N	\N	\N	student	Student060	L1
IM/2024/061	student-im24061@stu.kln.ac.lk	im2024061	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:53.075	\N	\N	\N	\N	\N	\N	\N	\N	student	Student061	L1
IM/2024/062	student-im24062@stu.kln.ac.lk	im2024062	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:53.142	\N	\N	\N	\N	\N	\N	\N	\N	student	Student062	L1
IM/2024/063	student-im24063@stu.kln.ac.lk	im2024063	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:53.21	\N	\N	\N	\N	\N	\N	\N	\N	student	Student063	L1
IM/2024/064	student-im24064@stu.kln.ac.lk	im2024064	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:53.273	\N	\N	\N	\N	\N	\N	\N	\N	student	Student064	L1
IM/2024/065	student-im24065@stu.kln.ac.lk	im2024065	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:53.346	\N	\N	\N	\N	\N	\N	\N	\N	student	Student065	L1
IM/2024/066	student-im24066@stu.kln.ac.lk	im2024066	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:53.418	\N	\N	\N	\N	\N	\N	\N	\N	student	Student066	L1
IM/2024/067	student-im24067@stu.kln.ac.lk	im2024067	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:53.487	\N	\N	\N	\N	\N	\N	\N	\N	student	Student067	L1
IM/2024/068	student-im24068@stu.kln.ac.lk	im2024068	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:53.56	\N	\N	\N	\N	\N	\N	\N	\N	student	Student068	L1
IM/2024/069	student-im24069@stu.kln.ac.lk	im2024069	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:53.631	\N	\N	\N	\N	\N	\N	\N	\N	student	Student069	L1
IM/2024/070	student-im24070@stu.kln.ac.lk	im2024070	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:53.702	\N	\N	\N	\N	\N	\N	\N	\N	student	Student070	L1
IM/2024/071	student-im24071@stu.kln.ac.lk	im2024071	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:53.773	\N	\N	\N	\N	\N	\N	\N	\N	student	Student071	L1
IM/2024/072	student-im24072@stu.kln.ac.lk	im2024072	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:53.844	\N	\N	\N	\N	\N	\N	\N	\N	student	Student072	L1
IM/2024/073	student-im24073@stu.kln.ac.lk	im2024073	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:53.923	\N	\N	\N	\N	\N	\N	\N	\N	student	Student073	L1
IM/2024/074	student-im24074@stu.kln.ac.lk	im2024074	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:53.994	\N	\N	\N	\N	\N	\N	\N	\N	student	Student074	L1
IM/2024/075	student-im24075@stu.kln.ac.lk	im2024075	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:54.06	\N	\N	\N	\N	\N	\N	\N	\N	student	Student075	L1
IM/2024/076	student-im24076@stu.kln.ac.lk	im2024076	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:54.122	\N	\N	\N	\N	\N	\N	\N	\N	student	Student076	L1
IM/2024/077	student-im24077@stu.kln.ac.lk	im2024077	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:54.191	\N	\N	\N	\N	\N	\N	\N	\N	student	Student077	L1
IM/2024/078	student-im24078@stu.kln.ac.lk	im2024078	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:54.259	\N	\N	\N	\N	\N	\N	\N	\N	student	Student078	L1
IM/2024/079	student-im24079@stu.kln.ac.lk	im2024079	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:54.328	\N	\N	\N	\N	\N	\N	\N	\N	student	Student079	L1
IM/2024/080	student-im24080@stu.kln.ac.lk	im2024080	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:54.387	\N	\N	\N	\N	\N	\N	\N	\N	student	Student080	L1
IM/2024/081	student-im24081@stu.kln.ac.lk	im2024081	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:54.451	\N	\N	\N	\N	\N	\N	\N	\N	student	Student081	L1
IM/2024/082	student-im24082@stu.kln.ac.lk	im2024082	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:54.517	\N	\N	\N	\N	\N	\N	\N	\N	student	Student082	L1
IM/2024/083	student-im24083@stu.kln.ac.lk	im2024083	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:54.584	\N	\N	\N	\N	\N	\N	\N	\N	student	Student083	L1
IM/2024/084	student-im24084@stu.kln.ac.lk	im2024084	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:54.657	\N	\N	\N	\N	\N	\N	\N	\N	student	Student084	L1
IM/2024/085	student-im24085@stu.kln.ac.lk	im2024085	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:54.724	\N	\N	\N	\N	\N	\N	\N	\N	student	Student085	L1
IM/2024/086	student-im24086@stu.kln.ac.lk	im2024086	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:54.793	\N	\N	\N	\N	\N	\N	\N	\N	student	Student086	L1
IM/2024/087	student-im24087@stu.kln.ac.lk	im2024087	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:54.87	\N	\N	\N	\N	\N	\N	\N	\N	student	Student087	L1
IM/2024/088	student-im24088@stu.kln.ac.lk	im2024088	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:54.939	\N	\N	\N	\N	\N	\N	\N	\N	student	Student088	L1
IM/2024/089	student-im24089@stu.kln.ac.lk	im2024089	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:55.013	\N	\N	\N	\N	\N	\N	\N	\N	student	Student089	L1
IM/2024/090	student-im24090@stu.kln.ac.lk	im2024090	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:55.08	\N	\N	\N	\N	\N	\N	\N	\N	student	Student090	L1
IM/2024/091	student-im24091@stu.kln.ac.lk	im2024091	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:55.143	\N	\N	\N	\N	\N	\N	\N	\N	student	Student091	L1
IM/2024/092	student-im24092@stu.kln.ac.lk	im2024092	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:55.222	\N	\N	\N	\N	\N	\N	\N	\N	student	Student092	L1
IM/2024/093	student-im24093@stu.kln.ac.lk	im2024093	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:55.298	\N	\N	\N	\N	\N	\N	\N	\N	student	Student093	L1
IM/2024/094	student-im24094@stu.kln.ac.lk	im2024094	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:55.365	\N	\N	\N	\N	\N	\N	\N	\N	student	Student094	L1
IM/2024/095	student-im24095@stu.kln.ac.lk	im2024095	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:55.434	\N	\N	\N	\N	\N	\N	\N	\N	student	Student095	L1
IM/2024/096	student-im24096@stu.kln.ac.lk	im2024096	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:55.5	\N	\N	\N	\N	\N	\N	\N	\N	student	Student096	L1
IM/2024/097	student-im24097@stu.kln.ac.lk	im2024097	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:55.572	\N	\N	\N	\N	\N	\N	\N	\N	student	Student097	L1
IM/2024/098	student-im24098@stu.kln.ac.lk	im2024098	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:55.644	\N	\N	\N	\N	\N	\N	\N	\N	student	Student098	L1
IM/2024/099	student-im24099@stu.kln.ac.lk	im2024099	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:55.714	\N	\N	\N	\N	\N	\N	\N	\N	student	Student099	L1
IM/2024/100	student-im24100@stu.kln.ac.lk	im2024100	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:55.782	\N	\N	\N	\N	\N	\N	\N	\N	student	Student100	L1
IM/2024/101	student-im24101@stu.kln.ac.lk	im2024101	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:55.86	\N	\N	\N	\N	\N	\N	\N	\N	student	Student101	L1
IM/2024/102	student-im24102@stu.kln.ac.lk	im2024102	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:55.933	\N	\N	\N	\N	\N	\N	\N	\N	student	Student102	L1
IM/2024/103	student-im24103@stu.kln.ac.lk	im2024103	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:56.003	\N	\N	\N	\N	\N	\N	\N	\N	student	Student103	L1
IM/2024/104	student-im24104@stu.kln.ac.lk	im2024104	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:56.072	\N	\N	\N	\N	\N	\N	\N	\N	student	Student104	L1
IM/2024/105	student-im24105@stu.kln.ac.lk	im2024105	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:56.141	\N	\N	\N	\N	\N	\N	\N	\N	student	Student105	L1
IM/2024/106	student-im24106@stu.kln.ac.lk	im2024106	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:56.202	\N	\N	\N	\N	\N	\N	\N	\N	student	Student106	L1
IM/2024/107	student-im24107@stu.kln.ac.lk	im2024107	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:56.273	\N	\N	\N	\N	\N	\N	\N	\N	student	Student107	L1
IM/2024/108	student-im24108@stu.kln.ac.lk	im2024108	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:56.339	\N	\N	\N	\N	\N	\N	\N	\N	student	Student108	L1
IM/2024/109	student-im24109@stu.kln.ac.lk	im2024109	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:56.401	\N	\N	\N	\N	\N	\N	\N	\N	student	Student109	L1
IM/2024/110	student-im24110@stu.kln.ac.lk	im2024110	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:56.469	\N	\N	\N	\N	\N	\N	\N	\N	student	Student110	L1
IM/2024/111	student-im24111@stu.kln.ac.lk	im2024111	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:56.535	\N	\N	\N	\N	\N	\N	\N	\N	student	Student111	L1
IM/2024/112	student-im24112@stu.kln.ac.lk	im2024112	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:56.606	\N	\N	\N	\N	\N	\N	\N	\N	student	Student112	L1
IM/2024/113	student-im24113@stu.kln.ac.lk	im2024113	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:56.671	\N	\N	\N	\N	\N	\N	\N	\N	student	Student113	L1
IM/2024/116	student-im24116@stu.kln.ac.lk	im2024116	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:56.865	2026-04-18 13:36:55.526	\N	\N	\N	\N	\N	\N	\N	student	Student116	L1
IM/2024/114	student-im24114@stu.kln.ac.lk	im2024114	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:56.741	2026-04-17 21:04:09.946	\N	\N	\N	\N	\N	\N	\N	student	Student114	L1
IM/2024/115	student-im24115@stu.kln.ac.lk	im2024115	$2b$10$Z8je0ahDjX14SI8QVuXI6es55fH1lbA9GS9stRXkDLns7W5XQEmjS	ACTIVE	2026-04-16 14:53:56.803	2026-04-17 16:59:59.055	\N	\N	\N	\N	\N	\N	\N	student	Student115	L1
cd570f68-a16d-4379-af96-a07b43a2cd82	thilinim@kln.ac.lk	thilinim	$2b$10$sLB/l7EoMDjl4/FsvB1pVeb8Dr0yzJ87KQLZHSo1UqF0g.RwmCp1q	ACTIVE	2026-04-16 15:16:36.531	\N	\N	\N	\N	\N	\N	\N	\N	student	Thilini	Mahanama
d0006f91-fbb6-4037-b2ec-9fef0e828342	ruwanw@kln.ac.lk	ruwanw	$2b$10$sLB/l7EoMDjl4/FsvB1pVeb8Dr0yzJ87KQLZHSo1UqF0g.RwmCp1q	ACTIVE	2026-04-16 15:16:36.537	\N	\N	\N	\N	\N	\N	\N	\N	student	Ruwan	Wickramarachchi
2c5ced79-0341-4185-8d51-6eac14cdf36f	amilaw@kln.ac.lk	amilaw	$2b$10$sLB/l7EoMDjl4/FsvB1pVeb8Dr0yzJ87KQLZHSo1UqF0g.RwmCp1q	ACTIVE	2026-04-16 15:16:36.54	\N	\N	\N	\N	\N	\N	\N	\N	student	Amila	Withanaarachchi
b7ae9438-4c82-4c09-a90a-bad4b648e495	chathurar@kln.ac.lk	chathurar	$2b$10$sLB/l7EoMDjl4/FsvB1pVeb8Dr0yzJ87KQLZHSo1UqF0g.RwmCp1q	ACTIVE	2026-04-16 15:16:36.547	\N	\N	\N	\N	\N	\N	\N	\N	student	Chathura	Rajapakse
8360a926-2023-4a61-a986-8ddeb3ea9ec4	chathumik@kln.ac.lk	chathumik	$2b$10$sLB/l7EoMDjl4/FsvB1pVeb8Dr0yzJ87KQLZHSo1UqF0g.RwmCp1q	ACTIVE	2026-04-16 15:16:36.552	\N	\N	\N	\N	\N	\N	\N	\N	student	Chathumi	Kavirathne
7d5608ea-a091-4283-a9bd-fe3e463f6b86	madhukem@kln.ac.lk	madhukem	$2b$10$sLB/l7EoMDjl4/FsvB1pVeb8Dr0yzJ87KQLZHSo1UqF0g.RwmCp1q	ACTIVE	2026-04-16 15:16:36.556	\N	\N	\N	\N	\N	\N	\N	\N	student	Madhuke	Madhuke
e5ce552c-33c8-4719-989b-d8a6e82141fb	navinin@kln.ac.lk	navinin	$2b$10$sLB/l7EoMDjl4/FsvB1pVeb8Dr0yzJ87KQLZHSo1UqF0g.RwmCp1q	ACTIVE	2026-04-16 15:16:36.558	\N	\N	\N	\N	\N	\N	\N	\N	student	Navini	Navini
b751c19d-63bd-4cf0-83f2-859cd1f9b8eb	sujeewas@kln.ac.lk	sujeewas	$2b$10$sLB/l7EoMDjl4/FsvB1pVeb8Dr0yzJ87KQLZHSo1UqF0g.RwmCp1q	ACTIVE	2026-04-16 15:16:36.56	\N	\N	\N	\N	\N	\N	\N	\N	student	Sujeewa	Sujeewa
0e551ed4-3c4f-470d-beba-3a5b30a54d83	gayanj@kln.ac.lk	gayanj	$2b$10$sLB/l7EoMDjl4/FsvB1pVeb8Dr0yzJ87KQLZHSo1UqF0g.RwmCp1q	ACTIVE	2026-04-16 15:16:36.562	\N	\N	\N	\N	\N	\N	\N	\N	student	Gayan	Jayasinghe
fe587071-49ff-43fc-a174-3c03ea3aac9b	ajiths@kln.ac.lk	ajiths	$2b$10$sLB/l7EoMDjl4/FsvB1pVeb8Dr0yzJ87KQLZHSo1UqF0g.RwmCp1q	ACTIVE	2026-04-16 15:16:36.564	\N	\N	\N	\N	\N	\N	\N	\N	student	Ajith	Salgadu
a2fd5222-2c84-4a97-9fcd-313f5ed44106	umayau@kln.ac.lk	umayau	$2b$10$sLB/l7EoMDjl4/FsvB1pVeb8Dr0yzJ87KQLZHSo1UqF0g.RwmCp1q	ACTIVE	2026-04-16 15:16:36.566	\N	\N	\N	\N	\N	\N	\N	\N	student	Umaya	Umaya
40173ed9-6b85-4d99-a4c3-37f5d617984d	tharakat@kln.ac.lk	tharakat	$2b$10$sLB/l7EoMDjl4/FsvB1pVeb8Dr0yzJ87KQLZHSo1UqF0g.RwmCp1q	ACTIVE	2026-04-16 15:16:36.568	\N	\N	\N	\N	\N	\N	\N	\N	student	Tharaka	Tharaka
5a8973b3-ba1e-4bdb-8f8f-dc176f01a054	panchalip@kln.ac.lk	panchalip	$2b$10$sLB/l7EoMDjl4/FsvB1pVeb8Dr0yzJ87KQLZHSo1UqF0g.RwmCp1q	ACTIVE	2026-04-16 15:16:36.57	\N	\N	\N	\N	\N	\N	\N	\N	student	Panchali	Panchali
f9cd265a-62cf-4348-88fa-9610e82846ac	saduns@kln.ac.lk	saduns	$2b$10$sLB/l7EoMDjl4/FsvB1pVeb8Dr0yzJ87KQLZHSo1UqF0g.RwmCp1q	ACTIVE	2026-04-16 15:16:36.572	\N	\N	\N	\N	\N	\N	\N	\N	student	Sadun	Sadun
4d9bc966-fa7a-4de3-af0f-ec8aa47f38e9	codet@kln.ac.lk	codet	$2b$10$sLB/l7EoMDjl4/FsvB1pVeb8Dr0yzJ87KQLZHSo1UqF0g.RwmCp1q	ACTIVE	2026-04-16 15:16:36.574	\N	\N	\N	\N	\N	\N	\N	\N	student	Code	Teriors
05c49617-eaa8-49af-b650-8ae609fb38ca	akalankaa@kln.ac.lk	akalankaa	$2b$10$sLB/l7EoMDjl4/FsvB1pVeb8Dr0yzJ87KQLZHSo1UqF0g.RwmCp1q	ACTIVE	2026-04-16 15:16:36.576	\N	\N	\N	\N	\N	\N	\N	\N	student	Akalanka	Akalanka
599cb63f-b19a-424c-aad6-7f0d4fa66eb5	janakaw@kln.ac.lk	janakaw	$2b$10$sLB/l7EoMDjl4/FsvB1pVeb8Dr0yzJ87KQLZHSo1UqF0g.RwmCp1q	ACTIVE	2026-04-16 15:16:36.545	2026-04-17 17:11:08.849	\N	\N	\N	\N	\N	\N	\N	student	Janaka	Wijayanayake
bb8c46fe-88e7-45c0-aedc-11bce0665734	keerthiw@kln.ac.lk	keerthiw	$2b$10$sLB/l7EoMDjl4/FsvB1pVeb8Dr0yzJ87KQLZHSo1UqF0g.RwmCp1q	ACTIVE	2026-04-16 15:16:36.542	2026-04-17 20:37:51.262	\N	\N	\N	\N	\N	\N	\N	student	Keerthi	Wijayasiriwardhane
fdd458a5-efdd-4565-957a-ebbdbcc09e3c	admin@sees.com	admin	$2b$10$hoTY1XXV0oyfoQYgCfsL1eJmCUrHPvCX2GGdsHrFFB07D2AvZ9Fw6	ACTIVE	2026-04-16 14:53:47.232	2026-04-18 02:17:48.335	\N	\N	\N	\N	\N	\N	\N	admin	Admin	User
4473498f-15ef-47b3-80fe-7001c9f5ab32	dinesha@kln.ac.lk	dinesha	$2b$10$sLB/l7EoMDjl4/FsvB1pVeb8Dr0yzJ87KQLZHSo1UqF0g.RwmCp1q	ACTIVE	2026-04-16 15:16:36.553	2026-04-17 04:03:09.438	\N	\N	\N	\N	\N	\N	\N	student	Dinesh	Asanka
88d65386-fb87-449c-9acd-f08e329c4568	dilaniw@kln.ac.lk	dilaniw	$2b$10$sLB/l7EoMDjl4/FsvB1pVeb8Dr0yzJ87KQLZHSo1UqF0g.RwmCp1q	ACTIVE	2026-04-16 15:16:36.549	2026-04-18 05:00:03.774	\N	\N	\N	\N	\N	\N	\N	student	Dilani	Wickramarachchi
\.


--
-- Data for Name: _ModulePrerequisites; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public."_ModulePrerequisites" ("A", "B") FROM stdin;
0a308fe3-8c2f-4aae-918e-9c425ecb44c2	a684256c-7801-47b6-9d3e-e334f334e63c
9df5d19b-1a4b-4cb5-a586-d649a7cb9add	7e1f26b7-fb20-445e-abe3-5a43f9a2c7af
194ba375-3037-4f18-9c56-306aefe4e499	7e1f26b7-fb20-445e-abe3-5a43f9a2c7af
c08df20a-02dc-4e5c-b498-729d78cb5983	50a00c33-a365-4ebe-a7eb-127d7efda5f6
6860d3ee-dd78-4fe1-8b9b-4ada56cb913e	7e1f26b7-fb20-445e-abe3-5a43f9a2c7af
6860d3ee-dd78-4fe1-8b9b-4ada56cb913e	9df5d19b-1a4b-4cb5-a586-d649a7cb9add
6860d3ee-dd78-4fe1-8b9b-4ada56cb913e	194ba375-3037-4f18-9c56-306aefe4e499
0bbd3aa6-1e2b-4e99-af0a-f3f84cc75a10	a684256c-7801-47b6-9d3e-e334f334e63c
68dddd76-e8bd-4e40-838b-646688be7efe	9df5d19b-1a4b-4cb5-a586-d649a7cb9add
68dddd76-e8bd-4e40-838b-646688be7efe	194ba375-3037-4f18-9c56-306aefe4e499
aab05c64-c69e-4c65-9bb8-5b5908627608	6860d3ee-dd78-4fe1-8b9b-4ada56cb913e
4fcb0b35-242f-4aa5-b1bc-b4924a8dc664	7e1f26b7-fb20-445e-abe3-5a43f9a2c7af
4fcb0b35-242f-4aa5-b1bc-b4924a8dc664	9df5d19b-1a4b-4cb5-a586-d649a7cb9add
7c24057a-3e64-4c31-a0de-9593a2bd498a	7e1f26b7-fb20-445e-abe3-5a43f9a2c7af
b89a3527-0029-4474-a7e4-0c30921a850d	9df5d19b-1a4b-4cb5-a586-d649a7cb9add
b89a3527-0029-4474-a7e4-0c30921a850d	037453b4-bc30-4640-95e3-12fdaba828fa
6b30076b-6f78-401d-abfe-bd0197844fcd	187bb9de-c86f-43d2-b47c-f27de80967e7
1fee972c-6d01-436b-803d-c6d3261b6189	58c560d6-06f3-4331-bd7d-81422a7d7139
1fee972c-6d01-436b-803d-c6d3261b6189	f82c0d24-7715-47e1-9898-dda42e472318
30978923-a161-4550-8388-375df1c3e8ae	f82c0d24-7715-47e1-9898-dda42e472318
30978923-a161-4550-8388-375df1c3e8ae	6c2848bd-f6ec-4354-98ab-929d2b016bd0
9b185406-61c3-41e9-8858-58f97b158f61	0bbd3aa6-1e2b-4e99-af0a-f3f84cc75a10
83c5ba1c-93f2-4b83-be77-a9f49e0ccb56	a684256c-7801-47b6-9d3e-e334f334e63c
83c5ba1c-93f2-4b83-be77-a9f49e0ccb56	0a308fe3-8c2f-4aae-918e-9c425ecb44c2
294b69cc-a7ec-487d-b081-128a01509f47	0a308fe3-8c2f-4aae-918e-9c425ecb44c2
294b69cc-a7ec-487d-b081-128a01509f47	0bbd3aa6-1e2b-4e99-af0a-f3f84cc75a10
3e6f95ea-4a25-47a6-8464-856a1685bb80	da40a045-4e9a-408c-a5ae-d535aba296ac
69319868-4c9d-413b-b7fe-5ef4065f4856	f82c0d24-7715-47e1-9898-dda42e472318
6934c7e2-1acc-4a62-a04c-f2080e7949ee	6b30076b-6f78-401d-abfe-bd0197844fcd
cee0f579-1fe3-45c7-a022-9267ae7f253e	0bbd3aa6-1e2b-4e99-af0a-f3f84cc75a10
37611975-b014-42da-95c3-8cbd1e2843f9	0bbd3aa6-1e2b-4e99-af0a-f3f84cc75a10
2fe6fe04-2630-49f5-8355-0d277ea2fb8f	f060c389-3ffb-4733-b21d-e3b59310d723
cb4b0bc4-fb3a-4519-826a-6a9772335779	0bbd3aa6-1e2b-4e99-af0a-f3f84cc75a10
1c52a9bd-8940-4ff0-8208-dbaa110c5af3	f060c389-3ffb-4733-b21d-e3b59310d723
1c52a9bd-8940-4ff0-8208-dbaa110c5af3	da40a045-4e9a-408c-a5ae-d535aba296ac
1c52a9bd-8940-4ff0-8208-dbaa110c5af3	f82c0d24-7715-47e1-9898-dda42e472318
1c52a9bd-8940-4ff0-8208-dbaa110c5af3	6b30076b-6f78-401d-abfe-bd0197844fcd
73f8dfec-691a-4ff2-9625-725b9cbdd9ec	f82c0d24-7715-47e1-9898-dda42e472318
5e85cf1a-25cc-4a05-b54c-e5f63637a7d6	0a308fe3-8c2f-4aae-918e-9c425ecb44c2
5e85cf1a-25cc-4a05-b54c-e5f63637a7d6	0bbd3aa6-1e2b-4e99-af0a-f3f84cc75a10
5e85cf1a-25cc-4a05-b54c-e5f63637a7d6	294b69cc-a7ec-487d-b081-128a01509f47
aad74d93-8665-4213-a1be-3d103934498d	f82c0d24-7715-47e1-9898-dda42e472318
3b9b100f-2ef9-4985-bab5-f09fce4cfa2f	9fede30e-98ea-43e8-9a96-2e66bdb404bf
d40cf07d-28a9-4701-9f9c-061a519eb64d	6934c7e2-1acc-4a62-a04c-f2080e7949ee
91035b15-ccef-47c1-92ef-13eecac56045	a684256c-7801-47b6-9d3e-e334f334e63c
91035b15-ccef-47c1-92ef-13eecac56045	7e1f26b7-fb20-445e-abe3-5a43f9a2c7af
00ac0409-f8ba-4a55-9c6d-16554d6a3e2f	6860d3ee-dd78-4fe1-8b9b-4ada56cb913e
222e7280-445c-4c6e-b515-2efe5e3c68ff	9df5d19b-1a4b-4cb5-a586-d649a7cb9add
222e7280-445c-4c6e-b515-2efe5e3c68ff	037453b4-bc30-4640-95e3-12fdaba828fa
45152844-fbfc-471f-9304-1315b5a8c087	7e1f26b7-fb20-445e-abe3-5a43f9a2c7af
45152844-fbfc-471f-9304-1315b5a8c087	91035b15-ccef-47c1-92ef-13eecac56045
840e23cb-0bd0-4024-867e-eef72cf98a70	6860d3ee-dd78-4fe1-8b9b-4ada56cb913e
89eacd27-7707-404c-aaad-1328ad1ef28b	a684256c-7801-47b6-9d3e-e334f334e63c
2760c24f-aed6-476f-b911-7738c1a11d86	aab05c64-c69e-4c65-9bb8-5b5908627608
172b4601-64b0-48d6-9f3b-31a241582adf	194ba375-3037-4f18-9c56-306aefe4e499
ebfa6454-83cf-4d90-9237-2566746d3575	7c24057a-3e64-4c31-a0de-9593a2bd498a
d7a78d3c-5800-4298-809a-b692157344e3	a684256c-7801-47b6-9d3e-e334f334e63c
d7a78d3c-5800-4298-809a-b692157344e3	0a308fe3-8c2f-4aae-918e-9c425ecb44c2
fa0ae5dc-a12f-4423-a52c-21274c0e6ddb	50a00c33-a365-4ebe-a7eb-127d7efda5f6
fa0ae5dc-a12f-4423-a52c-21274c0e6ddb	c08df20a-02dc-4e5c-b498-729d78cb5983
880d4408-f797-4673-bf13-f3a77c37e9b1	9df5d19b-1a4b-4cb5-a586-d649a7cb9add
880d4408-f797-4673-bf13-f3a77c37e9b1	037453b4-bc30-4640-95e3-12fdaba828fa
880d4408-f797-4673-bf13-f3a77c37e9b1	840e23cb-0bd0-4024-867e-eef72cf98a70
87d9c721-ff98-4942-a210-f7db026f68c1	a684256c-7801-47b6-9d3e-e334f334e63c
87d9c721-ff98-4942-a210-f7db026f68c1	4fcb0b35-242f-4aa5-b1bc-b4924a8dc664
87d9c721-ff98-4942-a210-f7db026f68c1	fa0ae5dc-a12f-4423-a52c-21274c0e6ddb
15010796-ab46-49bf-928e-3672b2c908f1	7c24057a-3e64-4c31-a0de-9593a2bd498a
7a7c6fa2-ffdb-4c28-a577-8b1573f80489	194ba375-3037-4f18-9c56-306aefe4e499
240ab053-55ea-4601-882a-59f449c89dfb	0a308fe3-8c2f-4aae-918e-9c425ecb44c2
240ab053-55ea-4601-882a-59f449c89dfb	45152844-fbfc-471f-9304-1315b5a8c087
fe8c8583-0fee-483c-a4d2-a165f290bd29	9df5d19b-1a4b-4cb5-a586-d649a7cb9add
fe8c8583-0fee-483c-a4d2-a165f290bd29	037453b4-bc30-4640-95e3-12fdaba828fa
4d3e12fe-59f7-4025-90c8-ee6a0f644b56	7e1f26b7-fb20-445e-abe3-5a43f9a2c7af
4d3e12fe-59f7-4025-90c8-ee6a0f644b56	7c24057a-3e64-4c31-a0de-9593a2bd498a
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
86eb7cc6-ee74-4a96-9934-3ee9cd5598c6	c1817922e660d7dea0d17b83f28aedd42ce6e7f34e832ecdf1a3f4836670b4d8	2026-03-29 14:28:46.284086+00	20260120044507_init	\N	\N	2026-03-29 14:28:46.005085+00	1
e2d708f1-1b2b-4801-a708-b84f14cc5389	caadbbecc6adf2328162c2d8631deb3457f1be25c1a84e2f20a2596002418e7b	2026-03-29 14:28:46.293123+00	20260120091134_add_user_names	\N	\N	2026-03-29 14:28:46.286164+00	1
c4a031a3-2fd8-46ff-bd4d-11615589d813	432cb329b00a02dd028392761f376df43190dbce72a97d7da1ed6dd70882bd47	2026-04-15 12:04:29.546899+00	20260424120000_graduation_eligibility_profiles	\N	\N	2026-04-15 12:04:29.513998+00	1
2fce7fcc-851b-4b9d-8873-2e5330363c6e	89a378f102884290e169722d19fe89d6b6d900574527ed03e0cf0d303e6f3e05	2026-03-29 14:28:46.37701+00	20260120123408_refactor_academic_structure	\N	\N	2026-03-29 14:28:46.295763+00	1
c281cf01-a469-488d-8d82-c2c699ce1941	22403e5bc749e98bd908c405316ef3d03604b0d6299c417b9470517a1e4540ae	2026-03-29 14:28:46.479671+00	20260127162902_a	\N	\N	2026-03-29 14:28:46.378887+00	1
1d155323-d1a5-4a73-b303-de822d0dc3e9	1fd1e56ebe75dd69d73432c7ec2f9aa3ebbe4ed1ed9696f7e67e352c645cea8d	2026-03-29 14:29:00.035685+00	20260329142900_add_pathway_preferences_final	\N	\N	2026-03-29 14:29:00.017987+00	1
588e440e-bb34-4362-8d2b-2865c50a279d	bd0618a2cdfabe26e4b683f5525fcdb4377fa3391d8096181dd8df0faa43541e	2026-04-15 13:00:05.778053+00	20260415130000_analytics_reports_and_indexes	\N	\N	2026-04-15 13:00:05.697725+00	1
392e77bc-1798-4a1d-a51e-cf8f6bb317b9	6dfc7f59ca24761063937d1aaa920bbf3794a45367824cf436e8044614e10575	2026-04-15 01:15:57.522973+00	20260415120000_add_selection_rounds	\N	\N	2026-04-15 01:15:57.466996+00	1
5cb2ddcb-85a5-4264-bc12-f0d5e7f9c918	93bca8775f2845fda12210c2bd4d4d5b48fd20d4c7049ea9f120706798b63631	2026-04-15 01:34:58.380526+00	20260416100000_selection_mode_auto_default	\N	\N	2026-04-15 01:34:58.314524+00	1
82d2a924-cee2-4aaf-a4f3-f93f803c8f17	8c11b7f69cb2268838576e943d947572b8a049ca67d768e9cfc4fa97d4b9485e	2026-04-16 06:12:49.876604+00	20260426120000_quantitative_academic_goals	\N	\N	2026-04-16 06:12:49.844893+00	1
14fc2c1e-cd58-4cec-bf8e-f09d706d1c30	c152280b0bfe43fe0f7dacb29541cd2371935294f8da06166081a38da9b246b0	2026-04-15 03:05:51.713446+00	20260415140000_module_registration_rounds	\N	\N	2026-04-15 03:05:51.666451+00	1
da6b9759-7000-4591-9470-5d143f3d7b7b	1bf6c3485d94c4df7faf3ab743667d0e0d284b89721575e05d3e75386ad3a108	2026-04-15 14:38:30.008298+00	20260425150000_student_onboarding_metadata	\N	\N	2026-04-15 14:38:29.993679+00	1
b5e3d39d-8616-4ac4-8833-6166e40efb10	8fa24ed3a0d812e01efbd295e9f080dc0cc309683191a0352b034435e6635330	2026-04-15 04:13:20.650437+00	20260416120000_selection_allocation_grace	\N	\N	2026-04-15 04:13:20.611635+00	1
eec3f2ec-042e-4808-873d-edbed139901e	9ae3f8efc5dc233e264f9a15003ebb7cd1f53708fbbd2db241909e8b04ddba4b	2026-04-15 06:11:06.534628+00	20260415180000_module_counts_toward_gpa	\N	\N	2026-04-15 06:11:06.516901+00	1
5e353320-689d-4895-9316-2adba1a8e450	f0c295912f39d1480e357a3fe50209be6649a858fdd0a58de6928e091f2bac43	2026-04-15 06:11:06.555126+00	20260423120000_message_indexes	\N	\N	2026-04-15 06:11:06.536421+00	1
e2b755ba-8a03-4f39-94d8-955e486093f2	118db5538d9d3a645d9911f15fa4d96615758a1be5a745efcc362a39c64ed059	2026-04-15 23:19:08.831631+00	20260415100000_notification_email_config	\N	\N	2026-04-15 23:19:08.790926+00	1
a36dba26-6091-4f82-9868-c8c35a7cf25d	7d3865ec6ce1a0c97b932305ed0593af098fd2fc49b6c4f2324b5534a3792659	2026-04-15 09:34:00.140033+00	20260415180000_module_custom_grading_bands	\N	\N	2026-04-15 09:34:00.122208+00	1
e73c521b-f118-417d-8303-8f16f69cbac4	b0b5093176d3be77ef4d8bd352539e718b424a461535c31a057062dc87100a0a	2026-04-15 10:21:25.017286+00	20260415190000_grade_marks_optional	\N	\N	2026-04-15 10:21:25.005372+00	1
8f812fd2-4d07-4cc8-b679-9ac59185ba25	bccaf1cc1a849d1d8a880b922e187288a49d186c12083faada6148e86249281e	2026-04-15 23:59:48.987645+00	20260416150000_audit_log_extended	\N	\N	2026-04-15 23:59:48.966082+00	1
3cb3d489-a603-4417-937e-fd182d43c248	923e20e450a705b99427eda633dcfac97a28b0f8b7fad68d558d49e9129633ed	2026-04-16 08:39:00.748322+00	20260427150000_add_student_ai_feedback_snapshot	\N	\N	2026-04-16 08:39:00.711399+00	1
5c14bc5a-9cc3-424c-837a-8e7954b96810	7d0d7cf8e882aeff59d00ff07b7e93a486144ec50df5b7c7ad2b10ed24c2b61d	2026-04-16 01:20:51.530482+00	20260416130000_anonymous_report_admin_fields	\N	\N	2026-04-16 01:20:51.506968+00	1
56a503f9-c743-4c0c-bf15-9ddf43d8c205	82d31995a64cad08049fa7aa4ce5c5bd38d0a8fc19942b8975763b901ae87548	2026-04-16 03:21:14.862573+00	20260426100000_selection_round_target_program_and_optional_level	\N	\N	2026-04-16 03:21:14.838427+00	1
dd5b682e-a238-405b-833e-bcb7c6e338e9	47f0e0228b1e7f61c7d8920fb42ab1cf10acbea6c1d7c2215a8a20c9d1d91fa0	2026-04-16 05:56:26.878273+00	20260416170000_add_student_graduation_tracking	\N	\N	2026-04-16 05:56:26.862277+00	1
90b7aa29-4701-43c8-839a-e299d035ae67	04be5600a1f3e5c7fb63f919b306db6f9755175c4941fd9a94cf4d80e02e4733	\N	20260416162000_add_lms_import_session	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260416162000_add_lms_import_session\n\nDatabase error code: 42P07\n\nDatabase error:\nERROR: relation "LmsImportSession" already exists\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42P07), message: "relation \\"LmsImportSession\\" already exists", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("heap.c"), line: Some(1150), routine: Some("heap_create_with_catalog") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20260416162000_add_lms_import_session"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20260416162000_add_lms_import_session"\n             at schema-engine/commands/src/commands/apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:246	2026-04-16 14:20:34.21829+00	2026-04-16 12:25:31.628459+00	0
155fee55-5b82-465b-ae68-2bde81dcf05d	04be5600a1f3e5c7fb63f919b306db6f9755175c4941fd9a94cf4d80e02e4733	2026-04-16 14:20:34.231687+00	20260416162000_add_lms_import_session		\N	2026-04-16 14:20:34.231687+00	0
de8051bd-a598-464f-8d00-33bb012b357a	bedcc638075bb83da30f027ae6076dcc78c1549781767fa809166f705779b5e7	2026-04-17 17:32:48.768626+00	20260427170000_add_advisor_contact_fields	\N	\N	2026-04-17 17:32:48.740373+00	1
\.


--
-- Data for Name: academic_credit_rules; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public.academic_credit_rules (id, level, semester_number, min_credits, max_credits, created_at, updated_at, academic_year_id) FROM stdin;
a5997901-fbf4-4467-9ec6-a859bf5c0936	L3	2	6	6	2026-04-17 03:15:01.797	2026-04-17 03:15:01.797	\N
\.


--
-- Data for Name: academic_path_transitions; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public.academic_path_transitions (id, source_program_id, target_program_id, level, created_at) FROM stdin;
\.


--
-- Data for Name: analytics_reports; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public.analytics_reports (report_id, owner_user_id, scope_role, title, definition, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public.audit_logs (log_id, admin_id, action, entity_type, entity_id, old_value, new_value, "timestamp", category, metadata, ip_address, user_agent) FROM stdin;
30d69424-7da0-480e-be8d-d83b126f136a	fdd458a5-efdd-4565-957a-ebbdbcc09e3c	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-16 14:56:32.027	AUTH	{"email": "admin@sees.com"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
028ae3b2-13eb-4856-92a0-e7a7dc57d630	\N	AUTH_LOGIN_FAILED	AUTH	login	\N	\N	2026-04-16 14:58:00.974	AUTH	{"email": "dilaniw@kln.ac.lk", "reason": "user_not_found"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
b94bb33a-30d3-44e3-a352-a71f9d863d44	d49ffbb9-cc8a-4944-abbc-dca2887b0843	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-16 14:58:06.334	AUTH	{"email": "lecturer@sees.com"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
a83925dc-2d51-4241-910c-363046e21f3a	fdd458a5-efdd-4565-957a-ebbdbcc09e3c	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-16 15:15:17.777	AUTH	{"email": "admin@sees.com"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
e5172bfe-bcee-46cf-8069-91b9c193bcba	IM/2024/118	AUTH_LOGIN_FAILED	AUTH	login	\N	\N	2026-04-16 15:18:37.686	AUTH	{"email": "student-im24118@stu.kln.ac.lk", "reason": "invalid_credentials"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
d79feeb4-1ca6-4b7b-aaa2-5f029807f91d	IM/2024/118	AUTH_LOGIN_FAILED	AUTH	login	\N	\N	2026-04-16 15:18:46.677	AUTH	{"email": "student-im24118@stu.kln.ac.lk", "reason": "invalid_credentials"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
0dc1282e-c37a-4616-956b-f4e25af7526b	IM/2024/118	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-16 15:20:31.951	AUTH	{"email": "student-im24118@stu.kln.ac.lk"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
c8fb2ce1-5df5-4114-9c5d-520c2f0f13a4	fdd458a5-efdd-4565-957a-ebbdbcc09e3c	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-16 15:28:56.079	AUTH	{"email": "admin@sees.com"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
145dbe4c-1329-48a6-b492-e12dc1d9492e	IM/2024/118	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-16 15:29:15.96	AUTH	{"email": "student-im24118@stu.kln.ac.lk"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
86ae4c2c-f834-4ce6-ac76-75ec88bdf6c5	fdd458a5-efdd-4565-957a-ebbdbcc09e3c	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-16 16:11:26.446	AUTH	{"email": "admin@sees.com"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
7310ba42-54b3-41c4-a26c-06a0149fba17	\N	AUTH_LOGIN_FAILED	AUTH	login	\N	\N	2026-04-16 16:11:51.901	AUTH	{"email": "student-im24118@stu.kln.ac.lk", "reason": "user_not_found"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
36267e42-766e-44fc-8e1c-eba29e1eb1d3	IM/2024/116	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-16 16:12:00.164	AUTH	{"email": "student-im24116@stu.kln.ac.lk"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
d4b5a599-11c8-4e6c-a15f-23c7306490d9	fdd458a5-efdd-4565-957a-ebbdbcc09e3c	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-16 16:14:30.444	AUTH	{"email": "admin@sees.com"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
92d58f20-f49d-4af7-9a4b-7a72aef1b828	fdd458a5-efdd-4565-957a-ebbdbcc09e3c	ADMIN_PROGRAM_INTAKE_UPSERT	PROGRAM_INTAKE	20aa71a7-16c2-4130-910c-f4e4a488d584	\N	\N	2026-04-16 16:14:45.191	ADMIN	{"status": "OPEN", "program_id": "24bcdfbd-b096-438c-b69e-ad906fbdaf00"}	\N	\N
52b26c10-6a1f-42e8-b22e-f3125ac90fce	\N	AUTH_LOGIN_FAILED	AUTH	login	\N	\N	2026-04-16 16:14:53.404	AUTH	{"email": "bandara-im22054@stu.kln.ac.lk", "reason": "user_not_found"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
95c28a16-0646-40df-9446-7bf15020f150	IM/2024/116	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-16 16:14:56.679	AUTH	{"email": "student-im24116@stu.kln.ac.lk"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
4e7d7d9f-222f-4364-8a56-f594646e3ad1	IM/2024/116	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 02:48:52.666	AUTH	{"email": "student-im24116@stu.kln.ac.lk"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
f45733e8-6d68-40e4-8257-c14e7cff22a1	\N	AUTH_LOGIN_FAILED	AUTH	login	\N	\N	2026-04-17 02:49:11.522	AUTH	{"email": "bandara-im22054@stu.kln.ac.lk", "reason": "user_not_found"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
5467c410-64cc-431a-b493-6561280d6190	\N	AUTH_LOGIN_FAILED	AUTH	login	\N	\N	2026-04-17 02:49:16.74	AUTH	{"email": "bandara-im2205e@stu.kln.ac.lk", "reason": "user_not_found"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
3cedf4d1-c2a1-4086-878b-22924d3df792	STU001	AUTH_LOGIN_FAILED	AUTH	login	\N	\N	2026-04-17 02:49:22.82	AUTH	{"email": "bandara-im22053@stu.kln.ac.lk", "reason": "invalid_credentials"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
ff01f305-e376-4aea-bba7-20f979f14623	fdd458a5-efdd-4565-957a-ebbdbcc09e3c	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 02:49:35.438	AUTH	{"email": "admin@sees.com"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
77d95440-1be7-45d0-936a-6cf6f98b6063	fdd458a5-efdd-4565-957a-ebbdbcc09e3c	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 03:11:33.734	AUTH	{"email": "admin@sees.com"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
7e288ae2-7076-4184-960a-b89150e689a2	fdd458a5-efdd-4565-957a-ebbdbcc09e3c	ADMIN_CREDIT_RULE_SAVE	ACADEMIC_CREDIT_RULE	a5997901-fbf4-4467-9ec6-a859bf5c0936	\N	\N	2026-04-17 03:15:01.81	ADMIN	{"level": "L3", "semester": 2}	\N	\N
fe8148ee-d129-4348-9881-d2bd49790823	88d65386-fb87-449c-9acd-f08e329c4568	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 03:16:33.164	AUTH	{"email": "dilaniw@kln.ac.lk"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
ad7f11f6-ae4f-4f75-9276-da534a7535da	88d65386-fb87-449c-9acd-f08e329c4568	GRADUATION_ELIGIBILITY_PROFILE_UPSERT	GRADUATION_ELIGIBILITY_PROFILE	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	\N	2026-04-18 05:16:03.301	STAFF	{"version": 5}	\N	\N
7e179ef1-7848-4c7a-9e55-0f82da4eec5b	d49ffbb9-cc8a-4944-abbc-dca2887b0843	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 03:16:41.864	AUTH	{"email": "lecturer@sees.com"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
36dc0572-3a8d-457f-bbb1-043fa85c3830	fdd458a5-efdd-4565-957a-ebbdbcc09e3c	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 03:16:51.862	AUTH	{"email": "admin@sees.com"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
170e085b-d9aa-46ea-8489-aa084f59c300	88d65386-fb87-449c-9acd-f08e329c4568	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 03:17:12.581	AUTH	{"email": "dilaniw@kln.ac.lk"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
f3f0712f-81ae-4325-acc8-f2e83bc63aed	88d65386-fb87-449c-9acd-f08e329c4568	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 03:18:40.253	AUTH	{"email": "dilaniw@kln.ac.lk"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
80a992ba-04b2-4ea2-9f26-6bd139fe9f43	fdd458a5-efdd-4565-957a-ebbdbcc09e3c	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 03:18:59.308	AUTH	{"email": "admin@sees.com"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
83ca19ed-ea7b-49a2-b5a3-adc9c4a38400	88d65386-fb87-449c-9acd-f08e329c4568	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 03:29:57.86	AUTH	{"email": "dilaniw@kln.ac.lk"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
25327b9c-817f-42b4-b4f8-de76640898f8	88d65386-fb87-449c-9acd-f08e329c4568	GRADUATION_ELIGIBILITY_PROFILE_UPSERT	GRADUATION_ELIGIBILITY_PROFILE	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	\N	2026-04-17 03:33:52.693	STAFF	{"version": 1}	\N	\N
cc0e3c03-ac35-49fc-972b-047b64e98041	88d65386-fb87-449c-9acd-f08e329c4568	GRADUATION_ELIGIBILITY_PROFILE_UPSERT	GRADUATION_ELIGIBILITY_PROFILE	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	\N	2026-04-17 03:34:21.256	STAFF	{"version": 2}	\N	\N
7898ce52-8c5c-48aa-8980-0011fae9fc2d	4473498f-15ef-47b3-80fe-7001c9f5ab32	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 04:03:09.456	AUTH	{"email": "dinesha@kln.ac.lk"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
3682161f-4b01-4aee-a0e6-e76e5052e256	599cb63f-b19a-424c-aad6-7f0d4fa66eb5	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 04:08:44.37	AUTH	{"email": "janakaw@kln.ac.lk"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
7e65eee7-c4dd-4f45-aad8-dbab2969ea32	599cb63f-b19a-424c-aad6-7f0d4fa66eb5	STAFF_GRADE_UPSERT	GRADE	8d1e9e3f-7db8-4103-874f-ad99f3a25389	\N	\N	2026-04-17 04:16:14.808	STAFF	{"hasMarks": false, "module_id": "9e882501-05ec-4007-a8cd-fbbb12d0cd3c", "letterGrade": "B-"}	\N	\N
75fca0bf-65f2-474f-9a30-9524627e7716	d49ffbb9-cc8a-4944-abbc-dca2887b0843	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 04:54:16.191	AUTH	{"email": "lecturer@sees.com"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
b19c7171-4f10-45c9-9709-e562ae8e5542	d49ffbb9-cc8a-4944-abbc-dca2887b0843	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 04:59:04.36	AUTH	{"email": "lecturer@sees.com"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
4a93450f-e22f-4a32-90d0-d7482ba8f927	599cb63f-b19a-424c-aad6-7f0d4fa66eb5	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 04:59:19.73	AUTH	{"email": "janakaw@kln.ac.lk"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
e1eede8e-8408-48f3-b9fc-ead557ffa507	599cb63f-b19a-424c-aad6-7f0d4fa66eb5	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 05:04:22.496	AUTH	{"email": "janakaw@kln.ac.lk"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
992fa0c2-217f-4367-b350-4a707488ac00	88d65386-fb87-449c-9acd-f08e329c4568	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 05:04:35.146	AUTH	{"email": "dilaniw@kln.ac.lk"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
85316048-2aa7-4512-8422-70a59c01c6ac	STU001	AUTH_LOGIN_FAILED	AUTH	login	\N	\N	2026-04-17 05:22:56.341	AUTH	{"email": "bandara-im22053@stu.kln.ac.lk", "reason": "invalid_credentials"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
fdf81eec-d579-4eb0-b45f-5f2307903d50	fdd458a5-efdd-4565-957a-ebbdbcc09e3c	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 05:23:01.518	AUTH	{"email": "admin@sees.com"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
cdfce640-4e0b-4d0e-bf57-5d096ca058dc	88d65386-fb87-449c-9acd-f08e329c4568	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 05:24:54.328	AUTH	{"email": "dilaniw@kln.ac.lk"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
15f82a6c-711c-44be-b8ff-dbb762071136	fdd458a5-efdd-4565-957a-ebbdbcc09e3c	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 05:26:48.156	AUTH	{"email": "admin@sees.com"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
93e044d5-6418-4e15-aa8c-ea5601036103	599cb63f-b19a-424c-aad6-7f0d4fa66eb5	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 05:27:25.408	AUTH	{"email": "janakaw@kln.ac.lk"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
247ad391-6a43-4118-8fdf-eb6ea593965a	\N	AUTH_LOGIN_FAILED	AUTH	login	\N	\N	2026-04-17 05:29:04.896	AUTH	{"email": "bandara-im22054@stu.kln.ac.lk", "reason": "user_not_found"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
0bc53102-84f2-4bf8-8f9d-1429d54bc6f8	STU001	AUTH_LOGIN_FAILED	AUTH	login	\N	\N	2026-04-17 05:29:10.154	AUTH	{"email": "bandara-im22053@stu.kln.ac.lk", "reason": "invalid_credentials"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
0f040849-c8d8-4d20-88c5-d7455078cd85	IM/2024/116	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 05:29:17.968	AUTH	{"email": "student-im24116@stu.kln.ac.lk"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
2638599a-66c9-4878-87a0-369405544a1c	88d65386-fb87-449c-9acd-f08e329c4568	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 05:35:50.109	AUTH	{"email": "dilaniw@kln.ac.lk"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
da68be9f-1aed-4094-b532-2b03994cb27f	88d65386-fb87-449c-9acd-f08e329c4568	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 05:36:27.188	AUTH	{"email": "dilaniw@kln.ac.lk"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
fad8c178-1031-4f10-bc1a-87834c5b508f	fdd458a5-efdd-4565-957a-ebbdbcc09e3c	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 05:37:22.324	AUTH	{"email": "admin@sees.com"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
5e29f21b-ee1c-4d95-9905-f20601049dc4	88d65386-fb87-449c-9acd-f08e329c4568	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 05:37:35.23	AUTH	{"email": "dilaniw@kln.ac.lk"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
cd27a234-34a8-4315-a4e9-823ffcc6378d	599cb63f-b19a-424c-aad6-7f0d4fa66eb5	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 07:40:10.261	AUTH	{"email": "janakaw@kln.ac.lk"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
84c97a35-6ab8-48e9-ada3-4a70ede06277	IM/2024/116	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 07:46:58.227	AUTH	{"email": "student-im24116@stu.kln.ac.lk"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
3fa9f0a2-7e90-49e5-a34c-536726cd2224	88d65386-fb87-449c-9acd-f08e329c4568	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 07:47:08.895	AUTH	{"email": "dilaniw@kln.ac.lk"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
59577aec-9564-4109-a7d8-2df9b239ba32	88d65386-fb87-449c-9acd-f08e329c4568	SELECTION_ROUND_CREATE	SELECTION_ROUND	c0c56716-03f0-416f-9028-82c52b99c576	\N	\N	2026-04-17 07:48:49.974	STAFF	{"type": "PATHWAY", "label": "26/27 MIT/IT Pathway selection", "level": "L1", "target_program_id": "24bcdfbd-b096-438c-b69e-ad906fbdaf00"}	\N	\N
6c391eac-5f15-4186-a37b-2bd75239cbd3	IM/2024/116	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 07:49:59.791	AUTH	{"email": "student-im24116@stu.kln.ac.lk"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
4f359efe-ed71-4df5-8b7d-eec7ed3dedb5	88d65386-fb87-449c-9acd-f08e329c4568	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 07:50:17.211	AUTH	{"email": "dilaniw@kln.ac.lk"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
f8d8f7fe-d468-438d-b225-2956b35cf0f9	88d65386-fb87-449c-9acd-f08e329c4568	SELECTION_ROUND_STATUS_UPDATE	SELECTION_ROUND	c0c56716-03f0-416f-9028-82c52b99c576	\N	\N	2026-04-17 07:50:48.313	STAFF	{"status": "OPEN", "previousStatus": "DRAFT"}	\N	\N
a4098567-f823-4d8f-8fc6-2dfdb3f44341	IM/2024/116	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 07:50:54.182	AUTH	{"email": "student-im24116@stu.kln.ac.lk"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
2e0ed7f8-791f-4d7f-82ce-85fe5f6174e7	88d65386-fb87-449c-9acd-f08e329c4568	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 07:51:07.028	AUTH	{"email": "dilaniw@kln.ac.lk"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
f34c820e-2b7d-40a5-a8da-58148320e14a	IM/2024/116	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 07:51:37.662	AUTH	{"email": "student-im24116@stu.kln.ac.lk"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
92aa5b71-ff72-48f9-b4c6-a12ea75d95f8	599cb63f-b19a-424c-aad6-7f0d4fa66eb5	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 08:04:05.754	AUTH	{"email": "janakaw@kln.ac.lk"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
2f58d459-7c7d-4a08-8845-a556d1b59fae	88d65386-fb87-449c-9acd-f08e329c4568	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 08:13:58.232	AUTH	{"email": "dilaniw@kln.ac.lk"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
7e0ded99-9c0d-448e-8ebc-065e54cb9733	fdd458a5-efdd-4565-957a-ebbdbcc09e3c	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 08:15:14.814	AUTH	{"email": "admin@sees.com"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
f9c309af-1d32-4b53-980c-1c7cc2b69fb9	599cb63f-b19a-424c-aad6-7f0d4fa66eb5	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 08:24:43.888	AUTH	{"email": "janakaw@kln.ac.lk"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
be277745-214e-466b-a025-de61e0fed481	fdd458a5-efdd-4565-957a-ebbdbcc09e3c	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 14:41:59.199	AUTH	{"email": "admin@sees.com"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
5efee8e2-2a59-4840-b0e7-7439056fbab2	fdd458a5-efdd-4565-957a-ebbdbcc09e3c	ADMIN_ACADEMIC_YEAR_DELETE	ACADEMIC_YEAR	1d41138b-1143-4bd6-a863-5a5627b46d77	\N	\N	2026-04-17 16:38:14.191	ADMIN	\N	\N	\N
8146adf7-5305-432d-a90f-7878fc7fa3a2	fdd458a5-efdd-4565-957a-ebbdbcc09e3c	ADMIN_GRADING_BANDS_SAVE	GRADING_SCHEME	active	\N	\N	2026-04-17 16:50:47.745	ADMIN	{"bandCount": 9}	\N	\N
33f8bf90-6e9f-4460-a6e8-5f3d47705735	fdd458a5-efdd-4565-957a-ebbdbcc09e3c	ADMIN_PROGRAM_INTAKE_UPSERT	PROGRAM_INTAKE	20aa71a7-16c2-4130-910c-f4e4a488d584	\N	\N	2026-04-17 16:54:15.191	ADMIN	{"status": "OPEN", "program_id": "24bcdfbd-b096-438c-b69e-ad906fbdaf00"}	\N	\N
70ba487f-9271-43a4-8d1e-c982159abe6a	IM/2024/116	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 16:54:23.857	AUTH	{"email": "student-im24116@stu.kln.ac.lk"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
3bcbd82e-cfab-48e5-ac62-197b67384861	IM/2024/115	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 16:59:59.063	AUTH	{"email": "student-im24115@stu.kln.ac.lk"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
a9eb4003-a97a-48b4-804b-489a09450154	IM/2024/116	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 17:00:36.976	AUTH	{"email": "student-im24116@stu.kln.ac.lk"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
69bd0264-80ec-4898-ada3-031d5ecd4124	599cb63f-b19a-424c-aad6-7f0d4fa66eb5	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 17:00:55.905	AUTH	{"email": "janakaw@kln.ac.lk"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
62c0c6b4-ef3a-41ef-b261-b923406da91a	599cb63f-b19a-424c-aad6-7f0d4fa66eb5	STAFF_GRADE_BULK_UPLOAD	MODULE	9e882501-05ec-4007-a8cd-fbbb12d0cd3c	\N	\N	2026-04-17 17:02:39.925	STAFF	{"rowCount": 1, "failCount": 0, "successCount": 1}	\N	\N
d8601198-8809-4492-bd49-346b7c0d8973	IM/2024/116	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 17:03:11.568	AUTH	{"email": "student-im24116@stu.kln.ac.lk"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
cf6d4510-4ecf-44f5-ad42-129e50b94a17	599cb63f-b19a-424c-aad6-7f0d4fa66eb5	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 17:11:08.866	AUTH	{"email": "janakaw@kln.ac.lk"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
452deda4-c8ce-48d0-8deb-16c70ae555e1	599cb63f-b19a-424c-aad6-7f0d4fa66eb5	STAFF_GRADES_RELEASE	GRADE	batch	\N	\N	2026-04-17 17:11:22.466	STAFF	{"batchId": 1776445881591, "gradeIds": 1, "releasedCount": 1}	\N	\N
3278eada-956d-4026-aba1-bd04919725f5	599cb63f-b19a-424c-aad6-7f0d4fa66eb5	STAFF_GRADES_RELEASE	GRADE	batch	\N	\N	2026-04-17 17:11:22.602	STAFF	{"batchId": 1776445882596, "gradeIds": 1, "releasedCount": 1}	\N	\N
6c8a722e-9d6d-46e6-a613-84ca3e8ed214	IM/2024/116	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 17:11:33.516	AUTH	{"email": "student-im24116@stu.kln.ac.lk"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
aa8a5361-7356-425f-98da-744cb0705022	fdd458a5-efdd-4565-957a-ebbdbcc09e3c	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 17:11:50.284	AUTH	{"email": "admin@sees.com"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
8cfea6dd-f914-4f35-919f-decdbb150bbb	IM/2024/116	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 17:12:53.665	AUTH	{"email": "student-im24116@stu.kln.ac.lk"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
5ca9abe8-7202-4a7e-9ac6-7d3113bf8ade	fdd458a5-efdd-4565-957a-ebbdbcc09e3c	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 17:58:23.91	AUTH	{"email": "admin@sees.com"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
1380e979-af60-4ef4-8b6d-669da3b3e586	IM/2024/116	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 18:14:37.39	AUTH	{"email": "student-im24116@stu.kln.ac.lk"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
f5b99ad1-594b-4d5b-bbe6-39842464474a	bb8c46fe-88e7-45c0-aedc-11bce0665734	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 20:37:51.28	AUTH	{"email": "keerthiw@kln.ac.lk"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
af82e090-d7da-4ca4-abda-5a8317081aa8	bb8c46fe-88e7-45c0-aedc-11bce0665734	STAFF_GRADE_UPSERT	GRADE	3ed36c9a-b0e9-4ace-a654-d5b1866d2157	\N	\N	2026-04-17 20:39:32.493	STAFF	{"hasMarks": false, "module_id": "76cd81f0-8e51-4dd0-a414-85e33fa09b1d", "letterGrade": "C"}	\N	\N
0de1aea2-37e6-42e8-ae70-c3442117ec0c	bb8c46fe-88e7-45c0-aedc-11bce0665734	STAFF_GRADE_UPSERT	GRADE	3ed36c9a-b0e9-4ace-a654-d5b1866d2157	\N	\N	2026-04-17 20:39:33.424	STAFF	{"hasMarks": false, "module_id": "76cd81f0-8e51-4dd0-a414-85e33fa09b1d", "letterGrade": "C"}	\N	\N
ea41c1c1-fade-4e83-8fd5-e1d8e147544c	bb8c46fe-88e7-45c0-aedc-11bce0665734	STAFF_GRADES_RELEASE	GRADE	batch	\N	\N	2026-04-17 20:43:55.446	STAFF	{"batchId": 1776458634652, "gradeIds": 1, "releasedCount": 1}	\N	\N
b8869c1d-65cc-4e7f-8e6f-a6ec91db4ca0	bb8c46fe-88e7-45c0-aedc-11bce0665734	STAFF_GRADES_RELEASE	GRADE	batch	\N	\N	2026-04-17 20:44:06.7	STAFF	{"batchId": 1776458646689, "gradeIds": 1, "releasedCount": 1}	\N	\N
d24b5342-601a-4af6-92e3-64067d15803b	IM/2024/116	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 20:44:17.581	AUTH	{"email": "student-im24116@stu.kln.ac.lk"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
6b27dc90-f225-4e16-b45c-5c3262cfadb4	IM/2024/114	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-17 21:04:09.966	AUTH	{"email": "student-im24114@stu.kln.ac.lk"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
56e27cad-091f-47bb-9237-4d06669d92e5	fdd458a5-efdd-4565-957a-ebbdbcc09e3c	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-18 02:17:48.348	AUTH	{"email": "admin@sees.com"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
7f756c52-d590-4f50-af91-628c03e8fc86	88d65386-fb87-449c-9acd-f08e329c4568	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-18 02:18:31.452	AUTH	{"email": "dilaniw@kln.ac.lk"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
6430809e-d6eb-4f27-9f29-e2f3b3865362	IM/2024/116	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-18 02:19:08.839	AUTH	{"email": "student-im24116@stu.kln.ac.lk"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
48d78d20-cef4-44ac-a160-c5c78e320e97	88d65386-fb87-449c-9acd-f08e329c4568	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-18 03:29:13.53	AUTH	{"email": "dilaniw@kln.ac.lk"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
9dfd35b9-9b92-4e3a-97d1-6eccd8d74591	IM/2024/116	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-18 04:46:30.573	AUTH	{"email": "student-im24116@stu.kln.ac.lk"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
2666ab82-8319-4c06-8ceb-77e1de4983cd	88d65386-fb87-449c-9acd-f08e329c4568	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-18 05:00:03.796	AUTH	{"email": "dilaniw@kln.ac.lk"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
31545f3b-3bbc-4701-b319-5b5dd7478462	88d65386-fb87-449c-9acd-f08e329c4568	GRADUATION_ELIGIBILITY_PROFILE_UPSERT	GRADUATION_ELIGIBILITY_PROFILE	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	\N	2026-04-18 05:09:19.863	STAFF	{"version": 3}	\N	\N
9c428f2e-54d5-4ad0-86b8-ece8d5275165	88d65386-fb87-449c-9acd-f08e329c4568	GRADUATION_ELIGIBILITY_PROFILE_UPSERT	GRADUATION_ELIGIBILITY_PROFILE	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	\N	2026-04-18 05:09:21.994	STAFF	{"version": 4}	\N	\N
31ecf4d5-767f-487c-bb03-ae43615e5165	88d65386-fb87-449c-9acd-f08e329c4568	GRADUATION_ELIGIBILITY_PROFILE_UPSERT	GRADUATION_ELIGIBILITY_PROFILE	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	2026-04-18 05:15:53.195	STAFF	{"version": 1}	\N	\N
32b016f3-38f8-4669-ab92-565dfff96f4e	88d65386-fb87-449c-9acd-f08e329c4568	GRADUATION_ELIGIBILITY_PROFILE_UPSERT	GRADUATION_ELIGIBILITY_PROFILE	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	2026-04-18 05:15:53.685	STAFF	{"version": 2}	\N	\N
f66b7c59-656c-4702-9d69-5640d813684c	88d65386-fb87-449c-9acd-f08e329c4568	GRADUATION_ELIGIBILITY_PROFILE_UPSERT	GRADUATION_ELIGIBILITY_PROFILE	ca7dfed6-55a9-46c5-bee1-7034852ea30b	\N	\N	2026-04-18 05:15:57.435	STAFF	{"version": 1}	\N	\N
61a3064a-cf76-4731-ac92-966575d2f4ec	88d65386-fb87-449c-9acd-f08e329c4568	GRADUATION_ELIGIBILITY_PROFILE_UPSERT	GRADUATION_ELIGIBILITY_PROFILE	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	2026-04-18 05:16:25.394	STAFF	{"version": 3}	\N	\N
09395194-2feb-4d17-9f96-e92eafac6eed	88d65386-fb87-449c-9acd-f08e329c4568	GRADUATION_ELIGIBILITY_PROFILE_UPSERT	GRADUATION_ELIGIBILITY_PROFILE	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	2026-04-18 05:17:10.809	STAFF	{"version": 4}	\N	\N
da2dcafc-ad7b-4463-b5eb-f9c4ea69c36a	88d65386-fb87-449c-9acd-f08e329c4568	GRADUATION_ELIGIBILITY_PROFILE_UPSERT	GRADUATION_ELIGIBILITY_PROFILE	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	2026-04-18 05:17:11.813	STAFF	{"version": 5}	\N	\N
0e3f08b7-6475-4fa8-b2a1-84d05f94051f	88d65386-fb87-449c-9acd-f08e329c4568	GRADUATION_ELIGIBILITY_PROFILE_UPSERT	GRADUATION_ELIGIBILITY_PROFILE	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	\N	2026-04-18 05:18:09.31	STAFF	{"version": 6}	\N	\N
c95432b3-5663-4bee-913f-29bd86a0ce0f	88d65386-fb87-449c-9acd-f08e329c4568	GRADUATION_ELIGIBILITY_PROFILE_UPSERT	GRADUATION_ELIGIBILITY_PROFILE	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	2026-04-18 05:18:12.401	STAFF	{"version": 6}	\N	\N
b3721f01-d27a-43b5-af14-01f878a194f2	88d65386-fb87-449c-9acd-f08e329c4568	GRADUATION_ELIGIBILITY_PROFILE_UPSERT	GRADUATION_ELIGIBILITY_PROFILE	24bcdfbd-b096-438c-b69e-ad906fbdaf00	\N	\N	2026-04-18 05:34:13.29	STAFF	{"version": 7}	\N	\N
4470214e-249d-405a-95f8-0a23df226a83	88d65386-fb87-449c-9acd-f08e329c4568	GRADUATION_ELIGIBILITY_PROFILE_UPSERT	GRADUATION_ELIGIBILITY_PROFILE	ca7dfed6-55a9-46c5-bee1-7034852ea30b	\N	\N	2026-04-18 05:42:42.094	STAFF	{"version": 2}	\N	\N
db704a18-02d7-4305-9c1d-b7c672c5cc29	IM/2024/116	AUTH_LOGIN_SUCCESS	AUTH	login	\N	\N	2026-04-18 13:36:55.556	AUTH	{"email": "student-im24116@stu.kln.ac.lk"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
\.


--
-- Data for Name: bulk_enrollment_batches; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public.bulk_enrollment_batches (batch_id, uploaded_by, filename, program_id, level, total_records, successful_records, failed_records, status, created_at) FROM stdin;
\.


--
-- Data for Name: bulk_enrollment_records; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public.bulk_enrollment_records (record_id, batch_id, email, role, user_id, status, error_message, email_sent, email_sent_at, email_resend_count, last_email_sent_at, created_at, "firstName", "lastName") FROM stdin;
\.


--
-- Data for Name: calendar_events; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public.calendar_events (id, title, description, "startDate", "endDate", type, "isRecurring", "recurrencePattern", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: feature_flags; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public.feature_flags (id, key, name, description, "isEnabled", "startDate", "endDate", "targetRoles", "createdAt", "updatedAt") FROM stdin;
8ff91f21-0721-4308-ad1d-837df40b3df9	anonymous_reports	Anonymous Reports	Enable anonymous reporting system	t	\N	\N	{student}	2026-04-16 14:53:47.172	2026-04-16 14:53:47.172
\.


--
-- Data for Name: graduation_eligibility_profiles; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public.graduation_eligibility_profiles (profile_id, program_id, rules, version, updated_at, updated_by_staff_id) FROM stdin;
e26179c7-6d8f-44b0-b563-cc815d18abf1	65bd1828-487f-486b-be24-4f7e7c5e5ee2	{"version": 6, "divisions": {"THIRD_PASS": {"label": "Third Class", "conditions": [{"type": "min_gpa", "minGpa": 2.5}]}, "FIRST_CLASS": {"label": "First Class", "conditions": [{"type": "min_gpa", "minGpa": 3.7}, {"type": "all_gpa_modules_min_grade_point", "minGradePoint": 2}, {"type": "min_fraction_credits_at_min_grade_point", "scope": "GPA_MODULES", "fraction": 0.5, "minGradePoint": 4}, {"type": "max_program_years", "maxYears": 4}]}, "SECOND_LOWER": {"label": "Second Class Lower", "conditions": [{"type": "min_gpa", "minGpa": 3}, {"type": "min_credits_at_min_grade_point", "scope": "GPA_MODULES", "minCredits": 117, "minGradePoint": 2}, {"type": "min_fraction_credits_at_min_grade_point", "scope": "GPA_MODULES", "fraction": 0.5, "minGradePoint": 3}, {"type": "max_program_years", "maxYears": 4}]}, "SECOND_UPPER": {"label": "Second Class Upper", "conditions": [{"type": "min_gpa", "minGpa": 3.3}, {"type": "min_credits_at_min_grade_point", "scope": "GPA_MODULES", "minCredits": 117, "minGradePoint": 2}, {"type": "min_fraction_credits_at_min_grade_point", "scope": "GPA_MODULES", "fraction": 0.5, "minGradePoint": 3}, {"type": "max_program_years", "maxYears": 4}]}}, "schemaVersion": 1, "evaluationOrder": ["FIRST_CLASS", "SECOND_UPPER", "SECOND_LOWER", "THIRD_PASS"]}	6	2026-04-18 05:18:09.298	88d65386-fb87-449c-9acd-f08e329c4568
a5cf837f-0d65-4718-9904-f86fd9e80d6f	ca7dfed6-55a9-46c5-bee1-7034852ea30b	{"version": 2, "divisions": {"THIRD_PASS": {"label": "Third Class", "conditions": [{"type": "min_gpa", "minGpa": 2.5}]}, "BASE_DEGREE": {"label": "Degree Eligible", "conditions": [{"type": "min_gpa", "minGpa": 2}, {"type": "min_total_credits_attempted", "scope": "ALL_STRUCTURED", "minCredits": 132, "minGradePoint": 0}]}, "FIRST_CLASS": {"label": "First Class", "conditions": [{"type": "min_gpa", "minGpa": 3.7}, {"type": "all_gpa_modules_min_grade_point", "minGradePoint": 2}, {"type": "min_fraction_credits_at_min_grade_point", "scope": "GPA_MODULES", "fraction": 0.5, "minGradePoint": 4}, {"type": "max_program_years", "maxYears": 4}]}, "SECOND_LOWER": {"label": "Second Class Lower", "conditions": [{"type": "min_gpa", "minGpa": 3}, {"type": "min_credits_at_min_grade_point", "scope": "GPA_MODULES", "minCredits": 117, "minGradePoint": 2}, {"type": "min_fraction_credits_at_min_grade_point", "scope": "GPA_MODULES", "fraction": 0.5, "minGradePoint": 3}, {"type": "max_program_years", "maxYears": 4}]}, "SECOND_UPPER": {"label": "Second Class Upper", "conditions": [{"type": "min_gpa", "minGpa": 3.3}, {"type": "min_credits_at_min_grade_point", "scope": "GPA_MODULES", "minCredits": 117, "minGradePoint": 2}, {"type": "min_fraction_credits_at_min_grade_point", "scope": "GPA_MODULES", "fraction": 0.5, "minGradePoint": 3}, {"type": "max_program_years", "maxYears": 4}]}}, "schemaVersion": 1, "evaluationOrder": ["FIRST_CLASS", "SECOND_UPPER", "SECOND_LOWER", "THIRD_PASS", "BASE_DEGREE"]}	2	2026-04-18 05:42:42.078	88d65386-fb87-449c-9acd-f08e329c4568
0cb941f1-14e0-4abf-936f-33ee445831aa	24bcdfbd-b096-438c-b69e-ad906fbdaf00	{"version": 7, "divisions": {"THIRD_PASS": {"label": "Third Class", "conditions": [{"type": "min_gpa", "minGpa": 2.5}]}, "BASE_DEGREE": {"label": "Degree Eligible", "conditions": [{"type": "min_gpa", "minGpa": 2}]}, "FIRST_CLASS": {"label": "First Class", "conditions": [{"type": "min_gpa", "minGpa": 3.7}]}, "SECOND_LOWER": {"label": "Second Class Lower", "conditions": [{"type": "min_gpa", "minGpa": 3}]}, "SECOND_UPPER": {"label": "Second Class Upper", "conditions": [{"type": "min_gpa", "minGpa": 3.3}]}}, "schemaVersion": 1, "evaluationOrder": ["FIRST_CLASS", "SECOND_UPPER", "SECOND_LOWER", "THIRD_PASS", "BASE_DEGREE"]}	7	2026-04-18 05:34:13.25	88d65386-fb87-449c-9acd-f08e329c4568
\.


--
-- Data for Name: module_registration_rounds; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public.module_registration_rounds (round_id, academic_year_id, label, status, opens_at, closes_at, levels, notes, student_message, features, finalized_at, created_at, updated_at) FROM stdin;
3903bc97-9fbc-4d1a-949a-7d04d17ffe52	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	25/26	OPEN	2026-04-17 05:36:00	2026-04-24 05:36:00	{L1,L2,L3,L4}	\N	\N	\N	\N	2026-04-17 05:36:15.934	2026-04-17 05:36:18.234
\.


--
-- Data for Name: notification_dispatch_logs; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public.notification_dispatch_logs (log_id, dedupe_key, event_key, recipient_email, recipient_user_id, entity_type, entity_id, status, error_message, created_at) FROM stdin;
cmo2h6kr00000fj965l4td06y	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:STU001:1776404178243	MODULE_REGISTRATION_OPENED	bandara-im22053@stu.kln.ac.lk	STU001	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:18.828
cmo2h6kxk0001fj96ujutdmvx	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:16f172bf-5f54-46f0-aa41-a0a1de2b8f4b:1776404178243	MODULE_REGISTRATION_OPENED	student@sees.com	16f172bf-5f54-46f0-aa41-a0a1de2b8f4b	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:19.064
cmo2h6l3i0002fj966tazukfl	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/110:1776404178243	MODULE_REGISTRATION_OPENED	student-im24110@stu.kln.ac.lk	IM/2024/110	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:19.277
cmo2h6la60003fj96xooxlqqe	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/022:1776404178243	MODULE_REGISTRATION_OPENED	student-im24022@stu.kln.ac.lk	IM/2024/022	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:19.518
cmo2h6lgm0004fj96f1bgmxab	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/111:1776404178243	MODULE_REGISTRATION_OPENED	student-im24111@stu.kln.ac.lk	IM/2024/111	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:19.75
cmo2h6ln80005fj961mzujju4	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/112:1776404178243	MODULE_REGISTRATION_OPENED	student-im24112@stu.kln.ac.lk	IM/2024/112	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:19.988
cmo2h6ltr0006fj96ocio8m2l	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/069:1776404178243	MODULE_REGISTRATION_OPENED	student-im24069@stu.kln.ac.lk	IM/2024/069	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:20.223
cmo2h6m040007fj96745maqit	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/070:1776404178243	MODULE_REGISTRATION_OPENED	student-im24070@stu.kln.ac.lk	IM/2024/070	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:20.452
cmo2h6m6w0008fj96qrfsgdlp	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/071:1776404178243	MODULE_REGISTRATION_OPENED	student-im24071@stu.kln.ac.lk	IM/2024/071	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:20.696
cmo2h6mdl0009fj96g86n9w66	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/072:1776404178243	MODULE_REGISTRATION_OPENED	student-im24072@stu.kln.ac.lk	IM/2024/072	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:20.937
cmo2h6mjs000afj960az8fnad	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/073:1776404178243	MODULE_REGISTRATION_OPENED	student-im24073@stu.kln.ac.lk	IM/2024/073	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:21.16
cmo2h6mq6000bfj96o81ofxji	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/074:1776404178243	MODULE_REGISTRATION_OPENED	student-im24074@stu.kln.ac.lk	IM/2024/074	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:21.39
cmo2h6mxn000cfj96y996hrvj	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/075:1776404178243	MODULE_REGISTRATION_OPENED	student-im24075@stu.kln.ac.lk	IM/2024/075	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:21.659
cmo2h6n45000dfj967turs34y	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/076:1776404178243	MODULE_REGISTRATION_OPENED	student-im24076@stu.kln.ac.lk	IM/2024/076	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:21.893
cmo2h6naz000efj96n22l2uqv	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/077:1776404178243	MODULE_REGISTRATION_OPENED	student-im24077@stu.kln.ac.lk	IM/2024/077	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:22.139
cmo2h6nhd000ffj966d0ay6j8	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/078:1776404178243	MODULE_REGISTRATION_OPENED	student-im24078@stu.kln.ac.lk	IM/2024/078	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:22.369
cmo2h6noj000gfj96yolbh0yj	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/079:1776404178243	MODULE_REGISTRATION_OPENED	student-im24079@stu.kln.ac.lk	IM/2024/079	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:22.627
cmo2h6nvn000hfj96uv7b7ksb	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/080:1776404178243	MODULE_REGISTRATION_OPENED	student-im24080@stu.kln.ac.lk	IM/2024/080	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:22.883
cmo2h6o2c000ifj96vaj1ae7r	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/081:1776404178243	MODULE_REGISTRATION_OPENED	student-im24081@stu.kln.ac.lk	IM/2024/081	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:23.124
cmo2h6o9h000jfj96uzyp26xr	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/082:1776404178243	MODULE_REGISTRATION_OPENED	student-im24082@stu.kln.ac.lk	IM/2024/082	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:23.38
cmo2h6oft000kfj96fjyr6z07	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/083:1776404178243	MODULE_REGISTRATION_OPENED	student-im24083@stu.kln.ac.lk	IM/2024/083	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:23.609
cmo2h6oms000lfj96k25voavf	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/023:1776404178243	MODULE_REGISTRATION_OPENED	student-im24023@stu.kln.ac.lk	IM/2024/023	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:23.86
cmo2h6osw000mfj969swcqnks	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/024:1776404178243	MODULE_REGISTRATION_OPENED	student-im24024@stu.kln.ac.lk	IM/2024/024	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:24.08
cmo2h6oyz000nfj96adx0jj2a	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/040:1776404178243	MODULE_REGISTRATION_OPENED	student-im24040@stu.kln.ac.lk	IM/2024/040	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:24.299
cmo2h6p4w000ofj96mpon584o	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/041:1776404178243	MODULE_REGISTRATION_OPENED	student-im24041@stu.kln.ac.lk	IM/2024/041	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:24.512
cmo2h6pb5000pfj96yj53jdio	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/042:1776404178243	MODULE_REGISTRATION_OPENED	student-im24042@stu.kln.ac.lk	IM/2024/042	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:24.737
cmo2h6ph3000qfj96br6awhhh	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/043:1776404178243	MODULE_REGISTRATION_OPENED	student-im24043@stu.kln.ac.lk	IM/2024/043	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:24.951
cmo2h6pn8000rfj96dirtb9je	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/044:1776404178243	MODULE_REGISTRATION_OPENED	student-im24044@stu.kln.ac.lk	IM/2024/044	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:25.172
cmo2h6pu4000sfj96aa7wqacj	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/045:1776404178243	MODULE_REGISTRATION_OPENED	student-im24045@stu.kln.ac.lk	IM/2024/045	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:25.42
cmo2h6q16000tfj962akojy81	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/046:1776404178243	MODULE_REGISTRATION_OPENED	student-im24046@stu.kln.ac.lk	IM/2024/046	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:25.674
cmo2h6q96000ufj96n2kkqydr	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/047:1776404178243	MODULE_REGISTRATION_OPENED	student-im24047@stu.kln.ac.lk	IM/2024/047	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:25.962
cmo2h6qfx000vfj968lkdv717	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/048:1776404178243	MODULE_REGISTRATION_OPENED	student-im24048@stu.kln.ac.lk	IM/2024/048	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:26.205
cmo2h6qn6000wfj9604w9qf98	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/049:1776404178243	MODULE_REGISTRATION_OPENED	student-im24049@stu.kln.ac.lk	IM/2024/049	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:26.466
cmo2h6qtm000xfj9620c1lddp	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/050:1776404178243	MODULE_REGISTRATION_OPENED	student-im24050@stu.kln.ac.lk	IM/2024/050	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:26.698
cmo2h6r0j000yfj967c4j3l25	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/051:1776404178243	MODULE_REGISTRATION_OPENED	student-im24051@stu.kln.ac.lk	IM/2024/051	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:26.947
cmo2h6r74000zfj96gjp2p49s	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/052:1776404178243	MODULE_REGISTRATION_OPENED	student-im24052@stu.kln.ac.lk	IM/2024/052	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:27.184
cmo2h6rd40010fj96lr5ob3we	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/053:1776404178243	MODULE_REGISTRATION_OPENED	student-im24053@stu.kln.ac.lk	IM/2024/053	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:27.4
cmo2h6rjk0011fj96m428d8w4	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/054:1776404178243	MODULE_REGISTRATION_OPENED	student-im24054@stu.kln.ac.lk	IM/2024/054	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:27.632
cmo2h6rpl0012fj96lokar8a6	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/055:1776404178243	MODULE_REGISTRATION_OPENED	student-im24055@stu.kln.ac.lk	IM/2024/055	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:27.849
cmo2h6rvm0013fj96fqz6kr2h	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/056:1776404178243	MODULE_REGISTRATION_OPENED	student-im24056@stu.kln.ac.lk	IM/2024/056	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:28.066
cmo2h6s1m0014fj96yej9g6g7	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/057:1776404178243	MODULE_REGISTRATION_OPENED	student-im24057@stu.kln.ac.lk	IM/2024/057	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:28.282
cmo2h6s7q0015fj96bk64r7j3	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/058:1776404178243	MODULE_REGISTRATION_OPENED	student-im24058@stu.kln.ac.lk	IM/2024/058	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:28.502
cmo2h6sdx0016fj964jou64w4	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/059:1776404178243	MODULE_REGISTRATION_OPENED	student-im24059@stu.kln.ac.lk	IM/2024/059	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:28.725
cmo2h6sjz0017fj96wih72bny	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/060:1776404178243	MODULE_REGISTRATION_OPENED	student-im24060@stu.kln.ac.lk	IM/2024/060	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:28.943
cmo2h6sr90018fj96ab06qth8	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/061:1776404178243	MODULE_REGISTRATION_OPENED	student-im24061@stu.kln.ac.lk	IM/2024/061	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:29.205
cmo2h6t3e0019fj96mp02nnbl	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/062:1776404178243	MODULE_REGISTRATION_OPENED	student-im24062@stu.kln.ac.lk	IM/2024/062	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:29.642
cmo2h6t9q001afj96y26v5in0	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/063:1776404178243	MODULE_REGISTRATION_OPENED	student-im24063@stu.kln.ac.lk	IM/2024/063	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:29.87
cmo2h6tg0001bfj96l0ic66kw	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/064:1776404178243	MODULE_REGISTRATION_OPENED	student-im24064@stu.kln.ac.lk	IM/2024/064	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:30.096
cmo2h6tlx001cfj96gyqlq7xf	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/065:1776404178243	MODULE_REGISTRATION_OPENED	student-im24065@stu.kln.ac.lk	IM/2024/065	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:30.309
cmo2h6trh001dfj96wwt4saxj	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/066:1776404178243	MODULE_REGISTRATION_OPENED	student-im24066@stu.kln.ac.lk	IM/2024/066	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:30.509
cmo2h6txh001efj96elgvrtg6	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/067:1776404178243	MODULE_REGISTRATION_OPENED	student-im24067@stu.kln.ac.lk	IM/2024/067	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:30.725
cmo2h6u42001ffj963mys22cp	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/068:1776404178243	MODULE_REGISTRATION_OPENED	student-im24068@stu.kln.ac.lk	IM/2024/068	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:30.962
cmo2h6ua2001gfj9663fpm5au	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/084:1776404178243	MODULE_REGISTRATION_OPENED	student-im24084@stu.kln.ac.lk	IM/2024/084	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:31.178
cmo2h6ugo001hfj9657oxbiqw	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/116:1776404178243	MODULE_REGISTRATION_OPENED	student-im24116@stu.kln.ac.lk	IM/2024/116	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:31.416
cmo2h6un6001ifj96611yosdi	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/113:1776404178243	MODULE_REGISTRATION_OPENED	student-im24113@stu.kln.ac.lk	IM/2024/113	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:31.65
cmo2h6utq001jfj96s1smtk7y	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/114:1776404178243	MODULE_REGISTRATION_OPENED	student-im24114@stu.kln.ac.lk	IM/2024/114	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:31.886
cmo2h6uzv001kfj96ugelz2zp	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/115:1776404178243	MODULE_REGISTRATION_OPENED	student-im24115@stu.kln.ac.lk	IM/2024/115	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:32.107
cmo2h6v5k001lfj96m4qgm1d6	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/011:1776404178243	MODULE_REGISTRATION_OPENED	student-im24011@stu.kln.ac.lk	IM/2024/011	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:32.312
cmo2h6vbf001mfj96f2asi8ta	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/012:1776404178243	MODULE_REGISTRATION_OPENED	student-im24012@stu.kln.ac.lk	IM/2024/012	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:32.523
cmo2h6vi4001nfj96vxc7u9wo	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/013:1776404178243	MODULE_REGISTRATION_OPENED	student-im24013@stu.kln.ac.lk	IM/2024/013	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:32.764
cmo2h6vox001ofj96kso2c3s2	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/014:1776404178243	MODULE_REGISTRATION_OPENED	student-im24014@stu.kln.ac.lk	IM/2024/014	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:33.009
cmo2h6vvm001pfj962osautkm	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/015:1776404178243	MODULE_REGISTRATION_OPENED	student-im24015@stu.kln.ac.lk	IM/2024/015	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:33.25
cmo2h6w2b001qfj96t2phvg77	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/016:1776404178243	MODULE_REGISTRATION_OPENED	student-im24016@stu.kln.ac.lk	IM/2024/016	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:33.491
cmo2h6w9q001rfj96t6onueja	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/017:1776404178243	MODULE_REGISTRATION_OPENED	student-im24017@stu.kln.ac.lk	IM/2024/017	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:33.758
cmo2h6wgj001sfj96nmhuhch2	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/018:1776404178243	MODULE_REGISTRATION_OPENED	student-im24018@stu.kln.ac.lk	IM/2024/018	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:34.003
cmo2h6wmv001tfj96gv6pugcm	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/019:1776404178243	MODULE_REGISTRATION_OPENED	student-im24019@stu.kln.ac.lk	IM/2024/019	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:34.231
cmo2h6wtx001ufj96337h22c7	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/020:1776404178243	MODULE_REGISTRATION_OPENED	student-im24020@stu.kln.ac.lk	IM/2024/020	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:34.485
cmo2h6x0n001vfj962yqh4miq	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/021:1776404178243	MODULE_REGISTRATION_OPENED	student-im24021@stu.kln.ac.lk	IM/2024/021	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:34.727
cmo2h6x6z001wfj96pyo3x7t8	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/025:1776404178243	MODULE_REGISTRATION_OPENED	student-im24025@stu.kln.ac.lk	IM/2024/025	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:34.955
cmo2h6xdq001xfj96jok9s2jj	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/085:1776404178243	MODULE_REGISTRATION_OPENED	student-im24085@stu.kln.ac.lk	IM/2024/085	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:35.198
cmo2h6xkq001yfj96udyn6cj5	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/086:1776404178243	MODULE_REGISTRATION_OPENED	student-im24086@stu.kln.ac.lk	IM/2024/086	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:35.45
cmo2h6xrr001zfj96r08xgnia	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/087:1776404178243	MODULE_REGISTRATION_OPENED	student-im24087@stu.kln.ac.lk	IM/2024/087	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:35.703
cmo2h6xys0020fj967ems92p6	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/106:1776404178243	MODULE_REGISTRATION_OPENED	student-im24106@stu.kln.ac.lk	IM/2024/106	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:35.955
cmo2h6y5a0021fj96qmx969oo	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/107:1776404178243	MODULE_REGISTRATION_OPENED	student-im24107@stu.kln.ac.lk	IM/2024/107	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:36.19
cmo2h6ybw0022fj962gpxvsn3	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/001:1776404178243	MODULE_REGISTRATION_OPENED	student-im24001@stu.kln.ac.lk	IM/2024/001	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:36.427
cmo2h6yie0023fj96ji9e6753	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/002:1776404178243	MODULE_REGISTRATION_OPENED	student-im24002@stu.kln.ac.lk	IM/2024/002	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:36.662
cmo2h6yor0024fj96qc9elasg	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/003:1776404178243	MODULE_REGISTRATION_OPENED	student-im24003@stu.kln.ac.lk	IM/2024/003	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:36.89
cmo2h6yux0025fj96hdycxure	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/004:1776404178243	MODULE_REGISTRATION_OPENED	student-im24004@stu.kln.ac.lk	IM/2024/004	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:37.113
cmo2h6z1c0026fj96oxbiatnp	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/005:1776404178243	MODULE_REGISTRATION_OPENED	student-im24005@stu.kln.ac.lk	IM/2024/005	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:37.344
cmo2h6z7l0027fj96aesxtxbf	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/006:1776404178243	MODULE_REGISTRATION_OPENED	student-im24006@stu.kln.ac.lk	IM/2024/006	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:37.569
cmo2h6ze10028fj96unt8ff7u	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/007:1776404178243	MODULE_REGISTRATION_OPENED	student-im24007@stu.kln.ac.lk	IM/2024/007	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:37.801
cmo2h6zka0029fj967vomkh9a	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/008:1776404178243	MODULE_REGISTRATION_OPENED	student-im24008@stu.kln.ac.lk	IM/2024/008	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:38.026
cmo2h6zqv002afj96wmbjqd9m	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/009:1776404178243	MODULE_REGISTRATION_OPENED	student-im24009@stu.kln.ac.lk	IM/2024/009	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:38.263
cmo2h6zxt002bfj96f2mp885u	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/010:1776404178243	MODULE_REGISTRATION_OPENED	student-im24010@stu.kln.ac.lk	IM/2024/010	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:38.513
cmo2h7061002cfj96mrwnhue1	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/108:1776404178243	MODULE_REGISTRATION_OPENED	student-im24108@stu.kln.ac.lk	IM/2024/108	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:38.809
cmo2h70bv002dfj961q14m5bb	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/109:1776404178243	MODULE_REGISTRATION_OPENED	student-im24109@stu.kln.ac.lk	IM/2024/109	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:39.019
cmo2h70ij002efj96uqrb1g2f	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/026:1776404178243	MODULE_REGISTRATION_OPENED	student-im24026@stu.kln.ac.lk	IM/2024/026	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:39.259
cmo2h70pj002ffj96v0xk3avh	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/027:1776404178243	MODULE_REGISTRATION_OPENED	student-im24027@stu.kln.ac.lk	IM/2024/027	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:39.511
cmo2h70w8002gfj96ava6s5cy	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/028:1776404178243	MODULE_REGISTRATION_OPENED	student-im24028@stu.kln.ac.lk	IM/2024/028	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:39.752
cmo2h712m002hfj96caz7o4z4	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/029:1776404178243	MODULE_REGISTRATION_OPENED	student-im24029@stu.kln.ac.lk	IM/2024/029	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:39.982
cmo2h7190002ifj96ozy8hjt6	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/030:1776404178243	MODULE_REGISTRATION_OPENED	student-im24030@stu.kln.ac.lk	IM/2024/030	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:40.212
cmo2h71gf002jfj966e4s616z	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/031:1776404178243	MODULE_REGISTRATION_OPENED	student-im24031@stu.kln.ac.lk	IM/2024/031	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:40.479
cmo2h71mb002kfj963e1pil4h	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/032:1776404178243	MODULE_REGISTRATION_OPENED	student-im24032@stu.kln.ac.lk	IM/2024/032	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:40.691
cmo2h71sn002lfj96dflinoe0	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/033:1776404178243	MODULE_REGISTRATION_OPENED	student-im24033@stu.kln.ac.lk	IM/2024/033	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:40.919
cmo2h71zh002mfj96ow8wh5eg	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/034:1776404178243	MODULE_REGISTRATION_OPENED	student-im24034@stu.kln.ac.lk	IM/2024/034	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:41.165
cmo2h726y002nfj96uqug9tiw	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/035:1776404178243	MODULE_REGISTRATION_OPENED	student-im24035@stu.kln.ac.lk	IM/2024/035	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:41.434
cmo2h72ds002ofj96zxmkagf4	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/036:1776404178243	MODULE_REGISTRATION_OPENED	student-im24036@stu.kln.ac.lk	IM/2024/036	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:41.68
cmo2h72jx002pfj960jx2m6tt	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/037:1776404178243	MODULE_REGISTRATION_OPENED	student-im24037@stu.kln.ac.lk	IM/2024/037	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:41.901
cmo2h72qd002qfj96r4se6q13	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/038:1776404178243	MODULE_REGISTRATION_OPENED	student-im24038@stu.kln.ac.lk	IM/2024/038	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:42.133
cmo2h72w6002rfj967905t4us	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/039:1776404178243	MODULE_REGISTRATION_OPENED	student-im24039@stu.kln.ac.lk	IM/2024/039	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:42.342
cmo2h732g002sfj96r27mu5c0	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/088:1776404178243	MODULE_REGISTRATION_OPENED	student-im24088@stu.kln.ac.lk	IM/2024/088	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:42.568
cmo2h738u002tfj965ml9jf93	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/089:1776404178243	MODULE_REGISTRATION_OPENED	student-im24089@stu.kln.ac.lk	IM/2024/089	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:42.798
cmo2h73f2002ufj96wlix1y3f	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/090:1776404178243	MODULE_REGISTRATION_OPENED	student-im24090@stu.kln.ac.lk	IM/2024/090	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:43.022
cmo2h73lb002vfj96q8a27wkh	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/091:1776404178243	MODULE_REGISTRATION_OPENED	student-im24091@stu.kln.ac.lk	IM/2024/091	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:43.247
cmo2h73ru002wfj96owlp8w4c	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/092:1776404178243	MODULE_REGISTRATION_OPENED	student-im24092@stu.kln.ac.lk	IM/2024/092	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:43.481
cmo2h73ya002xfj96lekbunpd	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/093:1776404178243	MODULE_REGISTRATION_OPENED	student-im24093@stu.kln.ac.lk	IM/2024/093	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:43.714
cmo2h744t002yfj96wpi8qh8e	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/094:1776404178243	MODULE_REGISTRATION_OPENED	student-im24094@stu.kln.ac.lk	IM/2024/094	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:43.949
cmo2h74ba002zfj967xcohe23	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/095:1776404178243	MODULE_REGISTRATION_OPENED	student-im24095@stu.kln.ac.lk	IM/2024/095	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:44.182
cmo2h74hf0030fj965i7qrkvt	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/096:1776404178243	MODULE_REGISTRATION_OPENED	student-im24096@stu.kln.ac.lk	IM/2024/096	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:44.403
cmo2h74nl0031fj967zbt51vc	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/097:1776404178243	MODULE_REGISTRATION_OPENED	student-im24097@stu.kln.ac.lk	IM/2024/097	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:44.625
cmo2h74ub0032fj966p9c53qb	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/098:1776404178243	MODULE_REGISTRATION_OPENED	student-im24098@stu.kln.ac.lk	IM/2024/098	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:44.867
cmo2h750r0033fj96lb6x11kk	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/099:1776404178243	MODULE_REGISTRATION_OPENED	student-im24099@stu.kln.ac.lk	IM/2024/099	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:45.099
cmo2h756i0034fj96avrsfvpw	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/100:1776404178243	MODULE_REGISTRATION_OPENED	student-im24100@stu.kln.ac.lk	IM/2024/100	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:45.306
cmo2h75ck0035fj96i5almos7	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/101:1776404178243	MODULE_REGISTRATION_OPENED	student-im24101@stu.kln.ac.lk	IM/2024/101	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:45.524
cmo2h75in0036fj9698ptqhoi	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/102:1776404178243	MODULE_REGISTRATION_OPENED	student-im24102@stu.kln.ac.lk	IM/2024/102	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:45.742
cmo2h75ox0037fj9675lp6aga	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/103:1776404178243	MODULE_REGISTRATION_OPENED	student-im24103@stu.kln.ac.lk	IM/2024/103	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:45.969
cmo2h75v80038fj964qxnduyy	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/104:1776404178243	MODULE_REGISTRATION_OPENED	student-im24104@stu.kln.ac.lk	IM/2024/104	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:46.196
cmo2h761g0039fj96hf7boe14	MODULE_REGISTRATION_OPENED:3903bc97-9fbc-4d1a-949a-7d04d17ffe52:IM/2024/105:1776404178243	MODULE_REGISTRATION_OPENED	student-im24105@stu.kln.ac.lk	IM/2024/105	module_registration_round	3903bc97-9fbc-4d1a-949a-7d04d17ffe52	SENT	\N	2026-04-17 05:36:46.42
cmo360fab0000fj96iscvcezw	GRADE_RELEASED:IM/2024/116:9e882501-05ec-4007-a8cd-fbbb12d0cd3c	GRADE_RELEASED	student-im24116@stu.kln.ac.lk	IM/2024/116	grade	ddbbc53d-51af-4d39-96fe-38e15e457888	SENT	\N	2026-04-17 17:11:22.211
cmo360fh50001fj96wfqqhd91	ACADEMIC_STANDING_CHANGED:IM/2024/116:1776445881591	ACADEMIC_STANDING_CHANGED	student-im24116@stu.kln.ac.lk	IM/2024/116	academic_standing	1776445881591	SENT	\N	2026-04-17 17:11:22.457
cmo3dlrk30000mp969rhgcokl	GRADE_RELEASED:IM/2024/116:76cd81f0-8e51-4dd0-a414-85e33fa09b1d	GRADE_RELEASED	student-im24116@stu.kln.ac.lk	IM/2024/116	grade	42843300-4aad-4981-8ea5-e30d28994a55	SENT	\N	2026-04-17 20:43:55.203
cmo3dlrqm0001mp96n4c3g9i0	ACADEMIC_STANDING_CHANGED:IM/2024/116:1776458634652	ACADEMIC_STANDING_CHANGED	student-im24116@stu.kln.ac.lk	IM/2024/116	academic_standing	1776458634652	SENT	\N	2026-04-17 20:43:55.438
\.


--
-- Data for Name: notification_email_templates; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public.notification_email_templates (template_id, name, event_key, subject, body, placeholders, is_active, channel, created_at, updated_at) FROM stdin;
67cdfa49-9e17-4968-bc63-00119cab6ff2	Grade released	GRADE_RELEASED	Your grades for {{moduleName}} are now available	Dear {{studentName}},\n\nYour grades for {{moduleCode}} — {{moduleName}} have been released. Letter grade: {{letterGrade}}.\n\nLog in to SEES to view details.\n\n— Academic Team	["{{studentName}}", "{{moduleName}}", "{{moduleCode}}", "{{letterGrade}}"]	t	email	2026-04-17 03:13:51.59	2026-04-17 03:13:51.59
bf7e3633-61ae-4f3c-891b-8babc0cae40c	Academic level changed	ACADEMIC_CLASS_CHANGED	Your academic level has been updated	Dear {{studentName}},\n\nYour academic level has changed from {{previousLevel}} to {{newLevel}}.\n\nIf you have questions, contact your advisor.\n\n— Academic Team	["{{studentName}}", "{{previousLevel}}", "{{newLevel}}"]	t	email	2026-04-17 03:13:51.593	2026-04-17 03:13:51.593
a52bec9a-69ae-42e5-920b-029f16ce307b	Academic standing changed (GPA)	ACADEMIC_STANDING_CHANGED	Your academic standing has been updated	Dear {{studentName}},\n\nFollowing newly released grades, your cumulative GPA is now {{currentGpa}} and your academic standing is {{newAcademicStanding}} (previously {{previousAcademicStanding}}).\n\n— Academic Team	["{{studentName}}", "{{previousAcademicStanding}}", "{{newAcademicStanding}}", "{{currentGpa}}"]	t	email	2026-04-17 03:13:51.595	2026-04-17 03:13:51.595
81131c36-f88e-4dcf-a692-6c058e00f380	Welcome — new student account	ENROLLMENT_WELCOME	Welcome to SEES — your account details	Hello {{firstName}},\n\nYour account has been created.\n\nUsername: {{username}}\nTemporary password: {{tempPassword}}\n\nPlease log in at {{loginUrl}} and change your password.\n\n— SEES	["{{firstName}}", "{{username}}", "{{tempPassword}}", "{{loginUrl}}"]	t	email	2026-04-17 03:13:51.598	2026-04-17 03:13:51.598
2fd77b8d-ee5f-4441-9fc2-24a56b26f074	Deadline reminder	DEADLINE_REMINDER	Reminder: {{deadlineTitle}} closes {{deadlineDate}}	Dear {{studentName}},\n\nThis is a reminder about: {{deadlineTitle}}.\n\nClosing: {{deadlineDate}}.\n\n{{extraMessage}}\n\n— SEES	["{{studentName}}", "{{deadlineTitle}}", "{{deadlineDate}}", "{{extraMessage}}"]	t	email	2026-04-17 03:13:51.6	2026-04-17 03:13:51.6
329c17b3-ecce-4194-b317-e55f61343163	Module registration window opened	MODULE_REGISTRATION_OPENED	Module registration is open: {{windowLabel}}	Dear {{studentName}},\n\nThe module registration window "{{windowLabel}}" is now open. Please complete any changes before {{closesAt}}.\n\n{{extraMessage}}\n\n— SEES	["{{studentName}}", "{{windowLabel}}", "{{closesAt}}", "{{extraMessage}}"]	t	email	2026-04-17 03:13:51.603	2026-04-17 03:13:51.603
5c032221-0611-4aed-900d-1c403be6831d	Pathway selection opened	PATHWAY_SELECTION_OPENED	Pathway selection is open: {{windowLabel}}	Dear {{studentName}},\n\nPathway selection "{{windowLabel}}" for {{level}} is now open. Submit your preferences before {{closesAt}}.\n\n{{extraMessage}}\n\n— Academic Team	["{{studentName}}", "{{windowLabel}}", "{{level}}", "{{closesAt}}", "{{extraMessage}}"]	t	email	2026-04-17 03:13:51.605	2026-04-17 03:13:51.605
9e0e241e-e4c6-4612-9e25-eb2587f1f8d3	Specialization selection opened	SPECIALIZATION_SELECTION_OPENED	Specialization selection is open: {{windowLabel}}	Dear {{studentName}},\n\nSpecialization selection "{{windowLabel}}" for {{level}} is now open. Submit your preferences before {{closesAt}}.\n\n{{extraMessage}}\n\n— Academic Team	["{{studentName}}", "{{windowLabel}}", "{{level}}", "{{closesAt}}", "{{extraMessage}}"]	t	email	2026-04-17 03:13:51.608	2026-04-17 03:13:51.608
440025c6-277c-4af2-85e7-a800b48dc529	Pathway / allocation outcome	PATHWAY_ALLOCATED	Your pathway allocation update	Dear {{studentName}},\n\nYour academic pathway allocation has been updated.\n\nOutcome: {{outcome}}\n\n— Academic Team	["{{studentName}}", "{{outcome}}"]	t	email	2026-04-17 03:13:51.61	2026-04-17 03:13:51.61
f39d31a0-ec5d-482b-9168-590ac4fd310d	System alert	SYSTEM_ALERT	{{alertTitle}}	{{alertBody}}	["{{alertTitle}}", "{{alertBody}}"]	t	email	2026-04-17 03:13:51.613	2026-04-17 03:13:51.613
\.


--
-- Data for Name: notification_trigger_configs; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public.notification_trigger_configs (config_id, event_key, enabled, config_json, updated_at) FROM stdin;
10858795-7d41-4fbc-ba9a-82255f6f5de2	GRADE_RELEASED	t	\N	2026-04-17 03:13:51.567
f2c2f475-e872-42ba-ab01-c7fb4f24d160	ACADEMIC_CLASS_CHANGED	t	\N	2026-04-17 03:13:51.57
09f02f25-8af2-460d-90fb-95f0a962c934	ACADEMIC_STANDING_CHANGED	t	\N	2026-04-17 03:13:51.571
407c5fa1-3ca4-4bae-9275-66a55bd78fbb	ENROLLMENT_WELCOME	t	\N	2026-04-17 03:13:51.573
415131a2-b8fa-4e39-b7e2-5fbab67eb43b	DEADLINE_REMINDER	t	{"daysBeforeClose": [1, 3]}	2026-04-17 03:13:51.575
75f3392f-f606-4d30-9a70-8d0b64025811	MODULE_REGISTRATION_OPENED	t	\N	2026-04-17 03:13:51.578
f87f271f-6698-4d25-91b3-74e70688d81f	PATHWAY_SELECTION_OPENED	t	\N	2026-04-17 03:13:51.581
493f0773-cae5-4356-a227-9ee263406b2b	SPECIALIZATION_SELECTION_OPENED	t	\N	2026-04-17 03:13:51.583
ec0bcf76-e72d-4560-adc1-6c457319d69f	PATHWAY_ALLOCATED	t	\N	2026-04-17 03:13:51.585
fa5224dd-9f4b-4b83-85a6-ac906bbc54db	SYSTEM_ALERT	t	\N	2026-04-17 03:13:51.587
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public.password_reset_tokens (id, user_id, token, expires_at, created_at, used, used_at) FROM stdin;
\.


--
-- Data for Name: registration_tokens; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public.registration_tokens (id, user_id, token, expires_at, created_at, used, used_at) FROM stdin;
\.


--
-- Data for Name: selection_allocation_change_requests; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public.selection_allocation_change_requests (request_id, round_id, student_id, requested_preference_1, requested_preference_2, reason, status, created_at, resolved_at, resolved_by_user_id) FROM stdin;
\.


--
-- Data for Name: selection_applications; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public.selection_applications (app_id, round_id, student_id, preference_1, preference_2, status, allocated_to, waitlist_pos, gpa_at_time, applied_at, updated_at) FROM stdin;
f91668ec-ec3b-473d-ac35-d7c0987deed2	c0c56716-03f0-416f-9028-82c52b99c576	IM/2024/116	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	PENDING	\N	\N	3.76	2026-04-17 16:56:51.297	2026-04-17 16:56:51.297
\.


--
-- Data for Name: selection_round_configs; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public.selection_round_configs (config_id, round_id, program_id, spec_id, capacity, priority) FROM stdin;
e81f604e-ef65-48a0-bb26-e7107e8f4bc1	c0c56716-03f0-416f-9028-82c52b99c576	ca7dfed6-55a9-46c5-bee1-7034852ea30b	\N	60	0
4c651ee6-c72b-457d-a4f5-de613e357d00	c0c56716-03f0-416f-9028-82c52b99c576	65bd1828-487f-486b-be24-4f7e7c5e5ee2	\N	60	0
\.


--
-- Data for Name: selection_rounds; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public.selection_rounds (round_id, academic_year_id, type, label, level, status, selection_mode, opens_at, closes_at, created_at, approved_at, notes, allocation_change_grace_days, target_program_id) FROM stdin;
c0c56716-03f0-416f-9028-82c52b99c576	2cc3ced4-b785-4fb9-84d4-d1bbd12ff39c	PATHWAY	26/27 MIT/IT Pathway selection	L1	OPEN	AUTO	2026-04-17 07:48:00	2026-04-19 07:48:00	2026-04-17 07:48:49.957	\N	\N	5	24bcdfbd-b096-438c-b69e-ad906fbdaf00
\.


--
-- Data for Name: system_metrics; Type: TABLE DATA; Schema: public; Owner: sees_user
--

COPY public.system_metrics (id, "timestamp", cpu, cores, memory, storage_used, storage_total, storage_percent, uptime, health, active_users) FROM stdin;
cmo1lnulk0000ih963bl52bp1	2026-04-16 14:53:57.032+00	42	8	65	250	512	48	99.9	100	87
cmo2bsmpb00002v96t5zfm1w1	2026-04-17 03:05:30.095+00	15	10	26	11.4544563293457	460.4317207336426	2	3.4	65	141
cmo2bvgm60000ki96rox4bzdv	2026-04-17 03:07:42.174+00	15	10	26	11.4544563293457	460.4317207336426	2	3.4	65	141
\.


--
-- Name: AcademicGoal AcademicGoal_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."AcademicGoal"
    ADD CONSTRAINT "AcademicGoal_pkey" PRIMARY KEY (goal_id);


--
-- Name: AcademicRecoverySnapshot AcademicRecoverySnapshot_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."AcademicRecoverySnapshot"
    ADD CONSTRAINT "AcademicRecoverySnapshot_pkey" PRIMARY KEY (snapshot_id);


--
-- Name: AcademicYear AcademicYear_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."AcademicYear"
    ADD CONSTRAINT "AcademicYear_pkey" PRIMARY KEY (academic_year_id);


--
-- Name: Advisor Advisor_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."Advisor"
    ADD CONSTRAINT "Advisor_pkey" PRIMARY KEY (advisor_id);


--
-- Name: AnonymousReport AnonymousReport_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."AnonymousReport"
    ADD CONSTRAINT "AnonymousReport_pkey" PRIMARY KEY (report_id);


--
-- Name: DegreeProgram DegreeProgram_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."DegreeProgram"
    ADD CONSTRAINT "DegreeProgram_pkey" PRIMARY KEY (program_id);


--
-- Name: GPAHistory GPAHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."GPAHistory"
    ADD CONSTRAINT "GPAHistory_pkey" PRIMARY KEY (gpa_history_id);


--
-- Name: Grade Grade_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."Grade"
    ADD CONSTRAINT "Grade_pkey" PRIMARY KEY (grade_id);


--
-- Name: GradingBand GradingBand_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."GradingBand"
    ADD CONSTRAINT "GradingBand_pkey" PRIMARY KEY (band_id);


--
-- Name: GradingScheme GradingScheme_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."GradingScheme"
    ADD CONSTRAINT "GradingScheme_pkey" PRIMARY KEY (scheme_id);


--
-- Name: HOD HOD_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."HOD"
    ADD CONSTRAINT "HOD_pkey" PRIMARY KEY (hod_id);


--
-- Name: InternshipDocument InternshipDocument_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."InternshipDocument"
    ADD CONSTRAINT "InternshipDocument_pkey" PRIMARY KEY (document_id);


--
-- Name: InternshipMilestone InternshipMilestone_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."InternshipMilestone"
    ADD CONSTRAINT "InternshipMilestone_pkey" PRIMARY KEY (milestone_id);


--
-- Name: Internship Internship_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."Internship"
    ADD CONSTRAINT "Internship_pkey" PRIMARY KEY (internship_id);


--
-- Name: LectureSchedule LectureSchedule_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."LectureSchedule"
    ADD CONSTRAINT "LectureSchedule_pkey" PRIMARY KEY (schedule_id);


--
-- Name: LmsImportSession LmsImportSession_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."LmsImportSession"
    ADD CONSTRAINT "LmsImportSession_pkey" PRIMARY KEY (session_id);


--
-- Name: Message Message_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_pkey" PRIMARY KEY (message_id);


--
-- Name: ModuleRegistration ModuleRegistration_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."ModuleRegistration"
    ADD CONSTRAINT "ModuleRegistration_pkey" PRIMARY KEY (reg_id);


--
-- Name: Module Module_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."Module"
    ADD CONSTRAINT "Module_pkey" PRIMARY KEY (module_id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (notification_id);


--
-- Name: ProgramIntake ProgramIntake_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."ProgramIntake"
    ADD CONSTRAINT "ProgramIntake_pkey" PRIMARY KEY (intake_id);


--
-- Name: ProgramStructure ProgramStructure_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."ProgramStructure"
    ADD CONSTRAINT "ProgramStructure_pkey" PRIMARY KEY (structure_id);


--
-- Name: Ranking Ranking_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."Ranking"
    ADD CONSTRAINT "Ranking_pkey" PRIMARY KEY (ranking_id);


--
-- Name: Semester Semester_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."Semester"
    ADD CONSTRAINT "Semester_pkey" PRIMARY KEY (semester_id);


--
-- Name: Specialization Specialization_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."Specialization"
    ADD CONSTRAINT "Specialization_pkey" PRIMARY KEY (specialization_id);


--
-- Name: StaffAssignment StaffAssignment_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."StaffAssignment"
    ADD CONSTRAINT "StaffAssignment_pkey" PRIMARY KEY (assignment_id);


--
-- Name: Staff Staff_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."Staff"
    ADD CONSTRAINT "Staff_pkey" PRIMARY KEY (staff_id);


--
-- Name: StudentAIFeedbackSnapshot StudentAIFeedbackSnapshot_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."StudentAIFeedbackSnapshot"
    ADD CONSTRAINT "StudentAIFeedbackSnapshot_pkey" PRIMARY KEY (snapshot_id);


--
-- Name: Student Student_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."Student"
    ADD CONSTRAINT "Student_pkey" PRIMARY KEY (student_id);


--
-- Name: SystemSetting SystemSetting_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."SystemSetting"
    ADD CONSTRAINT "SystemSetting_pkey" PRIMARY KEY (setting_id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (user_id);


--
-- Name: _ModulePrerequisites _ModulePrerequisites_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."_ModulePrerequisites"
    ADD CONSTRAINT "_ModulePrerequisites_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: academic_credit_rules academic_credit_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public.academic_credit_rules
    ADD CONSTRAINT academic_credit_rules_pkey PRIMARY KEY (id);


--
-- Name: academic_path_transitions academic_path_transitions_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public.academic_path_transitions
    ADD CONSTRAINT academic_path_transitions_pkey PRIMARY KEY (id);


--
-- Name: analytics_reports analytics_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public.analytics_reports
    ADD CONSTRAINT analytics_reports_pkey PRIMARY KEY (report_id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (log_id);


--
-- Name: bulk_enrollment_batches bulk_enrollment_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public.bulk_enrollment_batches
    ADD CONSTRAINT bulk_enrollment_batches_pkey PRIMARY KEY (batch_id);


--
-- Name: bulk_enrollment_records bulk_enrollment_records_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public.bulk_enrollment_records
    ADD CONSTRAINT bulk_enrollment_records_pkey PRIMARY KEY (record_id);


--
-- Name: calendar_events calendar_events_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public.calendar_events
    ADD CONSTRAINT calendar_events_pkey PRIMARY KEY (id);


--
-- Name: feature_flags feature_flags_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public.feature_flags
    ADD CONSTRAINT feature_flags_pkey PRIMARY KEY (id);


--
-- Name: graduation_eligibility_profiles graduation_eligibility_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public.graduation_eligibility_profiles
    ADD CONSTRAINT graduation_eligibility_profiles_pkey PRIMARY KEY (profile_id);


--
-- Name: module_registration_rounds module_registration_rounds_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public.module_registration_rounds
    ADD CONSTRAINT module_registration_rounds_pkey PRIMARY KEY (round_id);


--
-- Name: notification_dispatch_logs notification_dispatch_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public.notification_dispatch_logs
    ADD CONSTRAINT notification_dispatch_logs_pkey PRIMARY KEY (log_id);


--
-- Name: notification_email_templates notification_email_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public.notification_email_templates
    ADD CONSTRAINT notification_email_templates_pkey PRIMARY KEY (template_id);


--
-- Name: notification_trigger_configs notification_trigger_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public.notification_trigger_configs
    ADD CONSTRAINT notification_trigger_configs_pkey PRIMARY KEY (config_id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: registration_tokens registration_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public.registration_tokens
    ADD CONSTRAINT registration_tokens_pkey PRIMARY KEY (id);


--
-- Name: selection_allocation_change_requests selection_allocation_change_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public.selection_allocation_change_requests
    ADD CONSTRAINT selection_allocation_change_requests_pkey PRIMARY KEY (request_id);


--
-- Name: selection_applications selection_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public.selection_applications
    ADD CONSTRAINT selection_applications_pkey PRIMARY KEY (app_id);


--
-- Name: selection_round_configs selection_round_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public.selection_round_configs
    ADD CONSTRAINT selection_round_configs_pkey PRIMARY KEY (config_id);


--
-- Name: selection_rounds selection_rounds_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public.selection_rounds
    ADD CONSTRAINT selection_rounds_pkey PRIMARY KEY (round_id);


--
-- Name: system_metrics system_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public.system_metrics
    ADD CONSTRAINT system_metrics_pkey PRIMARY KEY (id);


--
-- Name: AcademicGoal_student_id_goal_type_idx; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE INDEX "AcademicGoal_student_id_goal_type_idx" ON public."AcademicGoal" USING btree (student_id, goal_type);


--
-- Name: AcademicGoal_student_id_status_idx; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE INDEX "AcademicGoal_student_id_status_idx" ON public."AcademicGoal" USING btree (student_id, status);


--
-- Name: AcademicRecoverySnapshot_student_id_dip_fingerprint_key; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE UNIQUE INDEX "AcademicRecoverySnapshot_student_id_dip_fingerprint_key" ON public."AcademicRecoverySnapshot" USING btree (student_id, dip_fingerprint);


--
-- Name: AcademicRecoverySnapshot_student_id_idx; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE INDEX "AcademicRecoverySnapshot_student_id_idx" ON public."AcademicRecoverySnapshot" USING btree (student_id);


--
-- Name: AcademicYear_label_key; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE UNIQUE INDEX "AcademicYear_label_key" ON public."AcademicYear" USING btree (label);


--
-- Name: DegreeProgram_code_academic_year_id_key; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE UNIQUE INDEX "DegreeProgram_code_academic_year_id_key" ON public."DegreeProgram" USING btree (code, academic_year_id);


--
-- Name: GPAHistory_calculation_date_idx; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE INDEX "GPAHistory_calculation_date_idx" ON public."GPAHistory" USING btree (calculation_date);


--
-- Name: Grade_reg_id_key; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE UNIQUE INDEX "Grade_reg_id_key" ON public."Grade" USING btree (reg_id);


--
-- Name: Grade_released_at_idx; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE INDEX "Grade_released_at_idx" ON public."Grade" USING btree (released_at);


--
-- Name: LmsImportSession_student_id_created_at_idx; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE INDEX "LmsImportSession_student_id_created_at_idx" ON public."LmsImportSession" USING btree (student_id, created_at);


--
-- Name: Message_recipient_id_read_at_idx; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE INDEX "Message_recipient_id_read_at_idx" ON public."Message" USING btree (recipient_id, read_at);


--
-- Name: Message_recipient_id_sent_at_idx; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE INDEX "Message_recipient_id_sent_at_idx" ON public."Message" USING btree (recipient_id, sent_at);


--
-- Name: Message_sender_id_sent_at_idx; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE INDEX "Message_sender_id_sent_at_idx" ON public."Message" USING btree (sender_id, sent_at);


--
-- Name: ModuleRegistration_semester_id_status_idx; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE INDEX "ModuleRegistration_semester_id_status_idx" ON public."ModuleRegistration" USING btree (semester_id, status);


--
-- Name: Module_code_academic_year_id_key; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE UNIQUE INDEX "Module_code_academic_year_id_key" ON public."Module" USING btree (code, academic_year_id);


--
-- Name: ProgramIntake_program_id_academic_year_id_key; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE UNIQUE INDEX "ProgramIntake_program_id_academic_year_id_key" ON public."ProgramIntake" USING btree (program_id, academic_year_id);


--
-- Name: ProgramStructure_program_id_specialization_id_module_id_aca_key; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE UNIQUE INDEX "ProgramStructure_program_id_specialization_id_module_id_aca_key" ON public."ProgramStructure" USING btree (program_id, specialization_id, module_id, academic_year_id);


--
-- Name: Specialization_code_academic_year_id_key; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE UNIQUE INDEX "Specialization_code_academic_year_id_key" ON public."Specialization" USING btree (code, academic_year_id);


--
-- Name: StaffAssignment_staff_id_module_id_academic_year_id_key; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE UNIQUE INDEX "StaffAssignment_staff_id_module_id_academic_year_id_key" ON public."StaffAssignment" USING btree (staff_id, module_id, academic_year_id);


--
-- Name: Staff_staff_number_key; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE UNIQUE INDEX "Staff_staff_number_key" ON public."Staff" USING btree (staff_number);


--
-- Name: StudentAIFeedbackSnapshot_student_id_expires_at_idx; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE INDEX "StudentAIFeedbackSnapshot_student_id_expires_at_idx" ON public."StudentAIFeedbackSnapshot" USING btree (student_id, expires_at);


--
-- Name: StudentAIFeedbackSnapshot_student_id_generated_at_idx; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE INDEX "StudentAIFeedbackSnapshot_student_id_generated_at_idx" ON public."StudentAIFeedbackSnapshot" USING btree (student_id, generated_at);


--
-- Name: SystemSetting_key_key; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE UNIQUE INDEX "SystemSetting_key_key" ON public."SystemSetting" USING btree (key);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_username_key; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE UNIQUE INDEX "User_username_key" ON public."User" USING btree (username);


--
-- Name: _ModulePrerequisites_B_index; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE INDEX "_ModulePrerequisites_B_index" ON public."_ModulePrerequisites" USING btree ("B");


--
-- Name: academic_credit_rules_level_semester_number_academic_year_i_key; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE UNIQUE INDEX academic_credit_rules_level_semester_number_academic_year_i_key ON public.academic_credit_rules USING btree (level, semester_number, academic_year_id);


--
-- Name: academic_path_transitions_source_program_id_target_program__key; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE UNIQUE INDEX academic_path_transitions_source_program_id_target_program__key ON public.academic_path_transitions USING btree (source_program_id, target_program_id, level);


--
-- Name: analytics_reports_owner_user_id_idx; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE INDEX analytics_reports_owner_user_id_idx ON public.analytics_reports USING btree (owner_user_id);


--
-- Name: analytics_reports_scope_role_idx; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE INDEX analytics_reports_scope_role_idx ON public.analytics_reports USING btree (scope_role);


--
-- Name: audit_logs_admin_id_idx; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE INDEX audit_logs_admin_id_idx ON public.audit_logs USING btree (admin_id);


--
-- Name: audit_logs_category_idx; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE INDEX audit_logs_category_idx ON public.audit_logs USING btree (category);


--
-- Name: audit_logs_timestamp_idx; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE INDEX audit_logs_timestamp_idx ON public.audit_logs USING btree ("timestamp");


--
-- Name: bulk_enrollment_records_batch_id_idx; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE INDEX bulk_enrollment_records_batch_id_idx ON public.bulk_enrollment_records USING btree (batch_id);


--
-- Name: bulk_enrollment_records_email_idx; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE INDEX bulk_enrollment_records_email_idx ON public.bulk_enrollment_records USING btree (email);


--
-- Name: bulk_enrollment_records_status_idx; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE INDEX bulk_enrollment_records_status_idx ON public.bulk_enrollment_records USING btree (status);


--
-- Name: feature_flags_key_key; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE UNIQUE INDEX feature_flags_key_key ON public.feature_flags USING btree (key);


--
-- Name: graduation_eligibility_profiles_program_id_key; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE UNIQUE INDEX graduation_eligibility_profiles_program_id_key ON public.graduation_eligibility_profiles USING btree (program_id);


--
-- Name: module_registration_rounds_academic_year_id_idx; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE INDEX module_registration_rounds_academic_year_id_idx ON public.module_registration_rounds USING btree (academic_year_id);


--
-- Name: module_registration_rounds_status_idx; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE INDEX module_registration_rounds_status_idx ON public.module_registration_rounds USING btree (status);


--
-- Name: notification_dispatch_logs_dedupe_key_key; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE UNIQUE INDEX notification_dispatch_logs_dedupe_key_key ON public.notification_dispatch_logs USING btree (dedupe_key);


--
-- Name: notification_dispatch_logs_event_key_created_at_idx; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE INDEX notification_dispatch_logs_event_key_created_at_idx ON public.notification_dispatch_logs USING btree (event_key, created_at);


--
-- Name: notification_email_templates_event_key_idx; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE INDEX notification_email_templates_event_key_idx ON public.notification_email_templates USING btree (event_key);


--
-- Name: notification_trigger_configs_event_key_key; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE UNIQUE INDEX notification_trigger_configs_event_key_key ON public.notification_trigger_configs USING btree (event_key);


--
-- Name: password_reset_tokens_token_idx; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE INDEX password_reset_tokens_token_idx ON public.password_reset_tokens USING btree (token);


--
-- Name: password_reset_tokens_token_key; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE UNIQUE INDEX password_reset_tokens_token_key ON public.password_reset_tokens USING btree (token);


--
-- Name: password_reset_tokens_user_id_idx; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE INDEX password_reset_tokens_user_id_idx ON public.password_reset_tokens USING btree (user_id);


--
-- Name: registration_tokens_token_idx; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE INDEX registration_tokens_token_idx ON public.registration_tokens USING btree (token);


--
-- Name: registration_tokens_token_key; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE UNIQUE INDEX registration_tokens_token_key ON public.registration_tokens USING btree (token);


--
-- Name: registration_tokens_user_id_idx; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE INDEX registration_tokens_user_id_idx ON public.registration_tokens USING btree (user_id);


--
-- Name: selection_allocation_change_requests_round_id_idx; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE INDEX selection_allocation_change_requests_round_id_idx ON public.selection_allocation_change_requests USING btree (round_id);


--
-- Name: selection_allocation_change_requests_status_idx; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE INDEX selection_allocation_change_requests_status_idx ON public.selection_allocation_change_requests USING btree (status);


--
-- Name: selection_allocation_change_requests_student_id_idx; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE INDEX selection_allocation_change_requests_student_id_idx ON public.selection_allocation_change_requests USING btree (student_id);


--
-- Name: selection_applications_round_id_idx; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE INDEX selection_applications_round_id_idx ON public.selection_applications USING btree (round_id);


--
-- Name: selection_applications_round_id_student_id_key; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE UNIQUE INDEX selection_applications_round_id_student_id_key ON public.selection_applications USING btree (round_id, student_id);


--
-- Name: selection_applications_student_id_idx; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE INDEX selection_applications_student_id_idx ON public.selection_applications USING btree (student_id);


--
-- Name: selection_rounds_target_program_id_idx; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE INDEX selection_rounds_target_program_id_idx ON public.selection_rounds USING btree (target_program_id);


--
-- Name: system_metrics_timestamp_idx; Type: INDEX; Schema: public; Owner: sees_user
--

CREATE INDEX system_metrics_timestamp_idx ON public.system_metrics USING btree ("timestamp");


--
-- Name: AcademicGoal AcademicGoal_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."AcademicGoal"
    ADD CONSTRAINT "AcademicGoal_module_id_fkey" FOREIGN KEY (module_id) REFERENCES public."Module"(module_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AcademicGoal AcademicGoal_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."AcademicGoal"
    ADD CONSTRAINT "AcademicGoal_student_id_fkey" FOREIGN KEY (student_id) REFERENCES public."Student"(student_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: AcademicRecoverySnapshot AcademicRecoverySnapshot_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."AcademicRecoverySnapshot"
    ADD CONSTRAINT "AcademicRecoverySnapshot_student_id_fkey" FOREIGN KEY (student_id) REFERENCES public."Student"(student_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Advisor Advisor_advisor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."Advisor"
    ADD CONSTRAINT "Advisor_advisor_id_fkey" FOREIGN KEY (advisor_id) REFERENCES public."Staff"(staff_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AnonymousReport AnonymousReport_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."AnonymousReport"
    ADD CONSTRAINT "AnonymousReport_student_id_fkey" FOREIGN KEY (student_id) REFERENCES public."Student"(student_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: DegreeProgram DegreeProgram_academic_year_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."DegreeProgram"
    ADD CONSTRAINT "DegreeProgram_academic_year_id_fkey" FOREIGN KEY (academic_year_id) REFERENCES public."AcademicYear"(academic_year_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: GPAHistory GPAHistory_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."GPAHistory"
    ADD CONSTRAINT "GPAHistory_student_id_fkey" FOREIGN KEY (student_id) REFERENCES public."Student"(student_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Grade Grade_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."Grade"
    ADD CONSTRAINT "Grade_module_id_fkey" FOREIGN KEY (module_id) REFERENCES public."Module"(module_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Grade Grade_reg_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."Grade"
    ADD CONSTRAINT "Grade_reg_id_fkey" FOREIGN KEY (reg_id) REFERENCES public."ModuleRegistration"(reg_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Grade Grade_semester_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."Grade"
    ADD CONSTRAINT "Grade_semester_id_fkey" FOREIGN KEY (semester_id) REFERENCES public."Semester"(semester_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Grade Grade_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."Grade"
    ADD CONSTRAINT "Grade_student_id_fkey" FOREIGN KEY (student_id) REFERENCES public."Student"(student_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: GradingBand GradingBand_scheme_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."GradingBand"
    ADD CONSTRAINT "GradingBand_scheme_id_fkey" FOREIGN KEY (scheme_id) REFERENCES public."GradingScheme"(scheme_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: GradingScheme GradingScheme_academic_year_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."GradingScheme"
    ADD CONSTRAINT "GradingScheme_academic_year_id_fkey" FOREIGN KEY (academic_year_id) REFERENCES public."AcademicYear"(academic_year_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: HOD HOD_hod_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."HOD"
    ADD CONSTRAINT "HOD_hod_id_fkey" FOREIGN KEY (hod_id) REFERENCES public."Staff"(staff_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InternshipDocument InternshipDocument_internship_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."InternshipDocument"
    ADD CONSTRAINT "InternshipDocument_internship_id_fkey" FOREIGN KEY (internship_id) REFERENCES public."Internship"(internship_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InternshipMilestone InternshipMilestone_internship_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."InternshipMilestone"
    ADD CONSTRAINT "InternshipMilestone_internship_id_fkey" FOREIGN KEY (internship_id) REFERENCES public."Internship"(internship_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Internship Internship_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."Internship"
    ADD CONSTRAINT "Internship_student_id_fkey" FOREIGN KEY (student_id) REFERENCES public."Student"(student_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LectureSchedule LectureSchedule_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."LectureSchedule"
    ADD CONSTRAINT "LectureSchedule_module_id_fkey" FOREIGN KEY (module_id) REFERENCES public."Module"(module_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LectureSchedule LectureSchedule_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."LectureSchedule"
    ADD CONSTRAINT "LectureSchedule_staff_id_fkey" FOREIGN KEY (staff_id) REFERENCES public."Staff"(staff_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LmsImportSession LmsImportSession_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."LmsImportSession"
    ADD CONSTRAINT "LmsImportSession_student_id_fkey" FOREIGN KEY (student_id) REFERENCES public."Student"(student_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Message Message_recipient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_recipient_id_fkey" FOREIGN KEY (recipient_id) REFERENCES public."User"(user_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Message Message_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_sender_id_fkey" FOREIGN KEY (sender_id) REFERENCES public."User"(user_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ModuleRegistration ModuleRegistration_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."ModuleRegistration"
    ADD CONSTRAINT "ModuleRegistration_module_id_fkey" FOREIGN KEY (module_id) REFERENCES public."Module"(module_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ModuleRegistration ModuleRegistration_semester_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."ModuleRegistration"
    ADD CONSTRAINT "ModuleRegistration_semester_id_fkey" FOREIGN KEY (semester_id) REFERENCES public."Semester"(semester_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ModuleRegistration ModuleRegistration_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."ModuleRegistration"
    ADD CONSTRAINT "ModuleRegistration_student_id_fkey" FOREIGN KEY (student_id) REFERENCES public."Student"(student_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Module Module_academic_year_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."Module"
    ADD CONSTRAINT "Module_academic_year_id_fkey" FOREIGN KEY (academic_year_id) REFERENCES public."AcademicYear"(academic_year_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Notification Notification_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."User"(user_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProgramIntake ProgramIntake_academic_year_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."ProgramIntake"
    ADD CONSTRAINT "ProgramIntake_academic_year_id_fkey" FOREIGN KEY (academic_year_id) REFERENCES public."AcademicYear"(academic_year_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProgramIntake ProgramIntake_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."ProgramIntake"
    ADD CONSTRAINT "ProgramIntake_program_id_fkey" FOREIGN KEY (program_id) REFERENCES public."DegreeProgram"(program_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProgramStructure ProgramStructure_academic_year_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."ProgramStructure"
    ADD CONSTRAINT "ProgramStructure_academic_year_id_fkey" FOREIGN KEY (academic_year_id) REFERENCES public."AcademicYear"(academic_year_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ProgramStructure ProgramStructure_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."ProgramStructure"
    ADD CONSTRAINT "ProgramStructure_module_id_fkey" FOREIGN KEY (module_id) REFERENCES public."Module"(module_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProgramStructure ProgramStructure_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."ProgramStructure"
    ADD CONSTRAINT "ProgramStructure_program_id_fkey" FOREIGN KEY (program_id) REFERENCES public."DegreeProgram"(program_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProgramStructure ProgramStructure_specialization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."ProgramStructure"
    ADD CONSTRAINT "ProgramStructure_specialization_id_fkey" FOREIGN KEY (specialization_id) REFERENCES public."Specialization"(specialization_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Ranking Ranking_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."Ranking"
    ADD CONSTRAINT "Ranking_student_id_fkey" FOREIGN KEY (student_id) REFERENCES public."Student"(student_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Semester Semester_academic_year_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."Semester"
    ADD CONSTRAINT "Semester_academic_year_id_fkey" FOREIGN KEY (academic_year_id) REFERENCES public."AcademicYear"(academic_year_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Specialization Specialization_academic_year_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."Specialization"
    ADD CONSTRAINT "Specialization_academic_year_id_fkey" FOREIGN KEY (academic_year_id) REFERENCES public."AcademicYear"(academic_year_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Specialization Specialization_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."Specialization"
    ADD CONSTRAINT "Specialization_program_id_fkey" FOREIGN KEY (program_id) REFERENCES public."DegreeProgram"(program_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StaffAssignment StaffAssignment_academic_year_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."StaffAssignment"
    ADD CONSTRAINT "StaffAssignment_academic_year_id_fkey" FOREIGN KEY (academic_year_id) REFERENCES public."AcademicYear"(academic_year_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: StaffAssignment StaffAssignment_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."StaffAssignment"
    ADD CONSTRAINT "StaffAssignment_module_id_fkey" FOREIGN KEY (module_id) REFERENCES public."Module"(module_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: StaffAssignment StaffAssignment_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."StaffAssignment"
    ADD CONSTRAINT "StaffAssignment_program_id_fkey" FOREIGN KEY (program_id) REFERENCES public."DegreeProgram"(program_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: StaffAssignment StaffAssignment_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."StaffAssignment"
    ADD CONSTRAINT "StaffAssignment_staff_id_fkey" FOREIGN KEY (staff_id) REFERENCES public."Staff"(staff_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Staff Staff_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."Staff"
    ADD CONSTRAINT "Staff_staff_id_fkey" FOREIGN KEY (staff_id) REFERENCES public."User"(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StudentAIFeedbackSnapshot StudentAIFeedbackSnapshot_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."StudentAIFeedbackSnapshot"
    ADD CONSTRAINT "StudentAIFeedbackSnapshot_student_id_fkey" FOREIGN KEY (student_id) REFERENCES public."Student"(student_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Student Student_advisor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."Student"
    ADD CONSTRAINT "Student_advisor_id_fkey" FOREIGN KEY (advisor_id) REFERENCES public."Advisor"(advisor_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Student Student_degree_path_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."Student"
    ADD CONSTRAINT "Student_degree_path_id_fkey" FOREIGN KEY (degree_path_id) REFERENCES public."DegreeProgram"(program_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Student Student_pathway_preference_1_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."Student"
    ADD CONSTRAINT "Student_pathway_preference_1_id_fkey" FOREIGN KEY (pathway_preference_1_id) REFERENCES public."DegreeProgram"(program_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Student Student_pathway_preference_2_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."Student"
    ADD CONSTRAINT "Student_pathway_preference_2_id_fkey" FOREIGN KEY (pathway_preference_2_id) REFERENCES public."DegreeProgram"(program_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Student Student_specialization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."Student"
    ADD CONSTRAINT "Student_specialization_id_fkey" FOREIGN KEY (specialization_id) REFERENCES public."Specialization"(specialization_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Student Student_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."Student"
    ADD CONSTRAINT "Student_student_id_fkey" FOREIGN KEY (student_id) REFERENCES public."User"(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _ModulePrerequisites _ModulePrerequisites_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."_ModulePrerequisites"
    ADD CONSTRAINT "_ModulePrerequisites_A_fkey" FOREIGN KEY ("A") REFERENCES public."Module"(module_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _ModulePrerequisites _ModulePrerequisites_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public."_ModulePrerequisites"
    ADD CONSTRAINT "_ModulePrerequisites_B_fkey" FOREIGN KEY ("B") REFERENCES public."Module"(module_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: academic_credit_rules academic_credit_rules_academic_year_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public.academic_credit_rules
    ADD CONSTRAINT academic_credit_rules_academic_year_id_fkey FOREIGN KEY (academic_year_id) REFERENCES public."AcademicYear"(academic_year_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: academic_path_transitions academic_path_transitions_source_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public.academic_path_transitions
    ADD CONSTRAINT academic_path_transitions_source_program_id_fkey FOREIGN KEY (source_program_id) REFERENCES public."DegreeProgram"(program_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: academic_path_transitions academic_path_transitions_target_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public.academic_path_transitions
    ADD CONSTRAINT academic_path_transitions_target_program_id_fkey FOREIGN KEY (target_program_id) REFERENCES public."DegreeProgram"(program_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: analytics_reports analytics_reports_owner_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public.analytics_reports
    ADD CONSTRAINT analytics_reports_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES public."User"(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: bulk_enrollment_records bulk_enrollment_records_batch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public.bulk_enrollment_records
    ADD CONSTRAINT bulk_enrollment_records_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.bulk_enrollment_batches(batch_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: graduation_eligibility_profiles graduation_eligibility_profiles_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public.graduation_eligibility_profiles
    ADD CONSTRAINT graduation_eligibility_profiles_program_id_fkey FOREIGN KEY (program_id) REFERENCES public."DegreeProgram"(program_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: graduation_eligibility_profiles graduation_eligibility_profiles_updated_by_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public.graduation_eligibility_profiles
    ADD CONSTRAINT graduation_eligibility_profiles_updated_by_staff_id_fkey FOREIGN KEY (updated_by_staff_id) REFERENCES public."Staff"(staff_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: module_registration_rounds module_registration_rounds_academic_year_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public.module_registration_rounds
    ADD CONSTRAINT module_registration_rounds_academic_year_id_fkey FOREIGN KEY (academic_year_id) REFERENCES public."AcademicYear"(academic_year_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: password_reset_tokens password_reset_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."User"(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: registration_tokens registration_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public.registration_tokens
    ADD CONSTRAINT registration_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."User"(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: selection_allocation_change_requests selection_allocation_change_requests_resolved_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public.selection_allocation_change_requests
    ADD CONSTRAINT selection_allocation_change_requests_resolved_by_user_id_fkey FOREIGN KEY (resolved_by_user_id) REFERENCES public."User"(user_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: selection_allocation_change_requests selection_allocation_change_requests_round_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public.selection_allocation_change_requests
    ADD CONSTRAINT selection_allocation_change_requests_round_id_fkey FOREIGN KEY (round_id) REFERENCES public.selection_rounds(round_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: selection_allocation_change_requests selection_allocation_change_requests_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public.selection_allocation_change_requests
    ADD CONSTRAINT selection_allocation_change_requests_student_id_fkey FOREIGN KEY (student_id) REFERENCES public."Student"(student_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: selection_applications selection_applications_round_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public.selection_applications
    ADD CONSTRAINT selection_applications_round_id_fkey FOREIGN KEY (round_id) REFERENCES public.selection_rounds(round_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: selection_round_configs selection_round_configs_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public.selection_round_configs
    ADD CONSTRAINT selection_round_configs_program_id_fkey FOREIGN KEY (program_id) REFERENCES public."DegreeProgram"(program_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: selection_round_configs selection_round_configs_round_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public.selection_round_configs
    ADD CONSTRAINT selection_round_configs_round_id_fkey FOREIGN KEY (round_id) REFERENCES public.selection_rounds(round_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: selection_round_configs selection_round_configs_spec_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public.selection_round_configs
    ADD CONSTRAINT selection_round_configs_spec_id_fkey FOREIGN KEY (spec_id) REFERENCES public."Specialization"(specialization_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: selection_rounds selection_rounds_academic_year_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public.selection_rounds
    ADD CONSTRAINT selection_rounds_academic_year_id_fkey FOREIGN KEY (academic_year_id) REFERENCES public."AcademicYear"(academic_year_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: selection_rounds selection_rounds_target_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sees_user
--

ALTER TABLE ONLY public.selection_rounds
    ADD CONSTRAINT selection_rounds_target_program_id_fkey FOREIGN KEY (target_program_id) REFERENCES public."DegreeProgram"(program_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: sees_user
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict JEAYmDJ3X8dTqDnSTgzcZlx6F5b9OWlWoRDdhWXkut7Oo77mDRiCYT2E52RWfcF

