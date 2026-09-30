import React from 'react'

import { cn } from '@/utilities/ui'

/** Encabezado común de las páginas de sección (especialidades, cartilla, novedades, turnos). */
export const EncabezadoSeccion: React.FC<{
  children?: React.ReactNode
  className?: string
  descripcion?: string
  titulo: string
}> = ({ children, className, descripcion, titulo }) => (
  <header className={cn('container pt-10 pb-10 md:pt-14', className)}>
    <div className="max-w-[46rem]">
      <h1 className="text-[clamp(2.1rem,1.6rem+2vw,3.1rem)] leading-[1.1] font-bold tracking-[-0.02em]">
        {titulo}
      </h1>
      {descripcion && <p className="mt-4 text-lg text-muted-foreground">{descripcion}</p>}
      {children}
    </div>
  </header>
)
