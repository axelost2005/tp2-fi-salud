import type { CollectionConfig, TextFieldSingleValidation } from 'payload'

import { accesoTurnos, esAdmin, gestionaTurnos, gestionaTurnosCampo } from '../../access/roles'
import { OBRAS_SOCIALES } from '../../utilities/cartilla'
import { ESTADOS_TURNO } from '../../utilities/turnos'
import { armarResumen, asignarCodigo, normalizarFecha, validarTurno } from './hooks'

const validarHora: TextFieldSingleValidation = (value) =>
  !value || /^([01]\d|2[0-3]):[0-5]\d$/.test(value) || 'Usá el formato de 24 horas, por ejemplo 08:20.'

const validarDni: TextFieldSingleValidation = (value) =>
  !value || /^\d{7,8}$/.test(value) || 'El DNI tiene que tener 7 u 8 números, sin puntos.'

/** Solo admin y recepción pueden cambiar estos datos; un profesional solo actualiza estado y notas. */
const soloGestion = { update: gestionaTurnosCampo }

/**
 * Colección nueva (módulo Turnos): los turnos que piden los pacientes desde
 * el sitio o que carga recepción desde el panel.
 * - Cualquier persona puede pedir un turno, pero únicamente a través de la
 *   Server Action del formulario público, que valida todo en el servidor.
 *   La API REST de esta colección no es pública.
 * - Admin y recepción ven todos los turnos; cada profesional, solo los suyos.
 * - Las reglas de agenda (días, horarios, doble reserva) están en hooks.ts.
 */
export const Turnos: CollectionConfig<'turnos'> = {
  slug: 'turnos',
  labels: {
    singular: 'Turno',
    plural: 'Turnos',
  },
  typescript: { interface: 'Turno' },
  access: {
    create: gestionaTurnos,
    delete: esAdmin,
    read: accesoTurnos,
    update: accesoTurnos,
  },
  admin: {
    defaultColumns: ['resumen', 'profesional', 'estado', 'creadoDesde', 'codigo'],
    description: 'Agenda de turnos. Los pedidos del sitio entran como "Pendiente de confirmación".',
    group: 'Turnos',
    listSearchableFields: ['codigo', 'resumen', 'paciente.dni'],
    useAsTitle: 'resumen',
  },
  defaultSort: ['fecha', 'hora'],
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'especialidad',
          type: 'relationship',
          label: 'Especialidad',
          relationTo: 'especialidades',
          required: true,
          access: soloGestion,
          admin: { width: '50%' },
        },
        {
          name: 'profesional',
          type: 'relationship',
          label: 'Profesional',
          relationTo: 'profesionales',
          required: true,
          access: soloGestion,
          admin: { width: '50%' },
          // En el panel solo se ofrecen profesionales de la especialidad elegida
          filterOptions: ({ siblingData }) => {
            const especialidad = (siblingData as { especialidad?: number | { id: number } })?.especialidad
            if (!especialidad) return true
            const id = typeof especialidad === 'object' ? especialidad.id : especialidad
            return { especialidades: { in: [id] } }
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'fecha',
          type: 'date',
          label: 'Fecha',
          required: true,
          access: soloGestion,
          admin: {
            date: { displayFormat: 'dd/MM/yyyy', pickerAppearance: 'dayOnly' },
            width: '50%',
          },
          hooks: { beforeValidate: [normalizarFecha] },
        },
        {
          name: 'hora',
          type: 'text',
          label: 'Hora',
          required: true,
          access: soloGestion,
          validate: validarHora,
          admin: {
            description: 'Formato 24 h (ej.: 08:20). Tiene que ser un horario de la agenda del profesional.',
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'paciente',
      type: 'group',
      label: 'Datos del paciente',
      access: soloGestion,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'nombre', type: 'text', label: 'Nombre', required: true, admin: { width: '50%' } },
            { name: 'apellido', type: 'text', label: 'Apellido', required: true, admin: { width: '50%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'dni',
              type: 'text',
              label: 'DNI',
              required: true,
              validate: validarDni,
              admin: { width: '33%' },
            },
            { name: 'telefono', type: 'text', label: 'Teléfono', required: true, admin: { width: '33%' } },
            { name: 'email', type: 'email', label: 'Email', required: true, admin: { width: '34%' } },
          ],
        },
        {
          name: 'obraSocial',
          type: 'select',
          label: 'Obra social',
          options: [...OBRAS_SOCIALES],
          required: true,
        },
      ],
    },
    {
      name: 'motivo',
      type: 'textarea',
      label: 'Motivo de la consulta',
      maxLength: 500,
      access: soloGestion,
    },
    {
      name: 'notasInternas',
      type: 'textarea',
      label: 'Notas internas',
      admin: {
        description: 'Solo las ve el personal. Nunca se muestran al paciente.',
      },
    },
    // ——— Barra lateral ———
    {
      name: 'estado',
      type: 'select',
      label: 'Estado',
      defaultValue: 'pendiente',
      options: [...ESTADOS_TURNO],
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'codigo',
      type: 'text',
      label: 'Código',
      unique: true,
      admin: {
        description: 'Se genera solo. Es el código que recibe el paciente.',
        position: 'sidebar',
        readOnly: true,
      },
      hooks: { beforeChange: [asignarCodigo] },
    },
    {
      name: 'creadoDesde',
      type: 'select',
      label: 'Origen',
      defaultValue: 'panel',
      options: [
        { label: 'Sitio web', value: 'web' },
        { label: 'Panel (recepción)', value: 'panel' },
      ],
      access: soloGestion,
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'resumen',
      type: 'text',
      label: 'Resumen',
      admin: {
        description: 'Se arma solo con la fecha, la hora y el paciente.',
        position: 'sidebar',
        readOnly: true,
      },
      hooks: { beforeChange: [armarResumen] },
    },
  ],
  hooks: {
    beforeChange: [validarTurno],
  },
}
