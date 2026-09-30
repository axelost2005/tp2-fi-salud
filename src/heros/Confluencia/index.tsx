import React from 'react'

import type { Page } from '@/payload-types'

import { RiosIlustracion } from '@/components/Confluencia/RiosIlustracion'
import { CMSLink } from '@/components/Link'
import RichText from '@/components/RichText'

/**
 * Hero "Confluencia" (nuevo): texto alineado a la izquierda con las acciones
 * principales y, a la derecha, la ilustración de marca. A diferencia del
 * hero "High Impact" del template no depende de una foto de fondo, así que
 * el texto siempre tiene buen contraste y carga más liviano.
 */
export const ConfluenciaHero: React.FC<Page['hero']> = ({ links, richText }) => {
  return (
    <section className="container">
      <div className="grid items-center gap-10 pt-6 pb-4 md:grid-cols-[1.15fr_1fr] md:gap-14 lg:pt-10">
        <div className="max-w-[36rem]">
          {richText && (
            <RichText
              className="hero-confluencia mb-8 [&_h1]:mb-5 [&_p]:text-lg [&_p]:text-muted-foreground"
              data={richText}
              enableGutter={false}
            />
          )}
          {Array.isArray(links) && links.length > 0 && (
            <ul className="flex flex-wrap gap-3">
              {links.map(({ link }, i) => (
                <li key={i}>
                  <CMSLink {...link} size="lg" />
                </li>
              ))}
            </ul>
          )}
        </div>
        <RiosIlustracion className="mx-auto w-full max-w-[34rem]" />
      </div>
    </section>
  )
}
