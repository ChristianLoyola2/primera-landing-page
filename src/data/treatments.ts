export interface Treatment {
  /** Identificador estable; se usa como valor en el formulario. */
  id: string;
  name: string;
  /** Duración del bloque que se reserva en la agenda. */
  duration: string;
  /** Qué es esa hora cuando no es el tratamiento completo. */
  qualifier?: string;
  description: string;
}

export const treatments: readonly Treatment[] = [
  {
    id: 'primera-visita',
    name: 'Primera visita y diagnóstico',
    duration: '40 min',
    description:
      'Examen completo, escaneo intraoral 3D, radiografía panorámica y plan de tratamiento por escrito.',
  },
  {
    id: 'limpieza',
    name: 'Limpieza y profilaxis',
    duration: '45 min',
    description: 'Destartraje ultrasónico, pulido y control de sarro subgingival.',
  },
  {
    id: 'ortodoncia',
    name: 'Ortodoncia invisible',
    duration: '30 min',
    qualifier: 'estudio inicial',
    description:
      'Simulación digital del resultado antes de decidir. Alineadores transparentes, control cada seis semanas.',
  },
  {
    id: 'implantes',
    name: 'Implantes y coronas',
    duration: '30 min',
    qualifier: 'valoración',
    description:
      'Planificación guiada por imagen y corona cerámica diseñada a partir del escaneo.',
  },
  {
    id: 'blanqueamiento',
    name: 'Blanqueamiento',
    duration: '60 min',
    description: 'Sesión en clínica con férulas de mantención hechas a tu medida.',
  },
  {
    id: 'urgencia',
    name: 'Urgencia dental',
    duration: '20 min',
    description:
      'Dolor, fractura o pieza salida. Reservamos cupos de urgencia todos los días.',
  },
] as const;

/** Opción de escape del formulario, fuera del catálogo de tratamientos. */
export const OTHER_REASON_ID = 'otro';

/** Motivos aceptables en una solicitud de hora: el catálogo más "Otro". */
export const bookingReasons = [
  ...treatments.map((t) => ({ id: t.id, name: t.name })),
  { id: OTHER_REASON_ID, name: 'Otro' },
] as const;

export function reasonName(id: string): string | undefined {
  return bookingReasons.find((r) => r.id === id)?.name;
}
