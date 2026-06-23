/* eslint-disable */
// Exporta la base activa a un JSON que alimenta el workflow de research de
// builders (subsistema B). Los scripts de Workflow no tocan la DB ni el disco,
// así que este script hace el puente: DB -> docs/research/active-members.json.
//
// NO gasta tokens de API. Sólo lee la base y escribe un archivo.
//
// Uso:
//   node scripts/export-active-members.js                    # todos los activos (no admin)
//   node scripts/export-active-members.js --limit=15         # piloto: primeros 15 por antigüedad
//   node scripts/export-active-members.js --with-links --limit=15  # piloto representativo: con LinkedIn/website
//   node scripts/export-active-members.js --out=ruta.json
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

async function main() {
  loadDotEnv();
  const args = process.argv.slice(2);
  const limitArg = args.find((a) => a.startsWith('--limit='));
  const limit = limitArg ? Math.max(1, parseInt(limitArg.split('=')[1], 10) || 0) : null;
  const withLinks = args.includes('--with-links');
  const outArg = args.find((a) => a.startsWith('--out='));
  const outPath = outArg
    ? path.resolve(process.cwd(), outArg.split('=')[1])
    : path.join(__dirname, '..', 'docs', 'research', 'active-members.json');

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error('Falta DATABASE_URL en .env.local');
  const sql = neon(dbUrl);

  // Orden estable por antigüedad para que el piloto (--limit) sea reproducible.
  // Con --with-links, prioriza los que tienen LinkedIn/website (piloto
  // representativo de la base actual, donde el research rinde mejor).
  const rows = withLinks
    ? await sql`
        SELECT id, name, company, company_url, website_url, linkedin_url,
               role, job_title, bio, building, neighborhood
        FROM members
        WHERE status = 'active' AND is_admin = false
          AND (linkedin_url IS NOT NULL OR website_url IS NOT NULL)
        ORDER BY created_at ASC
      `
    : await sql`
        SELECT id, name, company, company_url, website_url, linkedin_url,
               role, job_title, bio, building, neighborhood
        FROM members
        WHERE status = 'active' AND is_admin = false
        ORDER BY created_at ASC
      `;

  const sliced = limit ? rows.slice(0, limit) : rows;
  const people = sliced.map((r) => ({
    id: r.id,
    name: r.name,
    company: r.company || null,
    companyUrl: r.company_url || null,
    websiteUrl: r.website_url || null,
    linkedinUrl: r.linkedin_url || null,
    role: r.role || null,
    jobTitle: r.job_title || null,
    bio: r.bio || null,
    building: r.building || null,
    neighborhood: r.neighborhood || null,
  }));

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(people, null, 2));
  console.log(`Exportados ${people.length} de ${rows.length} activos → ${outPath}`);
  if (limit) console.log(`(modo piloto: --limit=${limit})`);
}

main().catch((e) => { console.error(e); process.exit(1); });
