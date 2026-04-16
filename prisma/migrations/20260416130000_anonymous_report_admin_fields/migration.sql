-- AlterTable
ALTER TABLE "AnonymousReport" ADD COLUMN "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "AnonymousReport" ADD COLUMN "admin_notes" TEXT;
ALTER TABLE "AnonymousReport" ADD COLUMN "assigned_to" TEXT;
