import type { TypedUser } from 'payload'

import { Banner } from '@payloadcms/ui/elements/Banner'
import React from 'react'

import type { User } from '@/payload-types'

import { tieneRol } from '@/access/roles'

import { sitio } from '@/config/sitio'

import { SeedButton } from './SeedButton'
import './index.scss'

const baseClass = 'before-dashboard'

/**
 * Bienvenida del panel (reemplaza la del template, que estaba en inglés y
 * orientada al desarrollador). Explica en lenguaje simple qué se gestiona acá.
 */
const BeforeDashboard = ({ user }: { user?: TypedUser | null }) => {
  const esAdmin = tieneRol(user as User | null, 'admin')

  return (
    <div className={baseClass}>
      <Banner className={`${baseClass}__banner`} type="success">
        <h4>Te damos la bienvenida al panel de {sitio.nombre}</h4>
      </Banner>
      Desde acá se administra todo lo que se ve en el sitio público:
      <ul className={`${baseClass}__instructions`}>
        <li>
          <b>Turnos:</b> pedidos que llegan desde el sitio (quedan pendientes hasta que recepción los
          confirma) y turnos cargados por teléfono.
        </li>
        <li>
          <b>Cartilla:</b> especialidades y profesionales, con sus días y horarios de atención.
        </li>
        <li>
          <b>Páginas y novedades:</b> textos, imágenes y artículos de salud, con borradores y
          vista previa antes de publicar.
        </li>
        <li>
          <b>Datos institucionales:</b> teléfonos, dirección y horarios que aparecen en todo el
          sitio (menú <i>Globales</i>).
        </li>
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
    </div>
  )
}

export default BeforeDashboard
