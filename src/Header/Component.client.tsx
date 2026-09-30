'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect } from 'react'

import type { Header } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'
import { sitio } from '@/config/sitio'
import { HeaderNav } from './Nav'
import { MenuMovil } from './MenuMovil'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  // Al cambiar de página el encabezado vuelve a heredar el tema global
  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // Solo una portada con foto de fondo fuerza el encabezado a oscuro
  const theme = headerTheme ?? null
  const boton = data?.botonDestacado?.mostrar ? data.botonDestacado.link : null

  return (
    <header className="container relative z-20" {...(theme ? { 'data-theme': theme } : {})}>
      <div className="flex h-20 items-center justify-between gap-4">
        <Link aria-label={`${sitio.nombre}, ir al inicio`} className="text-foreground" href="/">
          <Logo />
        </Link>
        <div className="flex items-center gap-2 lg:gap-6">
          <HeaderNav data={data} />
          {boton?.label && (
            <CMSLink {...boton} appearance="default" className="hidden sm:inline-flex" size="sm" />
          )}
          <MenuMovil data={data} />
        </div>
      </div>
    </header>
  )
}
