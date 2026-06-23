# Research y ranking de builders para el pitch deck

**Fecha:** 2026-06-23
**Estado:** Diseño (pendiente review del usuario)
**Alcance:** Subsistema B. Trabajo pago (workflow multi-agente), con **gate de
piloto** antes de gastar a escala.

## Objetivo

El usuario quiere "interpretar quiénes son los profesionales mejor parados y con
mejores perfiles de toda la base, y representarlos en el pitch deck". Decisiones
de brainstorming ya tomadas:

- **Cómo evaluar:** research con Sonnet de cada usuario — qué startup tienen, qué
  tan buena está, qué puesto ocupan — y rankear en base a eso.
- **Profundidad:** web research por persona (LinkedIn / empresa / website).
- **Universo:** toda la base activa (~160).
- **En el deck:** nombre + rol + empresa + avatar.

## Gate de costo (lo más importante)

El research completo de ~160 personas se estimó en **~6M–12M tokens (~US$30–60)**
con Sonnet 4.6. El usuario tiene dudas de cuánto usage le queda. Por eso el
diseño es **piloto primero**:

1. Se construye toda la maquinaria (export, workflow, reporte, slide) — eso no
   gasta tokens de research.
2. Se corre el **piloto de 15 builders**. Se mide el consumo real por agente.
3. Con ese dato se extrapola el costo exacto de los ~145 restantes y **el usuario
   decide** si sigue (todo / en tandas / corta ahí).
4. El research a escala nunca arranca sin esa aprobación explícita.

Esto convierte una estimación en un número medido antes de comprometer gasto.

## Arquitectura

Tres piezas, desacopladas:

```
scripts/export-active-members.js     # DB → JSON de entrada (corre el usuario/yo)
workflows/builder-research (Workflow)# por persona: web research → assessment
scripts/...(orquestación)            # resultados → reporte .md para revisar
lib/builder-ranking.ts (nuevo)       # showcase curado (post-review) → deck
app/pitch-deck/slides.tsx (+1 slide) # "Los builders"
```

### 1. Export de entrada — `scripts/export-active-members.js`

Los scripts de Workflow **no acceden a la DB ni al filesystem**. Entonces un
script Node aparte lee la base y escribe la entrada:

- Selecciona `status='active' AND is_admin=false`.
- Escribe `docs/research/active-members.json` con, por persona: `id`, `name`,
  `company`, `companyUrl`, `websiteUrl`, `linkedinUrl`, `role`, `jobTitle`,
  `bio`, `building`. (Sin email ni password — no se necesitan para research.)
- Flag `--limit N` para el piloto (default sin límite = todos).

### 2. Workflow de research — `builder-research`

Un workflow multi-agente (Sonnet 4.6) que recibe el array de personas como
`args` y, **por persona, en pipeline**, corre un agente de research:

- El agente usa **WebSearch + WebFetch** sobre LinkedIn / empresa / website para
  entender quién es, qué construye y qué tan parado está.
- Cap por persona para acotar costo: **1 búsqueda + 1–2 fetch dirigidos** (no
  exploración abierta). Si no hay señal pública, devuelve `confidence: "low"` y
  no inventa.
- Devuelve un objeto validado por schema:
  `{ id, name, company, role, seniority, startupAssessment, profileStrength, score (0-100), tier ('A'|'B'|'C'), evidence: string[], confidence ('low'|'med'|'high') }`.
- **Regla dura de la voz/datos:** no inventar métricas ni cargos. `evidence` cita
  de dónde sale cada afirmación (URL/fuente). Sin fuente → no se afirma.

El workflow corre en **modo piloto** (primeras 15) por defecto; el modo completo
es la misma maquinaria con el JSON completo, disparado sólo tras el gate.

### 3. Reporte para revisión humana — `docs/research/builder-ranking-report.md`

Los resultados del workflow se vuelcan a un markdown ordenado por score, con
empresa, rol, assessment, evidencia y confianza. **Este es el gate humano:** el
usuario lo lee y cura a mano quiénes entran al deck. Nada se publica
automáticamente.

### 4. Showcase curado — `lib/builder-ranking.ts` (nuevo)

Tras la curación del usuario, se escribe a mano un módulo con **sólo el subconjunto
elegido**, con los campos que van al deck: `name`, `role`, `company`,
`huevsiteUsername` (para avatar/link, si tiene). **No** se guardan scores ni
assessments en este archivo público — el ranking interno queda en el reporte.

### 5. Slide del deck — `app/pitch-deck/slides.tsx`

Un slide nuevo "Los builders" (insertado cerca del slide 5 "Quiénes son"), que
mapea `lib/builder-ranking.ts`: tarjetas con **avatar + nombre + rol + empresa**.
El avatar usa la foto del huevsite si está aprobado (`fetchHuevsiteProfile`), y
si no, cae a las iniciales en el estilo de marca (`.team-av`, ya existe). Reusa
los tokens y el CSS del deck.

### Privacidad y encuadre (decisión de diseño)

El spec del pitch deck había definido "sin nombrar empresas ni miembros, todo
agregado". Este subsistema **nombra a un subconjunto a propósito**, así que:

- Sólo se featurea gente **ya pública** en la landing (la sección de comunidad ya
  muestra nombre/empresa/avatar). No se expone a nadie que no esté ya visible.
- El deck los presenta como **muestra representativa** de la comunidad, no como un
  ranking ("algunos de los builders", sin números de score, sin orden de "top N"
  explícito). El scoring interno queda en el reporte privado, no en el deck.
- El deck sigue siendo `noindex` y por link.

Si el usuario prefiere mantener el deck 100% anónimo, el subsistema entrega igual
el **reporte interno** (valor para él) y se saltea el slide público.

## Plan de implementación (orden y gates)

1. Export script + workflow + schema + reporte — **construir** (sin gasto de
   research).
2. **Correr piloto de 15** → medir consumo → reportar costo extrapolado. **GATE.**
3. (Con OK del usuario) correr el resto, en tandas si hace falta.
4. Usuario cura el reporte → escribir `lib/builder-ranking.ts`.
5. Slide "Los builders" + `npm run build` + verificación visual.

## Verificación
- El export genera el JSON con los campos esperados y respeta `--limit`.
- El piloto devuelve 15 assessments válidos contra el schema, con `evidence` y
  `confidence`; se reporta el consumo real de tokens.
- El reporte markdown es legible y ordenado por score.
- `lib/builder-ranking.ts` tipa y sólo contiene el subconjunto curado (sin
  scores).
- `npm run build` compila; el slide nuevo renderiza avatar+nombre+rol+empresa y
  entra en la navegación/print del deck.

## Fuera de alcance (YAGNI)
- Re-correr el research solo; es one-time, se re-corre a pedido.
- Scores públicos o leaderboard en el deck.
- Scraping de avatares externos (LinkedIn). Avatar = huevsite o iniciales.
- Automatizar la curación: el gate humano es a propósito.

## Guía de voz
Igual que el resto: rioplatense, directo, números antes que adjetivos, sin
clichés de IA. En el deck, encuadre sobrio ("builders de la comunidad"), sin
superlativos inflados.
