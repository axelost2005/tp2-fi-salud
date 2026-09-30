import type {
  Access,
  CollectionConfig,
  FieldHook,
  SelectFieldSingleValidation,
  TextFieldSingleValidation,
} from 'payload'

import { gestionaContenidos, visiblePara } from '../../access/roles'
import { DIAS, HORAS, OBRAS_SOCIALES } from '../../utilities/cartilla'
import { revalidarCartilla, revalidarCartillaAlBorrar } from '../hooks/revalidarCartilla'

/** El público solo ve a los profesionales activos; el personal ve a todos. */
const activosOPersonal: Access = ({ req: { user } }) => {
  if (user) return true
  return { activo: { equals: true } }
}

/** Arma "Dra. Laura Pérez" a partir del tratamiento, el nombre y el apellido. */
const armarNombreCompleto: FieldHook = ({ data, originalDoc }) => {
  // En una edición parcial (por ejemplo, solo el apellido) se completa con lo que ya estaba guardado
  const d = { ...originalDoc, ...data }
  return [d.tratamiento, d.nombre, d.apellido].filter(Boolean).join(' ').trim()
}

/** Normaliza la matrícula: "mp1234" → "MP 1234". */
const normalizarMatricula: FieldHook = ({ value }) => {
  if (typeof value !== 'string') return value
  const limpio = value.toUpperCase().replace(/\s+/g, '')
  const partes = limpio.match(/^(MP|MN)(\d+)$/)
  return partes ? `${partes[1]} ${partes[2]}` : value.trim()
}

/** Matrícula provincial (MP) o nacional (MN) seguida de 3 a 6 dígitos. */
const validarMatricula: TextFieldSingleValidation = (value) => {
  if (!value) return 'La matrícula es obligatoria.'
  return (
    /^(MP|MN) \d{3,6}$/.test(value) || 'Usá el formato MP 1234 (provincial) o MN 12345 (nacional).'
  )
}

/** La hora de fin de atención tiene que ser posterior a la de inicio. */
const validarHoraFin: SelectFieldSingleValidation = (value, { siblingData }) => {
  if (!value) return 'Indicá hasta qué hora atiende.'
  const inicio = (siblingData as { horaInicio?: string })?.horaInicio
  return !inicio || value > inicio || 'La hora de fin tiene que ser posterior a la de inicio.'
}

/**
 * Colección nueva (módulo Cartilla): médicos y demás profesionales, con sus
 * especialidades, matrícula, obras sociales y días y horario de atención.
 * El horario lo usa después el módulo de turnos para ofrecer horarios libres.
 */
export const Profesionales: CollectionConfig<'profesionales'> = {
  slug: 'profesionales',
  labels: {
    singular: 'Profesional',
    plural: 'Profesionales',
  },
  // Nombre del tipo TypeScript generado (Payload lo derivaría como "Profesionale")
  typescript: { interface: 'Profesional' },
  access: {
    create: gestionaContenidos,
    delete: gestionaContenidos,
    read: activosOPersonal,
    update: gestionaContenidos,
  },
  admin: {
    defaultColumns: ['nombreCompleto', 'matricula', 'especialidades', 'activo'],
    description: 'Cartilla de profesionales. Solo los marcados como visibles aparecen en el sitio.',
    group: 'Cartilla',
    hidden: visiblePara('admin', 'editor', 'recepcion'),
    listSearchableFields: ['nombre', 'apellido', 'matricula'],
    useAsTitle: 'nombreCompleto',
  },
  defaultSort: 'apellido',
  defaultPopulate: {
    atencion: true,
    especialidades: true,
    foto: true,
    matricula: true,
    nombreCompleto: true,
    obrasSociales: true,
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'tratamiento',
          type: 'select',
          label: 'Tratamiento',
          defaultValue: 'Dra.',
          options: [
            { label: 'Dr.', value: 'Dr.' },
            { label: 'Dra.', value: 'Dra.' },
            { label: 'Lic.', value: 'Lic.' },
          ],
          admin: { width: '20%' },
        },
        {
          name: 'nombre',
          type: 'text',
          label: 'Nombre',
          required: true,
          admin: { width: '40%' },
        },
        {
          name: 'apellido',
          type: 'text',
          label: 'Apellido',
          required: true,
          admin: { width: '40%' },
        },
      ],
    },
    {
      name: 'nombreCompleto',
      type: 'text',
      label: 'Nombre para mostrar',
      admin: {
        description: 'Se completa solo con el tratamiento, el nombre y el apellido.',
        position: 'sidebar',
        readOnly: true,
      },
      hooks: {
        beforeChange: [armarNombreCompleto],
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'matricula',
          type: 'text',
          label: 'Matrícula',
          required: true,
          unique: true,
          admin: {
            description: 'MP (provincial) o MN (nacional) seguida del número. Ej.: MP 4521',
            width: '35%',
          },
          hooks: {
            beforeValidate: [normalizarMatricula],
          },
          validate: validarMatricula,
        },
        {
          name: 'especialidades',
          type: 'relationship',
          label: 'Especialidades',
          hasMany: true,
          relationTo: 'especialidades',
          required: true,
          admin: { width: '65%' },
        },
      ],
    },
    {
      name: 'foto',
      type: 'upload',
      label: 'Foto',
      relationTo: 'media',
    },
    {
      name: 'bio',
      type: 'textarea',
      label: 'Presentación breve',
      maxLength: 400,
    },
    {
      name: 'atencion',
      type: 'group',
      label: 'Días y horario de atención',
      admin: {
        description: 'Con estos datos se calculan los horarios disponibles para pedir turno.',
      },
      fields: [
        {
          name: 'dias',
          type: 'select',
          label: 'Días',
          hasMany: true,
          options: DIAS.map(({ label, value }) => ({ label, value })),
          required: true,
        },
        {
          type: 'row',
          fields: [
            {
              name: 'horaInicio',
              type: 'select',
              label: 'Desde',
              options: HORAS,
              required: true,
              admin: { width: '33%' },
            },
            {
              name: 'horaFin',
              type: 'select',
              label: 'Hasta',
              options: HORAS,
              required: true,
              admin: { width: '33%' },
              validate: validarHoraFin,
            },
            {
              name: 'duracionTurno',
              type: 'number',
              label: 'Duración de cada turno (min)',
              defaultValue: 20,
              max: 60,
              min: 10,
              required: true,
              admin: { step: 5, width: '34%' },
            },
          ],
        },
      ],
    },
    {
      name: 'obrasSociales',
      type: 'select',
      label: 'Obras sociales y prepagas',
      hasMany: true,
      options: [...OBRAS_SOCIALES],
    },
    {
      name: 'activo',
      type: 'checkbox',
      label: 'Visible en la cartilla',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
  ],
  hooks: {
    afterChange: [revalidarCartilla],
    afterDelete: [revalidarCartillaAlBorrar],
  },
}
