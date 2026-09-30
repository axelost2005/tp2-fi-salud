import type { Payload, PayloadRequest } from 'payload'

import type { Especialidad, Profesional } from '@/payload-types'

import { slugifyEs } from '@/utilities/slugify'

import { lexical } from './lexical'

type DatosEspecialidad = Pick<Especialidad, 'destacada' | 'icono' | 'nombre' | 'orden' | 'resumen'> & {
  detalle: string[]
}

/** Especialidades de ejemplo (datos ficticios). */
const especialidades: DatosEspecialidad[] = [
  {
    nombre: 'Clínica médica',
    icono: 'estetoscopio',
    destacada: true,
    orden: 1,
    resumen: 'Chequeos anuales, controles de presión y seguimiento de enfermedades crónicas en personas adultas.',
    detalle: [
      'La consulta clínica es la puerta de entrada al sistema de salud: evalúa tu estado general, indica estudios de control y, si hace falta, te deriva a la especialidad que corresponda.',
      'Atendemos controles de presión arterial, diabetes, colesterol y aptos físicos laborales y deportivos.',
    ],
  },
  {
    nombre: 'Pediatría',
    icono: 'bebe',
    destacada: true,
    orden: 2,
    resumen: 'Controles de niñas, niños y adolescentes desde el nacimiento hasta los 18 años.',
    detalle: [
      'Seguimiento del crecimiento y el desarrollo, calendario de vacunación, certificados escolares y consultas por enfermedades frecuentes de la infancia.',
    ],
  },
  {
    nombre: 'Cardiología',
    icono: 'corazon',
    destacada: true,
    orden: 3,
    resumen: 'Prevención, diagnóstico y tratamiento de enfermedades del corazón, con electrocardiograma en consultorio.',
    detalle: [
      'Evaluación del riesgo cardiovascular, control de hipertensión y arritmias, y riesgo quirúrgico prequirúrgico.',
    ],
  },
  {
    nombre: 'Traumatología',
    icono: 'hueso',
    destacada: true,
    orden: 4,
    resumen: 'Lesiones deportivas, dolores articulares, esguinces y fracturas.',
    detalle: ['Diagnóstico y tratamiento de lesiones de huesos, músculos y articulaciones, en coordinación con kinesiología.'],
  },
  {
    nombre: 'Ginecología',
    icono: 'venus',
    destacada: true,
    orden: 5,
    resumen: 'Controles ginecológicos anuales, salud sexual y reproductiva.',
    detalle: ['Papanicolaou y colposcopía, asesoramiento en métodos anticonceptivos y control del embarazo.'],
  },
  {
    nombre: 'Dermatología',
    icono: 'mano',
    destacada: true,
    orden: 6,
    resumen: 'Cuidado de la piel, control de lunares y tratamiento del acné.',
    detalle: ['Revisión de lunares, prevención del daño solar y tratamiento de enfermedades frecuentes de la piel.'],
  },
  {
    nombre: 'Oftalmología',
    icono: 'ojo',
    destacada: false,
    orden: 7,
    resumen: 'Control de la visión, fondo de ojo y receta de anteojos.',
    detalle: ['Control visual anual, medición de la presión ocular y seguimiento de personas con diabetes.'],
  },
  {
    nombre: 'Nutrición',
    icono: 'manzana',
    destacada: false,
    orden: 8,
    resumen: 'Planes de alimentación personalizados y educación alimentaria para toda la familia.',
    detalle: ['Acompañamiento en el descenso de peso, alimentación en el deporte y en enfermedades crónicas.'],
  },
  {
    nombre: 'Salud mental',
    icono: 'cerebro',
    destacada: false,
    orden: 9,
    resumen: 'Psicología y psiquiatría para adolescentes y personas adultas.',
    detalle: ['Espacio de escucha y tratamiento de ansiedad, depresión y otras situaciones que afectan el bienestar.'],
  },
  {
    nombre: 'Kinesiología',
    icono: 'persona',
    destacada: false,
    orden: 10,
    resumen: 'Rehabilitación física, postural y respiratoria.',
    detalle: ['Rehabilitación después de lesiones y cirugías, reeducación postural y kinesiología respiratoria.'],
  },
]

