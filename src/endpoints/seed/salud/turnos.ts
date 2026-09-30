import type { Payload, PayloadRequest } from 'payload'

import type { Profesional, Turno } from '@/payload-types'

import { slugifyEs } from '@/utilities/slugify'
import { atiendeEseDia, fechaLocal, generarHorarios, proximasFechas, sumarDias } from '@/utilities/turnos'

/** Usuarios del personal para la demo (las contraseñas están en el README). */
export const USUARIOS_DEMO = [
  { email: 'recepcion@tp2salud.local', name: 'Marta Gómez', password: 'Recepcion1234!', roles: ['recepcion'] as const },
  {
    email: 'lmendez@tp2salud.local',
    name: 'Laura Méndez',
    password: 'Profesional1234!',
    profesional: 'Méndez',
    roles: ['profesional'] as const,
  },
]

const pacientes = [
  { nombre: 'Juan', apellido: 'Pérez', dni: '30123456', obraSocial: 'issn' },
  { nombre: 'María', apellido: 'González', dni: '28456789', obraSocial: 'osde' },
  { nombre: 'Lucía', apellido: 'Fernández', dni: '41234567', obraSocial: 'particular' },
  { nombre: 'Carlos', apellido: 'Rodríguez', dni: '25678901', obraSocial: 'pami' },
  { nombre: 'Ana', apellido: 'Martínez', dni: '35789012', obraSocial: 'issn' },
  { nombre: 'Diego', apellido: 'López', dni: '33890123', obraSocial: 'swiss-medical' },
  { nombre: 'Sofía', apellido: 'Romero', dni: '44901234', obraSocial: 'galeno' },
  { nombre: 'Tomás', apellido: 'Díaz', dni: '39012345', obraSocial: 'issn' },
  { nombre: 'Valentina', apellido: 'Álvarez', dni: '42123456', obraSocial: 'osde' },
  { nombre: 'Joaquín', apellido: 'Torres', dni: '37234567', obraSocial: 'particular' },
] as const

type Plan = {
  apellidoProfesional: string
  cuando: 'hoy' | 'proximo' | 'pasado'
  estado: Turno['estado']
  horario: number // índice dentro de la agenda del día
  motivo?: string
}

const plan: Plan[] = [
  { apellidoProfesional: 'Méndez', cuando: 'proximo', estado: 'confirmado', horario: 0, motivo: 'Control anual.' },
  { apellidoProfesional: 'Méndez', cuando: 'proximo', estado: 'pendiente', horario: 1, motivo: 'Resultados de laboratorio.' },
  { apellidoProfesional: 'Méndez', cuando: 'proximo', estado: 'pendiente', horario: 3 },
  { apellidoProfesional: 'Sosa', cuando: 'proximo', estado: 'confirmado', horario: 2, motivo: 'Certificado escolar.' },
  { apellidoProfesional: 'Sosa', cuando: 'proximo', estado: 'pendiente', horario: 4 },
  { apellidoProfesional: 'Ríos', cuando: 'proximo', estado: 'confirmado', horario: 1, motivo: 'Control de presión.' },
  { apellidoProfesional: 'Castro', cuando: 'proximo', estado: 'cancelado', horario: 0 },
  { apellidoProfesional: 'Méndez', cuando: 'pasado', estado: 'atendido', horario: 2 },
]

/**
 * Carga turnos de ejemplo en fechas calculadas según la agenda real de cada
 * profesional, más algunos para "hoy" (con los profesionales que atienden el
 * día en que se corre el seed) para que el tablero del panel tenga datos.
 */
export const seedTurnos = async ({
  payload,
  profesionales,
  req,
}: {
  payload: Payload
  profesionales: Profesional[]
  req: PayloadRequest
}) => {
  payload.logger.info('— Cargando usuarios del personal y turnos de ejemplo...')

  for (const u of USUARIOS_DEMO) {
    await payload.delete({ collection: 'users', depth: 0, req, where: { email: { equals: u.email } } })
    const ficha = 'profesional' in u ? profesionales.find((p) => p.apellido === u.profesional) : undefined
    await payload.create({
      collection: 'users',
      data: {
        email: u.email,
        name: u.name,
        password: u.password,
        profesional: ficha?.id,
        roles: [...u.roles],
      },
      req,
    })
  }

  const hoy = fechaLocal()
  const porApellido = (apellido: string) => profesionales.find((p) => p.apellido === apellido)
  const especialidadDe = (p: Profesional) => {
    const primera = p.especialidades?.[0]
    return typeof primera === 'object' ? primera.id : primera
  }

  let n = 0
  const crear = async (p: Profesional, fecha: string, hora: string, estado: Turno['estado'], motivo?: string) => {
    const paciente = pacientes[n % pacientes.length]
    n++
    await payload.create({
      collection: 'turnos',
      // Permite cargar turnos de días pasados o de horas que ya pasaron hoy
      context: { permitirFechaPasada: true },
      data: {
        creadoDesde: n % 3 === 0 ? 'panel' : 'web',
        especialidad: especialidadDe(p) as number,
        estado,
        fecha,
        hora,
        motivo,
        paciente: {
          ...paciente,
          email: `${slugifyEs(paciente.nombre)}.${slugifyEs(paciente.apellido)}@example.com`,
          telefono: `(0299) 15-555-01${String(n).padStart(2, '0')}`,
        },
        profesional: p.id,
      },
      req,
    })
  }

  for (const t of plan) {
    const p = porApellido(t.apellidoProfesional)
    if (!p) continue
    const horarios = generarHorarios(p.atencion)
    let fecha: string | undefined
    if (t.cuando === 'proximo') fecha = proximasFechas(p.atencion).find((f) => f !== hoy)
    if (t.cuando === 'pasado') {
      for (let i = 1; i <= 14 && !fecha; i++) {
        const candidata = sumarDias(hoy, -i)
        if (atiendeEseDia(p.atencion, candidata)) fecha = candidata
      }
    }
    if (fecha && horarios[t.horario]) await crear(p, fecha, horarios[t.horario], t.estado, t.motivo)
  }

  // Turnos de hoy con quienes atienden hoy (si el seed corre un domingo, no habrá)
  const atiendenHoy = profesionales.filter((p) => p.activo !== false && atiendeEseDia(p.atencion, hoy)).slice(0, 3)
  for (const [i, p] of atiendenHoy.entries()) {
    const horarios = generarHorarios(p.atencion)
    await crear(p, hoy, horarios[i + 1] ?? horarios[0], i === 0 ? 'confirmado' : 'pendiente')
  }

  payload.logger.info(`— ${n} turnos de ejemplo cargados`)
}
