import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { SQLPlanSchema } from '@/lib/chatbot/planner-schema';
import { executePlannerSQL } from '@/lib/chatbot/db-query-engine';

// ─── Config ───────────────────────────────────────────────────────────────────

const XAI_API_KEY = process.env.XAI_API_KEY;
const XAI_MODEL   = process.env.XAI_MODEL || 'grok-beta';
const AI_CHAT_URL = 'https://api.x.ai/v1/chat/completions';

// ─── Guide-book context (curriculum facts, no DB needed) ─────────────────────

const GUIDE_BOOK_CONTEXT = `
Department of Industrial Management (DIM), Faculty of Science.
Programs: B.Sc. Honours in MIT and B.Sc. Honours in IT (SLQF Level 6, 4-year).
Level 1 (L1): Common modules. Transition to MIT or IT pathway for L2.
MIT Pathway (L2-L4): Specialization tracks BSE, OSCM, IS.
IT Pathway (L2-L4): Structured technical curriculum, no separate specializations.
Graduation: 132 total credits (≥30 from L3, ≥30 from L4). Min GPA 2.00 (Pass), 3.00 (Lower Second), 3.30 (Upper Second), 3.70 (First Class). ≥105 credits must be C or better.
Core modules: Software Dev Project (INTE 31356, 6cr), Internship (GNCT 32216, 6cr), Research Project (INTE 43216/MGTE 43216, 6cr).
L1 Core: Fundamentals of Computing (INTE 11213), Programming Concepts (INTE 11223), Business Statistics (MGTE 11233), Principles of Management (MGTE 11243).
`.trim();

// ─── Full schema for the planner LLM ─────────────────────────────────────────
// Table names are PostgreSQL-quoted PascalCase (Prisma default, no @@map unless noted).
// Include only academically relevant, non-sensitive models.

