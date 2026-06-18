// Opciones compartidas por el form de alta, la página /completar, el dashboard,
// el admin y la validación del backend. Editá estas listas para ajustar barrios
// o intenciones de matchmaking.

export const ROLES = [
  'Founder/CEO',
  'Developer/Engineer',
  'Product/Design',
  'Marketing/Growth',
  'Inversor',
  'Otro',
] as const;

// Job title corto derivado del rol (espejo del de /api/join).
export const ROLE_TITLE: Record<string, string> = {
  'Founder/CEO': 'Founder',
  'Developer/Engineer': 'Dev',
  'Product/Design': 'Product',
  'Marketing/Growth': 'Growth',
  'Inversor': 'Inversor',
  'Otro': 'Builder',
};

// Barrios de Nordelta + localidades de zona norte.
export const NEIGHBORHOODS: string[] = [
  'Nordelta · Los Castores',
  'Nordelta · El Yacht',
  'Nordelta · La Isla',
  'Nordelta · Los Lagos',
  'Nordelta · El Golf',
  'Nordelta · Las Caletas',
  'Nordelta · Vistas',
  'Nordelta · Portezuelo',
  'Nordelta · El Portón',
  'Nordelta · Cabos del Lago',
  'Nordelta · Bahía Grande',
  'Nordelta · La Alameda',
  'Nordelta · Santa Catalina',
  'Nordelta · El Rincón',
  'Nordelta · Los Sauces',
  'Nordelta · El Naudir',
  'Nordelta · otro barrio',
  'Tigre',
  'Benavídez',
  'General Pacheco',
  'San Isidro',
  'San Fernando',
  'Vicente López',
  'Pilar',
  'Escobar',
  'Otra zona',
];

// Qué busca cada builder en la comunidad (chips).
export const LOOKING_FOR_OPTIONS: string[] = [
  'Cofounder',
  'Clientes',
  'Inversión',
  'Mentoría',
  'Talento / equipo',
  'Feedback',
  'Networking',
];
