-- CreateTable
CREATE TABLE "StudentAIFeedbackSnapshot" (
    "snapshot_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "feedback_json" JSONB NOT NULL,
    "prompt_context_hash" TEXT NOT NULL,
    "gpa_at_generation" DOUBLE PRECISION NOT NULL,
    "transcript_fingerprint" TEXT NOT NULL,
    "latest_released_grade_at" TIMESTAMP(3),
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "source_version" TEXT NOT NULL DEFAULT 'v1',
    "status" TEXT NOT NULL DEFAULT 'READY',
    "error_message" TEXT,
    "invalidation_reason" TEXT,

    CONSTRAINT "StudentAIFeedbackSnapshot_pkey" PRIMARY KEY ("snapshot_id")
);

-- AddForeignKey
ALTER TABLE "StudentAIFeedbackSnapshot"
ADD CONSTRAINT "StudentAIFeedbackSnapshot_student_id_fkey"
FOREIGN KEY ("student_id")
REFERENCES "Student"("student_id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "StudentAIFeedbackSnapshot_student_id_generated_at_idx"
ON "StudentAIFeedbackSnapshot"("student_id", "generated_at");

-- CreateIndex
CREATE INDEX "StudentAIFeedbackSnapshot_student_id_expires_at_idx"
ON "StudentAIFeedbackSnapshot"("student_id", "expires_at");
