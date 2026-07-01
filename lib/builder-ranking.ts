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
  photo?: string; // foto pública verificada; si falta, la card usa las iniciales.
}

export const SHOWCASE_BUILDERS: ShowcaseBuilder[] = [
  { name: 'Diego Saez Gil',       role: 'Founder & CEO',              company: 'Pachama',          initials: 'DS', photo: '/builders/diego-saez-gil.jpg' },
  { name: 'Agustín Iglesias',     role: 'Co-founder & CEO',           company: 'Pulppo',           initials: 'AI', photo: '/builders/agustin-iglesias.jpg' },
  { name: 'Diego Noriega',        role: 'Co-founder & CEO',           company: 'SquadS Ventures',  initials: 'DN', photo: '/builders/diego-noriega.jpg' },
  { name: 'Mariano Focaraccio',   role: 'Founder & CEO',              company: 'Atanor',           initials: 'MF', photo: '/builders/mariano-focaraccio.jpg' },
  { name: 'Gastón Krasny',        role: 'Co-founder & CTO',           company: 'JurisprudenciaARG', initials: 'GK', photo: '/builders/gaston-krasny.jpg' },
  { name: 'Tomás Barreiro',       role: 'Senior Software Engineer',   company: 'Cline',            initials: 'TB', photo: '/builders/tomas-barreiro.jpg' },
  { name: 'Valeria Viva',         role: 'Co-founder & CTO',           company: 'XSTEM',            initials: 'VV', photo: '/builders/valeria-viva.jpg' },
  { name: 'Jorge Emiliano',       role: 'Founder · ex-Amazon',        company: 'Nordata Analytics', initials: 'JE', photo: '/builders/jorge-emiliano.jpg' },
  { name: 'Ivan Lendner',         role: 'Founder & CEO',              company: 'Sentrio',          initials: 'IL' },
  { name: 'Lucas Nikitczuk',      role: 'Founder & CEO',              company: 'NK Studio',        initials: 'LN', photo: '/builders/lucas-nikitczuk.jpg' },
  { name: 'Leandro Ahmad',        role: 'Founder & CEO',              company: 'Administrado',     initials: 'LA', photo: '/builders/leandro-ahmad.jpg' },
  { name: 'Florencia de Pamphilis', role: 'Founding Product Designer', company: 'HyperSignals',    initials: 'FP', photo: '/builders/florencia-de-pamphilis.jpg' },
];
