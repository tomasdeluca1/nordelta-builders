/* eslint-disable */
// Seed initial founder members into Neon Postgres.
// Usage:
//   DATABASE_URL=... node scripts/seed.js
//
// Idempotent: upserts by email. Each seed user gets a random temp password.

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { neon } = require('@neondatabase/serverless');

function loadDotEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+)\s*$/i);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
}

function slugifyName(name) {
  return (name || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
function defaultPasswordFor(name) {
  const slug = slugifyName(name) || 'builder';
  return `${slug}.nordelta.tech`;
}

const MEMBERS = [
  {
    name: 'Tomás Deluca',
    email: 'tomasdelucaa@gmail.com',
    initials: 'TD',
    role: 'Negocio / Fundación',
    jobTitle: 'Founder',
    company: 'huevsite.io',
    companyUrl: 'https://huevsite.io',
    tags: ['Founder', 'Builder'],
    colorIndex: 0,
  },
  {
    name: 'Lucas Argento',
    email: 'lucas@trysupplai.com',
    initials: 'LA',
    role: 'Negocio / Fundación',
    jobTitle: 'Founder',
    company: 'trysupplai.com',
    companyUrl: 'https://trysupplai.com',
    tags: ['AI', 'Founder'],
    colorIndex: 1,
  },
];

async function main() {
  loadDotEnv();
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('Missing DATABASE_URL');
  const sql = neon(url);

  const credentials = [];
  for (const m of MEMBERS) {
    const tempPwd = defaultPasswordFor(m.name);
    const hash = await bcrypt.hash(tempPwd, 10);
    const existing = await sql`SELECT id FROM members WHERE email = ${m.email} LIMIT 1`;
    if (existing.length) {
      await sql`
        UPDATE members SET
          name = ${m.name}, initials = ${m.initials}, role = ${m.role},
          job_title = ${m.jobTitle}, company = ${m.company}, company_url = ${m.companyUrl},
          tags = ${m.tags}, color_index = ${m.colorIndex}, updated_at = now()
        WHERE email = ${m.email}
      `;
      console.log(`✓ Updated: ${m.name}`);
    } else {
      await sql`
        INSERT INTO members (name, email, password_hash, must_change_password, initials, role, job_title, company, company_url, tags, color_index)
        VALUES (${m.name}, ${m.email}, ${hash}, true, ${m.initials}, ${m.role}, ${m.jobTitle}, ${m.company}, ${m.companyUrl}, ${m.tags}, ${m.colorIndex})
      `;
      credentials.push({ email: m.email, password: tempPwd });
      console.log(`✓ Inserted: ${m.name}`);
    }
  }

  if (credentials.length) {
    console.log('\nTemporary passwords (share securely):');
    for (const c of credentials) console.log(`  ${c.email} → ${c.password}`);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