type DatosProfesional = Omit<
  Profesional,
  'createdAt' | 'especialidades' | 'foto' | 'id' | 'nombreCompleto' | 'updatedAt'
> & { especialidades: string[] }

/** Profesionales de ejemplo. Los nombres y matrículas son ficticios. */
const profesionales: DatosProfesional[] = [
  {
    tratamiento: 'Dra.', nombre: 'Laura', apellido: 'Méndez', matricula: 'MP 4521',
    especialidades: ['Clínica médica'],
    atencion: { dias: ['lunes', 'miercoles', 'viernes'], horaInicio: '08:00', horaFin: '12:00', duracionTurno: 20 },
    obrasSociales: ['issn', 'osde', 'pami', 'particular'],
    bio: 'Médica clínica con 15 años de experiencia en atención primaria y enfermedades crónicas.',
  },
  {
    tratamiento: 'Dr.', nombre: 'Martín', apellido: 'Aguirre', matricula: 'MP 3876',
    especialidades: ['Clínica médica'],
    atencion: { dias: ['martes', 'jueves'], horaInicio: '14:00', horaFin: '19:00', duracionTurno: 20 },
    obrasSociales: ['issn', 'swiss-medical', 'particular'],
  },
  {
    tratamiento: 'Dr.', nombre: 'Esteban', apellido: 'Morales', matricula: 'MP 2877',
    especialidades: ['Clínica médica', 'Cardiología'],
    atencion: { dias: ['sabado'], horaInicio: '08:00', horaFin: '12:00', duracionTurno: 20 },
    obrasSociales: ['issn', 'galeno', 'particular'],
  },
  {
    tratamiento: 'Dra.', nombre: 'Valeria', apellido: 'Sosa', matricula: 'MP 5102',
    especialidades: ['Pediatría'],
    atencion: { dias: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'], horaInicio: '09:00', horaFin: '13:00', duracionTurno: 20 },
    obrasSociales: ['issn', 'osde', 'galeno', 'particular'],
    bio: 'Pediatra. Especial interés en lactancia y desarrollo infantil.',
  },
  {
    tratamiento: 'Dr.', nombre: 'Pablo', apellido: 'Ferreyra', matricula: 'MP 2954',
    especialidades: ['Pediatría'],
    atencion: { dias: ['martes', 'jueves'], horaInicio: '16:00', horaFin: '20:00', duracionTurno: 20 },
    obrasSociales: ['issn', 'sancor-salud', 'particular'],
  },
  {
    tratamiento: 'Dr.', nombre: 'Gustavo', apellido: 'Ríos', matricula: 'MP 3310',
    especialidades: ['Cardiología'],
    atencion: { dias: ['lunes', 'jueves'], horaInicio: '10:00', horaFin: '14:00', duracionTurno: 30 },
    obrasSociales: ['issn', 'osde', 'pami'],
  },
  {
    tratamiento: 'Dra.', nombre: 'Carolina', apellido: 'Ibáñez', matricula: 'MN 45871',
    especialidades: ['Cardiología'],
    atencion: { dias: ['miercoles', 'viernes'], horaInicio: '15:00', horaFin: '19:00', duracionTurno: 30 },
    obrasSociales: ['osde', 'swiss-medical', 'particular'],
  },
  {
    tratamiento: 'Dr.', nombre: 'Nicolás', apellido: 'Paredes', matricula: 'MP 4088',
    especialidades: ['Traumatología'],
    atencion: { dias: ['lunes', 'miercoles'], horaInicio: '14:00', horaFin: '18:00', duracionTurno: 20 },
    obrasSociales: ['issn', 'osecac', 'particular'],
  },
  {
    tratamiento: 'Dra.', nombre: 'Florencia', apellido: 'Luna', matricula: 'MP 5230',
    especialidades: ['Ginecología'],
    atencion: { dias: ['martes', 'viernes'], horaInicio: '08:00', horaFin: '12:00', duracionTurno: 20 },
    obrasSociales: ['issn', 'osde', 'galeno', 'particular'],
  },
  {
    tratamiento: 'Dra.', nombre: 'Julieta', apellido: 'Castro', matricula: 'MP 4760',
    especialidades: ['Dermatología'],
    atencion: { dias: ['lunes', 'jueves'], horaInicio: '15:00', horaFin: '18:30', duracionTurno: 20 },
    obrasSociales: ['osde', 'swiss-medical', 'particular'],
  },
  {
    tratamiento: 'Dra.', nombre: 'Mariana', apellido: 'Ortiz', matricula: 'MP 3999',
    especialidades: ['Dermatología'],
    atencion: { dias: ['miercoles'], horaInicio: '09:00', horaFin: '12:00', duracionTurno: 20 },
    obrasSociales: ['particular'],
    // De licencia: no aparece en el sitio público (control de acceso)
    activo: false,
  },
  {
    tratamiento: 'Dr.', nombre: 'Andrés', apellido: 'Villalba', matricula: 'MP 3698',
    especialidades: ['Oftalmología'],
    atencion: { dias: ['miercoles'], horaInicio: '09:00', horaFin: '13:00', duracionTurno: 15 },
    obrasSociales: ['issn', 'pami', 'particular'],
  },
  {
    tratamiento: 'Lic.', nombre: 'Sofía', apellido: 'Quiroga', matricula: 'MP 1287',
    especialidades: ['Nutrición'],
    atencion: { dias: ['martes', 'jueves'], horaInicio: '09:00', horaFin: '13:00', duracionTurno: 30 },
    obrasSociales: ['issn', 'osde', 'particular'],
  },
  {
    tratamiento: 'Lic.', nombre: 'Matías', apellido: 'Herrera', matricula: 'MP 1452',
    especialidades: ['Salud mental'],
    atencion: { dias: ['lunes', 'miercoles', 'viernes'], horaInicio: '14:00', horaFin: '20:00', duracionTurno: 45 },
    obrasSociales: ['issn', 'particular'],
  },
  {
    tratamiento: 'Lic.', nombre: 'Camila', apellido: 'Benítez', matricula: 'MP 1633',
    especialidades: ['Kinesiología'],
    atencion: { dias: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'], horaInicio: '07:00', horaFin: '11:00', duracionTurno: 30 },
    obrasSociales: ['issn', 'osecac', 'sancor-salud', 'particular'],
  },
]

/**
 * Carga la cartilla de ejemplo. Devuelve los documentos creados para que
 * otros pasos del seed (novedades, turnos) puedan referenciarlos.
 */
export const seedCartilla = async ({ payload, req }: { payload: Payload; req: PayloadRequest }) => {
  payload.logger.info('— Cargando especialidades y profesionales...')

  const especialidadesPorNombre = new Map<string, Especialidad>()
  for (const { detalle, ...datos } of especialidades) {
    const doc = await payload.create({
      collection: 'especialidades',
      context: { disableRevalidate: true },
      data: {
        ...datos,
        descripcion: lexical(detalle.map((texto) => ({ tipo: 'p', texto }))),
        slug: slugifyEs(datos.nombre) ?? '',
      },
      req,
    })
    especialidadesPorNombre.set(doc.nombre, doc)
  }

  const profesionalesCreados: Profesional[] = []
  for (const { especialidades: nombres, ...datos } of profesionales) {
    const doc = await payload.create({
      collection: 'profesionales',
      context: { disableRevalidate: true },
      data: {
        ...datos,
        especialidades: nombres.map((n) => {
          const e = especialidadesPorNombre.get(n)
          if (!e) throw new Error(`Especialidad inexistente en el seed: ${n}`)
          return e.id
        }),
      },
      req,
    })
    profesionalesCreados.push(doc)
  }

  return { especialidades: especialidadesPorNombre, profesionales: profesionalesCreados }
}
