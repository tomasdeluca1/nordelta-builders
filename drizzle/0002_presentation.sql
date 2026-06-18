-- Presentación de builders + onboarding (additive, idempotent)
-- Campos de la "presentación" rica que cada builder completa antes de la revisión.
ALTER TABLE members ADD COLUMN IF NOT EXISTS neighborhood varchar(100);
ALTER TABLE members ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE members ADD COLUMN IF NOT EXISTS building varchar(280);
ALTER TABLE members ADD COLUMN IF NOT EXISTS linkedin_url varchar(500);
ALTER TABLE members ADD COLUMN IF NOT EXISTS twitter_url varchar(500);
ALTER TABLE members ADD COLUMN IF NOT EXISTS instagram_url varchar(500);
ALTER TABLE members ADD COLUMN IF NOT EXISTS looking_for text[] NOT NULL DEFAULT '{}';
ALTER TABLE members ADD COLUMN IF NOT EXISTS can_help_with varchar(280);

-- Timestamps de control del flujo: presentación enviada y re-enganche de la campaña.
ALTER TABLE members ADD COLUMN IF NOT EXISTS profile_submitted_at timestamptz;
ALTER TABLE members ADD COLUMN IF NOT EXISTS reengaged_at timestamptz;

-- Los ya activos no deben aparecer como "presentación incompleta".
UPDATE members SET profile_submitted_at = created_at
  WHERE status = 'active' AND profile_submitted_at IS NULL;

-- Deadline de la campaña de re-enganche (editable desde el panel de admin).
INSERT INTO app_settings (key, value) VALUES
  ('reengagement_deadline', '')
ON CONFLICT (key) DO NOTHING;
