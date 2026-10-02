// @vitest-environment node
import type { Payload } from 'payload'

import { getPayload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import type { Profesional, User } from '@/payload-types'

import config from '@/payload.config'
import { atiendeEseDia, fechaLocal, generarHorarios, sumarDias } from '@/utilities/turnos'

/**
 * Pruebas de integración con la Local API de Payload: reglas de negocio y
 * permisos del módulo de turnos, contra la base real.
 * Requisito: base de desarrollo con los datos de ejemplo cargados.
 * Ejecutar con: pnpm test:int
 */

let payload: Payload
let mendez: Profesional
let usuarioMendez: User
const creados: number[] = []

const paciente = {
  apellido: 'Prueba',
  dni: '30111222',
  email: 'prueba@example.com',
  nombre: 'Test',
  obraSocial: 'particular' as const,
  telefono: '0299 4000000',
}

/** Un día que atienda la profesional, lejos de los turnos del seed. */
const diaLibre = (p: Profesional) => {
  for (let i = 30; i < 45; i++) {
    const fecha = sumarDias(fechaLocal(), i)
    if (atiendeEseDia(p.atencion, fecha)) return fecha
  }
  throw new Error('No se encontró un día de atención')
}

const nuevoTurno = (hora: string, fecha = diaLibre(mendez)) => ({
  especialidad: (typeof mendez.especialidades[0] === 'object'
    ? mendez.especialidades[0].id
    : mendez.especialidades[0]) as number,
  fecha,
  hora,
  paciente,
  profesional: mendez.id,
  // Igual que el formulario del sitio: el turno entra pendiente
  estado: 'pendiente' as const,
})

describe('Turnos (Local API)', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })

    const profesionales = await payload.find({
      collection: 'profesionales',
      depth: 0,
      where: { apellido: { equals: 'Méndez' } },
    })
    mendez = profesionales.docs[0]

    const usuarios = await payload.find({
      collection: 'users',
      depth: 0,
      where: { email: { equals: 'lmendez@tp2salud.local' } },
    })
    usuarioMendez = usuarios.docs[0]

    if (!mendez || !usuarioMendez) {
      throw new Error('Faltan los datos de ejemplo: cargalos desde el panel antes de correr estas pruebas.')
    }
  })

  afterAll(async () => {
    for (const id of creados) {
      await payload.delete({ collection: 'turnos', id })
    }
  })

  it('acepta un turno válido y le asigna código y resumen', async () => {
    const turno = await payload.create({ collection: 'turnos', data: nuevoTurno(generarHorarios(mendez.atencion)[2]) })
    creados.push(turno.id)

    expect(turno.codigo).toMatch(/^CS-/)
    expect(turno.estado).toBe('pendiente')
    expect(turno.resumen).toContain('Prueba, Test')
  })

  it('rechaza un horario que no es parte de la agenda', async () => {
    await expect(payload.create({ collection: 'turnos', data: nuevoTurno('07:13') })).rejects.toThrow()
  })

  it('rechaza un día que la profesional no atiende', async () => {
    let domingo = sumarDias(fechaLocal(), 30)
    while (new Date(`${domingo}T12:00:00Z`).getUTCDay() !== 0) domingo = sumarDias(domingo, 1)

    await expect(
      payload.create({ collection: 'turnos', data: nuevoTurno(generarHorarios(mendez.atencion)[0], domingo) }),
    ).rejects.toThrow()
  })

  it('rechaza la doble reserva del mismo horario', async () => {
    const hora = generarHorarios(mendez.atencion)[4]
    const primero = await payload.create({ collection: 'turnos', data: nuevoTurno(hora) })
    creados.push(primero.id)

    await expect(payload.create({ collection: 'turnos', data: nuevoTurno(hora) })).rejects.toThrow()
  })

  it('libera el horario cuando el turno se cancela', async () => {
    const hora = generarHorarios(mendez.atencion)[6]
    const turno = await payload.create({ collection: 'turnos', data: nuevoTurno(hora) })
    creados.push(turno.id)

    await payload.update({ collection: 'turnos', data: { estado: 'cancelado' }, id: turno.id })
    const otro = await payload.create({ collection: 'turnos', data: nuevoTurno(hora) })
    creados.push(otro.id)

    expect(otro.hora).toBe(hora)
  })

  it('una profesional solo ve sus propios turnos', async () => {
    const resultado = await payload.find({
      collection: 'turnos',
      depth: 0,
      limit: 200,
      overrideAccess: false,
      user: usuarioMendez,
    })

    expect(resultado.docs.length).toBeGreaterThan(0)
    expect(resultado.docs.every((t) => t.profesional === mendez.id)).toBe(true)
  })

  it('sin iniciar sesión no se pueden leer turnos', async () => {
    await expect(payload.find({ collection: 'turnos', overrideAccess: false })).rejects.toThrow()
  })

  it('una profesional no puede cambiar los datos del paciente', async () => {
    const turno = await payload.create({ collection: 'turnos', data: nuevoTurno(generarHorarios(mendez.atencion)[8]) })
    creados.push(turno.id)

    const actualizado = await payload.update({
      collection: 'turnos',
      data: { estado: 'atendido', paciente: { ...paciente, nombre: 'Cambiado' } },
      id: turno.id,
      overrideAccess: false,
      user: usuarioMendez,
    })

    expect(actualizado.estado).toBe('atendido')
    expect(actualizado.paciente.nombre).toBe('Test')
  })
})
