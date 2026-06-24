/* eslint-disable */
// Fusiona los outputs de las corridas del workflow de research (piloto + resto)
// en un reporte rankeado y un JSON consolidado. Solo lectura de los outputs.
//
// Uso:
//   node scripts/merge-research-report.js <output1.json> <output2.json> ...
//
// Cada archivo es el .output de una corrida de Workflow ({ result: { assessments } })
// o directamente un array de assessments. Escribe:
//   docs/research/builder-ranking-report.md   (gitignoreado, PII)
//   docs/research/all-assessments.json        (gitignoreado, PII)

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const files = process.argv.slice(2);
if (!files.length) { console.error('Pasá al menos un archivo de output.'); process.exit(1); }

function deEntity(s) {
  return String(s == null ? '' : s)
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

function extract(raw) {
  let j;
  try { j = JSON.parse(raw); } catch (e) { return []; }
  if (Array.isArray(j)) return j;
  if (j.result && Array.isArray(j.result.assessments)) return j.result.assessments;
  if (Array.isArray(j.assessments)) return j.assessments;
  return [];
}

const byId = new Map();
for (const f of files) {
  const items = extract(fs.readFileSync(f, 'utf8'));
  for (const a of items) {
    if (a && typeof a.id === 'number') byId.set(a.id, a); // último gana
  }
}

const all = [...byId.values()].map((a) => ({
  ...a,
  company: deEntity(a.company),
  role: deEntity(a.role),
  startupAssessment: deEntity(a.startupAssessment),
  profileStrength: deEntity(a.profileStrength),
}));
all.sort((x, y) => (y.score || 0) - (x.score || 0));

// JSON consolidado
const jsonOut = path.join(root, 'docs', 'research', 'all-assessments.json');
fs.writeFileSync(jsonOut, JSON.stringify(all, null, 2));

// Reporte markdown
const tierCount = all.reduce((m, a) => ((m[a.tier] = (m[a.tier] || 0) + 1), m), {});
const confCount = all.reduce((m, a) => ((m[a.confidence] = (m[a.confidence] || 0) + 1), m), {});

let md = '';
md += `# Ranking de builders — Reporte completo (${all.length})\n\n`;
md += `> Research web con Sonnet (cap 1 búsqueda + 1-2 fetch/persona). **No commitear** (PII).\n`;
md += `> Gate humano: curá a mano quiénes van al slide del deck.\n\n`;
md += `**Tiers:** A=${tierCount.A || 0} · B=${tierCount.B || 0} · C=${tierCount.C || 0}  ·  `;
md += `**Confianza:** high=${confCount.high || 0} · med=${confCount.med || 0} · low=${confCount.low || 0}\n\n`;

md += `## Ranking\n\n| # | Builder | Empresa | Rol | Score | Tier | Conf |\n|---|---------|---------|-----|------:|:----:|:----:|\n`;
all.forEach((a, i) => {
  const company = (a.company || '—').replace(/\|/g, '/').slice(0, 48);
  const role = (a.role || '—').replace(/\|/g, '/').slice(0, 40);
  md += `| ${i + 1} | ${a.name} | ${company} | ${role} | ${a.score} | ${a.tier} | ${a.confidence} |\n`;
});

md += `\n## Detalle por persona\n\n`;
all.forEach((a, i) => {
  md += `### ${i + 1}. ${a.name} — ${a.company || '—'} — ${a.score} · ${a.tier} · ${a.confidence}\n`;
  md += `**Rol:** ${a.role || '—'} · **Seniority:** ${a.seniority || '—'} · **id:** ${a.id}\n\n`;
  if (a.startupAssessment) md += `**Startup:** ${a.startupAssessment}\n\n`;
  if (a.profileStrength) md += `**Perfil:** ${a.profileStrength}\n\n`;
  if (Array.isArray(a.evidence) && a.evidence.length) md += `**Evidencia:** ${a.evidence.join(' · ')}\n\n`;
  else md += `**Evidencia:** —\n\n`;
});

const mdOut = path.join(root, 'docs', 'research', 'builder-ranking-report.md');
fs.writeFileSync(mdOut, md);

console.log(`Fusionados ${all.length} assessments.`);
console.log(`Tiers: A=${tierCount.A || 0} B=${tierCount.B || 0} C=${tierCount.C || 0} | high=${confCount.high || 0} med=${confCount.med || 0} low=${confCount.low || 0}`);
console.log(`→ ${mdOut}`);
console.log(`→ ${jsonOut}`);
console.log('\nTop 15:');
all.slice(0, 15).forEach((a, i) => console.log(`  ${String(i + 1).padStart(2)}. ${String(a.score).padStart(3)} ${a.tier} ${a.confidence.padEnd(4)} ${a.name} — ${a.company}`));
