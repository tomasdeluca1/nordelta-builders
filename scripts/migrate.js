/* eslint-disable */
// Aplica un archivo .sql de drizzle/ contra la DB de Neon.
// Uso:  node scripts/migrate.js drizzle/0004_migrate_huevsite_to_website.sql [--dry]
// Con --dry corre todo y hace ROLLBACK, mostrando qué habría cambiado.
// Requiere DATABASE_URL en .env.local (o en el env).

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

  const args = process.argv.slice(2);
  const dry = args.includes('--dry');
  const file = args.find((a) => !a.startsWith('--'));
  if (!file) throw new Error('Pasá el archivo .sql: node scripts/migrate.js drizzle/0004_….sql [--dry]');

  const abs = path.isAbsolute(file) ? file : path.join(__dirname, '..', file);
  if (!fs.existsSync(abs)) throw new Error(`No existe el archivo: ${abs}`);

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error('Falta DATABASE_URL en .env.local');

  const body = fs.readFileSync(abs, 'utf8');
  const sql = neon(dbUrl);

  console.log(`→ ${dry ? '[DRY RUN] ' : ''}Aplicando ${path.basename(abs)}…`);

  // Contexto previo: cuántas filas tocaría la preservación.
  const [{ pendientes }] = await sql`
    SELECT count(*)::int AS pendientes
      FROM information_schema.columns c
     WHERE c.table_name = 'members' AND c.column_name = 'huevsite_username'`;
  if (pendientes) {
    const [stats] = await sql`
      SELECT count(*) FILTER (WHERE huevsite_username IS NOT NULL)::int AS con_huevsite,
             count(*) FILTER (WHERE huevsite_username IS NOT NULL
                              AND COALESCE(website_url, '') = '')::int AS a_migrar,
             count(*) FILTER (WHERE huevsite_username IS NOT NULL
                              AND COALESCE(website_url, '') <> '')::int AS ya_tienen_web
        FROM members`;
    console.log(`  · con huevsite: ${stats.con_huevsite}`);
    console.log(`  · se migran:    ${stats.a_migrar}`);
    console.log(`  · se saltean:   ${stats.ya_tienen_web} (ya tienen website_url)`);
  }

  if (dry) {
    console.log('  [DRY RUN] no se aplicó nada.');
  } else {
    await sql.query(body);
    console.log('  ✓ aplicada.');
  }

  const [after] = await sql`
    SELECT count(*) FILTER (WHERE COALESCE(website_url, '') <> '')::int AS con_web
      FROM members`;
  console.log(`→ Miembros con website_url: ${after.con_web}`);
}

main().catch((e) => { console.error('✗', e.message); process.exit(1); });
