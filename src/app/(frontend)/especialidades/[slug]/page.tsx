import type { Metadata } from 'next'

import configPromise from '@payload-config'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import React, { cache } from 'react'

import { IconoEspecialidad } from '@/components/Cartilla/IconoEspecialidad'
import { TarjetaProfesional } from '@/components/Cartilla/TarjetaProfesional'
import RichText from '@/components/RichText'
import { sitio } from '@/config/sitio'

export const revalidate = 600

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const especialidades = await payload.find({
    collection: 'especialidades',
    depth: 0,
    limit: 100,
    overrideAccess: false,
    pagination: false,
    select: { slug: true },
  })

  return especialidades.docs.map(({ slug }) => ({ slug }))
}

type Args = {
  params: Promise<{ slug?: string }>
}

const buscarEspecialidad = cache(async (slug: string) => {
  const payload = await getPayload({ config: configPromise })
  const resultado = await payload.find({
    collection: 'especialidades',
    depth: 0,
    limit: 1,
    overrideAccess: false,
    pagination: false,
    where: { slug: { equals: slug } },
  })
  return resultado.docs[0] ?? null
})

export default async function PaginaEspecialidad({ params }: Args) {
  const { slug = '' } = await params
  const especialidad = await buscarEspecialidad(decodeURIComponent(slug))

  if (!especialidad) notFound()

  const payload = await getPayload({ config: configPromise })
  const profesionales = await payload.find({
    collection: 'profesionales',
    depth: 1,
    limit: 100,
    overrideAccess: false,
    pagination: false,
    sort: 'apellido',
    where: { especialidades: { in: [especialidad.id] } },
  })

  return (
    <div className="pb-24">
      <header className="container pt-8 pb-10 md:pt-12">
        <nav aria-label="Ruta de navegación" className="mb-6 text-sm text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link className="underline-offset-4 hover:text-primary hover:underline" href="/especialidades">
                Especialidades
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="font-semibold text-foreground">
              {especialidad.nombre}
            </li>
          </ol>
        </nav>
        <div className="flex max-w-[46rem] items-start gap-5">
          <IconoEspecialidad icono={especialidad.icono} tamano="lg" />
          <div>
            <h1 className="text-[clamp(2.1rem,1.6rem+2vw,3.1rem)] leading-[1.1] font-bold tracking-[-0.02em]">
              {especialidad.nombre}
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">{especialidad.resumen}</p>
          </div>
        </div>
      </header>

      {especialidad.descripcion && (
        <div className="container mb-14">
          <RichText className="mx-0" data={especialidad.descripcion} enableGutter={false} />
        </div>
      )}

      <section aria-labelledby="titulo-profesionales" className="container">
        <h2 className="mb-6 text-2xl font-bold" id="titulo-profesionales">
          Profesionales de {especialidad.nombre.toLowerCase()}
        </h2>
        {profesionales.docs.length === 0 ? (
          <p className="text-muted-foreground">
            Por ahora no hay profesionales cargados en esta especialidad.
          </p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {profesionales.docs.map((p) => (
              <TarjetaProfesional key={p.id} profesional={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug = '' } = await params
  const especialidad = await buscarEspecialidad(decodeURIComponent(slug))

  return {
    description: especialidad?.resumen,
    title: especialidad ? `${especialidad.nombre} | ${sitio.nombre}` : sitio.nombre,
  }
}
