import type { CollectionSlug, GlobalSlug, Payload, PayloadRequest } from 'payload'

import { contactForm as contactFormData } from './contact-form'
import { contact as contactPageData } from './contact-page'
import { home } from './home'
import { seedCartilla } from './salud/cartilla'
import { seedNovedades } from './salud/novedades'
import { seedTurnos } from './salud/turnos'

const collections: CollectionSlug[] = [
  'profesionales',
  'especialidades',
  'categories',
  'media',
  'pages',
  'posts',
  'forms',
  'form-submissions',
  'search',
]

const globals: Extract<GlobalSlug, 'header' | 'footer'>[] = ['header', 'footer']

/**
 * Carga los datos de ejemplo de Confluencia Salud (todos ficticios).
 * A diferencia del seed del template, no descarga nada de internet: las
 * imágenes se generan localmente, así funciona sin conexión.
 *
 * Orden: limpiar → autor → cartilla → novedades → turnos → formulario y
 * páginas → menús. Los errores "Error hitting revalidate route" que pueda
 * mostrar la consola al correrlo sin el servidor levantado son normales.
 */
export const seed = async ({
  payload,
  req,
}: {
  payload: Payload
  req: PayloadRequest
}): Promise<void> => {
  payload.logger.info('Cargando datos de ejemplo...')
  payload.logger.info('— Limpiando colecciones y globales...')

  await Promise.all(
    globals.map((global) =>
      payload.updateGlobal({
        slug: global,
        data: {
          navItems: [],
        },
        depth: 0,
        context: {
          disableRevalidate: true,
        },
      }),
    ),
  )

  // Los turnos referencian a profesionales y especialidades: se borran primero
  await payload.db.deleteMany({ collection: 'turnos', req, where: {} })

  await Promise.all(
    collections.map((collection) => payload.db.deleteMany({ collection, req, where: {} })),
  )

  await Promise.all(
    collections
      .filter((collection) => Boolean(payload.collections[collection].config.versions))
      .map((collection) => payload.db.deleteVersions({ collection, req, where: {} })),
  )

  payload.logger.info('— Creando el usuario autor de las novedades...')

  await payload.delete({
    collection: 'users',
    depth: 0,
    where: { email: { equals: 'comunicacion@tp2salud.local' } },
  })

  const autorNovedades = await payload.create({
    collection: 'users',
    data: {
      name: 'Equipo de Comunicación',
      email: 'comunicacion@tp2salud.local',
      password: 'Editor1234!',
      roles: ['editor'],
    },
  })

  const { profesionales } = await seedCartilla({ payload, req })

  await seedNovedades({ autor: autorNovedades, payload, profesionales, req })

  await seedTurnos({ payload, profesionales, req })

  payload.logger.info('— Creando el formulario de contacto...')

  const contactForm = await payload.create({
    collection: 'forms',
    depth: 0,
    data: contactFormData,
  })

  payload.logger.info('— Creando páginas...')

  const [, contactPage] = await Promise.all([
    payload.create({
      collection: 'pages',
      depth: 0,
      data: home(),
    }),
    payload.create({
      collection: 'pages',
      depth: 0,
      data: contactPageData({ contactForm: contactForm }),
    }),
  ])

  payload.logger.info('— Configurando encabezado y pie...')

  const enlaceContacto = {
    type: 'reference' as const,
    label: 'Contacto',
    reference: {
      relationTo: 'pages' as const,
      value: contactPage.id,
    },
  }

  await Promise.all([
    payload.updateGlobal({
      slug: 'header',
      data: {
        navItems: [
          { link: { type: 'custom', label: 'Especialidades', url: '/especialidades' } },
          { link: { type: 'custom', label: 'Profesionales', url: '/profesionales' } },
          { link: { type: 'custom', label: 'Novedades', url: '/novedades' } },
          { link: enlaceContacto },
        ],
        botonDestacado: {
          mostrar: true,
          link: { type: 'custom', label: 'Pedir turno', url: '/turnos' },
        },
      },
    }),
    payload.updateGlobal({
      slug: 'footer',
      data: {
        navItems: [
          { link: { type: 'custom', label: 'Pedir turno', url: '/turnos' } },
          { link: { type: 'custom', label: 'Cartilla de profesionales', url: '/profesionales' } },
          { link: enlaceContacto },
          { link: { type: 'custom', label: 'Acceso del personal', url: '/admin' } },
        ],
      },
    }),
  ])

  payload.logger.info('¡Datos de ejemplo cargados!')
}
