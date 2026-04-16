-- Add quantitative goal fields and module linkage
ALTER TABLE "AcademicGoal"
ADD COLUMN "goal_type" TEXT NOT NULL DEFAULT 'GPA_TARGET',
ADD COLUMN "metric_unit" TEXT NOT NULL DEFAULT 'GPA',
ADD COLUMN "target_value_number" DOUBLE PRECISION,
ADD COLUMN "baseline_value" DOUBLE PRECISION,
ADD COLUMN "module_id" TEXT;

-- Backfill numeric targets from existing columns
UPDATE "AcademicGoal"
SET
  "goal_type" = CASE
    WHEN "target_class" IS NOT NULL THEN 'GPA_TARGET'
    WHEN "target_gpa" IS NOT NULL THEN 'GPA_TARGET'
    ELSE 'CGPA_IMPROVEMENT'
  END,
  "metric_unit" = CASE
    WHEN "target_class" IS NOT NULL OR "target_gpa" IS NOT NULL THEN 'GPA'
    ELSE 'POINTS'
  END,
  "target_value_number" = CASE
    WHEN "target_gpa" IS NOT NULL THEN "target_gpa"
    WHEN "target_value" ~ '^[0-9]+(\.[0-9]+)?$' THEN ("target_value")::DOUBLE PRECISION
    ELSE NULL
  END,
  "baseline_value" = CASE
    WHEN "target_gpa" IS NOT NULL THEN GREATEST("target_gpa" - 0.3, 0.0)
    ELSE NULL
  END
WHERE "target_value_number" IS NULL;

CREATE INDEX "AcademicGoal_student_id_status_idx" ON "AcademicGoal"("student_id", "status");
CREATE INDEX "AcademicGoal_student_id_goal_type_idx" ON "AcademicGoal"("student_id", "goal_type");

ALTER TABLE "AcademicGoal"
ADD CONSTRAINT "AcademicGoal_module_id_fkey"
FOREIGN KEY ("module_id") REFERENCES "Module"("module_id")
ON DELETE SET NULL ON UPDATE CASCADE;
