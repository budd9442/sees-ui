-- Non-GPA modules (e.g. co-curricular GNCT) excluded from GPA numerator and denominator
ALTER TABLE "Module" ADD COLUMN "counts_toward_gpa" BOOLEAN NOT NULL DEFAULT true;

UPDATE "Module" SET "counts_toward_gpa" = false WHERE "code" LIKE 'GNCT%';
