/* eslint-disable */
// Genera un workflow self-contained para el research de builders, con la gente
// embebida como literal. Existe porque el global `args` del runtime de Workflow
// no llega al script en este entorno; embeber los datos lo hace robusto.
//
// NO gasta tokens. Lee el JSON exportado + el template y escribe el run file
// (gitignoreado, porque lleva PII).
//
// Uso:
//   node scripts/export-active-members.js --with-links --limit=15
//   node scripts/build-research-run.js
//   -> luego: Workflow({ scriptPath: "docs/research/builder-research.run.js" })

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const templatePath = path.join(root, 'scripts', 'builder-research.workflow.js');
const dataPath = path.join(root, 'docs', 'research', 'active-members.json');
const outPath = path.join(root, 'docs', 'research', 'builder-research.run.js');

const template = fs.readFileSync(templatePath, 'utf8');
const people = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
if (!Array.isArray(people) || !people.length) {
  throw new Error(`No hay gente en ${dataPath}. Corré primero export-active-members.js`);
}

// Reemplaza la lectura de args por el literal embebido.
const needle = 'const people = coercePeople(args)';
if (!template.includes(needle)) {
  throw new Error(`No encontré la línea a reemplazar ("${needle}") en el template.`);
}
const banner = `// GENERADO por scripts/build-research-run.js — NO editar a mano. Contiene PII (gitignoreado).\n`;
const out = banner + template.replace(needle, `const people = ${JSON.stringify(people)}`);

fs.writeFileSync(outPath, out);
console.log(`Run file generado con ${people.length} builders → ${outPath}`);
