/* eslint-disable */
// Aplica un archivo .sql de drizzle/ contra la DB de Neon.
// Uso:  node scripts/migrate.js drizzle/0004_migrate_huevsite_to_website.sql [--dry]
// Con --dry no aplica el archivo (el resto de los chequeos igual corre contra la DB).
//   IMPORTANTE: --dry no valida la sintaxis del SQL — los errores aparecen solo al correr de verdad.
// Con npm run, los argumentos van DESPUÉS de `--`, si no npm se los come en silencio:
//   npm run migrate -- drizzle/0004_migrate_huevsite_to_website.sql --dry   (correcto)
//   npm run migrate drizzle/0004_migrate_huevsite_to_website.sql --dry     (¡--dry se pierde, corre en serio!)
// Cualquier flag que no sea exactamente --dry aborta (--dry-run, --dryrun, --DRY, etc. NO son
// equivalentes: se ignoraban en silencio y la migración se aplicaba de verdad).
// El archivo .sql debe contener UNA sola sentencia top-level (el driver de Neon no soporta transacciones).
//   Múltiples sentencias se envuelven en un bloque: DO $$ ... sentencias ... END $$;
// Requiere DATABASE_URL en .env.local (o en el env).

const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');

const USAGE = 'Uso: node scripts/migrate.js <archivo.sql> [--dry]  (con npm run: npm run migrate -- <archivo.sql> [--dry])';

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

  const unknownFlags = args.filter((a) => a.startsWith('--') && a !== '--dry');
  if (unknownFlags.length) {
    throw new Error(`Flag(s) no reconocidos: ${unknownFlags.join(', ')}. ${USAGE}`);
  }

  const dry = args.includes('--dry');
  const file = args.find((a) => !a.startsWith('--'));
  if (!file) throw new Error(`Pasá el archivo .sql. ${USAGE}`);

  const abs = path.isAbsolute(file) ? file : path.join(__dirname, '..', file);
  if (!fs.existsSync(abs)) throw new Error(`No existe el archivo: ${abs}`);

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error('Falta DATABASE_URL en .env.local');

  const body = fs.readFileSync(abs, 'utf8');
  const sql = neon(dbUrl);

  console.log(`→ ${dry ? '[DRY RUN] ' : ''}Aplicando ${path.basename(abs)}…`);

  // Este reporte es específico de la migración de preservación (0004): cuenta
  // cuántas filas tocaría el UPDATE. Se imprime SOLO cuando el archivo que se
  // está corriendo es efectivamente ese, identificado por nombre — así un
  // --dry sobre 0005 (que dropea las columnas) nunca muestra un informe de
  // "se migran / se saltean" que no tiene nada que ver con un DROP.
  const isPreservationMigration = path.basename(abs) === '0004_migrate_huevsite_to_website.sql';

  if (isPreservationMigration) {
    const [{ pendientes }] = await sql`
      SELECT count(*)::int AS pendientes
        FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'members' AND column_name = 'huevsite_username'`;
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
  }

  if (dry) {
    console.log('  [DRY RUN] no se aplicó nada.');
  } else {
    await sql.query(body);
    console.log('  ✓ aplicada.');
  }

  // Chequeo posterior, informativo. Va en su propio try/catch: si la migración
  // de arriba ya se aplicó, un fallo acá NO debe reportarse como fracaso de la
  // migración ni pisar el exit code de éxito.
  try {
    const [after] = await sql`
      SELECT count(*) FILTER (WHERE COALESCE(website_url, '') <> '')::int AS con_web
        FROM members`;
    console.log(`→ Miembros con website_url: ${after.con_web}`);
  } catch (e) {
    const prefix = dry
      ? 'El dry run terminó sin aplicar nada, pero el chequeo posterior falló'
      : 'La migración se aplicó, pero el chequeo posterior falló';
    console.error(`⚠ ${prefix}: ${e.message}`);
  }
}

main().catch((e) => { console.error('✗', e.message); process.exit(1); });
