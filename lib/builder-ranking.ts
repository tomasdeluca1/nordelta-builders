// Showcase de builders para el pitch deck.
//
// Subconjunto curado a mano (2026-06-24) a partir del research de la base
// (docs/research/builder-ranking-report.md). Es una MUESTRA representativa de la
// comunidad para mostrarle a sponsors/inversores — no un ranking público: no
// lleva scores ni orden de "top N". El research interno queda en el reporte.
//
// Avatar = iniciales en estilo de marca (ninguno tiene huevsite aprobado hoy).

export interface ShowcaseBuilder {
  name: string;
  role: string;
  company: string;
  initials: string;
}

export const SHOWCASE_BUILDERS: ShowcaseBuilder[] = [
  { name: 'Diego Saez Gil',       role: 'Founder & CEO',              company: 'Pachama',          initials: 'DS' },
  { name: 'Agustín Iglesias',     role: 'Co-founder & CEO',           company: 'Pulppo',           initials: 'AI' },
  { name: 'Diego Noriega',        role: 'Co-founder & CEO',           company: 'SquadS Ventures',  initials: 'DN' },
  { name: 'Mariano Focaraccio',   role: 'Founder & CEO',              company: 'Atanor',           initials: 'MF' },
  { name: 'Gastón Krasny',        role: 'Co-founder & CTO',           company: 'JurisprudenciaARG', initials: 'GK' },
  { name: 'Tomás Barreiro',       role: 'Senior Software Engineer',   company: 'Cline',            initials: 'TB' },
  { name: 'Valeria Viva',         role: 'Co-founder & CTO',           company: 'XSTEM',            initials: 'VV' },
  { name: 'Jorge Emiliano',       role: 'Founder · ex-Amazon',        company: 'Nordata Analytics', initials: 'JE' },
  { name: 'Ivan Lendner',         role: 'Founder & CEO',              company: 'Sentrio',          initials: 'IL' },
  { name: 'Lucas Nikitczuk',      role: 'Founder & CEO',              company: 'NK Studio',        initials: 'LN' },
  { name: 'Leandro Ahmad',        role: 'Founder & CEO',              company: 'Administrado',     initials: 'LA' },
  { name: 'Florencia de Pamphilis', role: 'Founding Product Designer', company: 'HyperSignals',    initials: 'FP' },
];
