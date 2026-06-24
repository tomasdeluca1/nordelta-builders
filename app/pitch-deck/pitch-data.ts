// Snapshot de la comunidad a junio 2026 (datos reales de la DB de producción).
// El TOTAL de miembros se hidrata en vivo desde /api/members; este número es el fallback.
// Refrescado el 2026-06-23 con scripts/community-stats.js.
export const SNAPSHOT_LABEL = 'Datos a junio 2026';
export const MEMBERS_FALLBACK = 163; // miembros activos al 2026-06-23

// Acumulado por mes (de un grupo de 6 a 163 en semanas).
export const GROWTH = [
  { label: 'mar', n: 4 },
  { label: 'may', n: 6 },
  { label: 'jun', n: 163 },
];

export const ROLES = [
  { label: 'Founder / CEO', n: 84 },
  { label: 'Dev / Engineer', n: 46 },
  { label: 'Marketing / Growth', n: 12 },
  { label: 'Otro', n: 10 },
  { label: 'Product / Design', n: 9 },
  { label: 'Inversor', n: 2 },
];

export const VERTICALS = [
  { label: 'AI', n: 95 },
  { label: 'SaaS', n: 59 },
  { label: 'Fintech', n: 30 },
  { label: 'Marketing', n: 26 },
  { label: 'Design', n: 21 },
  { label: 'Web3', n: 20 },
  { label: 'Proptech', n: 3 },
];

export const LOOKING_FOR = [
  { label: 'Networking', n: 71 },
  { label: 'Feedback', n: 32 },
  { label: 'Talento / equipo', n: 28 },
  { label: 'Clientes', n: 26 },
  { label: 'Mentoría', n: 24 },
  { label: 'Cofounder', n: 22 },
  { label: 'Inversión', n: 14 },
];

export const GEOGRAPHY = [
  'Nordelta', 'Vicente López', 'Pilar', 'San Isidro',
  'Tigre', 'Escobar', 'General Pacheco', 'San Fernando',
];

export const PLATFORM = { huevsites: 28, linkedin: 81, websites: 23 };

export const TEAM = [
  { name: 'Tomás Deluca', initials: 'TD', role: 'Organizador' },
  { name: 'Patricio Iturraspe', initials: 'PI', role: 'Organizador' },
  { name: 'Lucas Argento', initials: 'LA', role: 'Organizador' },
];

export const TIERS = [
  {
    name: 'Lead',
    tagline: 'El sponsor principal del ciclo.',
    perks: [
      'Tu marca al frente de los eventos',
      'Espacio para hablar en los encuentros',
      'Presencia en nordelta.tech',
      'Línea directa con la comunidad',
    ],
  },
  {
    name: 'Partner',
    tagline: 'Acompañás de cerca.',
    perks: [
      'Marca en eventos y en la plataforma',
      'Acceso a la comunidad para contratar o testear',
      'Participación en una actividad por ciclo',
    ],
  },
  {
    name: 'Friend',
    tagline: 'Bancás que esto crezca.',
    perks: [
      'Mención como sponsor',
      'Invitaciones a los encuentros',
      'Acceso al directorio de builders',
    ],
  },
];

export const CONTACT = { email: 'huevsite.studio@gmail.com', site: 'nordelta.tech' };
