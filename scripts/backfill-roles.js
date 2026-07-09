/* eslint-disable */
// Backfill 2026-07: remapea los roles viejos a las funciones nuevas
// (role = área; el cargo vive en job_title y NO se toca acá).
//
// SEGURIDAD: por defecto es DRY-RUN (no escribe). Agregá --apply para escribir.
// Idempotente: sólo actualiza filas cuyo role esté en el mapa viejo.
//
// Uso:
//   node scripts/backfill-roles.js          # preview de cuántas filas cambiarían
//   node scripts/backfill-roles.js --apply  # aplica el remapeo
//
// Requiere DATABASE_URL en .env.local.

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

const ROLE_MAP = {
  'Founder/CEO':        'Negocio / Fundación',
  'Developer/Engineer': 'Tecnología',
  'Product/Design':     'Producto / Diseño',
  'Marketing/Growth':   'Marketing / Growth',
  'Inversor':           'Inversión',
  // 'Otro' queda igual.
};

async function main() {
  loadDotEnv();
  if (!process.env.DATABASE_URL) {
    console.error('Falta DATABASE_URL en .env.local');
    process.exit(1);
  }
  const apply = process.argv.includes('--apply');
  const sql = neon(process.env.DATABASE_URL);

  const rows = await sql`SELECT role, count(*)::int AS n FROM members GROUP BY role ORDER BY n DESC`;
  console.log('Distribución actual de roles:');
  for (const r of rows) console.log(`  ${String(r.n).padStart(4)}  ${r.role}`);

  let total = 0;
  for (const [from, to] of Object.entries(ROLE_MAP)) {
    const [{ n }] = await sql`SELECT count(*)::int AS n FROM members WHERE role = ${from}`;
    if (!n) continue;
    total += n;
    if (apply) {
      await sql`UPDATE members SET role = ${to}, updated_at = now() WHERE role = ${from}`;
      console.log(`✓ ${n} × "${from}" → "${to}"`);
    } else {
      console.log(`(dry-run) ${n} × "${from}" → "${to}"`);
    }
  }

  console.log(apply ? `Listo: ${total} filas actualizadas.` : `Dry-run: ${total} filas cambiarían. Corré con --apply para escribir.`);
}

main().catch((err) => { console.error(err); process.exit(1); });
