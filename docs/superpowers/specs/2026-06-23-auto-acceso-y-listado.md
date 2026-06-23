# Auto-acceso al registro + listado completo en la landing

**Fecha:** 2026-06-23
**Estado:** Diseño (pendiente review del usuario)
**Alcance:** 2 subsistemas de código, sin costo de tokens, desplegables ya.

Cubre dos cambios que comparten una misma naturaleza: tocan el flujo de
registro / comunidad de la app actual, son puro código y no tienen costo de
API. El research de builders (subsistema B) va en su propio spec
(`2026-06-23-builder-research-ranking.md`) porque es trabajo de otra clase
(workflow pago, con gate de piloto).

Cada subsistema de acá es un plan de implementación independiente.

---

## Subsistema A — Auto-acceso al registrarse

### Problema

Hoy el alta queda en revisión manual: `app/api/join/route.ts` inserta al
builder con `status: 'pending'` y le manda un mail de "recibimos tu registro,
un admin lo revisa". El acceso (credenciales + WhatsApp) recién sale cuando un
admin aprueba desde `/admin` (`app/api/admin/members/[id]/action/route.ts`,
acción `accept`). El usuario quiere sacar ese cuello de botella: que entren
solos.

### Decisión

Al registrarse, el builder queda **activo de una** y recibe **un solo mail**
con todo lo que necesita:

1. **Acceso a la plataforma** — credenciales (email + contraseña temporal) y
   botón a `/login`. (Confirmado por el usuario: "Email con acceso + WhatsApp".)
2. **Invitación al grupo de WhatsApp** de la comunidad.
3. **Pedido de website _condicional_** — sólo si no cargó `websiteUrl` en el
   formulario. Si ya lo cargó, ese bloque no aparece. "Y nada más": el mail no
   suma nada fuera de estos tres puntos.

No hay más revisión de admin como paso bloqueante. El aviso interno al admin
("se sumó un builder nuevo") se mantiene como notificación informativa, no como
cola de aprobación.

### Cambios

**`app/api/join/route.ts`**
- Insertar con `status: 'active'` en vez de `'pending'`. El resto del insert
  queda igual (`passwordHash`, `mustChangePassword: true`,
  `profileSubmittedAt: new Date()`, presentación, etc.).
- Reemplazar la llamada a `sendRegistrationReceivedEmail` por la nueva
  `sendWelcomeEmail({ to, name, defaultPassword: defaultPwd, needsWebsite })`,
  donde `needsWebsite = !presentation.websiteUrl`. La contraseña temporal es la
  misma que ya se calcula (`defaultPwd = defaultPasswordFor(name)`).
- Mantener `sendAdminNewRegistrationEmail`, ajustando sólo el copy del asunto /
  template para que no diga "pendiente" ni "revisar" (es un aviso, no una cola).
- La respuesta deja de marcar `pending: true`; devuelve `{ success: true, id, active: true }`.

**`lib/email.ts` + `lib/email-templates/welcome.ts` (nuevo)**
- Nueva función `sendWelcomeEmail(params: { to: string; name: string; defaultPassword: string; needsWebsite: boolean }): Promise<void>`.
  Lee `whatsapp_group_url` de settings (igual que `sendAcceptedEmail`), arma el
  HTML con `welcomeEmailHtml` y manda con Resend.
- Nuevo template `welcomeEmailHtml(params: { name; email; password; loginUrl; whatsappUrl; appUrl; needsWebsite }): string`,
  reusando los bloques de `lib/email-templates/layout.ts`
  (`emailShell`, `headingRow`, `paragraphRow`, `buttonRow`, `escapeHtml`,
  `escapeAttr`). Estructura: saludo de bienvenida → bloque de credenciales →
  botón "Iniciar sesión" → bloque WhatsApp (si hay URL) → **bloque "agregá tu
  website" sólo si `needsWebsite`** (apunta a `/login`/dashboard). Sin la lista
  "¿qué sigue?" larga del mail de aceptación: "nada más".
- `sendRegistrationReceivedEmail` queda en el archivo pero sin usarse desde el
  join (no se borra: lo puede reutilizar otro flujo). El de aceptación
  (`sendAcceptedEmail`) **no se toca** — lo sigue usando el botón "resend" /
  aceptación manual del admin.

**`app/page.tsx` (modal de registro)**
- Estado `success` (líneas ~537-544): el copy ya no dice "$ status --pending" ni
  "un admin va a revisar". Pasa a confirmar acceso inmediato: revisá el mail,
  ahí tenés tu acceso y la invitación al grupo. Tono actual (rioplatense,
  directo), sin sonar a AI.
- `modal-sub` (línea 553): sacar "Un admin revisa tu presentación y, si te
  acepta…". Reemplazar por algo tipo: entrás al toque y te llega el acceso + el
  grupo por mail.

