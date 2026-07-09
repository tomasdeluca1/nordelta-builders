# Directorio escalonado de la comunidad — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: usar superpowers:subagent-driven-development
> (recomendado) o superpowers:executing-plans para ejecutar este plan tarea por
> tarea. Los pasos usan checkboxes (`- [ ]`). No hay test runner en el repo; la
> verificación de cada tarea es `npm run build` (typecheck) más prueba
> manual/curl. Cada tarea termina en un deliverable verificable.

**Goal:** Mostrar a TODA la comunidad activa en la home con una grilla de
tarjetas escalonada (T1 huevsite → T2 web → T3 resto) con búsqueda inline,
retirando el modal "Ver todos".

**Architecture:** El endpoint `/api/members/all` pasa a devolver `websiteUrl` +
`tier` calculado y el orden escalonado. Un componente client nuevo
(`CommunityDirectory`) renderiza búsqueda + grilla con 3 variantes de tarjeta y
"Cargar más". El enriquecimiento visual de T1 (avatar/acento/score de huevsite)
se resuelve diferido desde el cliente vía un endpoint proxy liviano (evita CORS
y N fetches server-side en el listado). El carousel hero de huevsites no se
toca.

**Tech Stack:** Next.js 14 (app router), Drizzle + Neon, React 18, TS. Sin
librerías nuevas.

## Global Constraints

- Voz: castellano rioplatense, directo. Estética actual: eyebrows tipo
  `$ ls --community`, acento verde, tokens CSS existentes (`--surf`, `--border`,
  `--muted`, `--accent`, `--text`).
- Tiers (exactos): T1 = `huevsiteUsername` presente; T2 = sin huevsite pero con
  `websiteUrl` **o** `companyUrl`; T3 = resto.
- Orden: tier asc; dentro de T1: `huevsiteFeatured` desc → `huevsiteApproved`
  desc → `createdAt` asc; dentro de T2 y T3: nombre asc (locale `es`).
- Sin emails ni datos privados en el listado público (igual que hoy).
- El carousel hero y `/api/members` NO se tocan.
- `npm run build` debe pasar al final de cada tarea.
- Correr después del plan de roles (`2026-07-09-roles-funcion-cargo.md`) para
  que las tarjetas muestren el cargo bien, pero no hay dependencia de código.

## File Structure

- Create: `lib/palette.ts` — `PALETTE` compartida (hoy vive local en
  `app/page.tsx`).
- Modify: `app/api/members/all/route.ts` — `websiteUrl`, `tier`, orden
  escalonado.
- Create: `app/api/huevsite/profile/[username]/route.ts` — proxy del perfil
  público de huevsite (reusa `fetchHuevsiteProfile`, que cachea 300s).
- Create: `app/components/CommunityDirectory.tsx` — búsqueda + grilla tiered +
  enriquecimiento diferido.
- Modify: `app/page.tsx` — monta el directorio en `#comunidad`, borra el modal
  "ver todos" y su estado, `PALETTE` pasa a importarse de lib.
- Modify: `app/globals.css` — clases `dir-*` nuevas; se borran las `all-*` del
  modal retirado.

---

### Task 1: `/api/members/all` — tier + orden escalonado

**Files:**
- Modify: `app/api/members/all/route.ts`

**Interfaces:**
- Consumes: schema Drizzle existente (`schema.members`).
- Produces: `GET /api/members/all` →
  `{ members: DirectoryMember[], total: number }` donde cada member suma
  `websiteUrl: string | null` y `tier: 1 | 2 | 3`, ordenado escalonado. El
  componente de Task 3 consume exactamente esta shape.

- [ ] **Step 1: Reescribir el route**

Reemplazar el contenido completo de `app/api/members/all/route.ts` por:

