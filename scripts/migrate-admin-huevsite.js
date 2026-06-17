/* eslint-disable */
// Applies the admin/huevsite/settings migration to the Neon DB (idempotent).
// Usage: node scripts/migrate-admin-huevsite.js
// Requires DATABASE_URL in .env.local (or env).

const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');

function loadDotEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+)\s*$/i);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
}

async function main() {
  loadDotEnv();
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error('Set DATABASE_URL in .env.local');
  const sql = neon(dbUrl);

  console.log('→ Applying additive columns…');
  await sql`ALTER TABLE members ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false`;
  await sql`ALTER TABLE members ADD COLUMN IF NOT EXISTS huevsite_username varchar(80)`;
  await sql`ALTER TABLE members ADD COLUMN IF NOT EXISTS huevsite_approved boolean NOT NULL DEFAULT false`;
  await sql`ALTER TABLE members ADD COLUMN IF NOT EXISTS huevsite_featured boolean NOT NULL DEFAULT false`;

  console.log('→ Ensuring app_settings table…');
  await sql`CREATE TABLE IF NOT EXISTS app_settings (
    key varchar(80) PRIMARY KEY,
    value text,
    updated_at timestamptz NOT NULL DEFAULT now()
  )`;

  console.log('→ Seeding settings…');
  await sql`INSERT INTO app_settings (key, value) VALUES
    ('whatsapp_group_url', 'https://chat.whatsapp.com/BCjkNIAfX5k157xVl28NCT'),
    ('admin_notification_email', 'huevsite.studio@gmail.com'),
    ('huevsite_url', 'https://huevsite.io')
    ON CONFLICT (key) DO NOTHING`;

  console.log('→ Bootstrapping admin (tomasdelucaa@gmail.com)…');
  const adminEmail = (process.env.BOOTSTRAP_ADMIN_EMAIL || 'tomasdelucaa@gmail.com').toLowerCase();
  const res = await sql`UPDATE members SET is_admin = true WHERE lower(email) = ${adminEmail} RETURNING id, email`;
  console.log(res.length ? `  ✓ admin set: ${JSON.stringify(res)}` : `  ⚠ no member with email ${adminEmail}`);

  const settings = await sql`SELECT key, value FROM app_settings ORDER BY key`;
  console.log('→ Settings:', JSON.stringify(settings));
  console.log('✓ Migration done.');
}

main().catch((e) => { console.error('✗', e.message); process.exit(1); });
