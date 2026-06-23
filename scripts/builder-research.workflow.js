// Workflow de research de builders (subsistema B).
//
// NO se corre con `node`. Se invoca con la tool Workflow:
//   Workflow({ scriptPath: "scripts/builder-research.workflow.js", args: <people[]> })
// donde <people[]> es el contenido de docs/research/active-members.json
// (generado por scripts/export-active-members.js).
//
// Modo piloto vs completo lo decide CUÁNTA gente trae el JSON: corré el export
// con --limit=15 para el piloto, sin límite para el total. El gasto real de
// tokens del piloto se mide y recién ahí se decide seguir.
//
// Por persona: un agente hace web research acotado (1 búsqueda + 1-2 fetch
// dirigidos sobre LinkedIn / empresa / website) y devuelve un assessment
// validado por schema. Sin señal pública => confidence "low", no inventa.

export const meta = {
  name: 'builder-research',
  description: 'Research web por builder: startup, puesto y qué tan parado está. Ranking con evidencia.',
  whenToUse: 'Subsistema B de Nordelta Tech: evaluar la base activa para el pitch deck. Pasar el JSON de active-members como args.',
  phases: [{ title: 'Research', detail: 'un agente de web research por builder' }],
}

const ASSESSMENT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'name', 'company', 'role', 'seniority', 'startupAssessment', 'profileStrength', 'score', 'tier', 'evidence', 'confidence'],
  properties: {
    id: { type: 'number', description: 'id del builder, copiado tal cual de la entrada' },
    name: { type: 'string' },
    company: { type: 'string', description: 'empresa/proyecto confirmado por la web; "" si no se pudo confirmar' },
    role: { type: 'string', description: 'puesto real (founder/CEO, CTO, dev senior, etc.) según la evidencia' },
    seniority: { type: 'string', enum: ['junior', 'mid', 'senior', 'lead', 'founder', 'unknown'] },
    startupAssessment: { type: 'string', description: '2-4 frases: qué hace la empresa y qué tan buena/tracción tiene, según la web. Sin inventar métricas.' },
    profileStrength: { type: 'string', description: '1-2 frases sobre qué tan fuerte es el perfil profesional (trayectoria, señales públicas).' },
    score: { type: 'number', description: '0-100: qué tan "bien parado" está el perfil+startup según la evidencia.' },
    tier: { type: 'string', enum: ['A', 'B', 'C'], description: 'A=top, B=sólido, C=poca señal/temprano' },
    evidence: { type: 'array', items: { type: 'string' }, description: 'URLs/fuentes concretas que respaldan lo anterior. Vacío si no hubo señal pública.' },
    confidence: { type: 'string', enum: ['low', 'med', 'high'], description: 'qué tan confiable es el assessment según la señal encontrada.' },
  },
}

// args puede llegar como array, como string JSON, o envuelto en { people }.
function coercePeople(a) {
  let v = a
  if (typeof v === 'string') { try { v = JSON.parse(v) } catch (_) { /* noop */ } }
  if (v && !Array.isArray(v) && Array.isArray(v.people)) v = v.people
  return Array.isArray(v) ? v : []
}

const people = coercePeople(args)
if (!people.length) {
  log(`No vino gente en args (typeof=${typeof args}). Pasá el array de active-members.json como args.`)
  return { assessments: [], note: 'empty-input', argsType: typeof args }
}

log(`Research de ${people.length} builders (cap 1 búsqueda + 1-2 fetch por persona).`)

phase('Research')

function promptFor(p) {
  const known = [
    p.company ? `Empresa declarada: ${p.company}` : null,
    p.companyUrl ? `URL empresa: ${p.companyUrl}` : null,
    p.websiteUrl ? `Website: ${p.websiteUrl}` : null,
    p.linkedinUrl ? `LinkedIn: ${p.linkedinUrl}` : null,
    p.role ? `Rol declarado: ${p.role}` : null,
    p.jobTitle ? `Job title: ${p.jobTitle}` : null,
    p.building ? `Construye: ${p.building}` : null,
    p.bio ? `Bio: ${p.bio}` : null,
  ].filter(Boolean).join('\n')

  return `Sos un analista evaluando el perfil profesional de un miembro de Nordelta Tech (comunidad tech de zona norte, Buenos Aires) para un pitch deck a sponsors/inversores.

Builder a evaluar (id ${p.id}): ${p.name}
${known || '(sin datos declarados más allá del nombre)'}

Tarea: con web research ACOTADO, determiná quién es, qué startup/proyecto tiene, qué puesto ocupa y qué tan bien parado está su perfil + su empresa.

Reglas de costo y rigor (importantes):
- Cargá WebSearch y WebFetch con ToolSearch ("select:WebSearch,WebFetch") antes de usarlas.
- Máximo 1 búsqueda web + 1 o 2 fetch DIRIGIDOS (priorizá LinkedIn declarado, sino la web/empresa declarada). No explores de más.
- NO inventes métricas, rondas, ni cargos. Cada afirmación fuerte va respaldada en "evidence" con la URL/fuente. Si no hay señal pública confiable, devolvé confidence:"low", company:"" y un score conservador. No rellenes.
- "score" 0-100 y "tier" reflejan evidencia real, no optimismo.

Devolvé EXACTAMENTE el objeto del schema (la tool StructuredOutput), con id=${p.id} y name="${p.name}".`
}

const assessments = await pipeline(
  people,
  (p) => agent(promptFor(p), {
    label: `research:${p.name}`,
    phase: 'Research',
    schema: ASSESSMENT_SCHEMA,
    model: 'sonnet',
  }),
)

const clean = assessments.filter(Boolean)
const ranked = clean.slice().sort((a, b) => (b.score || 0) - (a.score || 0))

log(`Listos ${clean.length}/${people.length} assessments.`)

return {
  count: clean.length,
  requested: people.length,
  assessments: ranked,
}
