# Research y ranking de builders — Plan de implementación

> **For agentic workers:** plan tarea por tarea. La Tarea 2 (correr el piloto) es
> el **gate de gasto**: no se ejecuta sin OK explícito del usuario. El resto es
> sin costo (construir maquinaria) o post-gate (curación + slide).

**Goal:** Evaluar la base activa con web research (Sonnet), producir un ranking
con evidencia para revisión humana, y representar al subconjunto curado en el
pitch deck (avatar + nombre + rol + empresa).

**Architecture:** Export DB→JSON (script Node) → workflow multi-agente de research
→ reporte markdown (gate humano) → módulo curado `lib/builder-ranking.ts` → slide
nuevo en el deck. Las piezas están desacopladas; el gasto está aislado en la
corrida del workflow.

**Tech Stack:** Node + @neondatabase/serverless (export), Workflow tool con
agentes Sonnet 4.6 + WebSearch/WebFetch, Next.js (slide del deck).

## Global Constraints
- Voz: rioplatense, sobria, números antes que adjetivos; sin clichés AI.
- No inventar métricas/cargos: toda afirmación va con evidencia (URL). Sin señal
  → confidence "low", no se rellena.
- PII generada (JSON de entrada, reporte) **no se commitea** (`docs/research/.gitignore`).
- El deck featurea sólo gente ya pública en la landing; sin scores públicos.

---

## Task B1: Export de la base + workflow (CONSTRUIDO)

**Estado:** hecho en este mismo commit. Archivos:
- `scripts/export-active-members.js` — DB → `docs/research/active-members.json`
  (`--limit=N` para piloto, `--out=` para ruta custom). No gasta tokens.
- `scripts/builder-research.workflow.js` — workflow: por persona, un agente de
  web research acotado (cap 1 búsqueda + 1-2 fetch) que devuelve un assessment
  validado por schema (`{ id, name, company, role, seniority, startupAssessment,
  profileStrength, score, tier, evidence[], confidence }`).

**Verificación (sin costo):**
- [ ] `node scripts/export-active-members.js --limit=15` genera el JSON con 15
  entradas y los campos esperados.

---

## Task B2: Piloto de 15 — GATE DE GASTO

**No ejecutar sin OK explícito del usuario.**

- [ ] **Step 1:** `node scripts/export-active-members.js --limit=15`
- [ ] **Step 2:** Leer el JSON e invocar el workflow:
  `Workflow({ scriptPath: "scripts/builder-research.workflow.js", args: <contenido del JSON> })`
- [ ] **Step 3:** Medir el consumo real (tokens) de la corrida de 15 y
  **extrapolar** el costo de los ~145 restantes. Reportarlo al usuario.
- [ ] **Step 4:** GATE — el usuario decide: seguir con el total, hacerlo en
  tandas, o cortar acá.

---

## Task B3: Research completo (post-gate, opcional)

Sólo si el usuario aprueba tras el piloto.
- [ ] `node scripts/export-active-members.js` (sin límite) → JSON completo.
- [ ] Invocar el workflow con el JSON completo (o en tandas de ~50 si se prefiere
  acotar por sesión).
- [ ] Volcar resultados (piloto + completo) a
  `docs/research/builder-ranking-report.md`, rankeado por score, con empresa,
  rol, assessment, evidencia y confianza.

---

## Task B4: Curación humana + módulo de showcase

- [ ] **Step 1 (usuario):** revisar `builder-ranking-report.md` y elegir a mano el
  subconjunto que va al deck.
- [ ] **Step 2:** escribir `lib/builder-ranking.ts` con SÓLO ese subconjunto:

```ts
export interface ShowcaseBuilder {
  name: string;
  role: string;        // rol/puesto a mostrar (ej. "Founder & CEO")
  company: string;     // empresa/proyecto
  huevsiteUsername?: string | null; // para avatar/link si tiene huevsite aprobado
}

// Subconjunto curado a mano desde docs/research/builder-ranking-report.md.
// Sin scores: es una muestra representativa, no un ranking público.
export const SHOWCASE_BUILDERS: ShowcaseBuilder[] = [
  // { name: '…', role: '…', company: '…', huevsiteUsername: '…' },
];
```

- [ ] **Step 3:** Build. `npm run build`. Expected: compila (módulo tipado, aunque
  el array arranque vacío).

---

## Task B5: Slide "Los builders" en el deck

**Files:** Modify `app/pitch-deck/slides.tsx`, `app/pitch-deck/PitchDeck.tsx`
(pasar avatares), `app/pitch-deck/pitch-deck.css` (si hace falta).

- [ ] **Step 1:** En `slides.tsx`, importar `SHOWCASE_BUILDERS` y agregar un slide
  (cerca del 5 "Quiénes son") con tarjetas avatar+nombre+rol+empresa. El avatar
  usa la foto del huevsite si está aprobado (vía `/api/members` enriquecido) y si
  no, iniciales en estilo `.team-av` (ya existe). Reusar tokens del deck.
- [ ] **Step 2:** Encuadre sobrio: eyebrow "La comunidad", título tipo "ALGUNOS DE
  LOS BUILDERS", sin números de score ni "top N".
- [ ] **Step 3:** Build + verificación visual: el slide entra en la navegación y
  el print; renderiza avatar/nombre/rol/empresa.
- [ ] **Step 4:** Commit.

---

## Self-review (post-plan)
- Cobertura del spec: export+workflow→B1; piloto/gate→B2; completo→B3;
  curación+módulo→B4; slide→B5. ✓
- Sin placeholders: B1 ya construido; B4/B5 con código real (array curado se
  llena tras la corrida, por diseño). ✓
- El gasto está aislado en B2/B3 detrás de un gate explícito. ✓