### Verificación
- `npm run build` compila sin errores de tipos/lint.
- Registro de prueba (email descartable): el miembro queda `status='active'`,
  llega **un** mail con credenciales + WhatsApp; el bloque de website aparece
  sólo si no se cargó `websiteUrl`, y no aparece si se cargó.
- Con esas credenciales se puede entrar a `/login` y cae en cambio de
  contraseña (`mustChangePassword`).
- El admin recibe el aviso informativo (sin lenguaje de "pendiente").
- El modal de la landing muestra el nuevo copy de éxito.

---

## Subsistema C — Modal "Ver todos" en la comunidad

### Problema

La sección `#comunidad` de `app/page.tsx` muestra un slider/marquee animado de
miembros, y `/api/members` devuelve como mucho 60 activos (con enriquecimiento
de huevsite, que es caro). No hay forma de ver el listado completo de
participantes. El usuario quiere "una parte para ver el listado de todos",
resuelto como **modal "Ver todos" con búsqueda**.

### Decisión

- Botón **"Ver todos los N builders →"** en la sección de comunidad (junto al
  `members-join` o en el `comunidad-head`). `N` = `memberTotal` (ya se trae del
  `/api/members` → `total`).
- Modal con **buscador** que lista a **todos los activos**, filtrando en vivo por
  nombre, empresa, rol y tags. Sigue el patrón de modal existente
  (`modal-overlay` / `modal-card`, lock de `body.overflow`, cerrar con click
  afuera y con Escape).
- Como `/api/members` corta en 60 y hace fetch de huevsites, se agrega un
  **endpoint liviano** para el listado completo, sin enriquecimiento externo.

### Cambios

**`app/api/members/all/route.ts` (nuevo)**
- `GET` que devuelve **todos** los miembros `status='active'`, ordenados por
  nombre, con campos livianos: `id`, `name`, `initials`, `role`, `jobTitle`,
  `company`, `companyUrl`, `tags`, `colorIndex`, `huevsiteUsername`,
  `huevsiteApproved`. **Sin** `fetchHuevsiteProfile` (sin llamadas externas, sin
  límite de 60). Respuesta: `{ members: [...], total }`.
- `runtime = 'nodejs'`, `dynamic = 'force-dynamic'`.

**`app/page.tsx`**
- Nuevo estado `showAllModal` (bool) y `allMembers` (lista liviana, fetch lazy
  al abrir el modal por primera vez) + `allQuery` (texto del buscador).
- Sumar `showAllModal` al `useEffect` que bloquea el scroll del body y al
  manejo de Escape, igual que `showJoinModal`/`huevView`.
- Botón "Ver todos los {memberTotal} builders →" en la sección comunidad.
- Modal: input de búsqueda + grilla/lista filtrada. Cada fila reusa lo visual de
  `renderMemberCard` (avatar por iniciales/color, nombre, rol/empresa, tags) en
  versión compacta. Si el miembro tiene `huevsiteApproved && huevsiteUsername`,
  el botón "Ver huevsite" abre el visor existente (`setHuevView`). El filtro es
  client-side sobre `allMembers` (case-insensitive, sobre name/company/role/tags).
- El fetch de `/api/members/all` se dispara la primera vez que se abre el modal
  (no en el load inicial de la landing, para no pesar el primer paint).

### Privacidad
La sección de comunidad ya es pública y muestra nombre/empresa/iniciales de
miembros. El modal expone el mismo tipo de dato para el resto de los activos —
no agrega exposición nueva. No se muestran emails ni datos de contacto privados.

### Verificación
- `npm run build` compila sin errores.
- El botón muestra el total real; al abrir, el modal lista a todos los activos
  (más de 60).
- El buscador filtra en vivo por nombre, empresa, rol y tag.
- Cerrar con click afuera y con Escape; el scroll del body se bloquea mientras
  está abierto.
- Para miembros con huevsite aprobado, "Ver huevsite" abre el visor.
- El listado no incluye emails ni campos privados.

---

## Fuera de alcance (YAGNI)
- Paginación / scroll infinito en el modal (con ~160 alcanza render directo).
- Enriquecimiento de huevsite en el listado completo (caro; queda para el
  slider destacado de 60 que ya existe).
- Filtros avanzados (por barrio, por "qué busca"): el buscador de texto alcanza.
- Tocar el flujo de aceptación manual del admin (sigue existiendo para casos
  borde: reactivar, rechazar, resend).

## Guía de voz
Misma de siempre: castellano rioplatense, directo, frases cortas, números antes
que adjetivos. Nada de clichés de IA/marketing ("desbloqueá", "potenciá", "lleva
X al siguiente nivel"), sin relleno corporativo, sin exceso de emojis.
