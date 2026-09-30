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

/** Campo editable solo por admin y recepción (por ejemplo, los datos del paciente de un turno). */
export const gestionaTurnosCampo: FieldAccess = ({ req }: { req: ConUsuario }) =>
  tieneRol(req?.user as User | null, 'admin', 'recepcion')

/**
 * Turnos: admin y recepción ven todos; un profesional solo los de su agenda
 * (la condición se agrega a la consulta, así nunca llegan datos de otros
 * pacientes). Los datos de salud son sensibles según la Ley 25.326.
 */
export const accesoTurnos: Access = ({ req }) => {
  const user = req.user as User | null
  if (!user) return false
  if (tieneRol(user, 'admin', 'recepcion')) return true
  if (tieneRol(user, 'profesional') && user.profesional) {
    const id = typeof user.profesional === 'object' ? user.profesional.id : user.profesional
    return { profesional: { equals: id } }
  }
  return false
}

/**
 * Para `admin.hidden`: oculta una sección del menú del panel salvo para los
 * roles indicados. Solo afecta la interfaz; los permisos reales siguen
 * estando en `access`.
 */
export const visiblePara =
  (...roles: Rol[]) =>
  ({ user }: { user: unknown }): boolean =>
    !tieneRol(user as User | null, ...roles)

/** Un usuario puede verse y editarse a sí mismo; un admin, a todos. */
export const adminOElMismo: Access = ({ req }) => {
  const user = req.user as User | null
  if (!user) return false
  if (tieneRol(user, 'admin')) return true
  return { id: { equals: user.id } }
}