```ts
import { NextResponse } from 'next/server';
import { asc, eq } from 'drizzle-orm';
import { getDb, schema } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// T1: huevsite conectado · T2: web propia o de empresa · T3: resto.
function tierOf(r: { huevsiteUsername: string | null; websiteUrl: string | null; companyUrl: string | null }): 1 | 2 | 3 {
  if (r.huevsiteUsername) return 1;
  if (r.websiteUrl || r.companyUrl) return 2;
  return 3;
}

export async function GET() {
  try {
    const db = getDb();
    const rows = await db
      .select({
        id: schema.members.id,
        name: schema.members.name,
        initials: schema.members.initials,
        role: schema.members.role,
        jobTitle: schema.members.jobTitle,
        company: schema.members.company,
        companyUrl: schema.members.companyUrl,
        websiteUrl: schema.members.websiteUrl,
        tags: schema.members.tags,
        colorIndex: schema.members.colorIndex,
        huevsiteUsername: schema.members.huevsiteUsername,
        huevsiteApproved: schema.members.huevsiteApproved,
        huevsiteFeatured: schema.members.huevsiteFeatured,
        createdAt: schema.members.createdAt,
      })
      .from(schema.members)
      .where(eq(schema.members.status, 'active'))
      .orderBy(asc(schema.members.name));

    // Escalonado: huevsite → web → resto. Dentro de T1 pesan featured/approved
    // y antigüedad; T2/T3 quedan alfabéticos (ya vienen así de la query).
    const members = rows
      .map((r) => ({ ...r, _id: String(r.id), tier: tierOf(r) }))
      .sort((a, b) => {
        if (a.tier !== b.tier) return a.tier - b.tier;
        if (a.tier === 1) {
          const feat = Number(b.huevsiteFeatured) - Number(a.huevsiteFeatured);
          if (feat) return feat;
          const appr = Number(b.huevsiteApproved) - Number(a.huevsiteApproved);
          if (appr) return appr;
          return a.createdAt.getTime() - b.createdAt.getTime();
        }
        return a.name.localeCompare(b.name, 'es');
      })
      .map(({ createdAt, huevsiteApproved, huevsiteFeatured, ...pub }) => pub);

    return NextResponse.json({ members, total: members.length });
  } catch (error) {
    console.error('Error fetching all members:', error);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Verificar build + curl**

Run: `npm run build`
Expected: PASS.

Run (con `npm run dev` en otra terminal):

```bash
curl -s http://localhost:3000/api/members/all | node -e "
let s=''; process.stdin.on('data',d=>s+=d).on('end',()=>{
  const { members, total } = JSON.parse(s);
  console.log('total:', total);
  console.log('tiers en orden:', members.map(m=>m.tier).join(''));
  console.log('primero:', members[0]?.name, '| tier', members[0]?.tier);
});"
```

Expected: `tiers en orden` es una secuencia no-decreciente (todos los 1, después
los 2, después los 3) y ningún member trae `email`, `createdAt` ni los flags
`huevsite*` de moderación (solo `huevsiteUsername`).

- [ ] **Step 3: Commit**

```bash
git add app/api/members/all/route.ts
git commit -m "feat(api): listado de comunidad con tier y orden escalonado"
```

---

### Task 2: Proxy del perfil público de huevsite

**Files:**
- Create: `app/api/huevsite/profile/[username]/route.ts`

**Interfaces:**
- Consumes: `fetchHuevsiteProfile`, `parseHuevsiteUsername` de `@/lib/huevsite`
  (existentes; el fetch interno cachea con `revalidate: 300`).
- Produces: `GET /api/huevsite/profile/:username` →
  `{ profile: { username, avatar, accentColor, builderScore, headline, url } | null }`.
  Task 3 lo consume por tarjeta T1.

- [ ] **Step 1: Crear el route**

Crear `app/api/huevsite/profile/[username]/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { fetchHuevsiteProfile, parseHuevsiteUsername } from '@/lib/huevsite';

export const runtime = 'nodejs';

