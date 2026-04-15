-- Improve inbox and thread queries for direct messages
CREATE INDEX IF NOT EXISTS "Message_recipient_id_read_at_idx" ON "Message" ("recipient_id", "read_at");
CREATE INDEX IF NOT EXISTS "Message_recipient_id_sent_at_idx" ON "Message" ("recipient_id", "sent_at");
CREATE INDEX IF NOT EXISTS "Message_sender_id_sent_at_idx" ON "Message" ("sender_id", "sent_at");
