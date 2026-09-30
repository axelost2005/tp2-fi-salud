import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import { IconoEspecialidad } from '@/components/Cartilla/IconoEspecialidad'
import { EncabezadoSeccion } from '@/components/EncabezadoSeccion'
import { sitio } from '@/config/sitio'

export const revalidate = 600

export default async function PaginaEspecialidades() {
  const payload = await getPayload({ config: configPromise })

  const [especialidades, profesionales] = await Promise.all([
    payload.find({
      collection: 'especialidades',
      depth: 0,
      limit: 100,
      overrideAccess: false,
      pagination: false,
      sort: 'orden',
    }),
    // Solo para contar cuántos profesionales activos tiene cada especialidad
    payload.find({
      collection: 'profesionales',
      depth: 0,
      limit: 500,
      overrideAccess: false,
      pagination: false,
      select: { especialidades: true },
    }),
  ])

  const cantidadPorEspecialidad = new Map<number, number>()
  for (const p of profesionales.docs) {
    for (const e of p.especialidades || []) {
      const id = typeof e === 'object' ? e.id : e
      cantidadPorEspecialidad.set(id, (cantidadPorEspecialidad.get(id) ?? 0) + 1)
    }
  }

  return (
    <div className="pb-24">
      <EncabezadoSeccion
        descripcion="Elegí un área para conocer a sus profesionales y los días de atención."
        titulo="Especialidades"
      />

      <div className="container">
        {especialidades.docs.length === 0 ? (
          <p className="text-muted-foreground">Todavía no hay especialidades cargadas.</p>
        ) : (
          <ul className="grid overflow-hidden rounded-2xl border border-border sm:grid-cols-2 lg:grid-cols-3">
            {especialidades.docs.map((e) => {
              const cantidad = cantidadPorEspecialidad.get(e.id) ?? 0
              return (
                <li className="-mr-px -mb-px border-r border-b border-border" key={e.id}>
                  <Link
                    className="group flex h-full items-start gap-4 p-6 transition-colors hover:bg-secondary/60"
                    href={`/especialidades/${e.slug}`}
                  >
                    <IconoEspecialidad icono={e.icono} />
                    <span className="flex flex-1 flex-col gap-1">
                      <span className="flex items-center justify-between gap-2 text-lg font-bold group-hover:text-primary">
                        {e.nombre}
                        <ChevronRight aria-hidden className="size-5 text-muted-foreground" />
                      </span>
                      <span className="text-muted-foreground">{e.resumen}</span>
                      <span className="mt-1 text-sm font-semibold text-primary">
                        {cantidad === 1 ? '1 profesional' : `${cantidad} profesionales`}
                      </span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    description: 'Especialidades médicas y áreas de atención disponibles.',
    title: `Especialidades | ${sitio.nombre}`,
  }
}
