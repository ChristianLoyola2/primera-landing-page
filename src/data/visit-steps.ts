export interface VisitStep {
  title: string;
  description: string;
}

/**
 * El orden importa: es la secuencia real de la primera consulta, y por eso
 * la página los numera.
 */
export const visitSteps: readonly VisitStep[] = [
  {
    title: 'Conversamos',
    description:
      'Nos cuentas qué te trae, desde cuándo y qué te preocupa. Revisamos antecedentes de salud y medicamentos.',
  },
  {
    title: 'Escaneamos',
    description:
      'Escáner intraoral 3D y panorámica digital. Ves tu boca en pantalla mientras te explicamos lo que aparece.',
  },
  {
    title: 'Te vas con el plan',
    description:
      'Etapas, tiempos y valores por escrito antes de salir. Sin compromiso de tratarte con nosotros.',
  },
] as const;
