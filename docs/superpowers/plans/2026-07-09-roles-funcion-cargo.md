# Roles: función + cargo — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: usar superpowers:subagent-driven-development
> (recomendado) o superpowers:executing-plans para ejecutar este plan tarea por
> tarea. Los pasos usan checkboxes (`- [ ]`). No hay test runner en el repo; la
> verificación de cada tarea es `npm run build` (typecheck) más prueba
> manual/curl. Cada tarea termina en un deliverable verificable.

**Goal:** Separar el rol en dos dimensiones — `role` = función/área (lista
cerrada) y `jobTitle` = cargo en texto libre — expuestas en todos los forms, con
una única fuente de verdad en `lib/profile-fields.ts` y backfill de los datos
existentes.

**Architecture:** Las columnas `role` y `jobTitle` ya existen en el schema; no
hay migración. El trabajo es (1) redefinir la lista canónica, (2) matar la
duplicación — hoy hay listas/mapas de roles en **7 archivos** — y (3) exponer el
campo cargo en el alta pública y `/completar`, que hoy lo derivan/pisan.

**Tech Stack:** Next.js 14 (app router), Drizzle + Neon, React 18, TS. Script de
backfill en Node plano con `@neondatabase/serverless` (patrón de
`scripts/reengage.js`).

## Global Constraints

- Voz: castellano rioplatense, directo. Labels de UI: "Área" para la función,
  "Cargo" para el título libre.
- Funciones nuevas (exactas): `Negocio / Fundación`, `Tecnología`,
  `Producto / Diseño`, `Marketing / Growth`, `Inversión`, `Otro`.
- Fallback de cargo (`ROLE_TITLE`): `Negocio / Fundación → Founder`,
  `Tecnología → Dev`, `Producto / Diseño → Product`,
  `Marketing / Growth → Growth`, `Inversión → Inversor`, `Otro → Builder`.
- Cargo: opcional en todos los forms, máx. 80 chars (largo de la columna
  `job_title`), placeholder `Ej. Partner & CTO`.
- El backfill NO toca `job_title` (cargos ya cargados se respetan) y es
  idempotente.
- `npm run build` debe pasar al final de cada tarea.

## Rollout

El deploy de código y el backfill van juntos: deployar todas las tareas de
código y correr el backfill inmediatamente después (ventana corta en la que
miembros viejos tienen `role` fuera de lista — solo afecta el pre-seleccionado
de sus selects si editan justo en esa ventana; la visualización no se rompe
porque `role` se muestra como string).

## File Structure

- Modify: `lib/profile-fields.ts` — nueva taxonomía; se suma `ROLE_TAGS` (única
  fuente de verdad).
- Modify: `app/api/join/route.ts` — borra mapas locales, acepta `jobTitle`.
- Modify: `app/page.tsx` — options desde `ROLES`, campo Cargo, `jobTitle` en el
  POST.
- Modify: `app/completar/CompletarForm.tsx` + `app/completar/page.tsx` — campo
  Cargo precargado.
- Modify: `app/api/presentation/route.ts` — deja de pisar `jobTitle`.
- Modify: `app/api/auth/profile/route.ts` — borra `ALLOWED_ROLES`/`ROLE_TITLE`
  locales, importa de lib.
- Modify: `app/dashboard/page.tsx` — borra `ROLES` local, importa de lib; labels.
- Modify: `app/admin/page.tsx` — borra `ROLES` local, importa de lib.
- Modify: `app/api/admin/members/[id]/route.ts` — `ALLOWED_ROLES` desde lib.
- Create: `scripts/backfill-roles.js` — remapeo idempotente con dry-run.

---

### Task 1: Taxonomía canónica en `lib/profile-fields.ts`

**Files:**
- Modify: `lib/profile-fields.ts:5-22`

**Interfaces:**
- Consumes: nada.
- Produces: `ROLES: readonly string[]` (las 6 funciones),
  `ROLE_TITLE: Record<string, string>`, `ROLE_TAGS: Record<string, string[]>`.
  Todas las tareas siguientes importan de acá.