// Proxy liviano del perfil público de huevsite para el directorio (evita CORS
// desde el cliente; fetchHuevsiteProfile ya cachea 300s server-side).
export async function GET(_req: Request, { params }: { params: { username: string } }) {
  const username = parseHuevsiteUsername(params.username);
  if (!username) return NextResponse.json({ profile: null }, { status: 400 });

  const p = await fetchHuevsiteProfile(username);
  const profile = p
    ? { username: p.username, avatar: p.avatar, accentColor: p.accentColor, builderScore: p.builderScore, headline: p.headline, url: p.url }
    : null;

  return NextResponse.json(
    { profile },
    { headers: { 'cache-control': 'public, s-maxage=300, stale-while-revalidate=600' } },
  );
}
```

- [ ] **Step 2: Verificar build + curl**

Run: `npm run build`
Expected: PASS.

Run (con dev server; usar un username real de la DB — sacarlo de
`curl -s http://localhost:3000/api/members/all` mirando `huevsiteUsername`):

```bash
curl -s http://localhost:3000/api/huevsite/profile/<username-real>
curl -s http://localhost:3000/api/huevsite/profile/no-existe-xyz
```

Expected: el primero devuelve `{"profile":{"username":...}}`; el segundo
`{"profile":null}` (status 200 — el 400 es sólo para usernames no parseables).

- [ ] **Step 3: Commit**

```bash
git add "app/api/huevsite/profile/[username]/route.ts"
git commit -m "feat(api): proxy del perfil público de huevsite para el directorio"
```

---

### Task 3: `lib/palette.ts` + componente `CommunityDirectory`

**Files:**
- Create: `lib/palette.ts`
- Create: `app/components/CommunityDirectory.tsx`
- Modify: `app/globals.css` (clases `dir-*`, al final del archivo)

**Interfaces:**
- Consumes: `GET /api/members/all` (Task 1), `GET /api/huevsite/profile/:u`
  (Task 2), `PALETTE` de `lib/palette.ts`.
- Produces: `default export CommunityDirectory({ onOpenHuevsite: (v: { username: string; name: string }) => void })`.
  Task 4 lo monta en la home con `onOpenHuevsite={setHuevView}` (el modal
  iframe existente arma la URL con su propio `huevsiteUrl`; el componente no
  lo necesita).

- [ ] **Step 1: Extraer `PALETTE` a lib**

Crear `lib/palette.ts` (mismos valores que el `PALETTE` local de
`app/page.tsx:31-40`; ese local se borra en Task 4):

```ts
// Colores de avatar por colorIndex (compartidos por la home y el directorio).
export const PALETTE = [
  { bg: 'rgba(0,229,160,.1)',  color: '#00e5a0' },
  { bg: 'rgba(33,150,243,.1)', color: '#2196f3' },
  { bg: 'rgba(255,152,0,.1)',  color: '#ff9800' },
  { bg: 'rgba(156,39,176,.1)', color: '#9c27b0' },
  { bg: 'rgba(244,67,54,.1)',  color: '#ef5350' },
  { bg: 'rgba(0,188,212,.1)',  color: '#00bcd4' },
  { bg: 'rgba(255,193,7,.1)',  color: '#ffc107' },
  { bg: 'rgba(76,175,80,.1)',  color: '#4caf50' },
];
```

- [ ] **Step 2: Crear el componente**

Crear `app/components/CommunityDirectory.tsx`:

