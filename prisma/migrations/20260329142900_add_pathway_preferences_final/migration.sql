-- AlterTable
ALTER TABLE "AcademicGoal" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'academic',
ADD COLUMN     "deadline" TIMESTAMP(3),
ADD COLUMN     "description" TEXT,
ADD COLUMN     "milestones" TEXT[],
ADD COLUMN     "priority" TEXT NOT NULL DEFAULT 'medium',
ADD COLUMN     "progress" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
ADD COLUMN     "target_value" TEXT,
ADD COLUMN     "title" TEXT NOT NULL DEFAULT 'Academic Goal',
ALTER COLUMN "target_gpa" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "pathway_locked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pathway_preference_1_id" TEXT,
ADD COLUMN     "pathway_preference_2_id" TEXT,
ADD COLUMN     "pathway_selection_date" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "address" TEXT,
ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "emergency_contact" TEXT,
ADD COLUMN     "github" TEXT,
ADD COLUMN     "linkedin" TEXT,
ADD COLUMN     "phone" TEXT;

-- CreateTable
CREATE TABLE "Internship" (
    "internship_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'applied',
    "supervisor_name" TEXT,
    "supervisor_email" TEXT,
    "supervisor_phone" TEXT,
    "description" TEXT,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Internship_pkey" PRIMARY KEY ("internship_id")
);

-- CreateTable
CREATE TABLE "InternshipMilestone" (
    "milestone_id" TEXT NOT NULL,
    "internship_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "due_date" TIMESTAMP(3) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_date" TIMESTAMP(3),

    CONSTRAINT "InternshipMilestone_pkey" PRIMARY KEY ("milestone_id")
);

-- CreateTable
CREATE TABLE "InternshipDocument" (
    "document_id" TEXT NOT NULL,
    "internship_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InternshipDocument_pkey" PRIMARY KEY ("document_id")
);

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_pathway_preference_1_id_fkey" FOREIGN KEY ("pathway_preference_1_id") REFERENCES "DegreeProgram"("program_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_pathway_preference_2_id_fkey" FOREIGN KEY ("pathway_preference_2_id") REFERENCES "DegreeProgram"("program_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Internship" ADD CONSTRAINT "Internship_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternshipMilestone" ADD CONSTRAINT "InternshipMilestone_internship_id_fkey" FOREIGN KEY ("internship_id") REFERENCES "Internship"("internship_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternshipDocument" ADD CONSTRAINT "InternshipDocument_internship_id_fkey" FOREIGN KEY ("internship_id") REFERENCES "Internship"("internship_id") ON DELETE CASCADE ON UPDATE CASCADE;