- [ ] **Step 1: Reemplazar `ROLES` y `ROLE_TITLE`, agregar `ROLE_TAGS`**

Reemplazar las líneas 5-22 de `lib/profile-fields.ts` (los bloques `ROLES` y
`ROLE_TITLE` actuales) por:

```ts
// `role` es la FUNCIÓN/ÁREA del builder (lista cerrada, para filtros y
// validación). El título real va en `jobTitle` (texto libre, ej. "Partner &
// CTO"); si queda vacío se deriva con ROLE_TITLE.
export const ROLES = [
  'Negocio / Fundación',
  'Tecnología',
  'Producto / Diseño',
  'Marketing / Growth',
  'Inversión',
  'Otro',
] as const;

// Cargo corto derivado de la función (fallback cuando no escriben el suyo).
export const ROLE_TITLE: Record<string, string> = {
  'Negocio / Fundación': 'Founder',
  'Tecnología':          'Dev',
  'Producto / Diseño':   'Product',
  'Marketing / Growth':  'Growth',
  'Inversión':           'Inversor',
  'Otro':                'Builder',
};

// Tags default del alta cuando el usuario no elige ninguno (espejo por función).
export const ROLE_TAGS: Record<string, string[]> = {
  'Negocio / Fundación': ['Founder'],
  'Tecnología':          ['Dev'],
  'Producto / Diseño':   ['Product'],
  'Marketing / Growth':  ['Growth'],
  'Inversión':           ['Inversor'],
  'Otro':                ['Builder'],
};
```

El resto del archivo (`NEIGHBORHOODS`, `LOOKING_FOR_OPTIONS`) queda igual.

- [ ] **Step 2: Verificar que compila**

Run: `npm run build`
Expected: PASS. (`/completar` y `/api/presentation` ya importan `ROLES`/
`ROLE_TITLE` de acá; con esto ya ven la lista nueva sin tocarlos.)

- [ ] **Step 3: Commit**

```bash
git add lib/profile-fields.ts
git commit -m "feat(roles): nueva taxonomía función/área + ROLE_TAGS en profile-fields"
```

---

### Task 2: `/api/join` — mapas desde lib + acepta `jobTitle`

**Files:**
- Modify: `app/api/join/route.ts:1-32` (imports + mapas locales) y `:79`
  (cálculo de `jobTitle`).

**Interfaces:**
- Consumes: `ROLE_TITLE`, `ROLE_TAGS` de `@/lib/profile-fields` (Task 1).
- Produces: `POST /api/join` acepta `body.jobTitle?: string` (trim, máx. 80);
  vacío ⇒ deriva de `ROLE_TITLE[role]`.

- [ ] **Step 1: Borrar los mapas locales e importar de lib**

En `app/api/join/route.ts`, borrar los bloques `const ROLE_TITLE` (líneas 16-23)
y `const ROLE_TAGS` (líneas 25-32), y sumar el import:

```ts
import { ROLE_TITLE, ROLE_TAGS } from '@/lib/profile-fields';
```

- [ ] **Step 2: Aceptar `jobTitle` del body**

Después de la línea que parsea `role` (línea 40), agregar:

```ts
    const jobTitleRaw = typeof body.jobTitle === 'string' ? body.jobTitle.trim().slice(0, 80) : '';
```

Y en el insert, reemplazar:

```ts
      jobTitle: ROLE_TITLE[role] ?? role,
```

por:

```ts
      jobTitle: jobTitleRaw || (ROLE_TITLE[role] ?? role),
```

- [ ] **Step 3: Verificar que compila**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 4: Probar el endpoint con curl (dev server)**

Run (en una terminal `npm run dev`, en otra):

```bash
curl -s -X POST http://localhost:3000/api/join \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test Partner","email":"test-partner-cto@example.com","role":"Tecnología","jobTitle":"Partner & CTO","company":"Grupo TSA","linkedinUrl":"https://linkedin.com/in/test"}'
```

Expected: `{"success":true,...}` y en la DB el member queda con
`role = 'Tecnología'`, `job_title = 'Partner & CTO'`. Verificar y borrar el
registro de prueba:

