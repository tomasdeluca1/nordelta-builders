# Roles (función + cargo) + directorio escalonado de la comunidad

**Fecha:** 2026-07-09
**Estado:** Diseño (pendiente review del usuario)
**Alcance:** 2 subsistemas de código, sin costo de tokens, desplegables ya.

Nace de un mensaje de un miembro de la comunidad (Partner & CTO en Grupo TSA):
el formulario de alta sólo ofrece `Founder/CEO`, `Developer/Engineer`, etc., y
no cubre roles clave que no son CEO (Partner, Cofounder, CTO, COO, CFO). El
usuario validó el reclamo y sumó un segundo pedido: repensar cómo se muestra a
la comunidad — priorizar a quienes conectaron un website, pero mostrar a todos
de forma copada.

Son dos cambios que comparten naturaleza (tocan el flujo de comunidad, puro
código, sin costo de API) pero son planes de implementación independientes.

Decisiones ya tomadas con el usuario:
- **Rol → función + cargo** (dos dimensiones), no una lista plana más larga.
- **Destaque escalonado**: huevsite → web (propia o de empresa) → resto.
- **Directorio en la home** (Approach A): se mantiene el hero de huevsites en
  vivo y se suma abajo una grilla de toda la comunidad con jerarquía por tiers.

---

## Estado actual (contexto)

**Roles** viven hoy en tres lugares sin fuente de verdad única:
- `lib/profile-fields.ts` → `ROLES` + `ROLE_TITLE` (canónico; lo usan
  `/completar`, dashboard y admin vía el select de `ROLES`).
- `app/api/join/route.ts` → duplica `ROLE_TITLE` y define `ROLE_TAGS`.
- `app/page.tsx` (modal de alta) → las `<option>` están **hardcodeadas**, no
  usan `ROLES`.

El schema **ya tiene las dos columnas**: `role` (varchar 60) + `jobTitle`
(varchar 80). El **dashboard** (`app/dashboard/page.tsx`), el **admin**
(`app/admin/page.tsx`) y la **profile-API** (`app/api/auth/profile/route.ts`) ya
exponen función (select) + cargo (input libre) por separado. Los únicos lugares
que **no** dejan cargar el cargo son los de alta pública:
- Form de la home + `/api/join` (deriva `jobTitle` de `ROLE_TITLE`).
- `/completar` + `/api/presentation` (este último **pisa** `jobTitle` con el
  derivado, línea `set.jobTitle = ROLE_TITLE[body.role] ?? body.role`).

**Comunidad** tiene dos vistas:
- Sección `#comunidad` de la home → carousel de iframes en vivo de huevsite.
  **Solo** aparecen los miembros con huevsite conectado (`m.huevsite`).
- Botón "Ver todos los builders" → modal (`showAllModal`) con búsqueda y lista
  plana desde `/api/members/all` (inicial + nombre + cargo@empresa + botón
  "huevsite →"). Todos aparecen, pero como filas de texto detrás de un botón.

Consecuencia: quien no tiene huevsite queda invisible en primer plano o
enterrado en el modal.

---

## Subsistema A — Roles: función + cargo

### Problema

`role` mezcla función (`Developer/Engineer`, `Product/Design`) con posición
(`Founder/CEO`, `Inversor`) y no cubre socios ni C-level que construyen desde un
rol clave sin ser CEO. Un "Partner & CTO" no tiene dónde encajar.

### Decisión

Separar en dos dimensiones, aprovechando las columnas que ya existen:

1. **`role` = función/área.** Nueva lista, única fuente de verdad en
   `lib/profile-fields.ts`:
   `Negocio / Fundación · Tecnología · Producto / Diseño · Marketing / Growth · Inversión · Otro`
2. **`jobTitle` = cargo (texto libre).** El usuario escribe su título real
   (ej. `Partner & CTO`, `Founder & CEO`, `Head of Growth`). Opcional: si queda
   vacío, se deriva de la función vía `ROLE_TITLE` (comportamiento actual).

Resultado para el caso que originó esto: función *Tecnología* + cargo
*"Partner & CTO"* → se muestra **"Partner & CTO @ Grupo TSA"** (el display
`jobTitle @ company` ya existe en la home, dashboard y admin).

### Cambios

**`lib/profile-fields.ts`**
- Reemplazar `ROLES` por la lista de funciones nueva.
- Actualizar `ROLE_TITLE` con las claves nuevas (fallback de cargo cuando el
  usuario no lo escribe): `Negocio / Fundación → Founder`, `Tecnología → Dev`,
  `Producto / Diseño → Product`, `Marketing / Growth → Growth`,
  `Inversión → Inversor`, `Otro → Builder`.
- Exportar un helper de label opcional si hace falta para los `<option>`.

**`app/page.tsx` (modal de alta)**
- Importar `ROLES` (y el label) de `lib/profile-fields` en vez de las `<option>`
  hardcodeadas.
- Cambiar el label del select a algo tipo "Área / función".
- Sumar un campo nuevo **Cargo (opcional)**, placeholder `Ej. Partner & CTO`,
  ligado a `formData.jobTitle`.
- Mandar `jobTitle` en el body del `POST /api/join`.

**`app/api/join/route.ts`**
- Borrar los mapas duplicados `ROLE_TITLE` / `ROLE_TAGS`; importar de
  `lib/profile-fields` (o mover `ROLE_TAGS` allí si se sigue usando).
