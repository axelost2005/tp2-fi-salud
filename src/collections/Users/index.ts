import type { CollectionConfig, FieldHook } from 'payload'

import { authenticated } from '../../access/authenticated'
import { adminOElMismo, esAdmin, esAdminCampo, opcionesDeRol } from '../../access/roles'

/**
 * El primer usuario que se registra en una base vacía queda como admin,
 * así nunca se pierde el acceso total al panel.
 */
const primerUsuarioEsAdmin: FieldHook = async ({ operation, req, value }) => {
  if (operation !== 'create') return value

  const { totalDocs } = await req.payload.count({ collection: 'users', req })

  if (totalDocs === 0) return ['admin']

  return value
}

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Usuario',
    plural: 'Usuarios',
  },
  access: {
    admin: authenticated,
    // Solo un admin da de alta, ve a todos y elimina usuarios.
    // El resto del personal solo puede ver y editar su propia cuenta.
    create: esAdmin,
    delete: esAdmin,
    read: adminOElMismo,
    update: adminOElMismo,
  },
  admin: {
    defaultColumns: ['name', 'email', 'roles'],
    group: 'Administración',
    useAsTitle: 'name',
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Nombre y apellido',
      required: true,
    },
    {
      name: 'roles',
      type: 'select',
      label: 'Roles',
      hasMany: true,
      required: true,
      defaultValue: ['editor'],
      options: opcionesDeRol,
      // Viaja en el token de sesión: los permisos se resuelven sin ir a la base
      saveToJWT: true,
      access: {
        // Nadie puede auto-asignarse roles: solo un admin los cambia
        create: esAdminCampo,
        update: esAdminCampo,
      },
      admin: {
        description: 'Definen qué puede ver y hacer cada persona en el panel.',
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [primerUsuarioEsAdmin],
      },
    },
  ],
  timestamps: true,
}
