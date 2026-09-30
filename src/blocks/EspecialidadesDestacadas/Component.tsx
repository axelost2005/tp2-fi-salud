import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import type { EspecialidadesDestacadasBlock as Props } from '@/payload-types'

import { IconoEspecialidad } from '@/components/Cartilla/IconoEspecialidad'
import { Button } from '@/components/ui/button'

export const EspecialidadesDestacadasBlock: React.FC<Props & { id?: string }> = async ({
  cantidad,
  introduccion,
  titulo,
}) => {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'especialidades',
    depth: 0,
    limit: cantidad || 6,
    overrideAccess: false,
    sort: 'orden',
    where: { destacada: { equals: true } },
  })

  if (docs.length === 0) return null

  return (
    <section aria-labelledby="titulo-especialidades-destacadas" className="container">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-[40rem]">
          <h2
            className="text-[clamp(1.75rem,1.4rem+1.4vw,2.4rem)] leading-tight font-bold tracking-[-0.015em]"
            id="titulo-especialidades-destacadas"
          >
            {titulo}
          </h2>
          {introduccion && <p className="mt-3 text-lg text-muted-foreground">{introduccion}</p>}
        </div>
        <Button asChild variant="outline">
          <Link href="/especialidades">Ver todas las especialidades</Link>
        </Button>
      </div>

      <ul className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {docs.map((e) => (
          <li key={e.id}>
            <Link className="group flex items-start gap-4" href={`/especialidades/${e.slug}`}>
              <IconoEspecialidad icono={e.icono} />
              <span>
                <span className="block text-lg font-bold group-hover:text-primary group-hover:underline group-hover:underline-offset-4">
                  {e.nombre}
                </span>
                <span className="mt-1 block text-muted-foreground">{e.resumen}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
