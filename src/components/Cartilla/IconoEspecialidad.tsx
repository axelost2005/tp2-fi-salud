import {
  Apple,
  Baby,
  Bone,
  Brain,
  Ear,
  Eye,
  Hand,
  HeartPulse,
  type LucideIcon,
  Microscope,
  PersonStanding,
  Smile,
  Stethoscope,
  Syringe,
  Venus,
} from 'lucide-react'
import React from 'react'

import { cn } from '@/utilities/ui'

const iconos: Record<string, LucideIcon> = {
  bebe: Baby,
  cerebro: Brain,
  corazon: HeartPulse,
  estetoscopio: Stethoscope,
  hueso: Bone,
  jeringa: Syringe,
  mano: Hand,
  manzana: Apple,
  microscopio: Microscope,
  oido: Ear,
  ojo: Eye,
  persona: PersonStanding,
  sonrisa: Smile,
  venus: Venus,
}

/** Ícono de una especialidad dentro de un círculo con el color de marca. */
export const IconoEspecialidad: React.FC<{ className?: string; icono?: string | null; tamano?: 'md' | 'lg' }> = ({
  className,
  icono,
  tamano = 'md',
}) => {
  const Icono = iconos[icono || ''] ?? Stethoscope

  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-secondary text-primary',
        tamano === 'lg' ? 'size-16' : 'size-12',
        className,
      )}
    >
      <Icono className={tamano === 'lg' ? 'size-8' : 'size-6'} strokeWidth={1.8} />
    </span>
  )
}
