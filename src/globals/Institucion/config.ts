import type { GlobalConfig } from 'payload'

import { gestionaContenidos, visiblePara } from '@/access/roles'

import { revalidateInstitucion } from './hooks/revalidateInstitucion'

/**
 * Global nuevo: datos de contacto de la institución. Se editan una sola vez
 * desde el panel y se muestran en la barra superior, el pie de página y la
 * página de turnos. Así el personal administrativo los actualiza sin tocar
 * código.
 */
export const Institucion: GlobalConfig = {
  slug: 'institucion',
  label: 'Datos institucionales',
  admin: {
    description: 'Teléfonos, dirección y horarios que se muestran en todo el sitio.',
    group: 'Configuración del sitio',
    hidden: visiblePara('admin', 'editor'),
  },
  access: {
    read: () => true,
    update: gestionaContenidos,
  },
  fields: [
    {
      name: 'lema',
      type: 'text',
      label: 'Lema',
      defaultValue: 'Atención médica cerca tuyo, en la confluencia.',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'telefonoGuardia',
          type: 'text',
          label: 'Teléfono de guardia (24 h)',
          required: true,
          defaultValue: '(0299) 555-0100',
          admin: { width: '50%' },
        },
        {
          name: 'telefonoTurnos',
          type: 'text',
          label: 'Teléfono de turnos',
          defaultValue: '(0299) 555-0200',
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'email',
          type: 'email',
          label: 'Email de contacto',
          defaultValue: 'turnos@confluenciasalud.com.ar',
          admin: { width: '50%' },
        },
        {
          name: 'direccion',
          type: 'text',
          label: 'Dirección',
          defaultValue: 'Av. Argentina 1500, Neuquén Capital',
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'horario',
      type: 'text',
      label: 'Horario de atención',
      defaultValue: 'Lunes a viernes de 7 a 21 h, sábados de 8 a 13 h',
    },
    {
      name: 'avisoUrgencias',
      type: 'textarea',
      label: 'Aviso de urgencias',
      admin: {
        description: 'Se muestra en la página de turnos para aclarar que no es un canal de urgencias.',
      },
      defaultValue:
        'Los turnos online no son para urgencias. Ante una emergencia llamá al 107 o acercate a la guardia.',
    },
  ],
  hooks: {
    afterChange: [revalidateInstitucion],
  },
}
