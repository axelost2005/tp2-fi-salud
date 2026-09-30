import type { CollectionBeforeChangeHook, FieldHook } from 'payload'

import { ValidationError } from 'payload'

import type { Turno } from '@/payload-types'

import {
  aFechaCorta,
  aFechaGuardada,
  atiendeEseDia,
  fechaLegible,
  fechaLocal,
  generarCodigoTurno,
  generarHorarios,
  horaLocal,
} from '@/utilities/turnos'

type Relacion = number | { id: number } | null | undefined
const idDe = (valor: Relacion) => (typeof valor === 'object' && valor !== null ? valor.id : valor)

/** Guarda la fecha siempre al mediodía UTC del día elegido (evita corrimientos por huso horario). */
export const normalizarFecha: FieldHook = ({ value }) =>
  value ? aFechaGuardada(value as string) : value

/** Código que recibe el paciente, se genera una sola vez al crear el turno. */
export const asignarCodigo: FieldHook = ({ operation, value }) =>
  operation === 'create' || !value ? generarCodigoTurno() : value

/** Texto que identifica el turno en el panel: "05/10 08:20 — Pérez, Juan". */
export const armarResumen: FieldHook = ({ data, originalDoc }) => {
  const t = { ...originalDoc, ...data } as Partial<Turno>
  const fecha = t.fecha ? aFechaCorta(t.fecha) : ''
  const [, mes, dia] = fecha.split('-')
  const paciente = [t.paciente?.apellido, t.paciente?.nombre].filter(Boolean).join(', ')
  return `${dia}/${mes} ${t.hora ?? ''} — ${paciente}`.trim()
}

/**
 * Reglas de negocio del turno. Corre en el servidor antes de guardar, venga
 * el turno del formulario público o del panel de administración:
 * 1. El profesional existe, está activo y tiene esa especialidad.
 * 2. Atiende ese día de la semana y el horario es parte de su agenda.
 * 3. La fecha no pasó y está dentro de la ventana permitida.
 * 4. No hay otro turno vigente en el mismo horario (sin doble reserva).
 */
export const validarTurno: CollectionBeforeChangeHook<Turno> = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  const turno = { ...originalDoc, ...data } as Partial<Turno>
  if (turno.estado === 'cancelado') return data

  const cambioLaAgenda =
    operation === 'create' ||
    (idDe(data.profesional) !== undefined && idDe(data.profesional) !== idDe(originalDoc?.profesional)) ||
    (data.fecha !== undefined && aFechaCorta(data.fecha) !== aFechaCorta(originalDoc?.fecha ?? '')) ||
    (data.hora !== undefined && data.hora !== originalDoc?.hora) ||
    // reactivar un turno cancelado vuelve a ocupar el horario
    (originalDoc?.estado === 'cancelado' && data.estado !== undefined)

  if (!cambioLaAgenda) return data

  const errores: { message: string; path: string }[] = []
  const profesionalId = idDe(turno.profesional)
  const especialidadId = idDe(turno.especialidad)
  const fecha = turno.fecha ? aFechaCorta(turno.fecha) : ''
  const hora = turno.hora ?? ''

  const profesional = profesionalId
    ? await req.payload.findByID({
        collection: 'profesionales',
        depth: 0,
        disableErrors: true,
        id: profesionalId,
        req,
      })
    : null

  if (!profesional || profesional.activo === false) {
    errores.push({ message: 'El profesional elegido no está disponible.', path: 'profesional' })
  } else {
    const especialidades = (profesional.especialidades || []).map((e) => idDe(e as Relacion))
    if (especialidadId && !especialidades.includes(especialidadId)) {
      errores.push({ message: 'Ese profesional no atiende la especialidad elegida.', path: 'profesional' })
    }
    if (!atiendeEseDia(profesional.atencion, fecha)) {
      errores.push({
        message: `${profesional.nombreCompleto} no atiende el ${fechaLegible(fecha)}.`,
        path: 'fecha',
      })
    } else if (!generarHorarios(profesional.atencion).includes(hora)) {
      errores.push({
        message: `El horario ${hora} no es parte de la agenda. Horarios posibles: ${generarHorarios(profesional.atencion).join(', ')}.`,
        path: 'hora',
      })
    }
  }

  const hoy = fechaLocal()
  if (!req.context.permitirFechaPasada) {
    if (fecha < hoy || (fecha === hoy && hora <= horaLocal())) {
      errores.push({ message: 'La fecha y hora elegidas ya pasaron.', path: 'fecha' })
    }
  }

  if (errores.length === 0 && profesionalId) {
    const superpuestos = await req.payload.count({
      collection: 'turnos',
      overrideAccess: true,
      req,
      where: {
        and: [
          { profesional: { equals: profesionalId } },
          { fecha: { equals: aFechaGuardada(fecha) } },
          { hora: { equals: hora } },
          { estado: { not_equals: 'cancelado' } },
          ...(originalDoc?.id ? [{ id: { not_equals: originalDoc.id } }] : []),
        ],
      },
    })
    if (superpuestos.totalDocs > 0) {
      errores.push({ message: 'Ese horario ya está reservado. Elegí otro.', path: 'hora' })
    }
  }

  if (errores.length > 0) {
    throw new ValidationError({ collection: 'turnos', errors: errores, req })
  }

  return data
}
