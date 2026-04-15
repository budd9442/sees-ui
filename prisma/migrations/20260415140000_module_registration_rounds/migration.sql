-- CreateTable
CREATE TABLE "module_registration_rounds" (
    "round_id" TEXT NOT NULL,
    "academic_year_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "opens_at" TIMESTAMP(3),
    "closes_at" TIMESTAMP(3),
    "levels" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "student_message" TEXT,
    "features" JSONB,
    "finalized_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "module_registration_rounds_pkey" PRIMARY KEY ("round_id")
);

CREATE INDEX "module_registration_rounds_academic_year_id_idx" ON "module_registration_rounds"("academic_year_id");
CREATE INDEX "module_registration_rounds_status_idx" ON "module_registration_rounds"("status");

ALTER TABLE "module_registration_rounds" ADD CONSTRAINT "module_registration_rounds_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("academic_year_id") ON DELETE CASCADE ON UPDATE CASCADE;
