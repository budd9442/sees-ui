-- Add student onboarding metadata storage and completion marker.
ALTER TABLE "Student"
ADD COLUMN "metadata" JSONB,
ADD COLUMN "onboarding_completed_at" TIMESTAMP(3);
