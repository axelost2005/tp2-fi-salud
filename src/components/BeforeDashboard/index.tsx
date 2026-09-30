import type { TypedUser } from 'payload'

import { Banner } from '@payloadcms/ui/elements/Banner'
import React from 'react'

import type { User } from '@/payload-types'

import { type Rol, tieneRol } from '@/access/roles'
import { sitio } from '@/config/sitio'

import { SeedButton } from './SeedButton'
import './index.scss'

const baseClass = 'before-dashboard'

type Item = { roles: Rol[]; texto: React.ReactNode }

/** Qué ve cada rol en la bienvenida: solo lo que puede gestionar. */
const items: Item[] = [
  {
    roles: ['admin', 'recepcion'],
    texto: (
      <>
        <b>Turnos:</b> los pedidos del sitio entran como pendientes; confirmalos o cancelalos desde la
        lista. También podés cargar turnos pedidos por teléfono.
      </>
    ),
  },
  {
    roles: ['profesional'],
    texto: (
      <>
        <b>Tu agenda:</b> en Turnos ves solo tus pacientes. Podés marcar cada turno como atendido y
        dejar notas internas.
      </>
    ),
  },
  {
    roles: ['admin', 'recepcion'],
    texto: (
      <>
        <b>Mensajes:</b> las consultas del formulario de contacto están en Envíos de formularios.
      </>
    ),
  },
  {
    roles: ['admin', 'editor'],
    texto: (
      <>
        <b>Cartilla:</b> especialidades y profesionales, con sus días y horarios de atención.
      </>
    ),
  },
  {
    roles: ['admin', 'editor'],
    texto: (
      <>
        <b>Páginas y novedades:</b> textos, imágenes y artículos de salud, con borradores y vista previa
        antes de publicar.
      </>
    ),
  },
  {
    roles: ['admin', 'editor'],
    texto: (
      <>
        <b>Datos institucionales:</b> teléfonos, dirección y horarios que aparecen en todo el sitio.
      </>
    ),
  },
]

/**
 * Bienvenida del panel (reemplaza la del template, que estaba en inglés y
 * orientada al desarrollador). Muestra solo las tareas del rol de quien entra.
 */
const BeforeDashboard = ({ user }: { user?: TypedUser | null }) => {
  const usuario = user as User | null
  const visibles = items.filter((item) => tieneRol(usuario, ...item.roles))
  const esAdmin = tieneRol(usuario, 'admin')

  return (
    <div className={baseClass}>
      <Banner className={`${baseClass}__banner`} type="success">
        <h4>
          Hola{usuario?.name ? `, ${usuario.name.split(' ')[0]}` : ''}. Este es el panel de {sitio.nombre}.
        </h4>
      </Banner>
      {visibles.length > 0 && (
        <ul className={`${baseClass}__instructions`}>
          {visibles.map((item, i) => (
            <li key={i}>{item.texto}</li>
          ))}
          {esAdmin && (
            <li>
              <SeedButton />
              {' para borrar todo y cargar contenido de ejemplo; después podés '}
              <a href="/" rel="noopener noreferrer" target="_blank">
                ver el sitio
              </a>
              .
            </li>
          )}
        </ul>
      )}
    </div>
  )
}

export default BeforeDashboard
