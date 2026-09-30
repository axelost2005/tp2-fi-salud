import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
  label: 'Encabezado',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      label: 'Menú principal',
      labels: { singular: 'Enlace', plural: 'Enlaces' },
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
    },
    {
      name: 'botonDestacado',
      type: 'group',
      label: 'Botón destacado',
      admin: {
        description: 'Acción principal que se ve siempre en el encabezado (por ejemplo, "Pedir turno").',
      },
      fields: [
        {
          name: 'mostrar',
          type: 'checkbox',
          label: 'Mostrar el botón',
          defaultValue: false,
        },
        link({
          appearances: false,
          overrides: {
            admin: {
              condition: (_, siblingData) => Boolean(siblingData?.mostrar),
            },
          },
        }),
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}
