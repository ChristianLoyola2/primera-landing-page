export interface TimeSlot {
  id: string;
  /** Etiqueta compacta para el control del formulario. */
  short: string;
  /** Etiqueta completa para la confirmación y el correo a la clínica. */
  label: string;
}

export const timeSlots: readonly TimeSlot[] = [
  { id: 'manana', short: 'Mañana 9–13', label: 'Mañana 9:00–13:00' },
  { id: 'tarde', short: 'Tarde 15–20', label: 'Tarde 15:00–20:00' },
] as const;

export function slotLabel(id: string): string | undefined {
  return timeSlots.find((s) => s.id === id)?.label;
}
