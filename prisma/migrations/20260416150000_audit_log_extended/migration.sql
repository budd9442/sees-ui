-- Extend audit_logs for unified logging (auth, email, staff, admin).
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "category" TEXT NOT NULL DEFAULT 'ADMIN';
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "metadata" JSONB;
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "ip_address" TEXT;
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "user_agent" TEXT;

ALTER TABLE "audit_logs" ALTER COLUMN "admin_id" DROP NOT NULL;

CREATE INDEX IF NOT EXISTS "audit_logs_category_idx" ON "audit_logs"("category");
