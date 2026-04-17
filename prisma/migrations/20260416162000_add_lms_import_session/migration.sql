-- CreateTable
CREATE TABLE "LmsImportSession" (
    "session_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "stage" TEXT NOT NULL DEFAULT 'LOGIN',
    "progress_pct" INTEGER NOT NULL DEFAULT 0,
    "preview_json" JSONB,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LmsImportSession_pkey" PRIMARY KEY ("session_id")
);

-- AddForeignKey
ALTER TABLE "LmsImportSession"
ADD CONSTRAINT "LmsImportSession_student_id_fkey"
FOREIGN KEY ("student_id")
REFERENCES "Student"("student_id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "LmsImportSession_student_id_created_at_idx"
ON "LmsImportSession"("student_id", "created_at");

