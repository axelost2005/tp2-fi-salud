import type { Payload, TypedUser } from 'payload'

import Link from 'next/link'
import React from 'react'

import type { Turno } from '@/payload-types'

import { tieneRol } from '@/access/roles'
import { aFechaGuardada, ESTADOS_TURNO, fechaLegible, fechaLocal } from '@/utilities/turnos'

import './index.scss'

const baseClass = 'turnos-de-hoy'

const etiquetaEstado = (valor?: string | null) =>
  ESTADOS_TURNO.find((e) => e.value === valor)?.label ?? valor ?? ''

/**
 * Tablero nuevo en el inicio del panel: turnos del día y pedidos pendientes.
 * Es un componente de servidor de Payload: recibe `payload` y `user`, y
 * consulta con overrideAccess: false para respetar los permisos (un
 * profesional ve solo su agenda).
 */
const TurnosDeHoy = async ({ payload, user }: { payload: Payload; user?: TypedUser | null }) => {
  if (!user || !tieneRol(user as never, 'admin', 'recepcion', 'profesional')) return null

  const hoy = fechaLocal()
  const [deHoy, pendientes] = await Promise.all([
    payload.find({
      collection: 'turnos',
      depth: 1,
      limit: 12,
      overrideAccess: false,
      sort: 'hora',
      user,
      where: {
        and: [{ fecha: { equals: aFechaGuardada(hoy) } }, { estado: { not_equals: 'cancelado' } }],
      },
    }),
    payload.count({
      collection: 'turnos',
      overrideAccess: false,
      user,
      where: { estado: { equals: 'pendiente' } },
    }),
  ])

  return (
    <section className={baseClass}>
      <div className={`${baseClass}__encabezado`}>
        <h2>Turnos de hoy</h2>
        <span className={`${baseClass}__fecha`}>{fechaLegible(hoy)}</span>
      </div>

      <div className={`${baseClass}__indicadores`}>
        <Link href="/admin/collections/turnos?where[estado][equals]=pendiente">
          <strong>{pendientes.totalDocs}</strong>{' '}
          {pendientes.totalDocs === 1 ? 'pendiente de confirmar' : 'pendientes de confirmar'}
        </Link>
        <Link href="/admin/collections/turnos">
          <strong>{deHoy.totalDocs}</strong> {deHoy.totalDocs === 1 ? 'turno para hoy' : 'turnos para hoy'}
        </Link>
      </div>

      {deHoy.docs.length === 0 ? (
        <p>No hay turnos para hoy.</p>
      ) : (
        <table className={`${baseClass}__tabla`}>
          <thead>
            <tr>
              <th scope="col">Hora</th>
              <th scope="col">Paciente</th>
              <th scope="col">Profesional</th>
              <th scope="col">Estado</th>
            </tr>
          </thead>
          <tbody>
            {deHoy.docs.map((t: Turno) => (
              <tr key={t.id}>
                <td>{t.hora}</td>
                <td>
                  <Link href={`/admin/collections/turnos/${t.id}`}>
                    {t.paciente?.apellido}, {t.paciente?.nombre}
                  </Link>
                </td>
                <td>{typeof t.profesional === 'object' ? t.profesional.nombreCompleto : ''}</td>
                <td>
                  <span className={`${baseClass}__estado ${baseClass}__estado--${t.estado}`}>
                    {etiquetaEstado(t.estado)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

export default TurnosDeHoy
