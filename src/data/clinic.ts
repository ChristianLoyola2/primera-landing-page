/**
 * Única fuente de verdad de los datos de la clínica.
 *
 * Todo lo que se muestre en la página (cabecera, ficha, pie, datos
 * estructurados para buscadores y el correo de las solicitudes) sale de
 * aquí. Para cambiar el teléfono o la dirección se toca este archivo y
 * nada más.
 */
export const clinic = {
  name: 'Sonrisa Digital',
  tagline: 'Clínica dental',

  phone: {
    display: '+56 2 2345 6789',
    href: 'tel:+56223456789',
  },
  email: 'hola@sonrisadigital.cl',

  address: {
    street: 'Av. Los Leones 1450, of. 302',
    district: 'Providencia',
    city: 'Santiago',
    region: 'Región Metropolitana',
    country: 'CL',
    transit: 'Metro Los Leones, línea 1',
  },

  /** Zona horaria de la agenda: define qué día es "hoy" al validar una solicitud. */
  timezone: 'America/Santiago',

  hours: {
    weekdays: 'Lun a vie 9:00–20:00',
    saturday: 'Sábado 9:00–14:00',
    /** Formato schema.org, para los datos estructurados. */
    schema: ['Mo-Fr 09:00-20:00', 'Sa 09:00-14:00'],
  },

  firstVisit: {
    /** Forma corta, para las tablas y fichas donde manda la brevedad. */
    duration: '40 min',
    /** Forma larga, para cuando la duración va dentro de una frase. */
    durationLong: '40 minutos',
    note: 'con escaneo 3D',
  },

  urgency: 'Atención el mismo día',

  /** Plazo que le prometemos al paciente para llamarlo de vuelta. */
  responseWindow: 'dos horas hábiles',
} as const;

export type Clinic = typeof clinic;
