-- CreateTable
CREATE TABLE "selection_rounds" (
    "round_id" TEXT NOT NULL,
    "academic_year_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "selection_mode" TEXT NOT NULL DEFAULT 'GPA',
    "opens_at" TIMESTAMP(3),
    "closes_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "selection_rounds_pkey" PRIMARY KEY ("round_id")
);

-- CreateTable
CREATE TABLE "selection_round_configs" (
    "config_id" TEXT NOT NULL,
    "round_id" TEXT NOT NULL,
    "program_id" TEXT,
    "spec_id" TEXT,
    "capacity" INTEGER NOT NULL DEFAULT 50,
    "priority" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "selection_round_configs_pkey" PRIMARY KEY ("config_id")
);

-- CreateTable
CREATE TABLE "selection_applications" (
    "app_id" TEXT NOT NULL,
    "round_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "preference_1" TEXT NOT NULL,
    "preference_2" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "allocated_to" TEXT,
    "waitlist_pos" INTEGER,
    "gpa_at_time" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "selection_applications_pkey" PRIMARY KEY ("app_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "selection_applications_round_id_student_id_key" ON "selection_applications"("round_id", "student_id");

-- CreateIndex
CREATE INDEX "selection_applications_round_id_idx" ON "selection_applications"("round_id");

-- CreateIndex
CREATE INDEX "selection_applications_student_id_idx" ON "selection_applications"("student_id");

-- AddForeignKey
ALTER TABLE "selection_rounds" ADD CONSTRAINT "selection_rounds_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("academic_year_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "selection_round_configs" ADD CONSTRAINT "selection_round_configs_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "selection_rounds"("round_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "selection_round_configs" ADD CONSTRAINT "selection_round_configs_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "DegreeProgram"("program_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "selection_round_configs" ADD CONSTRAINT "selection_round_configs_spec_id_fkey" FOREIGN KEY ("spec_id") REFERENCES "Specialization"("specialization_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "selection_applications" ADD CONSTRAINT "selection_applications_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "selection_rounds"("round_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "selection_applications" ADD CONSTRAINT "selection_applications_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("student_id") ON DELETE RESTRICT ON UPDATE CASCADE;
