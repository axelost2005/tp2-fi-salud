import { Clock3 } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import type { Post } from '@/payload-types'

import { cn } from '@/utilities/ui'
import { Media } from '@/components/Media'
import { MarcaConfluencia } from '@/components/Logo/MarcaConfluencia'
import { hrefDocumento } from '@/utilities/rutas'

export type CardPostData = Pick<Post, 'slug' | 'categories' | 'meta' | 'title'> &
  Partial<Pick<Post, 'tiempoLectura'>>

/**
 * Tarjeta de novedad. Cambios respecto del template:
 * - Toda la tarjeta es clickeable con un "enlace estirado" en CSS (el
 *   pseudo-elemento del título cubre la tarjeta), sin JavaScript: el
 *   template lo resolvía con refs y eventos de mouse.
 * - Imagen con proporción fija para que las tarjetas queden parejas.
 * - Categorías como etiquetas en vez de texto en mayúsculas.
 * - Si no hay foto se muestra el isotipo (el template decía "No image").
 */
export const Card: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardPostData
  relationTo?: 'posts'
  showCategories?: boolean
  title?: string
}> = (props) => {
  const { className, doc, relationTo, showCategories, title: titleFromProps } = props

  const { slug, categories, meta, tiempoLectura, title } = doc || {}
  const { description, image: metaImage } = meta || {}

  const hasCategories = categories && Array.isArray(categories) && categories.length > 0
  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ') // replace non-breaking space with white space
  const href = hrefDocumento(relationTo || 'posts', slug)

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-background transition-colors hover:border-primary/60',
        className,
      )}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-secondary">
        {metaImage && typeof metaImage === 'object' ? (
          <Media fill imgClassName="object-cover" resource={metaImage} size="33vw" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <MarcaConfluencia className="h-16 w-16 opacity-60" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        {showCategories && hasCategories && (
          <ul className="relative z-10 flex flex-wrap gap-2">
            {categories?.map((category, index) => {
              if (typeof category === 'object' && category !== null) {
                return (
                  <li
                    className="rounded-full bg-secondary px-2.5 py-0.5 text-sm font-semibold text-secondary-foreground"
                    key={index}
                  >
                    {category.title || 'Sin categoría'}
                  </li>
                )
              }

              return null
            })}
          </ul>
        )}
        {titleToUse && (
          <h3 className="text-xl leading-snug font-bold">
            <Link
              className="after:absolute after:inset-0 after:content-[''] group-hover:text-primary"
              href={href}
            >
              {titleToUse}
            </Link>
          </h3>
        )}
        {description && <p className="text-muted-foreground">{sanitizedDescription}</p>}
        {tiempoLectura ? (
          <p className="mt-auto flex items-center gap-1.5 pt-1 text-sm text-muted-foreground">
            <Clock3 aria-hidden className="size-4" />
            {tiempoLectura} min de lectura
          </p>
        ) : null}
      </div>
    </article>
  )
}
