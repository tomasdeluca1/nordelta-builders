# Norte Tech

Sitio de comunidad (bsasnortetech.vercel.app).

Stack: Next.js + Neon + Resend · hereda las constantes del raíz (`Projects/CLAUDE.md`).
Completar aquí lo específico: comandos no estándar, env vars clave, decisiones de arquitectura.

## Marca

- Paleta Índigo (`--bg #0a0f24`) con el degradado del logo `--g1 #5a8fda → --g2 #8e6bae → --g3 #f4c2a8` como único acento. Tokens en `app/globals.css`.
- Tipografías: Outfit (títulos y texto), Instrument Serif itálica para la palabra destacada (`.serif-hl`), JetBrains Mono para datos.
- Logo en vector en `public/brand/` (generado por `marketing/hero-video/scripts/build-logo.mjs`, no editar a mano). El nombre en textos es siempre "Norte Tech"; el logo dice `norte.tech`.
- Video del hero: `marketing/hero-video` (Remotion). Salida web en `public/video/`.

