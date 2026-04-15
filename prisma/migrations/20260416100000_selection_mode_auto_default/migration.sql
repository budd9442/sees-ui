-- Default new selection rounds to AUTO (capacity-triggered GPA vs FIFO).
ALTER TABLE "selection_rounds" ALTER COLUMN "selection_mode" SET DEFAULT 'AUTO';
