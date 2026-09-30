import { BadgeCheck, Info } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import type { Especialidad, Profesional } from '@/payload-types'

/**
 * Recuadro "Contenido revisado por…": vincula la nota con un profesional de
 * la cartilla (relación entre colecciones) para dar respaldo al contenido.
 */
export const RevisionProfesional: React.FC<{ profesional: Profesional }> = ({ profesional }) => {
  const especialidades = (profesional.especialidades || [])
    .filter((e): e is Especialidad => typeof e === 'object' && e !== null)
    .map((e) => e.nombre)
    .join(' y ')

  return (
    <aside className="flex gap-4 rounded-2xl border border-border bg-card p-5">
      <BadgeCheck aria-hidden className="mt-0.5 size-6 shrink-0 text-primary" />
      <div>
        <p className="font-semibold">
          Contenido revisado por {profesional.nombreCompleto}
          {especialidades && `, ${especialidades.toLowerCase()}`}
        </p>
        <p className="text-muted-foreground">
          Matrícula {profesional.matricula}.{' '}
          <Link
            className="font-semibold text-primary underline-offset-4 hover:underline"
            href={`/profesionales?q=${encodeURIComponent(profesional.apellido)}`}
          >
            Ver en la cartilla
          </Link>
        </p>
      </div>
    </aside>
  )
}

/** Aviso al pie de cada nota: la información es general y no reemplaza la consulta. */
export const AvisoMedico: React.FC = () => (
  <p className="flex gap-3 border-t border-border pt-6 text-[0.95rem] text-muted-foreground">
    <Info aria-hidden className="mt-1 size-5 shrink-0" />
    <span>
      Esta información es general y no reemplaza la consulta con un profesional de la salud. Ante una
      urgencia, llamá al 107 o acercate a la guardia.
    </span>
  </p>
)
