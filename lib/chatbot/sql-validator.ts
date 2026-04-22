'server-only';

// ─── Blocked tables (never accessible regardless of role) ────────────────────

const BLOCKED_TABLES = [
  'audit_logs',
  'auditlog',
  'system_metrics',
  'systemmetric',
  'password_reset_tokens',
  'passwordresettoken',
  'registration_tokens',
  'registrationtoken',
  'twofactorconfirmation',
  'bulk_enrollment_batches',
  'bulkenrollmentbatch',
  'bulk_enrollment_records',
  'bulkenrollmentrecord',
  'notification_dispatch_logs',
  'notificationdispatchlog',
  'SystemSetting',
  'systemsetting',
  'lms_import',
  'lmsimport',
  'lmsimportsession',
  'notification_email_templates',
  'notificationemailtemplate',
  'notification_trigger_configs',
  'notificationtriggerconfig',
];

// Postgres system / dangerous function prefixes
const DANGEROUS_PATTERNS = [
  /\bpg_read_file\b/i,
  /\bpg_ls_dir\b/i,
  /\bpg_stat_file\b/i,
  /\bcopy\b/i,
  /\blocaltimestamp\b.*into\b/i,
  /lo_import\b/i,
  /lo_export\b/i,
  /\bdblink\b/i,
];

// ─── Per-role additional blocked tables ──────────────────────────────────────

const STUDENT_BLOCKED_TABLES = [
  'message',
  '"Message"',
  'notification',
  '"Notification"',
  'anonymousreport',
  'anonymous_reports',
];

// ─── Public validator ─────────────────────────────────────────────────────────

export type ValidationResult =
  | { safe: true; sql: string }
  | { safe: false; reason: string };

export function validateSQL(rawSql: string, role: string): ValidationResult {
  const sql = rawSql.trim();

  // 1. Must be a SELECT or WITH statement
  if (!/^(select|with)\b/i.test(sql)) {
    return { safe: false, reason: 'Only SELECT or WITH queries are permitted.' };
  }

  // 2. Block write/DDL keywords anywhere in the query
  const WRITE_KEYWORDS = [
    /\binsert\b/i, /\bupdate\b/i, /\bdelete\b/i, /\btruncate\b/i,
    /\bdrop\b/i, /\balter\b/i, /\bcreate\b/i, /\bgrant\b/i,
    /\brevoke\b/i, /\bexec\b/i, /\bexecute\b/i, /\bcall\b/i,
  ];
  for (const kw of WRITE_KEYWORDS) {
    if (kw.test(sql)) {
      return { safe: false, reason: `Query contains a disallowed keyword.` };
    }
  }

  // 3. Block dangerous Postgres functions
  for (const pat of DANGEROUS_PATTERNS) {
    if (pat.test(sql)) {
      return { safe: false, reason: 'Query uses a disallowed database function.' };
    }
  }

  // 4. Block system schema access
  if (/\binformation_schema\b/i.test(sql) || /\bpg_catalog\b/i.test(sql)) {
    return { safe: false, reason: 'Access to system schemas is not permitted.' };
  }

  // 5. Check blocked tables (global)
  const sqlLower = sql.toLowerCase();
  for (const table of BLOCKED_TABLES) {
    if (sqlLower.includes(table.toLowerCase())) {
      return { safe: false, reason: `Access to the "${table}" table is not permitted.` };
    }
  }

  // 6. Role-specific blocks
  if (role === 'student') {
    for (const table of STUDENT_BLOCKED_TABLES) {
      if (sqlLower.includes(table.toLowerCase())) {
        return { safe: false, reason: `Students cannot query the "${table}" table.` };
      }
    }
  }

  // 7. Enforce LIMIT — add one if missing, cap if too large
  const withLimit = enforceLimitClause(sql, role);

  return { safe: true, sql: withLimit };
}

function enforceLimitClause(sql: string, role: string): string {
  const maxRows = role === 'student' ? 100 : 500;

  // If LIMIT already present, cap it
  const limitMatch = sql.match(/\blimit\s+(\d+)\b/i);
  if (limitMatch) {
    const existing = parseInt(limitMatch[1], 10);
    if (existing > maxRows) {
      return sql.replace(/\blimit\s+\d+\b/i, `LIMIT ${maxRows}`);
    }
    return sql;
  }

  // No LIMIT — inject before any trailing semicolons
  const clean = sql.replace(/;+\s*$/, '');
  return `${clean} LIMIT ${maxRows}`;
}
