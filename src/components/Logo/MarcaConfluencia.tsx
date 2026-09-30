import React from 'react'

/**
 * Isotipo: los ríos Limay (turquesa) y Neuquén (arena) se unen y corren
 * un tramo lado a lado, como pasa en la confluencia real, antes de formar
 * un solo cauce.
 */
export const MarcaConfluencia: React.FC<{ className?: string; title?: string }> = ({
  className,
  title,
}) => (
  <svg
    aria-hidden={title ? undefined : true}
    className={className}
    fill="none"
    role={title ? 'img' : undefined}
    viewBox="0 0 40 40"
    xmlns="http://www.w3.org/2000/svg"
  >
    {title && <title>{title}</title>}
    <path
      d="M4 10.5C12 10.5 15 17.5 22.5 18.5H36"
      stroke="var(--barda, #c98f45)"
      strokeLinecap="round"
      strokeWidth="3.6"
    />
    <path
      d="M4 29.5C12 29.5 15 22.5 22.5 21.6H36"
      stroke="var(--rio, #0d6b62)"
      strokeLinecap="round"
      strokeWidth="3.6"
    />
  </svg>
)
