import { CalendarDays, CreditCard } from 'lucide-react'
import React from 'react'

import type { Especialidad, Profesional } from '@/payload-types'

import { Media } from '@/components/Media'
import { describirAtencion, etiquetaObraSocial } from '@/utilities/cartilla'
import { cn } from '@/utilities/ui'

export type ProfesionalCartilla = Pick<
  Profesional,
  'apellido' | 'atencion' | 'especialidades' | 'foto' | 'id' | 'matricula' | 'nombre' | 'nombreCompleto' | 'obrasSociales'
>

const iniciales = (p: ProfesionalCartilla) =>
  `${p.nombre?.charAt(0) ?? ''}${p.apellido?.charAt(0) ?? ''}`.toUpperCase()

/**
 * Ficha de un profesional en la cartilla: foto (o iniciales), especialidades,
 * matrícula, días de atención y obras sociales. `acciones` permite sumar
 * botones (por ejemplo, "Pedir turno") sin tocar este componente.
 */
export const TarjetaProfesional: React.FC<{
  acciones?: React.ReactNode
  className?: string
  profesional: ProfesionalCartilla
}> = ({ acciones, className, profesional }) => {
  const especialidades = (profesional.especialidades || []).filter(
    (e): e is Especialidad => typeof e === 'object' && e !== null,
  )
  const atencion = describirAtencion(profesional.atencion)
  const obrasSociales = profesional.obrasSociales || []

  return (
    <article className={cn('flex gap-4 rounded-2xl border border-border bg-background p-5', className)}>
      <div className="relative size-20 shrink-0 overflow-hidden rounded-full bg-secondary">
        {profesional.foto && typeof profesional.foto === 'object' ? (
          <Media fill imgClassName="object-cover" resource={profesional.foto} size="80px" />
        ) : (
          <span
            aria-hidden
            className="flex h-full items-center justify-center text-2xl font-bold text-secondary-foreground"
          >
            {iniciales(profesional)}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div>
          <h3 className="text-lg leading-snug font-bold">{profesional.nombreCompleto}</h3>
          <p className="text-sm text-muted-foreground">Matrícula {profesional.matricula}</p>
        </div>

        {especialidades.length > 0 && (
          <ul aria-label="Especialidades" className="flex flex-wrap gap-2">
            {especialidades.map((e) => (
              <li
                className="rounded-full bg-secondary px-2.5 py-0.5 text-sm font-semibold text-secondary-foreground"
                key={e.id}
              >
                {e.nombre}
              </li>
            ))}
          </ul>
        )}

        {atencion && (
          <p className="flex items-start gap-2 text-[0.95rem]">
            <CalendarDays aria-hidden className="mt-1 size-4 shrink-0 text-primary" />
            <span>{atencion}</span>
          </p>
        )}

        {obrasSociales.length > 0 && (
          <p className="flex items-start gap-2 text-[0.95rem] text-muted-foreground">
            <CreditCard aria-hidden className="mt-1 size-4 shrink-0 text-primary" />
            <span>
              <span className="sr-only">Obras sociales: </span>
              {obrasSociales.map(etiquetaObraSocial).join(', ')}
            </span>
          </p>
        )}

        {acciones && <div className="mt-1">{acciones}</div>}
      </div>
    </article>
  )
}
