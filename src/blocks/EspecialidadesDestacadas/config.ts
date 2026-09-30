import type { Block } from 'payload'

/**
 * Bloque nuevo para el constructor de páginas: muestra las especialidades
 * marcadas como "destacadas" con un enlace a cada una. El editor solo
 * elige el título y el texto; los datos salen de la colección.
 */
export const EspecialidadesDestacadas: Block = {
  slug: 'especialidadesDestacadas',
  interfaceName: 'EspecialidadesDestacadasBlock',
  labels: {
    plural: 'Especialidades destacadas',
    singular: 'Especialidades destacadas',
  },
  fields: [
    {
      name: 'titulo',
      type: 'text',
      label: 'Título',
      defaultValue: 'Especialidades',
      required: true,
    },
    {
      name: 'introduccion',
      type: 'textarea',
      label: 'Texto introductorio',
    },
    {
      name: 'cantidad',
      type: 'number',
      label: 'Cantidad máxima a mostrar',
      defaultValue: 6,
      max: 12,
      min: 3,
    },
  ],
}
