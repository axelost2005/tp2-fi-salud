'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { SearchIcon } from 'lucide-react'

/** Navegación de escritorio. En pantallas chicas se usa el MenuMovil. */
export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []

  return (
    <nav aria-label="Principal" className="hidden items-center gap-6 lg:flex">
      {navItems.map(({ link }, i) => {
        return (
          <CMSLink
            key={i}
            {...link}
            appearance="link"
            className="text-base font-semibold text-foreground hover:text-primary"
          />
        )
      })}
      <Link
        className="inline-flex size-10 items-center justify-center rounded-full text-primary hover:bg-secondary"
        href="/search"
      >
        <span className="sr-only">Buscar en el sitio</span>
        <SearchIcon aria-hidden className="size-5" />
      </Link>
    </nav>
  )
}
