import { getCachedGlobal } from '@/utilities/getGlobals'
import { Mail, MapPin, Phone } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'
import { sitio } from '@/config/sitio'
import { telHref } from '@/utilities/telefono'

export async function Footer() {
  const [footerData, institucion] = await Promise.all([
    getCachedGlobal('footer', 1)(),
    getCachedGlobal('institucion', 0)(),
  ])

  const navItems = footerData?.navItems || []
  const { direccion, email, horario, lema, telefonoGuardia, telefonoTurnos } = institucion || {}

  return (
    <footer className="pie-oscuro mt-auto bg-pie text-pie-foreground">
      <div className="container grid gap-10 py-12 md:grid-cols-[1.2fr_1fr_0.8fr]">
        <div className="flex flex-col gap-4">
          <Link aria-label={`${sitio.nombre}, ir al inicio`} className="w-fit" href="/">
            <Logo />
          </Link>
          {lema && <p className="max-w-[22rem] text-pie-muted">{lema}</p>}
        </div>

        <address className="flex flex-col gap-3 not-italic">
          <h2 className="text-base font-bold">Contacto</h2>
          {telefonoGuardia && (
            <a className="inline-flex items-center gap-2 font-semibold text-pie-urgencia" href={telHref(telefonoGuardia)}>
              <Phone aria-hidden className="size-4" />
              Guardia 24 h: {telefonoGuardia}
            </a>
          )}
          {telefonoTurnos && (
            <a className="inline-flex items-center gap-2" href={telHref(telefonoTurnos)}>
              <Phone aria-hidden className="size-4" />
              Turnos: {telefonoTurnos}
            </a>
          )}
          {email && (
            <a className="inline-flex items-center gap-2" href={`mailto:${email}`}>
              <Mail aria-hidden className="size-4" />
              {email}
            </a>
          )}
          {direccion && (
            <span className="inline-flex items-center gap-2">
              <MapPin aria-hidden className="size-4" />
              {direccion}
            </span>
          )}
          {horario && <span className="text-pie-muted">{horario}</span>}
        </address>

        <div className="flex flex-col gap-3">
          <h2 className="text-base font-bold">Enlaces</h2>
          <nav aria-label="Pie de página" className="flex flex-col gap-2">
            {navItems.map(({ link }, i) => {
              return <CMSLink className="w-fit underline-offset-4 hover:underline" key={i} {...link} />
            })}
          </nav>
          <div className="mt-2 flex items-center gap-2 text-pie-muted">
            <span>Tema:</span>
            <ThemeSelector />
          </div>
        </div>
      </div>
      <div className="border-t border-pie-borde">
        <div className="container flex flex-col gap-1 py-5 text-sm text-pie-muted md:flex-row md:justify-between">
          <span>
            © {new Date().getFullYear()} {sitio.nombre}
          </span>
          <span>Sitio de demostración de un trabajo práctico universitario. Los datos son ficticios.</span>
        </div>
      </div>
    </footer>
  )
}