```bash
node -e "
const { neon } = require('@neondatabase/serverless');
require('fs').readFileSync('.env.local','utf8').split(/\r?\n/).forEach(l=>{const m=l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+)\s*$/i); if(m&&!process.env[m[1]])process.env[m[1]]=m[2].replace(/^['\"]|['\"]$/g,'');});
const sql = neon(process.env.DATABASE_URL);
sql\`SELECT role, job_title FROM members WHERE email='test-partner-cto@example.com'\`.then(r=>{console.log(r);return sql\`DELETE FROM members WHERE email='test-partner-cto@example.com'\`}).then(()=>console.log('cleaned'));
"
```

Expected: `[ { role: 'Tecnología', job_title: 'Partner & CTO' } ]` y `cleaned`.

- [ ] **Step 5: Commit**

```bash
git add app/api/join/route.ts
git commit -m "feat(join): acepta cargo (jobTitle) y usa la taxonomía compartida"
```

---

### Task 3: Form de alta en la home — options desde lib + campo Cargo

**Files:**
- Modify: `app/page.tsx:4` (import), `:61` (estado), `:223`
  (`handleAddAnother`), `:695-706` (select + campo nuevo).

**Interfaces:**
- Consumes: `ROLES` de `@/lib/profile-fields`; `POST /api/join` con `jobTitle`
  (Task 2).
- Produces: nada que consuman otras tareas.

- [ ] **Step 1: Importar `ROLES`**

En `app/page.tsx`, después del import de `PresentationFields` (línea 4):

```ts
import { ROLES } from '@/lib/profile-fields';
```

- [ ] **Step 2: Sumar `jobTitle` al estado del form**

Línea 61, reemplazar:

```ts
  const [formData, setFormData] = useState({ name: '', email: '', role: '', company: '', companyUrl: '' });
```

por:

```ts
  const [formData, setFormData] = useState({ name: '', email: '', role: '', jobTitle: '', company: '', companyUrl: '' });
```

Y en `handleAddAnother` (línea 223), el mismo cambio en el reset:

```ts
    setFormData({ name: '', email: '', role: '', jobTitle: '', company: '', companyUrl: '' });
```

(`handleJoinSubmit` ya manda `...formData`, así que `jobTitle` viaja solo.)

- [ ] **Step 3: Select desde `ROLES` + campo Cargo**

Reemplazar el bloque del select (líneas 695-706):

```tsx
                  <div className="field">
                    <label>¿A qué te dedicás?</label>
                    <select required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                      <option value="" disabled>Seleccioná tu rol...</option>
                      <option value="Founder/CEO">Founder / CEO</option>
                      <option value="Developer/Engineer">Developer / Engineer</option>
                      <option value="Product/Design">Product / Design</option>
                      <option value="Marketing/Growth">Marketing / Growth</option>
                      <option value="Inversor">Inversor / VC</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
```

por:

```tsx
                  <div className="form-grid">
                    <div className="field">
                      <label>¿Cuál es tu área?</label>
                      <select required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                        <option value="" disabled>Seleccioná tu área...</option>
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div className="field">
                      <label>Cargo <span className="opt">(opcional)</span></label>
                      <input placeholder="Ej. Partner & CTO" maxLength={80} value={formData.jobTitle} onChange={e => setFormData({...formData, jobTitle: e.target.value})} />
                    </div>
                  </div>
```

- [ ] **Step 4: Verificar build + manual**

Run: `npm run build`
Expected: PASS.

