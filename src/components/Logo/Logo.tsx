import clsx from 'clsx'
import React from 'react'

import { sitio } from '@/config/sitio'

import { MarcaConfluencia } from './MarcaConfluencia'

interface Props {
  className?: string
}

/**
 * Isologotipo: isotipo SVG + nombre en texto real (no imagen), así se lee
 * bien con lectores de pantalla y hereda el color del contexto (claro/oscuro).
 */
export const Logo = ({ className }: Props) => {
  const [primera, ...resto] = sitio.nombre.split(' ')

  return (
    <span className={clsx('inline-flex items-center gap-2.5 text-current', className)}>
      <MarcaConfluencia className="h-9 w-9 shrink-0" />
      <span className="text-[1.3rem] leading-none tracking-[-0.01em]">
        <span className="font-bold">{primera}</span>
        {resto.length > 0 && <span className="font-normal"> {resto.join(' ')}</span>}
      </span>
    </span>
  )
}
