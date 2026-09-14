import { bookingReasons, reasonName } from '~/data/treatments';
import { slotLabel, timeSlots } from '~/data/time-slots';

/**
 * Validación compartida por el navegador y por la función serverless.
 *
 * Vive en un solo archivo a propósito: el cliente valida para dar respuesta
 * inmediata, el servidor vuelve a validar porque nunca confía en lo que le
 * llega. Ambos usan exactamente las mismas reglas. Se escribió a mano en vez
 * de usar una librería de esquemas para no mandar un validador entero al
 * navegador por seis campos.
 */

export interface BookingInput {
  nombre: string;
  telefono: string;
  email: string;
  motivo: string;
  fecha: string;
  franja: string;
  notas: string;
  /** Campo trampa: solo un bot lo rellena. */
  botcheck?: string;
}

export interface Booking {
  nombre: string;
  telefono: string;
  email: string;
  motivo: string;
  motivoNombre: string;
  fecha: string;
  franja: string;
  franjaNombre: string;
  notas: string;
}

export type BookingField = keyof BookingInput;

export type ValidationResult =
  | { ok: true; data: Booking }
  | { ok: false; field: BookingField; message: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const MAX_NOTES = 600;

/** Cuenta solo dígitos: tolera +56, espacios, guiones y paréntesis. */
export function digitCount(value: string): number {
  return value.replace(/\D/g, '').length;
}

/**
 * El "hoy" de la agenda es el de la clínica, no el del navegador del
 * paciente ni el del servidor donde corra la función.
 */
export function todayInTimezone(timezone: string, now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function isHoneypotTripped(raw: Partial<BookingInput>): boolean {
  return text(raw.botcheck).length > 0;
}

export function validateBooking(
  raw: Partial<BookingInput>,
  options: { timezone: string; now?: Date },
): ValidationResult {
  const nombre = text(raw.nombre);
  if (nombre.length < 2) {
    return { ok: false, field: 'nombre', message: 'Falta tu nombre para poder contactarte.' };
  }
  if (nombre.length > 120) {
    return { ok: false, field: 'nombre', message: 'El nombre es demasiado largo.' };
  }

  const telefono = text(raw.telefono);
  if (digitCount(telefono) < 8) {
    return {
      ok: false,
      field: 'telefono',
      message: 'Revisa el teléfono: necesitamos un número donde llamarte.',
    };
  }

  const email = text(raw.email);
  if (email && !EMAIL_PATTERN.test(email)) {
    return { ok: false, field: 'email', message: 'Ese correo no parece válido.' };
  }

  const motivo = text(raw.motivo) || bookingReasons[0].id;
  const motivoNombre = reasonName(motivo);
  if (!motivoNombre) {
    return { ok: false, field: 'motivo', message: 'Elige un motivo de la lista.' };
  }

  const fecha = text(raw.fecha);
  if (!ISO_DATE_PATTERN.test(fecha)) {
    return { ok: false, field: 'fecha', message: 'Elige un día preferido para tu hora.' };
  }
  if (fecha < todayInTimezone(options.timezone, options.now)) {
    return { ok: false, field: 'fecha', message: 'Ese día ya pasó. Elige una fecha desde hoy.' };
  }

  const franja = text(raw.franja) || timeSlots[0].id;
  const franjaNombre = slotLabel(franja);
  if (!franjaNombre) {
    return { ok: false, field: 'franja', message: 'Elige una franja horaria.' };
  }

  const notas = text(raw.notas).slice(0, MAX_NOTES);

  return {
    ok: true,
    data: { nombre, telefono, email, motivo, motivoNombre, fecha, franja, franjaNombre, notas },
  };
}

/** Respuesta de POST /api/booking. */
export type BookingResponse =
  | { ok: true; reference: string }
  | { ok: false; field?: BookingField; message: string };
