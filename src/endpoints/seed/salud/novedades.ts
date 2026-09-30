import type { Payload, PayloadRequest } from 'payload'

import type { Category, Media, Post, Profesional, User } from '@/payload-types'

import { slugifyEs } from '@/utilities/slugify'

import { type Bloque, lexical } from './lexical'
import { generarPortada, type Portada } from './portadas'

export const CATEGORIAS_SALUD = [
  'Prevención',
  'Nutrición',
  'Infancia',
  'Vacunación',
  'Cuidado de la piel',
  'Salud cardiovascular',
]

type NovedadEjemplo = {
  bloques: Bloque[]
  categorias: string[]
  descripcion: string
  portada: Portada
  revisadoPor: string // apellido del profesional
  titulo: string
}

/**
 * Novedades de ejemplo. El contenido es información general de salud,
 * redactada para la demo y marcada con el aviso "no reemplaza la consulta".
 */
const novedades: NovedadEjemplo[] = [
  {
    titulo: 'Presión arterial: por qué conviene medirla aunque te sientas bien',
    descripcion:
      'La presión alta muchas veces no da síntomas. Te contamos cada cuánto controlarla y qué hábitos ayudan.',
    categorias: ['Prevención', 'Salud cardiovascular'],
    revisadoPor: 'Ríos',
    portada: { icono: 'HeartPulse', paleta: 'rio' },
    bloques: [
      {
        tipo: 'p',
        texto:
          'La hipertensión arterial es uno de los principales factores de riesgo de infarto y accidente cerebrovascular. El problema es que en general no duele ni molesta: muchas personas se enteran recién cuando aparece una complicación.',
      },
      { tipo: 'h2', texto: '¿Cada cuánto hay que controlarla?' },
      {
        tipo: 'p',
        texto:
          'Las personas adultas sanas deberían medirse la presión al menos una vez al año. Si tenés antecedentes familiares, diabetes, sobrepeso o fumás, tu médica o médico puede indicarte controles más frecuentes.',
      },
      { tipo: 'h2', texto: 'Hábitos que ayudan' },
      {
        tipo: 'lista',
        items: [
          'Reducir la sal: probá condimentar con hierbas y limón.',
          'Moverte al menos 30 minutos por día, por ejemplo caminando.',
          'No fumar y moderar el consumo de alcohol.',
          'Dormir bien y buscar momentos para bajar el estrés.',
        ],
      },
      {
        tipo: 'p',
        texto:
          'Si ya tenés diagnóstico de hipertensión, no suspendas la medicación por tu cuenta aunque te sientas bien: los controles periódicos permiten ajustar el tratamiento.',
      },
    ],
  },
  {
    titulo: 'Vacunas en edad escolar: qué dosis corresponden y dónde aplicarlas',
    descripcion:
      'Al ingreso escolar y a los 11 años el Calendario Nacional incluye refuerzos gratuitos. Revisá el carnet antes de empezar las clases.',
    categorias: ['Vacunación', 'Infancia'],
    revisadoPor: 'Sosa',
    portada: { icono: 'Syringe', paleta: 'niebla' },
    bloques: [
      {
        tipo: 'p',
        texto:
          'El Calendario Nacional de Vacunación prevé refuerzos en dos momentos de la edad escolar: al ingreso a primer grado (5 o 6 años) y a los 11 años. Las vacunas del calendario son gratuitas y se aplican en los vacunatorios públicos.',
      },
      { tipo: 'h2', texto: 'Antes de empezar las clases' },
      {
        tipo: 'lista',
        items: [
          'Revisá el carnet de vacunación y llevalo a la consulta pediátrica.',
          'Si falta alguna dosis, se puede completar: nunca es tarde para ponerse al día.',
          'Consultá el calendario vigente en el sitio del Ministerio de Salud de la Nación.',
        ],
      },
      {
        tipo: 'p',
        texto:
          'En el control de salud escolar también se evalúan el crecimiento, la visión y la audición, y se entrega el certificado que piden las escuelas.',
      },
    ],
  },
  {
    titulo: 'Protector solar en la Patagonia: cómo elegirlo y usarlo',
    descripcion:
      'El viento y el fresco engañan: la radiación del verano patagónico es alta. Claves para cuidar la piel de toda la familia.',
    categorias: ['Prevención', 'Cuidado de la piel'],
    revisadoPor: 'Castro',
    portada: { icono: 'Sun', paleta: 'arena' },
    bloques: [
      {
        tipo: 'p',
        texto:
          'En la región el viento y las temperaturas moderadas hacen que no sintamos el sol, pero eso no reduce la radiación ultravioleta. Las quemaduras solares, sobre todo en la infancia, aumentan el riesgo de cáncer de piel en la adultez.',
      },
      { tipo: 'h2', texto: 'Cómo usarlo bien' },
      {
        tipo: 'lista',
        items: [
          'Elegí un protector con factor 30 o más y que proteja contra rayos UVA y UVB.',
          'Aplicalo 20 minutos antes de salir y renovalo cada dos horas o después de bañarte.',
          'Evitá la exposición directa entre las 10 y las 16 horas.',
          'Sumá gorro, anteojos de sol y ropa que cubra.',
        ],
      },
      {
        tipo: 'p',
        texto:
          'Revisá tus lunares una vez por mes. Si alguno cambia de forma, tamaño o color, consultá con dermatología.',
      },
    ],
  },
  {
    titulo: 'Comer bien gastando menos: siete ideas para la semana',
    descripcion:
      'Legumbres, verduras de estación y cocinar en casa: propuestas simples para una alimentación saludable y económica.',
    categorias: ['Nutrición'],
    revisadoPor: 'Quiroga',
    portada: { icono: 'Apple', paleta: 'tinta' },
    bloques: [
      {
        tipo: 'p',
        texto:
          'Una alimentación saludable no tiene por qué ser cara. Las Guías Alimentarias para la Población Argentina proponen basar las comidas en alimentos simples y variados.',
      },
      { tipo: 'h2', texto: 'Ideas para organizarte' },
      {
        tipo: 'lista',
        items: [
          'Planificá el menú de la semana y armá la lista antes de ir a comprar.',
          'Sumá legumbres (lentejas, garbanzos, porotos): rinden y aportan proteínas.',
          'Elegí frutas y verduras de estación, que son más baratas.',
          'Cociná de más y congelá porciones para los días con poco tiempo.',
          'Tomá agua en lugar de bebidas azucaradas.',
          'Leé las etiquetas: los sellos negros advierten excesos de azúcar, sodio o grasas.',
          'Compartí la cocina en familia: es una buena forma de aprender a comer mejor.',
        ],
      },
    ],
  },
]

