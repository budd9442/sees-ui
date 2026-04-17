-- Add advisor contact discoverability fields for messaging flow.
ALTER TABLE "Advisor"
ADD COLUMN "is_available_for_contact" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "specialty_areas" JSONB,
ADD COLUMN "bio" TEXT;
