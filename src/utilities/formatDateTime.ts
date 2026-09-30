/**
 * Fecha en español de Argentina: "12 de agosto de 2026".
 * (El template mostraba el formato de EE. UU., MM/DD/AAAA.)
 */
export const formatDateTime = (timestamp: string): string => {
  const date = timestamp ? new Date(timestamp) : new Date()

  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'long',
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
  }).format(date)
}
