-- Create audit_logs for unified logging (auth, email, staff, admin).
CREATE TABLE "audit_logs" (
    "log_id" TEXT NOT NULL,
    "admin_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "old_value" TEXT,
    "new_value" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" TEXT NOT NULL DEFAULT 'ADMIN',
    "metadata" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("log_id")
);

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");
CREATE INDEX "audit_logs_admin_id_idx" ON "audit_logs"("admin_id");
CREATE INDEX "audit_logs_category_idx" ON "audit_logs"("category");
