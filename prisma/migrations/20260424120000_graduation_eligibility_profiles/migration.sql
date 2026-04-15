-- CreateTable
CREATE TABLE "graduation_eligibility_profiles" (
    "profile_id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "rules" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by_staff_id" TEXT,

    CONSTRAINT "graduation_eligibility_profiles_pkey" PRIMARY KEY ("profile_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "graduation_eligibility_profiles_program_id_key" ON "graduation_eligibility_profiles"("program_id");

-- AddForeignKey
ALTER TABLE "graduation_eligibility_profiles" ADD CONSTRAINT "graduation_eligibility_profiles_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "DegreeProgram"("program_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduation_eligibility_profiles" ADD CONSTRAINT "graduation_eligibility_profiles_updated_by_staff_id_fkey" FOREIGN KEY ("updated_by_staff_id") REFERENCES "Staff"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;
