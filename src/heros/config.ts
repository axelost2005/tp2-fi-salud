import type { Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { linkGroup } from '@/fields/linkGroup'

export const hero: Field = {
  name: 'hero',
  type: 'group',
  fields: [
    {
      name: 'type',
      type: 'select',
      defaultValue: 'lowImpact',
      label: 'Tipo de portada',
      options: [
        {
          label: 'Sin portada',
          value: 'none',
        },
        {
          label: 'Confluencia (texto + ilustración de marca)',
          value: 'confluencia',
        },
        {
          label: 'Alto impacto (foto de fondo)',
          value: 'highImpact',
        },
        {
          label: 'Impacto medio (texto + foto)',
          value: 'mediumImpact',
        },
        {
          label: 'Bajo impacto (solo texto)',
          value: 'lowImpact',
        },
      ],
      required: true,
    },
    {
      name: 'richText',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: false,
    },
    linkGroup({
      overrides: {
        label: 'Botones',
        maxRows: 2,
      },
    }),
    {
      name: 'media',
      type: 'upload',
      label: 'Imagen',
      admin: {
        condition: (_, { type } = {}) => ['highImpact', 'mediumImpact'].includes(type),
      },
      relationTo: 'media',
      required: true,
    },
  ],
  label: false,
}