Manual (`npm run dev`, abrir `http://localhost:3000`, click "Unirse a la
comunidad"): el select muestra las 6 áreas nuevas, al lado hay un input Cargo
con placeholder `Ej. Partner & CTO`, y el submit registra con ambos.

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx
git commit -m "feat(home): área desde la lista compartida + campo cargo en el alta"
```

---

### Task 4: `/completar` + `/api/presentation` — cargo editable, sin pisar

**Files:**
- Modify: `app/completar/CompletarForm.tsx:11-27` (interface), `:38-43`
  (estado), `:97-105` (campo nuevo).
- Modify: `app/completar/page.tsx` (objeto `initial`, agregar `jobTitle`).
- Modify: `app/api/presentation/route.ts:61-64`.

**Interfaces:**
- Consumes: `ROLE_TITLE` de `@/lib/profile-fields` (ya importado en el route).
- Produces: `POST /api/presentation` acepta `body.jobTitle?: string` (trim,
  máx. 80); vacío ⇒ deriva del rol (comportamiento actual).

- [ ] **Step 1: `CompletarInitial` + estado con `jobTitle`**

En `app/completar/CompletarForm.tsx`, dentro de `CompletarInitial` (línea 14,
después de `role: string;`):

```ts
  jobTitle: string;
```

Y el estado `identity` (líneas 38-43) pasa a:

```ts
  const [identity, setIdentity] = useState({
    name: initial.name,
    role: initial.role || '',
    jobTitle: initial.jobTitle || '',
    company: initial.company,
    companyUrl: initial.companyUrl,
  });
```

(El submit ya manda `...identity`, así que `jobTitle` viaja solo.)

- [ ] **Step 2: Campo Cargo en el form**

Después del `</div>` del field del select de rol (línea 105), antes del
`<div className="form-grid">`, insertar:

```tsx
      <div className="field">
        <label>Cargo <span className="opt">(opcional)</span></label>
        <input placeholder="Ej. Partner & CTO" maxLength={80} value={identity.jobTitle} onChange={(e) => setIdentity({ ...identity, jobTitle: e.target.value })} />
      </div>
```

- [ ] **Step 3: Precargar `jobTitle` en el server component**

En `app/completar/page.tsx`, en el objeto `initial`, después de
`role: member.role,`:

```ts
    jobTitle: member.jobTitle ?? '',
```

- [ ] **Step 4: `/api/presentation` deja de pisar el cargo**

En `app/api/presentation/route.ts`, reemplazar (líneas 61-64):

```ts
  if (typeof body.role === 'string' && ALLOWED_ROLES.has(body.role)) {
    set.role = body.role;
    set.jobTitle = ROLE_TITLE[body.role] ?? body.role;
  }
```

por:

```ts
  if (typeof body.role === 'string' && ALLOWED_ROLES.has(body.role)) {
    set.role = body.role;
    // El cargo lo escribe el builder; sólo se deriva del rol si viene vacío.
    const jobTitleRaw = typeof body.jobTitle === 'string' ? body.jobTitle.trim().slice(0, 80) : '';
    set.jobTitle = jobTitleRaw || (ROLE_TITLE[body.role] ?? body.role);
  }
```

- [ ] **Step 5: Verificar build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/completar/CompletarForm.tsx app/completar/page.tsx app/api/presentation/route.ts
git commit -m "feat(completar): campo cargo editable; presentation no pisa jobTitle"
```

---

### Task 5: `/api/auth/profile` + dashboard — lista compartida

**Files:**
- Modify: `app/api/auth/profile/route.ts:9-25` (sets locales).
- Modify: `app/dashboard/page.tsx:38` (ROLES local), `:233-242` (labels).

**Interfaces:**
- Consumes: `ROLES`, `ROLE_TITLE` de `@/lib/profile-fields`.
- Produces: nada nuevo; `PATCH /api/auth/profile` valida contra la lista nueva.

- [ ] **Step 1: Route — borrar sets locales, importar de lib**

En `app/api/auth/profile/route.ts`, borrar los bloques `ALLOWED_ROLES`
(líneas 9-16) y `ROLE_TITLE` (líneas 18-25), y reemplazarlos por:

```ts
import { ROLES, ROLE_TITLE } from '@/lib/profile-fields';

const ALLOWED_ROLES = new Set<string>(ROLES);
```

(el `import` va arriba con los demás; la línea de `ALLOWED_ROLES` queda donde
estaban los sets).

- [ ] **Step 2: Dashboard — ROLES importado + labels**

En `app/dashboard/page.tsx`, borrar la línea 38:

```ts
const ROLES = ['Founder/CEO', 'Developer/Engineer', 'Product/Design', 'Marketing/Growth', 'Inversor', 'Otro'];
```

y sumar arriba (junto a los imports):

```ts
import { ROLES } from '@/lib/profile-fields';
```

En el form (líneas 233-242), cambiar el label `<span>Rol</span>` por
`<span>Área</span>`, el label `<span>Job title</span>` por
`<span>Cargo</span>`, y el placeholder del input de cargo por:

```tsx
                <input placeholder="Ej. Partner & CTO" maxLength={80} value={profile.jobTitle} onChange={e => setProfile({ ...profile, jobTitle: e.target.value })} />
```

- [ ] **Step 3: Verificar build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add app/api/auth/profile/route.ts app/dashboard/page.tsx
git commit -m "refactor(profile): roles desde la lista compartida en API y dashboard"
```

---

### Task 6: Admin — lista compartida en UI y route

**Files:**
- Modify: `app/admin/page.tsx:5` (import), `:41` (ROLES local).
- Modify: `app/api/admin/members/[id]/route.ts:11-13`.

**Interfaces:**
- Consumes: `ROLES` de `@/lib/profile-fields`.
- Produces: nada nuevo; `PATCH /api/admin/members/[id]` valida contra la lista
  nueva.

- [ ] **Step 1: Admin page — ROLES importado**

En `app/admin/page.tsx`, borrar la línea 41:

```ts
const ROLES = ['Founder/CEO', 'Developer/Engineer', 'Product/Design', 'Marketing/Growth', 'Inversor', 'Otro'];
```

y extender el import existente de la línea 5:

```ts
import { NEIGHBORHOODS, LOOKING_FOR_OPTIONS, ROLES } from '@/lib/profile-fields';
```

- [ ] **Step 2: Admin route — ALLOWED_ROLES desde lib**

En `app/api/admin/members/[id]/route.ts`, reemplazar (líneas 11-13):

```ts
const ALLOWED_ROLES = new Set([
  'Founder/CEO', 'Developer/Engineer', 'Product/Design', 'Marketing/Growth', 'Inversor', 'Otro',
]);
```

por:

```ts
import { ROLES } from '@/lib/profile-fields';

const ALLOWED_ROLES = new Set<string>(ROLES);
```

(el `import` va arriba con los demás).

- [ ] **Step 3: Verificar build + grep de que no queda duplicación**

Run: `npm run build`
Expected: PASS.

Run: `grep -rn "Founder/CEO" app/ lib/ --include="*.ts" --include="*.tsx"`
Expected: **sin resultados** (la string vieja ya no existe en el código; sólo
puede quedar en `scripts/` legacy, que no importa acá).

- [ ] **Step 4: Commit**

```bash
git add app/admin/page.tsx "app/api/admin/members/[id]/route.ts"
git commit -m "refactor(admin): roles desde la lista compartida"
```

---

### Task 7: Backfill de roles existentes

**Files:**
- Create: `scripts/backfill-roles.js`

**Interfaces:**
- Consumes: `DATABASE_URL` de `.env.local` (patrón de `scripts/reengage.js`).
- Produces: filas de `members` con `role` remapeado al set nuevo. No toca
  `job_title`.

- [ ] **Step 1: Escribir el script**

Crear `scripts/backfill-roles.js`:

```js
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
```

- [ ] **Step 2: Dry-run**

Run: `node scripts/backfill-roles.js`
Expected: imprime la distribución actual y cuántas filas cambiarían por mapeo,
sin escribir nada.

- [ ] **Step 3: Aplicar**

Run: `node scripts/backfill-roles.js --apply`
Expected: `✓ N × "Founder/CEO" → "Negocio / Fundación"` etc., y al final
`Listo: N filas actualizadas.`

- [ ] **Step 4: Verificar idempotencia y resultado**

Run: `node scripts/backfill-roles.js`
Expected: `Dry-run: 0 filas cambiarían.` y la distribución muestra sólo
funciones nuevas (más los `Otro`).

- [ ] **Step 5: Commit**

```bash
git add scripts/backfill-roles.js
git commit -m "chore(scripts): backfill de roles viejos a la taxonomía función/área"
```
