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
import { notFound } from 'next/navigation'

export const revalidate = 600

const POR_PAGINA = 12

type Args = {
  params: Promise<{
    pageNumber: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { pageNumber } = await paramsPromise
  const payload = await getPayload({ config: configPromise })

  const sanitizedPageNumber = Number(pageNumber)

  if (!Number.isInteger(sanitizedPageNumber)) notFound()

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: POR_PAGINA,
    page: sanitizedPageNumber,
    overrideAccess: false,
    sort: '-publishedAt',
  })

  return (
    <div className="pb-24">
      <PageClient />
      <EncabezadoSeccion titulo={`Novedades de salud, página ${sanitizedPageNumber}`} />

      <div className="container mb-8 text-muted-foreground">
        <PageRange
          collection="posts"
          currentPage={posts.page}
          limit={POR_PAGINA}
          totalDocs={posts.totalDocs}
        />
      </div>

      <CollectionArchive posts={posts.docs} />

      <div className="container">
        {posts?.page && posts?.totalPages > 1 && (
          <Pagination page={posts.page} totalPages={posts.totalPages} />
        )}
      </div>
    </div>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { pageNumber } = await paramsPromise
  return {
    title: `Novedades, página ${pageNumber || ''} | ${sitio.nombre}`,
  }
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const { totalDocs } = await payload.count({
    collection: 'posts',
    overrideAccess: false,
  })

  // El template calculaba las páginas con 10 por página aunque mostraba 12
  const totalPages = Math.ceil(totalDocs / POR_PAGINA)

  const pages: { pageNumber: string }[] = []

  for (let i = 1; i <= totalPages; i++) {
    pages.push({ pageNumber: String(i) })
  }

  return pages
}