const DB_SCHEMA = `
PostgreSQL database — SEES academic platform. All table names are double-quoted PascalCase.
You MUST double-quote all table and column names in your SQL (e.g. "Module", "grade_point").

=== ALLOWED TABLES ===

"User"                 (user_id uuid PK, email, "firstName", "lastName", role, status, created_at, last_login_date)
"Student"              (student_id uuid PK FK→"User".user_id, current_gpa float, current_level text, admission_year int, academic_class text, enrollment_status text, graduation_status text, degree_path_id uuid FK→"DegreeProgram", specialization_id uuid FK→"Specialization")
"Staff"                (staff_id uuid PK FK→"User".user_id, staff_number text, staff_type text, department text)
"Advisor"              (advisor_id uuid PK FK→"Staff".staff_id)
"HOD"                  (hod_id uuid PK FK→"Staff".staff_id, department text)
"DegreeProgram"        (program_id uuid PK, code text, name text, active bool, is_common bool)
"Specialization"       (specialization_id uuid PK, code text, name text, active bool, program_id uuid FK→"DegreeProgram")
"Module"               (module_id uuid PK, code text, name text, credits int, level text, active bool, counts_toward_gpa bool, academic_year_id uuid)
"AcademicYear"         (academic_year_id uuid PK, label text UNIQUE, start_date timestamptz, end_date timestamptz, active bool)
"Semester"             (semester_id uuid PK, academic_year_id uuid FK→"AcademicYear", label text, start_date timestamptz, end_date timestamptz)
"ModuleRegistration"   (reg_id uuid PK, student_id uuid FK→"Student", module_id uuid FK→"Module", semester_id uuid FK→"Semester", status text, registration_date timestamptz)
"Grade"                (grade_id uuid PK, reg_id uuid UNIQUE FK→"ModuleRegistration", student_id uuid FK→"Student", module_id uuid FK→"Module", semester_id uuid FK→"Semester", marks float, grade_point float, letter_grade text, released_at timestamptz NULL — NULL means not yet released)
"GradingScheme"        (scheme_id uuid PK, name text, version text, active bool, academic_year_id uuid)
"GradingBand"          (band_id uuid PK, scheme_id uuid FK→"GradingScheme", min_marks float, max_marks float, grade_point float, letter_grade text)
"StaffAssignment"      (assignment_id uuid PK, staff_id uuid FK→"Staff", module_id uuid FK→"Module", program_id uuid FK→"DegreeProgram", role text, active bool, academic_year_id uuid)
"ProgramStructure"     (structure_id uuid PK, program_id uuid FK→"DegreeProgram", specialization_id uuid, module_id uuid FK→"Module", academic_level text, semester_number int, module_type text, credits int)
"Ranking"              (ranking_id uuid PK, student_id uuid FK→"Student", degree_path_id uuid, rank int, gpa float, weighted_average float, created_at timestamptz)
"GPAHistory"           (gpa_history_id uuid PK, student_id uuid FK→"Student", calculation_date timestamptz, gpa float, academic_class text)
"AcademicGoal"         (goal_id uuid PK, student_id uuid FK→"Student", goal_type text, status text, progress int, target_gpa float, target_class text)
"Specialization"       (specialization_id uuid PK, code text, name text, program_id uuid FK→"DegreeProgram", active bool)
"SelectionRound"       (round_id uuid PK, academic_year_id uuid, type text, label text, status text, opens_at timestamptz, closes_at timestamptz)
"SelectionApplication" (app_id uuid PK, round_id uuid, student_id uuid, status text, allocated_to uuid, gpa_at_time float, applied_at timestamptz) — maps to table "selection_applications"
"LectureSchedule"      (schedule_id uuid PK, module_id uuid FK→"Module", staff_id uuid FK→"Staff", day_of_week text, start_time timestamptz, end_time timestamptz, location text)

=== BLOCKED — NEVER QUERY ===
"AuditLog" / "audit_logs", "SystemSetting", "SystemMetric" / "system_metrics",
"PasswordResetToken" / "password_reset_tokens", "RegistrationToken" / "registration_tokens",
"TwoFactorConfirmation", "BulkEnrollmentBatch", "BulkEnrollmentRecord",
"NotificationDispatchLog", "NotificationEmailTemplate", "NotificationTriggerConfig",
"LmsImportSession", password_hash column on "User"

=== NOTES ===
- "SelectionApplication" maps to table "selection_applications" (use @@map name in SQL)
- All other table names are exactly as shown above (PascalCase, double-quoted)
- grade_point scale: A+=4.0, A=4.0, B+=3.3, B=3.0, C+=2.3, C=2.0, D=1.0, E/F=0.0
- Pass = grade_point >= 2.0
- released_at IS NOT NULL means the grade is published
`.trim();

// ─── Role-specific SQL notes ──────────────────────────────────────────────────

