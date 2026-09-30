/**
 * Opciones compartidas por la cartilla (especialidades y profesionales)
 * y por el módulo de turnos. Están en un solo lugar para que el panel,
 * el sitio público y las validaciones usen exactamente los mismos valores.
 */

export const DIAS = [
  { label: 'Lunes', value: 'lunes', indice: 1 },
  { label: 'Martes', value: 'martes', indice: 2 },
  { label: 'Miércoles', value: 'miercoles', indice: 3 },
  { label: 'Jueves', value: 'jueves', indice: 4 },
  { label: 'Viernes', value: 'viernes', indice: 5 },
  { label: 'Sábado', value: 'sabado', indice: 6 },
] as const

export type Dia = (typeof DIAS)[number]['value']

/** Horas de 07:00 a 21:00 cada 30 minutos, para los horarios de atención. */
export const HORAS: { label: string; value: string }[] = Array.from({ length: 29 }, (_, i) => {
  const minutos = 7 * 60 + i * 30
  const hh = String(Math.floor(minutos / 60)).padStart(2, '0')
  const mm = String(minutos % 60).padStart(2, '0')
  return { label: `${hh}:${mm}`, value: `${hh}:${mm}` }
})

export const OBRAS_SOCIALES = [
  { label: 'Particular', value: 'particular' },
  { label: 'ISSN', value: 'issn' },
  { label: 'PAMI', value: 'pami' },
  { label: 'OSDE', value: 'osde' },
  { label: 'Swiss Medical', value: 'swiss-medical' },
  { label: 'Galeno', value: 'galeno' },
  { label: 'Sancor Salud', value: 'sancor-salud' },
  { label: 'OSECAC', value: 'osecac' },
] as const

export const ICONOS_ESPECIALIDAD = [
  { label: 'Estetoscopio (clínica)', value: 'estetoscopio' },
  { label: 'Corazón (cardiología)', value: 'corazon' },
  { label: 'Bebé (pediatría)', value: 'bebe' },
  { label: 'Hueso (traumatología)', value: 'hueso' },
  { label: 'Cerebro (neurología, salud mental)', value: 'cerebro' },
  { label: 'Ojo (oftalmología)', value: 'ojo' },
  { label: 'Sonrisa (odontología)', value: 'sonrisa' },
  { label: 'Mano (dermatología)', value: 'mano' },
  { label: 'Manzana (nutrición)', value: 'manzana' },
  { label: 'Oído (otorrinolaringología)', value: 'oido' },
  { label: 'Símbolo femenino (ginecología)', value: 'venus' },
  { label: 'Persona (kinesiología)', value: 'persona' },
  { label: 'Microscopio (laboratorio)', value: 'microscopio' },
  { label: 'Jeringa (vacunatorio)', value: 'jeringa' },
] as const

export type IconoEspecialidad = (typeof ICONOS_ESPECIALIDAD)[number]['value']

const nombreDia = (valor: string) => DIAS.find((d) => d.value === valor)?.label.toLowerCase() ?? valor

/** "lunes, miércoles y viernes" */
export const listarDias = (dias?: string[] | null): string => {
  const ordenados = [...(dias || [])].sort(
    (a, b) => (DIAS.find((d) => d.value === a)?.indice ?? 9) - (DIAS.find((d) => d.value === b)?.indice ?? 9),
  )
  const nombres = ordenados.map(nombreDia)
  if (nombres.length <= 1) return nombres.join('')
  return `${nombres.slice(0, -1).join(', ')} y ${nombres.at(-1)}`
}

/** "Lunes, miércoles y viernes de 08:00 a 12:00" */
export const describirAtencion = (atencion?: {
  dias?: string[] | null
  horaFin?: string | null
  horaInicio?: string | null
} | null): string | null => {
  if (!atencion?.dias?.length || !atencion.horaInicio || !atencion.horaFin) return null
  const dias = listarDias(atencion.dias)
  return `${dias.charAt(0).toUpperCase()}${dias.slice(1)} de ${atencion.horaInicio} a ${atencion.horaFin} h`
}

export const etiquetaObraSocial = (valor: string) =>
  OBRAS_SOCIALES.find((o) => o.value === valor)?.label ?? valor