```tsx
"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { PALETTE } from '@/lib/palette';

export interface DirectoryMember {
  _id: string;
  name: string;
  initials: string;
  role: string;
  jobTitle?: string | null;
  company?: string | null;
  companyUrl?: string | null;
  websiteUrl?: string | null;
  tags?: string[];
  colorIndex: number;
  huevsiteUsername?: string | null;
  tier: 1 | 2 | 3;
}

interface HuevProfile {
  username: string;
  avatar: string | null;
  accentColor: string | null;
  builderScore: number | null;
  headline: string | null;
  url: string;
}

const PAGE_SIZE = 24;

/**
 * Directorio de toda la comunidad activa, escalonado: T1 (huevsite) con tarjeta
 * rica, T2 (web) con chip "web ↗", T3 básica. El detalle visual de T1
 * (avatar/acento/score) se trae diferido, sólo para las tarjetas visibles.
 */
export default function CommunityDirectory({
  onOpenHuevsite,
}: {
  onOpenHuevsite: (v: { username: string; name: string }) => void;
}) {
  const [members, setMembers] = useState<DirectoryMember[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [profiles, setProfiles] = useState<Map<string, HuevProfile | null>>(new Map());
  const inflight = useRef<Set<string>>(new Set());

  useEffect(() => {
    fetch('/api/members/all')
      .then((r) => r.json())
      .then((d) => { setMembers(d.members ?? []); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) =>
      [m.name, m.company, m.role, m.jobTitle, ...(m.tags ?? [])]
        .filter(Boolean)
        .some((f) => String(f).toLowerCase().includes(q)));
  }, [members, query]);

  const shown = filtered.slice(0, visible);

  // Enriquecimiento diferido de T1: sólo tarjetas visibles, una vez cada una.
  useEffect(() => {
    for (const m of shown) {
      const u = m.huevsiteUsername;
      if (m.tier !== 1 || !u || profiles.has(u) || inflight.current.has(u)) continue;
      inflight.current.add(u);
      fetch(`/api/huevsite/profile/${encodeURIComponent(u)}`)
        .then((r) => r.json())
        .then((d) => setProfiles((prev) => new Map(prev).set(u, d.profile ?? null)))
        .catch(() => setProfiles((prev) => new Map(prev).set(u, null)));
    }
  }, [shown, profiles]);

  if (!loaded) return <div className="dir"><p className="dir-empty">Cargando builders…</p></div>;

  return (
    <div className="dir">
      <div className="dir-head">
        <input
          className="dir-search"
          placeholder="Buscar por nombre, empresa, rol o tag…"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setVisible(PAGE_SIZE); }}
        />
        <span className="dir-count">{filtered.length} de {members.length} builders</span>
      </div>

      {!filtered.length ? (
        <p className="dir-empty">No encontramos a nadie con eso.</p>
      ) : (
        <>
          <div className="dir-grid">
            {shown.map((m) => {
              const c = PALETTE[m.colorIndex % PALETTE.length];
              const sub = m.jobTitle && m.company ? `${m.jobTitle} @ ${m.company}` : (m.jobTitle || m.role);

              if (m.tier === 1 && m.huevsiteUsername) {
                const p = profiles.get(m.huevsiteUsername);
                return (
                  <div className="dir-card dir-card-t1" key={m._id} style={p?.accentColor ? { borderColor: p.accentColor } : undefined}>
                    {p?.avatar
                      ? <img className="dir-av dir-av-img" src={p.avatar} alt="" />
                      : <div className="dir-av" style={{ background: c.bg, color: c.color }}>{m.initials}</div>}
                    <div className="dir-info">
                      <div className="dir-name">
                        {m.name}
                        {typeof p?.builderScore === 'number' && <span className="dir-score">{p.builderScore}</span>}
                      </div>
                      <div className="dir-sub">{sub}</div>
                    </div>
                    <button className="dir-cta" onClick={() => onOpenHuevsite({ username: m.huevsiteUsername as string, name: m.name })}>
                      Ver huevsite →
                    </button>
                  </div>
                );
              }

              const web = m.tier === 2 ? (m.websiteUrl || m.companyUrl) : null;
              return (
                <div className="dir-card" key={m._id}>
                  <div className="dir-av" style={{ background: c.bg, color: c.color }}>{m.initials}</div>
                  <div className="dir-info">
                    <div className="dir-name">{m.name}</div>
                    <div className="dir-sub">{sub}</div>
                  </div>
                  {web && <a className="dir-cta dir-cta-web" href={web} target="_blank" rel="noopener">web ↗</a>}
                </div>
              );
            })}
          </div>

          {filtered.length > visible && (
            <button className="btn btn-outline dir-more" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
              Cargar más ({filtered.length - visible} restantes)
            </button>
          )}
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Estilos `dir-*`**

Agregar al final de `app/globals.css`:

```css
/* ── Directorio de la comunidad (grilla escalonada) ─────────────────── */
.dir { margin-top: 28px; }
.dir-head { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; margin-bottom: 14px; }
.dir-search { flex: 1; min-width: 220px; background: var(--surf); border: 1px solid var(--border); border-radius: 12px; padding: 12px 14px; color: var(--text); font-family: inherit; font-size: 14px; }
.dir-search:focus { outline: none; border-color: var(--accent); }
.dir-count { font-family: 'Space Mono', monospace; font-size: 12px; color: var(--muted); white-space: nowrap; }
.dir-empty { color: var(--muted); font-size: 14px; padding: 24px 0; text-align: center; }
.dir-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.dir-card { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border: 1px solid var(--border); border-radius: 12px; background: var(--surf); min-width: 0; }
.dir-card-t1 { border-color: rgba(0,229,160,.35); background: linear-gradient(180deg, rgba(0,229,160,.05), var(--surf)); }
.dir-av { width: 40px; height: 40px; flex: 0 0 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; }
.dir-av-img { object-fit: cover; }
.dir-info { min-width: 0; flex: 1; }
.dir-name { color: var(--text); font-weight: 600; font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 8px; }
.dir-score { font-family: 'Space Mono', monospace; font-size: 11px; color: var(--accent); border: 1px solid rgba(0,229,160,.35); border-radius: 999px; padding: 1px 7px; flex: 0 0 auto; }
.dir-sub { color: var(--muted); font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dir-cta { background: none; border: 1px solid var(--border); color: var(--accent); border-radius: 999px; padding: 6px 12px; font-size: 12px; cursor: pointer; font-family: inherit; white-space: nowrap; text-decoration: none; }
.dir-cta:hover { border-color: var(--accent); }
.dir-more { display: block; margin: 18px auto 0; }
@media (max-width: 960px) { .dir-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px) { .dir-grid { grid-template-columns: 1fr; } }
```

- [ ] **Step 4: Verificar build**

Run: `npm run build`
Expected: PASS (el componente todavía no se monta en ningún lado; sólo
typecheck).

- [ ] **Step 5: Commit**

```bash
git add lib/palette.ts app/components/CommunityDirectory.tsx app/globals.css
git commit -m "feat(comunidad): componente CommunityDirectory con grilla escalonada"
```

---

### Task 4: Integrar en la home y retirar el modal "ver todos"

**Files:**
- Modify: `app/page.tsx` — montar directorio, borrar modal + estado + `PALETTE`
  local.
- Modify: `app/globals.css` — borrar clases `all-*` (líneas 1274-1290).

**Interfaces:**
- Consumes: `CommunityDirectory` (Task 3), `PALETTE` de `lib/palette.ts`.
- Produces: home final; no hay consumidores posteriores.

- [ ] **Step 1: Imports + borrar `PALETTE` local**

En `app/page.tsx`:
- Sumar imports (junto al de `PresentationFields`, línea 4):

```ts
import CommunityDirectory from './components/CommunityDirectory';
import { PALETTE } from '@/lib/palette';
```

- Borrar el bloque `const PALETTE = [...]` (líneas 31-40). Los usos existentes
  (chip del nav, carousel) siguen funcionando con el import.

- [ ] **Step 2: Borrar el estado y la carga del modal**

Borrar en `app/page.tsx`:
- Los estados `showAllModal`, `allMembers`, `allLoaded`, `allQuery`
  (líneas 45-48).
- La función `openAllModal` completa (líneas 168-176).
- En el effect del overflow (línea 201), quitar `showAllModal` de la condición y
  del array de deps:

```ts
  useEffect(() => {
    if (isMobOpen || showJoinModal || huevView) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
  }, [isMobOpen, showJoinModal, huevView]);
```

- [ ] **Step 3: Montar el directorio y simplificar `members-join`**

Después del cierre del bloque del carousel (el `)}` de la línea 546) y antes de
`<div className="members-join">`, insertar:

```tsx
        <CommunityDirectory onOpenHuevsite={setHuevView} />
