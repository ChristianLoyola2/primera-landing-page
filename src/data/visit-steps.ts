export interface VisitStep {
  title: string;
  description: string;
  /** Minutos que ocupa el tramo. La página dibuja los bloques a esta escala. */
  minutes: number;
}

/**
 * El orden importa: es la secuencia real de la primera consulta. Los
 * minutos también, porque la página los dibuja a escala en vez de
 * numerar los pasos.
 */
export const visitSteps: readonly VisitStep[] = [
  {
    title: 'Conversamos',
    description:
      'Nos cuentas qué te trae, desde cuándo y qué te preocupa. Revisamos antecedentes de salud y medicamentos.',
    minutes: 12,
  },
  {
    title: 'Escaneamos',
    description:
      'Escáner intraoral 3D y panorámica digital. Ves tu boca en pantalla mientras te explicamos lo que aparece.',
    minutes: 16,
  },
  {
    title: 'Te vas con el plan',
    description:
      'Etapas, tiempos y valores por escrito antes de salir. Sin compromiso de tratarte con nosotros.',
    minutes: 12,
  },
] as const;

/** Duración total de la primera visita, sumada desde los tramos. */
export const visitMinutes = visitSteps.reduce((total, step) => total + step.minutes, 0);
