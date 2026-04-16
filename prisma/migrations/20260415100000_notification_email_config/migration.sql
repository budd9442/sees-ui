-- CreateTable
CREATE TABLE "notification_email_templates" (
    "template_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "event_key" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "placeholders" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "channel" TEXT NOT NULL DEFAULT 'email',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_email_templates_pkey" PRIMARY KEY ("template_id")
);

-- CreateTable
CREATE TABLE "notification_trigger_configs" (
    "config_id" TEXT NOT NULL,
    "event_key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "config_json" JSONB,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_trigger_configs_pkey" PRIMARY KEY ("config_id")
);

-- CreateTable
CREATE TABLE "notification_dispatch_logs" (
    "log_id" TEXT NOT NULL,
    "dedupe_key" TEXT NOT NULL,
    "event_key" TEXT NOT NULL,
    "recipient_email" TEXT NOT NULL,
    "recipient_user_id" TEXT,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "status" TEXT NOT NULL,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_dispatch_logs_pkey" PRIMARY KEY ("log_id")
);

-- CreateIndex
CREATE INDEX "notification_email_templates_event_key_idx" ON "notification_email_templates"("event_key");

-- CreateIndex
CREATE UNIQUE INDEX "notification_trigger_configs_event_key_key" ON "notification_trigger_configs"("event_key");

-- CreateIndex
CREATE UNIQUE INDEX "notification_dispatch_logs_dedupe_key_key" ON "notification_dispatch_logs"("dedupe_key");

-- CreateIndex
CREATE INDEX "notification_dispatch_logs_event_key_created_at_idx" ON "notification_dispatch_logs"("event_key", "created_at");
