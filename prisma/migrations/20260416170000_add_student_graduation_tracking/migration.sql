-- Add explicit graduation lifecycle fields on students.
ALTER TABLE "Student"
ADD COLUMN "graduation_status" TEXT NOT NULL DEFAULT 'NOT_GRADUATED',
ADD COLUMN "graduated_at" TIMESTAMP(3);
