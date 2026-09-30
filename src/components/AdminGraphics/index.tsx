import React from 'react'

import { MarcaConfluencia } from '@/components/Logo/MarcaConfluencia'
import { sitio } from '@/config/sitio'

/**
 * Identidad en el panel de administración (reemplaza el logo de Payload).
 * El panel no usa Tailwind, por eso los estilos van en línea.
 */
export const LogoAdmin: React.FC = () => (
  <span style={{ alignItems: 'center', display: 'inline-flex', gap: '0.75rem' }}>
    <MarcaConfluencia className="confluencia-logo-admin" />
    <span style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.01em' }}>{sitio.nombre}</span>
  </span>
)

export const IconoAdmin: React.FC = () => <MarcaConfluencia className="confluencia-icono-admin" />
