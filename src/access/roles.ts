import type { Access, FieldAccess, PayloadRequest } from 'payload'

import type { User } from '@/payload-types'

/**
 * Roles del personal. Cada usuario del panel tiene uno o más:
 * - admin: todo, incluida la gestión de usuarios.
 * - editor: contenidos del sitio (páginas, novedades, cartilla, datos institucionales).
 * - recepcion: turnos y mensajes que llegan por los formularios.
 * - profesional: solo ve y actualiza su propia agenda de turnos.
 *
 * Los roles viajan dentro del token de sesión (saveToJWT), así cada control
 * de acceso se resuelve sin consultar la base de datos.
 */
export const ROLES = ['admin', 'editor', 'recepcion', 'profesional'] as const
export type Rol = (typeof ROLES)[number]

export const opcionesDeRol: { label: string; value: Rol }[] = [
  { label: 'Administrador/a', value: 'admin' },
  { label: 'Editor/a de contenidos', value: 'editor' },
  { label: 'Recepción', value: 'recepcion' },
  { label: 'Profesional de la salud', value: 'profesional' },
]

type ConUsuario = Pick<PayloadRequest, 'user'> | undefined

export const tieneRol = (user: User | null | undefined, ...roles: Rol[]): boolean =>
  Boolean(user?.roles?.some((rol) => roles.includes(rol as Rol)))

const segunRoles =
  (...roles: Rol[]): Access =>
  ({ req }) =>
    tieneRol(req.user as User | null, ...roles)

/** Solo administradores. */
export const esAdmin: Access = segunRoles('admin')

/** Administradores y editores: todo lo que se publica en el sitio. */
export const gestionaContenidos: Access = segunRoles('admin', 'editor')

/** Administradores y recepción: turnos y mensajes de formularios. */
export const gestionaTurnos: Access = segunRoles('admin', 'recepcion')

/** Versión para permisos a nivel de campo (por ejemplo, quién puede cambiar roles). */
export const esAdminCampo: FieldAccess = ({ req }: { req: ConUsuario }) =>
  tieneRol(req?.user as User | null, 'admin')

/** Un usuario puede verse y editarse a sí mismo; un admin, a todos. */
export const adminOElMismo: Access = ({ req }) => {
  const user = req.user as User | null
  if (!user) return false
  if (tieneRol(user, 'admin')) return true
  return { id: { equals: user.id } }
}
