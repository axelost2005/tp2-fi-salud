import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { gestionaContenidos } from '../access/roles'
import { slugField } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: 'Categoría',
    plural: 'Categorías',
  },
  access: {
    create: gestionaContenidos,
    delete: gestionaContenidos,
    read: anyone,
    update: gestionaContenidos,
  },
  admin: {
    group: 'Contenidos',
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Nombre',
      required: true,
    },
    slugField({
      position: undefined,
    }),
  ],
}
