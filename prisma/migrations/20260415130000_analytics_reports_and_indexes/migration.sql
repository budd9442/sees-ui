-- Analytics saved reports
CREATE TABLE "analytics_reports" (
    "report_id" TEXT NOT NULL,
    "owner_user_id" TEXT NOT NULL,
    "scope_role" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "definition" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analytics_reports_pkey" PRIMARY KEY ("report_id")
);

CREATE INDEX "analytics_reports_owner_user_id_idx" ON "analytics_reports"("owner_user_id");
CREATE INDEX "analytics_reports_scope_role_idx" ON "analytics_reports"("scope_role");

ALTER TABLE "analytics_reports" ADD CONSTRAINT "analytics_reports_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Hot-path indexes for analytics queries
CREATE INDEX IF NOT EXISTS "GPAHistory_calculation_date_idx" ON "GPAHistory"("calculation_date");
CREATE INDEX IF NOT EXISTS "Grade_released_at_idx" ON "Grade"("released_at");
CREATE INDEX IF NOT EXISTS "ModuleRegistration_semester_id_status_idx" ON "ModuleRegistration"("semester_id", "status");
