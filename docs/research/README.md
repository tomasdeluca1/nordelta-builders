# Research de builders (subsistema B)

Carpeta de trabajo del research de perfiles para el pitch deck. **Todo lo
generado acá es PII y NO se commitea** (ver `.gitignore`).

## Flujo

1. **Export** (sin costo): `node scripts/export-active-members.js [--limit=15]`
   → escribe `active-members.json` (entrada del workflow).
2. **Research** (pago, con gate de piloto): se invoca el workflow
   `scripts/builder-research.workflow.js` con ese JSON como `args`. Empezar con
   el piloto de 15 para medir consumo real antes de ir por los ~160.
3. **Reporte**: los resultados se vuelcan a `builder-ranking-report.md`
   (rankeado, con evidencia y confianza). **Gate humano**: el usuario cura a mano
   quiénes entran al deck.
4. **Showcase**: con la curación, se escribe `lib/builder-ranking.ts` (sólo el
   subconjunto elegido: nombre/rol/empresa/huevsite, sin scores) y se agrega el
   slide "Los builders" al deck.

Detalle completo en `docs/superpowers/plans/2026-06-23-builder-research-ranking.md`.
