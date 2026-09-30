import { formatDateTime } from 'src/utilities/formatDateTime'
import React from 'react'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'
import { formatAuthors } from '@/utilities/formatAuthors'

/**
 * Encabezado de cada novedad. El template superponía el título blanco
 * sobre la foto; acá título y datos van sobre fondo liso (mejor contraste
 * y lectura) y la imagen se muestra debajo, completa.
 */
export const PostHero: React.FC<{
  post: Post
}> = ({ post }) => {
  const { categories, heroImage, populatedAuthors, publishedAt, title } = post

  const hasAuthors =
    populatedAuthors && populatedAuthors.length > 0 && formatAuthors(populatedAuthors) !== ''

  const categorias = (categories || []).filter(
    (c): c is Exclude<typeof c, number> => typeof c === 'object' && c !== null,
  )

  return (
    <header className="container">
      <div className="mx-auto max-w-[48rem] pt-4 pb-8">
        {categorias.length > 0 && (
          <ul className="mb-5 flex flex-wrap gap-2">
            {categorias.map((categoria) => (
              <li
                className="rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground"
                key={categoria.id}
              >
                {categoria.title}
              </li>
            ))}
          </ul>
        )}

        <h1 className="mb-6 text-[clamp(2rem,1.5rem+2vw,3rem)] leading-[1.1] font-bold tracking-[-0.02em]">
          {title}
        </h1>

        <dl className="flex flex-col gap-4 text-muted-foreground sm:flex-row sm:gap-12">
          {hasAuthors && (
            <div>
              <dt className="text-sm">Escrito por</dt>
              <dd className="font-semibold text-foreground">{formatAuthors(populatedAuthors)}</dd>
            </div>
          )}
          {publishedAt && (
            <div>
              <dt className="text-sm">Publicado el</dt>
              <dd className="font-semibold text-foreground">
                <time dateTime={publishedAt}>{formatDateTime(publishedAt)}</time>
              </dd>
            </div>
          )}
        </dl>
      </div>

      {heroImage && typeof heroImage === 'object' && (
        <div className="mx-auto max-w-[64rem] overflow-hidden rounded-2xl">
          <Media imgClassName="aspect-[16/8] w-full object-cover" priority resource={heroImage} />
        </div>
      )}
    </header>
  )
}
