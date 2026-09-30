import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { EncabezadoSeccion } from '@/components/EncabezadoSeccion'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import { sitio } from '@/config/sitio'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function Page() {
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 12,
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
      tiempoLectura: true,
    },
    sort: '-publishedAt',
  })

  return (
    <div className="pb-24">
      <PageClient />
      <EncabezadoSeccion
        descripcion="Consejos de prevención y cuidado de la salud, revisados por profesionales de nuestra cartilla."
        titulo="Novedades de salud"
      />

      <div className="container mb-8 text-muted-foreground">
        <PageRange
          collection="posts"
          currentPage={posts.page}
          limit={12}
          totalDocs={posts.totalDocs}
        />
      </div>

      <CollectionArchive posts={posts.docs} />

      <div className="container">
        {posts.totalPages > 1 && posts.page && (
          <Pagination page={posts.page} totalPages={posts.totalPages} />
        )}
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    description: 'Consejos de prevención y cuidado de la salud revisados por profesionales.',
    title: `Novedades de salud | ${sitio.nombre}`,
  }
}
