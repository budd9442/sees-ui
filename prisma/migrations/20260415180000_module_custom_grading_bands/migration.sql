-- Optional per-module grading band override (null = institution active scheme)
ALTER TABLE "Module" ADD COLUMN IF NOT EXISTS "custom_grading_bands" JSONB;
