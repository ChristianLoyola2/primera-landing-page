import type { APIRoute } from 'astro';
import { clinic } from '~/data/clinic';
import {
  isHoneypotTripped,
  validateBooking,
  type BookingInput,
  type BookingResponse,
} from '~/lib/booking';
import { bookingReference, formatLongDate } from '~/lib/format';

/**
 * Recibe las solicitudes de hora y las reenvía al correo de la clínica.
 *
 * Corre en el servidor por dos razones: la clave de Web3Forms nunca llega al
 * navegador, y la validación se repite aquí sin confiar en lo que mandó el
 * cliente. Es la única ruta de la página que no se prerenderiza.
 */
export const prerender = false;

const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';
const UPSTREAM_TIMEOUT_MS = 10_000;

function json(body: BookingResponse, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  let payload: Partial<BookingInput>;
  try {
    payload = (await request.json()) as Partial<BookingInput>;
  } catch {
    return json({ ok: false, message: 'No pudimos leer el formulario.' }, 400);
  }

  // Trampa antispam: respondemos como si todo hubiera salido bien para no
  // enseñarle al bot qué lo delató, pero no enviamos ningún correo.
  if (isHoneypotTripped(payload)) {
    return json({ ok: true, reference: bookingReference() }, 200);
  }

  const validation = validateBooking(payload, { timezone: clinic.timezone });
  if (!validation.ok) {
    return json({ ok: false, field: validation.field, message: validation.message }, 400);
  }

  const accessKey = import.meta.env.WEB3FORMS_ACCESS_KEY;
  if (!accessKey) {
    console.error('Falta la variable de entorno WEB3FORMS_ACCESS_KEY.');
    return json(
      { ok: false, message: 'El formulario no está configurado en el servidor.' },
      500,
    );
  }

  const booking = validation.data;
  const reference = bookingReference();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const upstream = await fetch(WEB3FORMS_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        access_key: accessKey,
        subject: `Nueva hora · ${booking.motivoNombre} · ${booking.nombre}`,
        from_name: `Agenda web ${clinic.name}`,
        ...(booking.email ? { replyto: booking.email } : {}),
        Nombre: booking.nombre,
        Telefono: booking.telefono,
        Email: booking.email || 'no indicado',
        Motivo: booking.motivoNombre,
        'Dia preferido': `${formatLongDate(booking.fecha)} (${booking.fecha})`,
        Franja: booking.franjaNombre,
        Notas: booking.notas || 'sin notas',
        Codigo: reference,
      }),
    });

    const result = (await upstream.json().catch(() => ({}))) as {
      success?: boolean;
      message?: string;
    };

    if (!upstream.ok || !result.success) {
      throw new Error(result.message ?? `Web3Forms respondió ${upstream.status}`);
    }

    return json({ ok: true, reference }, 200);
  } catch (error) {
    console.error('No se pudo reenviar la solicitud de hora:', error);
    return json({ ok: false, message: 'No pudimos enviar la solicitud.' }, 502);
  } finally {
    clearTimeout(timeout);
  }
};
