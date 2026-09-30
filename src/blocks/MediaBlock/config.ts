import type { Block } from 'payload'

export const MediaBlock: Block = {
  slug: 'mediaBlock',
  interfaceName: 'MediaBlock',
  labels: {
    plural: 'Imágenes',
    singular: 'Imagen',
  },
  fields: [
    {
      name: 'media',
      type: 'upload',
      label: 'Imagen',
      relationTo: 'media',
      required: true,
    },
  ],
}
