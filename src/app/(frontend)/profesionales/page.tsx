import type { Metadata } from 'next'
import type { Where } from 'payload'

import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import { TarjetaProfesional } from '@/components/Cartilla/TarjetaProfesional'
import { EncabezadoSeccion } from '@/components/EncabezadoSeccion'
import { Button } from '@/components/ui/button'
import { sitio } from '@/config/sitio'
import { OBRAS_SOCIALES } from '@/utilities/cartilla'

type Args = {
  searchParams: Promise<{ especialidad?: string; obra?: string; q?: string }>
}

const claseCampo =
  'h-11 w-full rounded-lg border border-input bg-background px-3 text-base font-normal text-foreground'

/**
 * Cartilla de profesionales con filtros. El formulario usa GET y se resuelve
 * en el servidor: funciona aunque el navegador tenga JavaScript desactivado
 * y cada búsqueda queda en la URL (se puede compartir o guardar).
 */
export default async function PaginaProfesionales({ searchParams }: Args) {
  const { especialidad = '', obra = '', q = '' } = await searchParams
  const texto = q.trim().slice(0, 60)
  const payload = await getPayload({ config: configPromise })

  const especialidades = await payload.find({
    collection: 'especialidades',
    depth: 0,
    limit: 100,
    overrideAccess: false,
    pagination: false,
    select: { nombre: true, slug: true },
    sort: 'nombre',
  })

  const condiciones: Where[] = []
  const especialidadElegida = especialidades.docs.find((e) => e.slug === especialidad)
  if (especialidadElegida) condiciones.push({ especialidades: { in: [especialidadElegida.id] } })
  if (OBRAS_SOCIALES.some((o) => o.value === obra)) condiciones.push({ obrasSociales: { in: [obra] } })
  if (texto) {
    condiciones.push({
      or: [{ nombre: { like: texto } }, { apellido: { like: texto } }, { matricula: { like: texto } }],
    })
  }

  // overrideAccess: false aplica las reglas de acceso públicas (solo profesionales activos)
  const profesionales = await payload.find({
    collection: 'profesionales',
    depth: 1,
    limit: 100,
    overrideAccess: false,
    pagination: false,
    sort: 'apellido',
    ...(condiciones.length ? { where: { and: condiciones } } : {}),
  })

  const hayFiltros = Boolean(especialidadElegida || obra || texto)
  const total = profesionales.docs.length

  return (
    <div className="pb-24">
      <EncabezadoSeccion
        descripcion="Buscá por especialidad, obra social o nombre. Todos los datos de atención están actualizados por la institución."
        titulo="Cartilla de profesionales"
      />

      <div className="container">
        <form
          action="/profesionales"
          aria-label="Filtrar la cartilla"
          className="mb-8 grid gap-4 rounded-2xl border border-border bg-card p-5 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end"
          method="get"
        >
          <label className="flex flex-col gap-1.5 font-semibold">
            Especialidad
            <select className={claseCampo} defaultValue={especialidadElegida?.slug ?? ''} name="especialidad">
              <option value="">Todas</option>
              {especialidades.docs.map((e) => (
                <option key={e.id} value={e.slug ?? ''}>
                  {e.nombre}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 font-semibold">
            Obra social
            <select className={claseCampo} defaultValue={obra} name="obra">
              <option value="">Todas</option>
              {OBRAS_SOCIALES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 font-semibold">
            Nombre o matrícula
            <input
              className={claseCampo}
              defaultValue={texto}
              name="q"
              placeholder="Ej.: Pérez o MP 4521"
              type="search"
            />
          </label>
          <Button type="submit">Buscar</Button>
        </form>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3" role="status">
          <p className="font-semibold">
            {total === 0
              ? 'No encontramos profesionales con esos filtros.'
              : total === 1
                ? 'Encontramos 1 profesional'
                : `Encontramos ${total} profesionales`}
          </p>
          {hayFiltros && (
            <Link className="font-semibold text-primary underline-offset-4 hover:underline" href="/profesionales">
              Limpiar filtros
            </Link>
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {profesionales.docs.map((p) => (
            <TarjetaProfesional key={p.id} profesional={p} />
          ))}
        </div>
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    description: 'Cartilla de profesionales con especialidades, días de atención y obras sociales.',
    title: `Cartilla de profesionales | ${sitio.nombre}`,
  }
}
