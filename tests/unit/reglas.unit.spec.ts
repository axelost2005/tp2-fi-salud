// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { describirAtencion, listarDias } from '@/utilities/cartilla'
import { hrefDocumento } from '@/utilities/rutas'
import { slugifyEs } from '@/utilities/slugify'
import {
  aFechaCorta,
  aFechaGuardada,
  diaDeLaSemana,
  generarCodigoTurno,
  generarHorarios,
  horariosLibres,
  proximasFechas,
  sumarDias,
} from '@/utilities/turnos'

/**
 * Pruebas unitarias de las reglas del módulo de turnos y de la cartilla.
 * Son funciones puras: no necesitan base de datos ni servidor.
 * Ejecutar con: pnpm test:unit
 */

const agenda = {
  dias: ['lunes', 'miercoles', 'viernes'],
  duracionTurno: 20,
  horaFin: '10:00',
  horaInicio: '08:00',
}

describe('generarHorarios', () => {
  it('arma los turnos de la agenda sin pasarse de la hora de fin', () => {
    expect(generarHorarios(agenda)).toEqual(['08:00', '08:20', '08:40', '09:00', '09:20', '09:40'])
  })

  it('respeta la duración de cada turno', () => {
    expect(generarHorarios({ ...agenda, duracionTurno: 30 })).toEqual(['08:00', '08:30', '09:00', '09:30'])
  })

  it('sin horario de atención no hay turnos', () => {
    expect(generarHorarios({ dias: ['lunes'] })).toEqual([])
    expect(generarHorarios(null)).toEqual([])
  })
})

describe('fechas en hora de Argentina', () => {
  it('guarda el día elegido al mediodía UTC', () => {
    expect(aFechaGuardada('2026-10-02')).toBe('2026-10-02T12:00:00.000Z')
  })

  it('lee una fecha guardada como el mismo día', () => {
    expect(aFechaCorta('2026-10-02T12:00:00.000Z')).toBe('2026-10-02')
  })

  it('a la 01:00 UTC del 3 de octubre en Argentina todavía es 2 de octubre', () => {
    expect(aFechaCorta(new Date('2026-10-03T01:00:00.000Z'))).toBe('2026-10-02')
  })

  it('calcula el día de la semana', () => {
    expect(diaDeLaSemana('2026-10-02')).toBe('viernes')
    expect(diaDeLaSemana('2026-10-04')).toBe('domingo')
  })

  it('suma días cambiando de mes', () => {
    expect(sumarDias('2026-09-30', 1)).toBe('2026-10-01')
  })
})

describe('horarios libres', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Miércoles 30/09/2026 a las 12:00 de Argentina (15:00 UTC)
    vi.setSystemTime(new Date('2026-09-30T15:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('saca los horarios ya reservados', () => {
    expect(horariosLibres(agenda, '2026-10-02', ['08:20', '09:00'])).toEqual([
      '08:00',
      '08:40',
      '09:20',
      '09:40',
    ])
  })

  it('un día que el profesional no atiende no tiene horarios', () => {
    expect(horariosLibres(agenda, '2026-10-01', [])).toEqual([]) // jueves
  })

  it('hoy solo ofrece los horarios que todavía no pasaron', () => {
    vi.setSystemTime(new Date('2026-10-02T12:30:00.000Z')) // viernes 09:30 en Argentina
    expect(horariosLibres(agenda, '2026-10-02', [])).toEqual(['09:40'])
  })

  it('las próximas fechas son solo días de atención, y hoy no si ya terminó la agenda', () => {
    expect(proximasFechas(agenda, 7)).toEqual(['2026-10-02', '2026-10-05', '2026-10-07'])
  })
})

describe('código de turno', () => {
  it('tiene el formato CS-XXXXXX sin caracteres confusos', () => {
    for (let i = 0; i < 50; i++) {
      expect(generarCodigoTurno()).toMatch(/^CS-[A-HJ-NP-Z2-9]{6}$/)
    }
  })
})

describe('cartilla', () => {
  it('lista los días en orden y en castellano', () => {
    expect(listarDias(['viernes', 'lunes', 'miercoles'])).toBe('lunes, miércoles y viernes')
  })

  it('describe el horario de atención', () => {
    expect(describirAtencion(agenda)).toBe('Lunes, miércoles y viernes de 08:00 a 10:00 h')
  })
})

describe('URLs', () => {
  it('convierte textos con tildes y eñes en slugs', () => {
    expect(slugifyEs('Clínica médica')).toBe('clinica-medica')
    expect(slugifyEs('Pediatría y niñez')).toBe('pediatria-y-ninez')
    expect(slugifyEs('¿Qué es la hipertensión?')).toBe('que-es-la-hipertension')
  })

  it('publica las novedades en /novedades', () => {
    expect(hrefDocumento('posts', 'mi-nota')).toBe('/novedades/mi-nota')
    expect(hrefDocumento('pages', 'contacto')).toBe('/contacto')
    expect(hrefDocumento('pages', 'home')).toBe('/')
  })
})
