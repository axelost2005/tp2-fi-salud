import React from 'react'

import { sitio } from '@/config/sitio'

const BeforeLogin: React.FC = () => {
  return (
    <div>
      <p>
        <b>Panel de gestión de {sitio.nombre}.</b>
        {' Ingresá con tu usuario del personal para administrar contenidos, la cartilla y los turnos.'}
      </p>
    </div>
  )
}

export default BeforeLogin
