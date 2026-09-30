import { Clock, MapPin, Phone } from 'lucide-react'
import React from 'react'

import type { Institucion } from '@/payload-types'

import { telHref } from '@/utilities/telefono'

/**
 * Barra superior (nueva): el teléfono de guardia siempre visible y tocable.
 * En salud es la información más urgente del sitio, por eso va primero y
 * en el color reservado para urgencias.
 */
export const TopBar: React.FC<{ institucion: Institucion }> = ({ institucion }) => {
  const { direccion, horario, telefonoGuardia } = institucion || {}

  return (
    <div className="border-b border-border bg-card text-sm">
      <div className="container flex min-h-10 flex-wrap items-center justify-between gap-x-6 gap-y-1 py-2">
        {telefonoGuardia && (
          <a
            className="inline-flex items-center gap-2 font-semibold text-urgencia underline-offset-4 hover:underline"
            href={telHref(telefonoGuardia)}
          >
            <Phone aria-hidden className="size-4" />
            Guardia 24 h: {telefonoGuardia}
          </a>
        )}
        <div className="hidden items-center gap-6 text-muted-foreground md:flex">
          {horario && (
            <span className="inline-flex items-center gap-2">
              <Clock aria-hidden className="size-4" />
              {horario}
            </span>
          )}
          {direccion && (
            <span className="inline-flex items-center gap-2">
              <MapPin aria-hidden className="size-4" />
              {direccion}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
