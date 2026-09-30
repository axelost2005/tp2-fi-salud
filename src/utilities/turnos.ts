/**
 * Reglas de agenda del módulo de turnos, como funciones puras (sin acceso a
 * la base). Las usan el hook de validación de la colección, las Server
 * Actions del formulario público y el propio formulario en el navegador,
 * así las tres capas calculan los horarios exactamente igual.
 *
 * Fechas: se manejan como texto "AAAA-MM-DD" en hora de Argentina y se
 * guardan en la base al mediodía UTC, para que el día no cambie por el uso
 * horario (Argentina es UTC-3).
 */

export const ZONA_HORARIA = 'America/Argentina/Buenos_Aires'

/** Cuántos días hacia adelante se pueden pedir turnos online. */
export const DIAS_DE_ANTICIPACION = 45

export const ESTADOS_TURNO = [
  { label: 'Pendiente de confirmación', value: 'pendiente' },
  { label: 'Confirmado', value: 'confirmado' },
  { label: 'Cancelado', value: 'cancelado' },
  { label: 'Atendido', value: 'atendido' },
] as const

export type EstadoTurno = (typeof ESTADOS_TURNO)[number]['value']

const DIAS_SEMANA = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'] as const

type Atencion = {
  dias?: string[] | null
  duracionTurno?: number | null
  horaFin?: string | null
  horaInicio?: string | null
}

const aMinutos = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

const aHHMM = (minutos: number) =>
  `${String(Math.floor(minutos / 60)).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`

/** Día calendario ("AAAA-MM-DD") de un instante, visto desde Argentina. */
export const fechaLocal = (instante: Date | string = new Date()): string => {
  const d = typeof instante === 'string' ? new Date(instante) : instante
  // en-CA formatea como AAAA-MM-DD
  return new Intl.DateTimeFormat('en-CA', {
    day: '2-digit',
    month: '2-digit',
    timeZone: ZONA_HORARIA,
    year: 'numeric',
  }).format(d)
}

/** Hora actual en Argentina como "HH:MM". */
export const horaLocal = (instante: Date = new Date()): string =>
  new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    timeZone: ZONA_HORARIA,
  }).format(instante)

/** Acepta "AAAA-MM-DD" o una fecha ISO y devuelve siempre "AAAA-MM-DD" (día en Argentina). */
export const aFechaCorta = (valor: string | Date): string =>
  typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(valor) ? valor : fechaLocal(valor)

/** Valor que se guarda en la base: el día elegido al mediodía UTC. */
export const aFechaGuardada = (valor: string | Date): string => `${aFechaCorta(valor)}T12:00:00.000Z`

/** Suma días a una fecha "AAAA-MM-DD". */
export const sumarDias = (fecha: string, dias: number): string => {
  const d = new Date(`${fecha}T12:00:00.000Z`)
  d.setUTCDate(d.getUTCDate() + dias)
  return d.toISOString().slice(0, 10)
}

/** "lunes", "martes"... para una fecha "AAAA-MM-DD". */
export const diaDeLaSemana = (fecha: string): (typeof DIAS_SEMANA)[number] =>
  DIAS_SEMANA[new Date(`${fecha}T12:00:00.000Z`).getUTCDay()]

/** "lunes 5 de octubre" */
export const fechaLegible = (fecha: string): string =>
  new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
    weekday: 'long',
  }).format(new Date(`${fecha}T12:00:00.000Z`))

/** Todos los horarios de la agenda de un profesional: 08:00, 08:20, 08:40... */
export const generarHorarios = (atencion?: Atencion | null): string[] => {
  if (!atencion?.horaInicio || !atencion.horaFin) return []
  const paso = Math.max(10, atencion.duracionTurno || 20)
  const fin = aMinutos(atencion.horaFin)
  const horarios: string[] = []
  // El último turno tiene que terminar antes (o justo a) la hora de fin
  for (let t = aMinutos(atencion.horaInicio); t + paso <= fin; t += paso) horarios.push(aHHMM(t))
  return horarios
}

/** ¿El profesional atiende ese día de la semana? */
export const atiendeEseDia = (atencion: Atencion | null | undefined, fecha: string): boolean =>
  Boolean(atencion?.dias?.includes(diaDeLaSemana(fecha)))

/**
 * Próximas fechas en las que atiende un profesional (para el formulario).
 * Hoy se incluye solo si todavía quedan horarios por delante.
 */
export const proximasFechas = (atencion: Atencion | null | undefined, cantidadDias = DIAS_DE_ANTICIPACION): string[] => {
  const hoy = fechaLocal()
  const horarios = generarHorarios(atencion)
  const ultimoHorario = horarios.at(-1)
  const fechas: string[] = []
  for (let i = 0; i <= cantidadDias; i++) {
    const fecha = sumarDias(hoy, i)
    if (!atiendeEseDia(atencion, fecha)) continue
    if (i === 0 && (!ultimoHorario || ultimoHorario <= horaLocal())) continue
    fechas.push(fecha)
  }
  return fechas
}

/** Horarios libres de un día: la agenda menos los ya reservados y, si es hoy, menos los que ya pasaron. */
export const horariosLibres = (
  atencion: Atencion | null | undefined,
  fecha: string,
  reservados: string[],
): string[] => {
  if (!atiendeEseDia(atencion, fecha)) return []
  const esHoy = fecha === fechaLocal()
  const ahora = horaLocal()
  const ocupados = new Set(reservados)
  return generarHorarios(atencion).filter((h) => !ocupados.has(h) && (!esHoy || h > ahora))
}

/** Código corto para que la persona identifique su turno (sin 0/O ni 1/I para no confundir). */
export const generarCodigoTurno = (): string => {
  const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let codigo = ''
  for (let i = 0; i < 6; i++) codigo += alfabeto[Math.floor(Math.random() * alfabeto.length)]
  return `CS-${codigo}`
}
