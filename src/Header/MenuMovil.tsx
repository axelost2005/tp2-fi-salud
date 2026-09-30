'use client'

import { Menu, SearchIcon, X } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useId, useState } from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'

/**
 * Menú para celulares (nuevo): el template mostraba los links en una sola
 * fila y con más secciones no entraban. Botón accesible (aria-expanded,
 * aria-controls) que se cierra al tocar un enlace o con la tecla Escape.
 */
export const MenuMovil: React.FC<{ data: HeaderType }> = ({ data }) => {
  const [abierto, setAbierto] = useState(false)
  const panelId = useId()
  const navItems = data?.navItems || []
  const boton = data?.botonDestacado?.mostrar ? data.botonDestacado.link : null

  useEffect(() => {
    if (!abierto) return
    const alPresionar = (e: KeyboardEvent) => e.key === 'Escape' && setAbierto(false)
    window.addEventListener('keydown', alPresionar)
    return () => window.removeEventListener('keydown', alPresionar)
  }, [abierto])

  return (
    <div className="lg:hidden">
      <button
        aria-controls={panelId}
        aria-expanded={abierto}
        className="inline-flex size-11 items-center justify-center rounded-full border border-border text-foreground hover:bg-secondary"
        onClick={() => setAbierto((v) => !v)}
        type="button"
      >
        <span className="sr-only">{abierto ? 'Cerrar menú' : 'Abrir menú'}</span>
        {abierto ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
      </button>

      {abierto && (
        <div
          className="absolute inset-x-0 top-full border-y border-border bg-background shadow-lg"
          id={panelId}
        >
          <nav
            aria-label="Principal (móvil)"
            className="container flex flex-col py-3"
            onClick={(e) => {
              // Cerrar el menú al elegir cualquier enlace
              if ((e.target as HTMLElement).closest('a')) setAbierto(false)
            }}
          >
            {navItems.map(({ link }, i) => (
              <CMSLink
                key={i}
                {...link}
                appearance="inline"
                className="border-b border-border py-3 text-lg font-semibold last:border-b-0"
              />
            ))}
            <Link className="inline-flex items-center gap-2 py-3 text-lg font-semibold" href="/search">
              <SearchIcon aria-hidden className="size-5 text-primary" />
              Buscar
            </Link>
            {boton?.label && (
              <CMSLink {...boton} appearance="default" className="mt-2 w-full sm:hidden" size="lg" />
            )}
          </nav>
        </div>
      )}
    </div>
  )
}