function roleSQLNotes(role: string): string {
  if (role === 'student') {
    return `ROLE RESTRICTIONS (student):
- Do NOT return email, password_hash, or any column that identifies another individual student.
- You MAY aggregate (COUNT, AVG, MIN, MAX) over student data.
- Do NOT query "Notification", "Message", "AnonymousReport", individual internship records.
- You CAN return module-level stats, GPA distributions, program stats.`;
  }
  if (role === 'staff' || role === 'advisor') {
    return `ROLE RESTRICTIONS (${role}):
- Do NOT return password_hash or security-related columns.
- You MAY query student academic data (GPA, grades, modules) for analysis.
- Do NOT query "Notification", "AuditLog", "SystemSetting".`;
  }
  // hod / admin — full access to allowed tables
  return `ROLE (${role}): Full access to all allowed tables. Avoid password_hash and security columns.`;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function callAI(
  messages: { role: string; content: string }[],
  jsonMode = false
): Promise<string> {
  const res = await fetch(AI_CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${XAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: XAI_MODEL,
      messages,
      temperature: jsonMode ? 0.0 : 0.3,
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`XAI API ${res.status}: ${txt.slice(0, 200)}`);
  }

  const data = await res.json();
  return (data?.choices?.[0]?.message?.content as string) ?? '';
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/#{1,3} (.*)/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .trim();
}

// ─── Main handler ─────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: AI Chat Assistant
 *     description: Academic virtual assistant that can answer questions about the curriculum and student data using Grok AI and direct SQL queries.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: User's question or message.
 *               history:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                     content:
 *                       type: string
 *     responses:
 *       200:
 *         description: Successfully generated response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *                 dbAccess:
 *                   type: boolean
 *       400:
 *         description: Message is required
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function POST(request: NextRequest) {
  try {
    // ── 1. Auth ───────────────────────────────────────────────────────────
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { response: 'Please log in to use the SEES AI assistant.' },
        { status: 401 }
      );
    }
    const role = (session.user.role ?? 'student') as string;

    // ── 2. API key ────────────────────────────────────────────────────────
    if (!XAI_API_KEY) {
      return NextResponse.json({ error: 'AI service is not configured.' }, { status: 500 });
    }

    // ── 3. Admin kill-switch ──────────────────────────────────────────────
    const killSwitch = await prisma.systemSetting.findUnique({
      where: { key: 'chatbot_db_access_enabled' },
    });
    const dbAccessEnabled = killSwitch ? killSwitch.value === 'true' : true;

    // ── 4. Parse body ─────────────────────────────────────────────────────
    const body = await request.json();
    const text = typeof body.message === 'string' ? body.message.trim().slice(0, 2000) : '';
    if (!text) return NextResponse.json({ error: 'Message is required' }, { status: 400 });

    const safeHistory: { role: string; content: string }[] = Array.isArray(body.history)
      ? body.history
          .slice(-6)
          .filter((h: unknown) =>
            h && typeof h === 'object' &&
            typeof (h as Record<string, unknown>).role === 'string' &&
            typeof (h as Record<string, unknown>).content === 'string'
          )
      : [];

    // ── 5. Guide-book-only fallback (kill-switch) ─────────────────────────
    if (!dbAccessEnabled) {
      const raw = await callAI([
        {
          role: 'system',
          content: `You are the SEES Official Academic Virtual Assistant. Answer in plain text (no markdown), max 180 words.
${GUIDE_BOOK_CONTEXT}
If you cannot answer from the guide, say "I don't have enough information to answer that about SEES." Never invent data.`,
        },
        ...safeHistory,
        { role: 'user', content: text },
      ]);
      return NextResponse.json({ response: stripMarkdown(raw), dbAccess: false });
    }

    // ── 6. Phase 1: PLANNER — generate SQL ───────────────────────────────
    const userContext = `USER CONTEXT:
- Name: ${session.user.name || 'Unknown'}
- Role: ${role}
- User ID: ${session.user.id}
When the user says "my" (e.g., "my modules", "my grades", "my ranking"), filter by this User ID. In the database, this ID matches the primary key of "User", "Student", or "Staff".`;

    const plannerSystem = `You are a SQL query planner for the SEES academic platform (PostgreSQL).
Given a user question, decide whether it can be answered from the database, then write a single SELECT or WITH query.

${DB_SCHEMA}

${roleSQLNotes(role)}

${userContext}

Output ONLY valid JSON (no extra text):
{
  "canAnswer": true | false,
  "reason": null | "string — required only when canAnswer=false, shown directly to the user",
  "sql": null | "SELECT ... or WITH ... — required when canAnswer=true"
}

Rules:
- canAnswer=false for: questions about individual student PII (when role=student), write operations, anything outside academics, weather, general knowledge.
- canAnswer=false with reason="GUIDE_ONLY" for questions answerable purely from the curriculum guide (pathways, graduation rules, module descriptions) without needing live data.
- canAnswer=true for anything that needs real database data: enrollment counts, GPA stats, pass rates, module performance, rankings, grade distributions, cohort analysis, etc.
- Write correct PostgreSQL. Double-quote all identifiers. Do not add a LIMIT (the server will add one).
- If a question is ambiguous, write a general query that covers the most likely intent.
- When aggregating, always include a COUNT or AVG as appropriate. Use ROUND(x::numeric, 2) for float rounding.`;

    let planRaw: string;
    try {
      planRaw = await callAI(
        [
          { role: 'system', content: plannerSystem },
          ...safeHistory,
          { role: 'user', content: text },
        ],
        true
      );
    } catch (err) {
      console.error('[Chat] AI call failed:', err);
      return NextResponse.json({
        response: "I'm having trouble connecting to my reasoning engine. Please try again.",
      });
    }

    let plan: ReturnType<typeof SQLPlanSchema.parse>;
    try {
      plan = SQLPlanSchema.parse(JSON.parse(planRaw));
    } catch (err) {
      console.error('[Chat] Planner JSON invalid:', planRaw, err);
      return NextResponse.json({
        response: 'I had trouble understanding your question. Could you rephrase it?',
      });
    }

    // ── 7. Not answerable ─────────────────────────────────────────────────
    if (!plan.canAnswer) {
      if (plan.reason === 'GUIDE_ONLY') {
        const raw = await callAI([
          {
            role: 'system',
            content: `You are the SEES Official Academic Virtual Assistant. Answer in plain text (no markdown), max 180 words.
${GUIDE_BOOK_CONTEXT}
If you cannot answer from the guide, say "I don't have enough information to answer that about SEES." Never invent data.`,
          },
          ...safeHistory,
          { role: 'user', content: text },
        ]);
        return NextResponse.json({ response: stripMarkdown(raw), dbAccess: false });
      }

      const reason =
        (plan.reason ?? '').trim() ||
        "I'm not able to answer that from the SEES database. I can help with module statistics, GPA averages, enrollment data, pass rates, grade distributions, and other academic information.";
      return NextResponse.json({ response: reason });
    }

    // ── 8. Execute SQL ────────────────────────────────────────────────────
    if (!plan.sql?.trim()) {
      return NextResponse.json({
        response: "I wasn't sure what data to look up for that question. Could you be more specific?",
      });
    }

    const execResult = await executePlannerSQL(plan.sql, role);

    if (!execResult.ok) {
      console.error('[Chat] SQL exec failed:', execResult.reason, 'SQL:', execResult.sql);

      // Let the synthesizer recover gracefully if it was a query error
      return NextResponse.json({
        response: `I wasn't able to retrieve that data. ${execResult.reason}`,
      });
    }

    if (execResult.rows.length === 0) {
      return NextResponse.json({
        response:
          'I found no matching records for your question. The data may not exist yet, or you may need to refine your search (e.g. check module codes or academic year).',
      });
    }

    // ── 9. Phase 2: SYNTHESIZER ───────────────────────────────────────────
    const dataPreview = JSON.stringify(execResult.rows.slice(0, 50));

    const synthSystem = `You are the SEES Official Academic Virtual Assistant for the Department of Industrial Management (DIM).
Answer the user's question using ONLY the database results below. Do not invent or estimate any numbers not in the data.
Write in plain text (no markdown). Be concise (max 200 words). Use bullet points with • where helpful.
If the data does not fully answer the question, say so honestly.
Curriculum context (for background): ${GUIDE_BOOK_CONTEXT}`;

    const synthUser = `Database results (${execResult.rows.length} rows):\n${dataPreview}\n\nUser question: ${text}`;

    let answer: string;
    try {
      answer = await callAI([
        { role: 'system', content: synthSystem },
        ...safeHistory,
        { role: 'user', content: synthUser },
      ]);
    } catch {
      // Fall back to raw data summary
      const cols = execResult.rows[0] ? Object.keys(execResult.rows[0]).join(', ') : '';
      answer = `I retrieved ${execResult.rows.length} row(s) with columns: ${cols}. Raw data: ${dataPreview.slice(0, 500)}`;
    }

    return NextResponse.json({ response: stripMarkdown(answer), dbAccess: true });
  } catch (error) {
    console.error('[Chat] Unhandled error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}
