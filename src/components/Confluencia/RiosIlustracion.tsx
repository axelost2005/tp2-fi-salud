import React from 'react'

/**
 * Ilustración del hero: la confluencia de los ríos Limay (turquesa) y
 * Neuquén (arena) sobre curvas de nivel que evocan las bardas.
 * Los dos cauces corren un tramo lado a lado y recién después se mezclan
 * (degradé), igual que en la confluencia real. Es el único elemento
 * animado del sitio y respeta prefers-reduced-motion (ver globals.css).
 */
export const RiosIlustracion: React.FC<{ className?: string }> = ({ className }) => (
  <figure className={className}>
    <svg
      aria-label="Ilustración de los ríos Limay y Neuquén uniéndose en la confluencia"
      className="h-auto w-full"
      role="img"
      viewBox="0 0 560 440"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient gradientUnits="userSpaceOnUse" id="rio-mezcla" x1="0" x2="560" y1="0" y2="0">
          <stop offset="0.58" style={{ stopColor: 'var(--barda)' }} />
          <stop offset="1" style={{ stopColor: 'var(--rio)' }} />
        </linearGradient>
      </defs>

      {/* Curvas de nivel (bardas) */}
      <g fill="none" stroke="var(--border)" strokeWidth="1.5">
        <path d="M-10 34C120 12 300 58 580 26" />
        <path d="M-10 118C90 104 170 128 250 150" />
        <path d="M330 132C420 118 500 112 580 96" />
        <path d="M-10 318C80 334 150 312 230 296" />
        <path d="M320 318C420 338 500 350 580 344" />
        <path d="M-10 410C150 430 360 396 580 420" />
      </g>

      {/* Río Neuquén (arena) y río Limay (turquesa) */}
      <g fill="none" strokeLinecap="round" strokeWidth="32">
        <path
          className="rio-trazo rio-trazo--neuquen"
          d="M-24 70C116 70 166 190 292 206L600 214"
          pathLength={1}
          stroke="url(#rio-mezcla)"
        />
        <path
          className="rio-trazo rio-trazo--limay"
          d="M-24 390C116 390 166 262 292 238L600 246"
          pathLength={1}
          stroke="var(--rio)"
        />
      </g>
    </svg>
    <figcaption className="mt-3 text-sm text-muted-foreground">
      Los ríos Limay y Neuquén corren juntos antes de mezclarse: de ahí nuestro nombre.
    </figcaption>
  </figure>
)
