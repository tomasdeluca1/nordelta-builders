/* eslint-disable */
// Connects + approves the huevsite of specific Nordelta members so their card
// shows on the landing. Each handle is validated against the public huevsite API
// before writing. Idempotent.
//
// Usage:  node scripts/connect-huevsites.js [--dry]
// Requires DATABASE_URL in .env.local.

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

// email (the member row to target) -> huevsite username (provided by the admin)
const MAP = [
  { email: 'lucasargento7@gmail.com',  username: 'lucasargento' },   // Lucas Argento
  { email: 'patopiturraspe@gmail.com', username: 'pato-iturraspe' }, // Patricio Iturraspe
  { email: 'nicolomanto@gmail.com',    username: 'nlomanto' },       // Nicolas Lomanto
  { email: 'agusvrancic@gmail.com',    username: 'agustin' },        // Agustin Vrancic
  { email: 'joacomarilm@gmail.com',    username: 'joacomaril' },     // Joaquin Maril
  { email: 'juandovzak@gmail.com',     username: 'kazdov' },         // Juan Cruz Dovzak
];

const HUEVSITE = process.env.HUEVSITE_URL || 'https://huevsite.io';

async function validate(username) {
  try {
    const res = await fetch(`${HUEVSITE}/api/public/profile/${encodeURIComponent(username)}`, {
      headers: { accept: 'application/json' },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function main() {
  loadDotEnv();
  const dry = process.argv.includes('--dry');
  if (!process.env.DATABASE_URL) throw new Error('Set DATABASE_URL in .env.local');
  const sql = neon(process.env.DATABASE_URL);

  for (const { email, username } of MAP) {
    const profile = await validate(username);
    if (!profile) {
      console.log(`  ✗ @${username} no existe en huevsite — salteado (${email})`);
      continue;
    }
    if (dry) {
      console.log(`  • [dry] ${email} -> @${username} (${profile.name}, score ${profile.builderScore})`);
      continue;
    }
    const r = await sql`
      UPDATE members SET huevsite_username=${username}, huevsite_approved=true, updated_at=now()
      WHERE lower(email)=${email.toLowerCase()}
      RETURNING id, name`;
    console.log(r.length
      ? `  ✓ ${r[0].name} (id ${r[0].id}) -> @${username} aprobado`
      : `  ⚠ no hay miembro con email ${email}`);
  }

  const all = await sql`SELECT id, name, huevsite_username FROM members WHERE huevsite_approved=true AND huevsite_username IS NOT NULL ORDER BY id`;
  console.log(`\n→ Huevsites aprobados (${all.length}):`);
  for (const m of all) console.log(`   id=${m.id} ${m.name} -> @${m.huevsite_username}`);
}

main().catch((e) => { console.error('✗', e.message); process.exit(1); });