```

Y reemplazar el bloque `members-join` (líneas 548-554):

```tsx
        <div className="members-join">
          <button onClick={openAllModal} className="btn btn-outline">
            Ver todos {memberTotal ? `los ${memberTotal} ` : ''}builders →
          </button>
          {me
```

por (se va el botón del modal; queda el CTA de sumarse):

```tsx
        <div className="members-join">
          {me
```

Nota: si `memberTotal` queda sin usar tras este cambio, borrar también ese
estado y su set en `fetchMembers`; si se usa en otro lado (verificar con grep),
dejarlo.

- [ ] **Step 4: Borrar el JSX del modal "ver todos"**

Borrar el bloque completo `{showAllModal && (...)}` (líneas 605-660, delimitado
por el comentario `{/* JOIN MODAL */}` — ojo: ese comentario está mal ubicado
hoy, el bloque que sigue es el del modal "toda la comunidad"; el modal de join
real es el `{showJoinModal && ...}` de abajo, que NO se toca).

- [ ] **Step 5: Borrar las clases `all-*` de `globals.css`**

Primero verificar que no quedan usos:

Run: `grep -rn "all-search\|all-count\|all-empty\|all-grid\|all-row\|all-av\|all-info\|all-name\|all-role\|all-huev" app/`
Expected: sin resultados en `.tsx` (sólo las definiciones CSS).

Después borrar de `app/globals.css` el bloque de `.all-search` a
`@media (max-width: 720px) { .all-grid ... }` (líneas 1274-1290).

- [ ] **Step 6: Verificar build**

Run: `npm run build`
Expected: PASS, sin warnings de variables sin usar en `page.tsx`.

- [ ] **Step 7: Commit**

```bash
git add app/page.tsx app/globals.css
git commit -m "feat(home): directorio escalonado en #comunidad, chau modal 'ver todos'"
```

---

### Task 5: Verificación end-to-end

**Files:** ninguno (solo verificación).

**Interfaces:**
- Consumes: todo lo anterior.
- Produces: evidencia de que el flujo funciona en el navegador real.

- [ ] **Step 1: Levantar dev y verificar la API**

Run: `npm run dev` y:

```bash
curl -s http://localhost:3000/api/members/all | node -e "
let s=''; process.stdin.on('data',d=>s+=d).on('end',()=>{
  const { members } = JSON.parse(s);
  const t = members.map(m=>m.tier);
  console.log('orden ok:', t.every((v,i)=>i===0||v>=t[i-1]));
  console.log('por tier:', [1,2,3].map(k=>t.filter(v=>v===k).length).join(' / '));
});"
```

Expected: `orden ok: true`.

- [ ] **Step 2: Verificar la home en el navegador**

Abrir `http://localhost:3000#comunidad` y chequear:
- El carousel hero de huevsites sigue funcionando (autoavance, flechas).
- Debajo aparece la grilla: tarjetas T1 destacadas (borde acento; avatar y
  score aparecen al ratito, cuando llega el enriquecimiento), T2 con chip
  "web ↗" que abre la web en otra pestaña, T3 básicas.
- La búsqueda filtra por nombre/empresa/rol/tag y resetea el "Cargar más".
- "Cargar más" agrega tarjetas de a 24 y desaparece al agotar la lista.
- "Ver huevsite →" en una T1 abre el modal iframe de siempre.
- El botón viejo "Ver todos los builders" ya no existe; el CTA de sumarse sigue.
- Mobile (DevTools, 390px): grilla a 1 columna, búsqueda usable.

- [ ] **Step 3: Screenshot de evidencia**

Sacar screenshot de la sección con las 3 variantes de tarjeta visibles (para el
review del usuario).
