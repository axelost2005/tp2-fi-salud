import type { RequiredDataFromCollectionSlug } from 'payload'

import { sitio } from '@/config/sitio'

import { lexical } from './salud/lexical'

/**
 * Página de inicio de ejemplo. Arma la portada con bloques del CMS: el
 * editor puede reordenarlos, quitarlos o sumar otros desde el panel.
 */
export const home = (): RequiredDataFromCollectionSlug<'pages'> => ({
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
          'Especialidades, cartilla de profesionales y turnos online en Neuquén. Pedí tu turno en minutos, sin llamar por teléfono.',
      },
    ]),
    links: [
      { link: { type: 'custom', appearance: 'default', label: 'Pedir turno', url: '/turnos' } },
      {
        link: { type: 'custom', appearance: 'outline', label: 'Ver especialidades', url: '/especialidades' },
      },
    ],
  },
  layout: [
    {
      blockName: 'Especialidades destacadas',
      blockType: 'especialidadesDestacadas',
      cantidad: 6,
      introduccion: 'Atención para toda la familia, con profesionales de la región.',
      titulo: 'Especialidades',
    },
    {
      blockName: 'Cómo pedir un turno',
      blockType: 'content',
      columns: [
        { size: 'full', richText: lexical([{ tipo: 'h2', texto: 'Cómo pedir un turno online' }]) },
        {
          size: 'oneThird',
          richText: lexical([
            { tipo: 'h3', texto: '1. Elegí la especialidad' },
            { tipo: 'p', texto: 'Buscá el área que necesitás o consultá la cartilla completa de profesionales.' },
          ]),
        },
        {
          size: 'oneThird',
          richText: lexical([
            { tipo: 'h3', texto: '2. Elegí día y horario' },
            {
              tipo: 'p',
              texto: 'Te mostramos solo los horarios libres de cada profesional, según sus días de atención.',
            },
          ]),
        },
        {
          size: 'oneThird',
          richText: lexical([
            { tipo: 'h3', texto: '3. Recibí la confirmación' },
            {
              tipo: 'p',
              texto: 'Te damos un código de turno y recepción te confirma por email o por teléfono.',
            },
          ]),
        },
      ],
    },
    {
      blockName: 'Últimas novedades',
      blockType: 'archive',
      introContent: lexical([
        { tipo: 'h2', texto: 'Novedades de salud' },
        { tipo: 'p', texto: 'Consejos de prevención y cuidado, revisados por profesionales de nuestra cartilla.' },
      ]),
      limit: 3,
      populateBy: 'collection',
      relationTo: 'posts',
    },
    {
      blockName: 'Cartilla',
      blockType: 'cta',
      links: [{ link: { type: 'custom', appearance: 'default', label: 'Ver la cartilla', url: '/profesionales' } }],
      richText: lexical([
        { tipo: 'h3', texto: '¿Buscás a un profesional en particular?' },
        { tipo: 'p', texto: 'Consultá la cartilla con días de atención, matrícula y obras sociales de cada profesional.' },
      ]),
    },
  ],
  meta: {
    description: sitio.descripcion,
    title: 'Inicio',
  },
})
