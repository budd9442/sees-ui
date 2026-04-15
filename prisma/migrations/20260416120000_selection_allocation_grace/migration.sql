-- AlterTable
ALTER TABLE "selection_rounds" ADD COLUMN "allocation_change_grace_days" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "selection_allocation_change_requests" (
    "request_id" TEXT NOT NULL,
    "round_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "requested_preference_1" TEXT NOT NULL,
    "requested_preference_2" TEXT,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),
    "resolved_by_user_id" TEXT,

    CONSTRAINT "selection_allocation_change_requests_pkey" PRIMARY KEY ("request_id")
);

-- CreateIndex
CREATE INDEX "selection_allocation_change_requests_round_id_idx" ON "selection_allocation_change_requests"("round_id");

-- CreateIndex
CREATE INDEX "selection_allocation_change_requests_student_id_idx" ON "selection_allocation_change_requests"("student_id");

-- CreateIndex
CREATE INDEX "selection_allocation_change_requests_status_idx" ON "selection_allocation_change_requests"("status");

-- AddForeignKey
ALTER TABLE "selection_allocation_change_requests" ADD CONSTRAINT "selection_allocation_change_requests_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "selection_rounds"("round_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "selection_allocation_change_requests" ADD CONSTRAINT "selection_allocation_change_requests_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "selection_allocation_change_requests" ADD CONSTRAINT "selection_allocation_change_requests_resolved_by_user_id_fkey" FOREIGN KEY ("resolved_by_user_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
