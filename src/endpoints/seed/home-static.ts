import type { RequiredDataFromCollectionSlug } from 'payload'

import { lexical } from './salud/lexical'

/**
 * Inicio provisorio: se muestra solo mientras la base no tiene la página
 * "home" (por ejemplo, recién instalado y antes de cargar los datos de ejemplo).
 */
export const homeStatic: RequiredDataFromCollectionSlug<'pages'> = {
  slug: 'home',
  _status: 'published',
  title: 'Inicio',
  hero: {
    type: 'confluencia',
    richText: lexical([
      { tipo: 'h1', texto: 'Tu salud, en un solo lugar.' },
      {
        tipo: 'p',
        texto:
          'El sitio todavía no tiene contenido. Ingresá al panel con un usuario administrador y usá "Cargar datos de ejemplo".',
      },
    ]),
    links: [{ link: { type: 'custom', appearance: 'default', label: 'Ir al panel', url: '/admin' } }],
  },
  layout: [],
  meta: {
    description: 'Plataforma de gestión de salud.',
    title: 'Inicio',
  },
}
