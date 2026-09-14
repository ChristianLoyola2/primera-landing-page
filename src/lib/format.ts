/** Alfabeto sin caracteres que se confundan al dictarlos por teléfono (0/O, 1/I). */
const REFERENCE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const REFERENCE_LENGTH = 5;

/**
 * Código corto que el paciente puede leer por teléfono y la clínica buscar
 * en su correo. No es un identificador único garantizado: es una referencia
 * humana para una solicitud que además trae nombre, teléfono y fecha.
 */
export function bookingReference(): string {
  const bytes = new Uint8Array(REFERENCE_LENGTH);
  crypto.getRandomValues(bytes);

  let code = '';
  for (const byte of bytes) {
    code += REFERENCE_ALPHABET[byte % REFERENCE_ALPHABET.length];
  }
  return `SD-${code}`;
}

/** "2026-09-21" → "lunes, 21 de septiembre" */
export function formatLongDate(isoDate: string, locale = 'es-CL'): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  if (!year || !month || !day) return isoDate;

  // Fecha local a propósito: es un día de calendario, no un instante.
  return new Date(year, month - 1, day).toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}
