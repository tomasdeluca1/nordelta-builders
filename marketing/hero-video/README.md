# Video del hero · Norte Tech

Video de presentación de la comunidad hecho con [Remotion](https://remotion.dev) (React → MP4).
18 s a 128 BPM, guion "Quiénes somos", paleta Índigo, Outfit + Instrument Serif + JetBrains Mono.

## Composiciones

| id | tamaño | audio | uso |
|---|---|---|---|
| `Hero` | 1080×1350 (4:5) | no, fundido al final para el loop | hero del sitio |
| `Social` | 1920×1080 | sí | X, LinkedIn, YouTube |
| `Vertical` | 1080×1920 | sí | Reels, Stories, TikTok |

## Comandos

```bash
npm install
npm run studio           # editar con preview en vivo
npm run logo             # regenera public/brand/*.svg del sitio y src/logo-data.ts
npm run music            # regenera public/music/norte-tech-hype.wav (tema sintetizado, sin licencias)
npm run render:hero      # out/hero.mp4
npm run render:social    # out/norte-tech-social.mp4
npm run render:vertical  # out/norte-tech-vertical.mp4
```

Después de renderizar el hero, comprimirlo para la web:

```bash
ffmpeg -i out/hero.mp4 -c:v libx264 -crf 25 -preset slow -pix_fmt yuv420p -movflags +faststart -an ../../public/video/norte-tech-hero.mp4
ffmpeg -i out/hero.mp4 -c:v libvpx-vp9 -b:v 0 -crf 36 -row-mt 1 -an ../../public/video/norte-tech-hero.webm
ffmpeg -ss 14.6 -i out/hero.mp4 -frames:v 1 -q:v 3 ../../public/video/norte-tech-hero-poster.jpg
```

## Datos

Los números del video (miembros, tags, coworks) están en `src/theme.ts` → `DATA`. Actualizarlos antes de volver a renderizar.
Las fotos salen de `public/community` y `public/coworks` del sitio (symlinks).
