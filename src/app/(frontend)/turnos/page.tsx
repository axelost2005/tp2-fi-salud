import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { TriangleAlert } from 'lucide-react'
import { getPayload } from 'payload'
import React from 'react'

import { EncabezadoSeccion } from '@/components/EncabezadoSeccion'
import { sitio } from '@/config/sitio'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { telHref } from '@/utilities/telefono'

import { FormularioTurno, type EspecialidadOpcion, type ProfesionalOpcion } from './FormularioTurno'

type Args = {
  searchParams: Promise<{ especialidad?: string; profesional?: string }>
}

/**
 * Página nueva: pedir un turno online. El servidor arma las listas de
 * especialidades y profesionales (solo activos) y se las pasa al formulario,
 * que corre en el navegador. Acepta ?especialidad=slug&profesional=id para
 * llegar con la elección hecha desde la cartilla.
 */
export default async function PaginaTurnos({ searchParams }: Args) {
  const { especialidad, profesional } = await searchParams
  const payload = await getPayload({ config: configPromise })

  const [especialidades, profesionales, institucion] = await Promise.all([
    payload.find({
      collection: 'especialidades',
      depth: 0,
      limit: 100,
      overrideAccess: false,
      pagination: false,
      select: { nombre: true, slug: true },
      sort: 'nombre',
    }),
    payload.find({
      collection: 'profesionales',
      depth: 0,
      limit: 200,
      overrideAccess: false,
      pagination: false,
      select: { atencion: true, especialidades: true, matricula: true, nombreCompleto: true, obrasSociales: true },
      sort: 'apellido',
    }),
    getCachedGlobal('institucion', 0)(),
  ])

  const opcionesEspecialidad: EspecialidadOpcion[] = especialidades.docs.map((e) => ({
    id: e.id,
    nombre: e.nombre,
    slug: e.slug ?? '',
  }))

  const opcionesProfesional: ProfesionalOpcion[] = profesionales.docs.map((p) => ({
    atencion: {
      dias: p.atencion?.dias ?? [],
      duracionTurno: p.atencion?.duracionTurno ?? 20,
      horaFin: p.atencion?.horaFin ?? '',
      horaInicio: p.atencion?.horaInicio ?? '',
    },
    especialidades: (p.especialidades || []).map((e) => (typeof e === 'object' ? e.id : e)),
    id: p.id,
    matricula: p.matricula,
    nombreCompleto: p.nombreCompleto ?? '',
    obrasSociales: p.obrasSociales ?? [],
  }))

  const especialidadInicial = opcionesEspecialidad.find((e) => e.slug === especialidad)?.id ?? null
  const profesionalInicial =
    opcionesProfesional.find(
      (p) =>
        String(p.id) === profesional &&
        (!especialidadInicial || p.especialidades.includes(especialidadInicial)),
    )?.id ?? null

  return (
    <div className="pb-24">
      <EncabezadoSeccion
        descripcion="Elegí la especialidad, el profesional y el horario. Recepción confirma cada pedido por email o teléfono."
        titulo="Pedir un turno"
      />

      <div className="container grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <FormularioTurno
          especialidadInicial={especialidadInicial}
          especialidades={opcionesEspecialidad}
          profesionalInicial={profesionalInicial}
          profesionales={opcionesProfesional}
        />

        <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
          {institucion?.avisoUrgencias && (
            <div className="flex gap-3 rounded-2xl border border-urgencia/40 bg-error/40 p-5" role="note">
              <TriangleAlert aria-hidden className="mt-1 size-5 shrink-0 text-urgencia" />
              <div>
                <p className="font-bold">No es un canal de urgencias</p>
                <p className="mt-1">{institucion.avisoUrgencias}</p>
                {institucion.telefonoGuardia && (
                  <a
                    className="mt-2 inline-block font-bold text-urgencia underline underline-offset-4"
                    href={telHref(institucion.telefonoGuardia)}
                  >
                    Guardia: {institucion.telefonoGuardia}
                  </a>
                )}
              </div>
            </div>
          )}
          {institucion?.telefonoTurnos && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="font-bold">¿Preferís hablar con alguien?</p>
              <p className="mt-1 text-muted-foreground">También podés pedir tu turno por teléfono.</p>
              <a
                className="mt-2 inline-block font-bold text-primary underline-offset-4 hover:underline"
                href={telHref(institucion.telefonoTurnos)}
              >
                {institucion.telefonoTurnos}
              </a>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    description: 'Pedí un turno online con los profesionales de la cartilla.',
    title: `Pedir un turno | ${sitio.nombre}`,
  }
}
