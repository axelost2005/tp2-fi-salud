import type { Form } from '@/payload-types'
import { RequiredDataFromCollectionSlug } from 'payload'

import { lexical } from './salud/lexical'

type ContactArgs = {
  contactForm: Form
}

export const contact: (args: ContactArgs) => RequiredDataFromCollectionSlug<'pages'> = ({
  contactForm,
}) => {
  return {
    slug: 'contacto',
    _status: 'published',
    title: 'Contacto',
    hero: {
      type: 'lowImpact',
      richText: lexical([
        { tipo: 'h1', texto: 'Contacto' },
        {
          tipo: 'p',
          texto:
            'Para consultas administrativas, de obras sociales o sugerencias. Para pedir un turno usá la sección Turnos.',
        },
      ]),
    },
    layout: [
      {
        blockType: 'formBlock',
        enableIntro: false,
        form: contactForm,
      },
    ],
    meta: {
      description: 'Escribinos por consultas administrativas, obras sociales o sugerencias.',
      title: 'Contacto',
    },
  }
}