/**
 * Carga categorías y novedades de salud con sus portadas ilustradas.
 * Cada novedad queda "revisada por" un profesional de la cartilla.
 */
export const seedNovedades = async ({
  autor,
  payload,
  profesionales,
  req,
}: {
  autor: User
  payload: Payload
  profesionales: Profesional[]
  req: PayloadRequest
}) => {
  payload.logger.info('— Cargando categorías y novedades de salud...')

  const categorias = new Map<string, Category>()
  for (const titulo of CATEGORIAS_SALUD) {
    const doc = await payload.create({
      collection: 'categories',
      data: { slug: slugifyEs(titulo) ?? '', title: titulo },
      req,
    })
    categorias.set(titulo, doc)
  }

  const creadas: Post[] = []
  // En orden y con fechas escalonadas, para que el listado quede ordenado
  for (const [indice, n] of novedades.entries()) {
    const archivo = await generarPortada(n.portada, slugifyEs(n.titulo) ?? `novedad-${indice}`)
    const portada: Media = await payload.create({
      collection: 'media',
      data: { alt: `Ilustración de la nota: ${n.titulo}` },
      file: archivo,
      req,
    })

    const revisor = profesionales.find((p) => p.apellido === n.revisadoPor)
    const fecha = new Date()
    fecha.setDate(fecha.getDate() - indice * 6)

    const doc = await payload.create({
      collection: 'posts',
      context: { disableRevalidate: true },
      depth: 0,
      data: {
        _status: 'published',
        authors: [autor.id],
        categories: n.categorias.map((c) => categorias.get(c)?.id).filter((id): id is number => Boolean(id)),
        content: lexical(n.bloques),
        heroImage: portada.id,
        meta: { description: n.descripcion, image: portada.id, title: n.titulo },
        mostrarAviso: true,
        publishedAt: fecha.toISOString(),
        revisadoPor: revisor?.id,
        slug: slugifyEs(n.titulo) ?? '',
        title: n.titulo,
      },
      req,
    })
    creadas.push(doc)
  }

  // Cada nota recomienda las otras de su misma categoría (o las más recientes)
  for (const doc of creadas) {
    const relacionadas = creadas.filter((o) => o.id !== doc.id).slice(0, 3)
    await payload.update({
      collection: 'posts',
      context: { disableRevalidate: true },
      data: { relatedPosts: relacionadas.map((r) => r.id) },
      id: doc.id,
      req,
    })
  }

  return { categorias, novedades: creadas }
}
