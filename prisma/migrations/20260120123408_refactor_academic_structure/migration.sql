/*
  Warnings:

  - You are about to drop the column `capacity` on the `Module` table. All the data in the column will be lost.
  - You are about to drop the column `capacity` on the `Specialization` table. All the data in the column will be lost.
  - You are about to drop the column `degree_path_id` on the `Specialization` table. All the data in the column will be lost.
  - You are about to drop the `DegreePath` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `program_id` to the `Specialization` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Specialization" DROP CONSTRAINT "Specialization_degree_path_id_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_degree_path_id_fkey";

-- AlterTable
ALTER TABLE "Module" DROP COLUMN "capacity";

-- AlterTable
ALTER TABLE "Specialization" DROP COLUMN "capacity",
DROP COLUMN "degree_path_id",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "program_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "DegreePath";

-- CreateTable
CREATE TABLE "DegreeProgram" (
    "program_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DegreeProgram_pkey" PRIMARY KEY ("program_id")
);

-- CreateTable
CREATE TABLE "ProgramIntake" (
    "intake_id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "academic_year_id" TEXT NOT NULL,
    "min_students" INTEGER NOT NULL DEFAULT 0,
    "max_students" INTEGER NOT NULL DEFAULT 100,
    "status" TEXT NOT NULL DEFAULT 'OPEN',

    CONSTRAINT "ProgramIntake_pkey" PRIMARY KEY ("intake_id")
);

-- CreateTable
CREATE TABLE "ProgramStructure" (
    "structure_id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "specialization_id" TEXT,
    "module_id" TEXT NOT NULL,
    "semester_id" TEXT,
    "academic_level" TEXT NOT NULL,
    "semester_number" INTEGER NOT NULL,
    "module_type" TEXT NOT NULL,
    "credits" INTEGER,

    CONSTRAINT "ProgramStructure_pkey" PRIMARY KEY ("structure_id")
);

-- CreateTable
CREATE TABLE "StaffAssignment" (
    "assignment_id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "program_id" TEXT,
    "module_id" TEXT,
    "role" TEXT NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "StaffAssignment_pkey" PRIMARY KEY ("assignment_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DegreeProgram_code_key" ON "DegreeProgram"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramIntake_program_id_academic_year_id_key" ON "ProgramIntake"("program_id", "academic_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramStructure_program_id_specialization_id_module_id_key" ON "ProgramStructure"("program_id", "specialization_id", "module_id");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_degree_path_id_fkey" FOREIGN KEY ("degree_path_id") REFERENCES "DegreeProgram"("program_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Specialization" ADD CONSTRAINT "Specialization_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "DegreeProgram"("program_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramIntake" ADD CONSTRAINT "ProgramIntake_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "DegreeProgram"("program_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramIntake" ADD CONSTRAINT "ProgramIntake_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("academic_year_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramStructure" ADD CONSTRAINT "ProgramStructure_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "DegreeProgram"("program_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramStructure" ADD CONSTRAINT "ProgramStructure_specialization_id_fkey" FOREIGN KEY ("specialization_id") REFERENCES "Specialization"("specialization_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramStructure" ADD CONSTRAINT "ProgramStructure_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "Module"("module_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffAssignment" ADD CONSTRAINT "StaffAssignment_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "Staff"("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffAssignment" ADD CONSTRAINT "StaffAssignment_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "DegreeProgram"("program_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffAssignment" ADD CONSTRAINT "StaffAssignment_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "Module"("module_id") ON DELETE SET NULL ON UPDATE CASCADE;
