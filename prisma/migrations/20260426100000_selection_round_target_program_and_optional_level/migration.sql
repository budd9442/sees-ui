-- AlterTable
ALTER TABLE "selection_rounds"
ADD COLUMN "target_program_id" TEXT,
ALTER COLUMN "level" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "selection_rounds_target_program_id_idx" ON "selection_rounds"("target_program_id");

-- AddForeignKey
ALTER TABLE "selection_rounds"
ADD CONSTRAINT "selection_rounds_target_program_id_fkey"
FOREIGN KEY ("target_program_id") REFERENCES "DegreeProgram"("program_id")
ON DELETE SET NULL ON UPDATE CASCADE;