- **Re-keyear `ROLE_TAGS` a las funciones nuevas** (hoy sus claves son los roles
  viejos): `Negocio / Fundación → ['Founder']`, `Tecnología → ['Dev']`,
  `Producto / Diseño → ['Product']`, `Marketing / Growth → ['Growth']`,
  `Inversión → ['Inversor']`, `Otro → ['Builder']`. Es el default de tags cuando
  el usuario no elige ninguno; si las claves no matchean el `role` nuevo cae
  siempre a `['Builder']`.
- Aceptar `body.jobTitle` (trim). `jobTitle = jobTitleRaw || ROLE_TITLE[role] ?? role`.

**`app/completar/CompletarForm.tsx`**
- Sumar el campo Cargo (mismo patrón que la home), ligado a `identity.jobTitle`.

**`app/api/presentation/route.ts`**
- Dejar de pisar `jobTitle`: aceptar `body.jobTitle` y sólo derivar del rol
  cuando venga vacío (`set.jobTitle = jobTitleRaw || ROLE_TITLE[role] ?? role`).

**Backfill — `scripts/backfill-roles.js` (nuevo)**
- Remapear los `role` viejos a las funciones nuevas para que nadie quede con un
  valor fuera de lista en los selects:
  `Founder/CEO → Negocio / Fundación`, `Developer/Engineer → Tecnología`,
  `Product/Design → Producto / Diseño`, `Marketing/Growth → Marketing / Growth`,
  `Inversor → Inversión`, `Otro → Otro`.
- **No** toca `jobTitle` (los cargos ya cargados se respetan).
- Idempotente: sólo actualiza filas cuyo `role` esté en el set viejo.

### Fuera de alcance

- No se cambia el schema (las columnas ya existen).
- No se inventan tags nuevos: `ROLE_TAGS` sólo se re-keyea a las funciones
  nuevas (mismos valores de tag), no se agregan categorías.

---

## Subsistema B — Directorio escalonado de la comunidad

### Problema

El primer plano de la home sólo muestra huevsites; el resto de la comunidad
queda escondido en un modal como filas de texto. El usuario quiere mostrar a
**todos** de forma copada, priorizando a los que conectaron un website.

### Decisión (Approach A)

Mantener el carousel de huevsites en vivo como **hero** y sumar **debajo** una
grilla de toda la comunidad activa, ordenada en tiers, con búsqueda **inline**
(se muda del modal). Se retira el modal "ver todos".

**Escalonado (tiers):**
- **T1 — huevsite conectado** (`huevsiteUsername` presente): tarjeta rica —
  avatar real, color de acento, cargo@empresa, builder score, botón
  "Ver huevsite".
- **T2 — web conectada** (sin huevsite, pero con `websiteUrl` o `companyUrl`):
  inicial+color, nombre, cargo@empresa, chip "web ↗".
- **T3 — resto**: inicial+color, nombre, cargo@empresa.

**Orden dentro del feed:** T1 primero (featured/approved arriba, después por
antigüedad), luego T2, luego T3 (alfabético). El `tier` se calcula en el
backend.

### Cambios

**`app/api/members/all/route.ts`**
- Sumar `websiteUrl` al select.
- Calcular y devolver `tier` (1/2/3) por miembro.
- Ordenar escalonado (tier asc, y dentro de cada tier el criterio de arriba) en
  vez de sólo `asc(name)`.
- Enriquecimiento de T1 (avatar/accent/builderScore vía `fetchHuevsiteProfile`):
  **diferido**, no en este endpoint por cada miembro. Ver "Perf".

**Componente nuevo — `app/components/CommunityDirectory.tsx`**
- Recibe la lista, renderiza búsqueda inline + grilla tiered con 3 variantes de
  tarjeta.
- "Cargar más" / windowing para no pintar cientos de tarjetas de una.
- El enriquecimiento de T1 se hace por-tarjeta cuando entra en viewport
  (o por lote de los visibles), reusando la data pública de huevsite.

**`app/page.tsx`**
- Reemplazar el modal `showAllModal` (estado + markup) por `CommunityDirectory`
  embebido en la sección `#comunidad`, debajo del carousel.
- El botón "Ver todos los builders" pasa a ser un scroll/anchor a la grilla (o
  se elimina si la grilla ya está visible).
- Se conserva `huevView` (preview de huevsite) que usan las tarjetas T1.

**`app/globals.css`**
- Estilos de la grilla tiered y las 3 variantes de tarjeta, en la estética
  actual (eyebrows tipo `$ ls --community`, acento verde, `PALETTE`). Reusar
  como base las clases `all-*` existentes.

### Perf (consideración explícita)

`fetchHuevsiteProfile` es un fetch por username. Hacerlo para cada miembro T1 en
el endpoint del listado escala mal. Estrategia: el endpoint devuelve sólo campos
locales + `huevsiteUsername`; el enriquecimiento visual (avatar/score) se resuelve
**client-side, diferido** (al entrar en viewport o por lote de visibles). El
carousel hero sigue con su enriquecimiento actual (`/api/members`, limit 60).

### Fuera de alcance

- No se toca el carousel hero ni `/api/members`.
- No se agrega paginación server-side (alcanza con windowing/"cargar más"
  client-side para el tamaño actual de la comunidad).

---

## Plan de implementación

Cada subsistema es un plan independiente y desplegable por separado:
- **A (roles)** puede shipear solo; desbloquea el reclamo del miembro de una.
- **B (directorio)** depende de A sólo para mostrar bien el cargo; se puede
  hacer después.

Orden sugerido: A → backfill → B.
