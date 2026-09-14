import { clinic } from '~/data/clinic';
import {
  isHoneypotTripped,
  todayInTimezone,
  validateBooking,
  type BookingInput,
  type BookingResponse,
} from '~/lib/booking';
import { formatLongDate } from '~/lib/format';
import { slotLabel } from '~/data/time-slots';
import { reasonName } from '~/data/treatments';

const ENDPOINT = '/api/booking';

function el<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

export function initBookingForm(): void {
  const form = el<HTMLFormElement>('form-hora');
  const confirmation = el<HTMLElement>('confirmacion');
  const notice = el<HTMLParagraphElement>('aviso');
  const submitButton = el<HTMLButtonElement>('enviar');
  const dateField = el<HTMLInputElement>('fecha');

  if (!form || !confirmation || !notice || !submitButton || !dateField) return;

  const timezone = form.dataset.timezone ?? clinic.timezone;

  // La página se prerenderiza, así que el día mínimo no puede venir del
  // build: se fija en el navegador, cada vez que alguien abre la página.
  dateField.min = todayInTimezone(timezone);

  function showNotice(message: string): void {
    notice!.textContent = message;
    notice!.hidden = false;
  }

  function failed(technicalReason: unknown): void {
    console.error('Sonrisa Digital · formulario:', technicalReason);
    submitButton!.disabled = false;
    submitButton!.textContent = 'Solicitar hora';
    showNotice(
      `No pudimos enviar la solicitud. Llámanos al ${clinic.phone.display} y te damos la hora al momento.`,
    );
  }

  function readForm(): BookingInput {
    const data = new FormData(form!);
    const value = (name: string): string => {
      const raw = data.get(name);
      return typeof raw === 'string' ? raw : '';
    };

    return {
      nombre: value('nombre'),
      telefono: value('telefono'),
      email: value('email'),
      motivo: value('motivo'),
      fecha: value('fecha'),
      franja: value('franja'),
      notas: value('notas'),
      botcheck: value('botcheck'),
    };
  }

  function showConfirmation(input: BookingInput, reference: string): void {
    const summary: Array<[string, string]> = [
      ['ok-motivo', reasonName(input.motivo) ?? input.motivo],
      ['ok-fecha', `${formatLongDate(input.fecha)} · ${slotLabel(input.franja) ?? input.franja}`],
      ['ok-tel', input.telefono],
      ['ok-codigo', reference],
    ];

    for (const [id, text] of summary) {
      const target = el(id);
      if (target) target.textContent = text;
    }

    form!.hidden = true;
    confirmation!.hidden = false;
    confirmation!.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    notice.hidden = true;

    const input = readForm();

    // Un bot rellenó el campo trampa: no enviamos nada y no le decimos por qué.
    if (isHoneypotTripped(input)) return;

    const validation = validateBooking(input, { timezone });
    if (!validation.ok) {
      showNotice(validation.message);
      el<HTMLElement>(validation.field)?.focus();
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Enviando…';

    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(input),
      });

      const body = (await response.json()) as BookingResponse;

      if (!response.ok || !body.ok) {
        // 400 es culpa del formulario y tiene un mensaje útil para el paciente;
        // cualquier otro código es problema nuestro.
        if (response.status === 400 && !body.ok) {
          submitButton.disabled = false;
          submitButton.textContent = 'Solicitar hora';
          showNotice(body.message);
          if (body.field) el<HTMLElement>(body.field)?.focus();
          return;
        }
        throw new Error(!body.ok ? body.message : `HTTP ${response.status}`);
      }

      showConfirmation(input, body.reference);
    } catch (error) {
      failed(error);
    }
  });
}
