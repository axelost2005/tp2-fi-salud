import type { CollectionConfig } from 'payload'

import { slugField } from 'payload'

import { anyone } from '../../access/anyone'
import { gestionaContenidos, visiblePara } from '../../access/roles'
import { ICONOS_ESPECIALIDAD } from '../../utilities/cartilla'
import { slugifyPayload } from '../../utilities/slugify'
import { revalidarCartilla, revalidarCartillaAlBorrar } from '../hooks/revalidarCartilla'

/**
 * Colección nueva (módulo Cartilla): las especialidades médicas que ofrece
 * la institución. Se muestran en /especialidades, en el bloque
 * "Especialidades destacadas" del inicio y sirven para filtrar la cartilla
 * de profesionales.
 */
export const Especialidades: CollectionConfig<'especialidades'> = {
  slug: 'especialidades',
  labels: {
    singular: 'Especialidad',
    plural: 'Especialidades',
  },
  // Nombre del tipo TypeScript generado (Payload lo derivaría como "Especialidade")
  typescript: { interface: 'Especialidad' },
  access: {
    create: gestionaContenidos,
    delete: gestionaContenidos,
    read: anyone,
    update: gestionaContenidos,
  },
  admin: {
    defaultColumns: ['nombre', 'destacada', 'orden', 'updatedAt'],
    description:
      'Áreas de atención. Se muestran en el sitio y se usan para filtrar la cartilla y pedir turnos.',
    group: 'Cartilla',
    hidden: visiblePara('admin', 'editor', 'recepcion'),
    useAsTitle: 'nombre',
  },
  defaultSort: 'orden',
  // Qué campos se traen cuando otra colección referencia una especialidad
  defaultPopulate: {
    icono: true,
    nombre: true,
    resumen: true,
    slug: true,
  },
  fields: [
    {
      name: 'nombre',
      type: 'text',
      label: 'Nombre',
      required: true,
      unique: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'icono',
          type: 'select',
          label: 'Ícono',
          defaultValue: 'estetoscopio',
          options: [...ICONOS_ESPECIALIDAD],
          required: true,
          admin: { width: '50%' },
        },
        {
          name: 'orden',
          type: 'number',
          label: 'Orden',
          defaultValue: 10,
          admin: { description: 'Menor número, aparece primero.', width: '25%' },
        },
        {
          name: 'destacada',
          type: 'checkbox',
          label: 'Destacada en el inicio',
          defaultValue: false,
          admin: { width: '25%' },
        },
      ],
    },
    {
      name: 'resumen',
      type: 'textarea',
      label: 'Resumen',
      maxLength: 180,
      required: true,
      admin: { description: 'Una o dos oraciones para las tarjetas (máximo 180 caracteres).' },
    },
    {
      name: 'descripcion',
      type: 'richText',
      label: 'Descripción completa',
    },
    slugField({ slugify: slugifyPayload, useAsSlug: 'nombre' }),
  ],
  hooks: {
    afterChange: [revalidarCartilla],
    afterDelete: [revalidarCartillaAlBorrar],
  },
}
