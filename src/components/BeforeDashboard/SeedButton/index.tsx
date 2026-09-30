'use client'

import React, { Fragment, useCallback, useState } from 'react'
import { toast } from '@payloadcms/ui'

import './index.scss'

const SuccessMessage: React.FC = () => (
  <div>
    ¡Datos de ejemplo cargados! Ya podés{' '}
    <a target="_blank" href="/">
      ver el sitio
    </a>
  </div>
)

export const SeedButton: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [seeded, setSeeded] = useState(false)
  const [error, setError] = useState<null | string>(null)

  const handleClick = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()

      if (seeded) {
        toast.info('Los datos de ejemplo ya se cargaron.')
        return
      }
      if (loading) {
        toast.info('La carga ya está en curso.')
        return
      }
      if (error) {
        toast.error('Hubo un error. Recargá la página y probá de nuevo.')
        return
      }

      setLoading(true)

      try {
        toast.promise(
          new Promise((resolve, reject) => {
            try {
              fetch('/next/seed', { method: 'POST', credentials: 'include' })
                .then((res) => {
                  if (res.ok) {
                    resolve(true)
                    setSeeded(true)
                  } else {
                    reject('No se pudieron cargar los datos de ejemplo.')
                  }
                })
                .catch((error) => {
                  reject(error)
                })
            } catch (error) {
              reject(error)
            }
          }),
          {
            loading: 'Cargando datos de ejemplo…',
            success: <SuccessMessage />,
            error: 'No se pudieron cargar los datos de ejemplo.',
          },
        )
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err)
        setError(error)
      }
    },
    [loading, seeded, error],
  )

  let message = ''
  if (loading) message = ' (cargando…)'
  if (seeded) message = ' (¡listo!)'
  if (error) message = ` (error: ${error})`

  return (
    <Fragment>
      <button className="seedButton" onClick={handleClick}>
        Cargar datos de ejemplo
      </button>
      {message}
    </Fragment>
  )
}
