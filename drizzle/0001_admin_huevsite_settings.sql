-- Admin + huevsite + settings (additive, idempotent)
ALTER TABLE members ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;
ALTER TABLE members ADD COLUMN IF NOT EXISTS huevsite_username varchar(80);
ALTER TABLE members ADD COLUMN IF NOT EXISTS huevsite_approved boolean NOT NULL DEFAULT false;
ALTER TABLE members ADD COLUMN IF NOT EXISTS huevsite_featured boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS app_settings (
  key varchar(80) PRIMARY KEY,
  value text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO app_settings (key, value) VALUES
  ('whatsapp_group_url', 'https://chat.whatsapp.com/BCjkNIAfX5k157xVl28NCT'),
  ('admin_notification_email', 'huevsite.studio@gmail.com'),
  ('huevsite_url', 'https://huevsite.io')
ON CONFLICT (key) DO NOTHING;

UPDATE members SET is_admin = true WHERE lower(email) = 'tomasdelucaa@gmail.com';
