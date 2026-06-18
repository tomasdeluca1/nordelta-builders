-- "Otro website" (URL libre, distinta del huevsite) — aditiva, idempotente.
ALTER TABLE members ADD COLUMN IF NOT EXISTS website_url varchar(500);
