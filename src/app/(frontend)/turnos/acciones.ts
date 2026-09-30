'use server'

import configPromise from '@payload-config'
import { getPayload, ValidationError } from 'payload'
import { z } from 'zod'

import { OBRAS_SOCIALES } from '@/utilities/cartilla'
import {
  aFechaGuardada,
  DIAS_DE_ANTICIPACION,
  fechaLegible,
  fechaLocal,
  horariosLibres,
  sumarDias,
} from '@/utilities/turnos'

/*
 * Server Actions del formulario de turnos (Next.js).
 * Aunque se llaman como funciones desde el formulario, son endpoints HTTP
 * públicos: por eso TODO lo que llega se vuelve a validar acá (zod) y en el
 * hook de la colección (reglas de agenda), sin confiar en el navegador.
 */

const esFecha = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { error: 'Elegí una fecha.' })

/** Horarios libres de un profesional para un día. */
export async function consultarHorarios(
  profesionalId: number,
  fecha: string,
): Promise<{ error?: string; horarios: string[] }> {
  const datos = z
    .object({ fecha: esFecha, profesionalId: z.number().int().positive() })
    .safeParse({ fecha, profesionalId })
  if (!datos.success) return { error: 'Datos inválidos.', horarios: [] }

  const payload = await getPayload({ config: configPromise })

  // overrideAccess: false → si el profesional está inactivo, para el público "no existe"
  const profesional = await payload.findByID({
    collection: 'profesionales',
    depth: 0,
    disableErrors: true,
    id: profesionalId,
    overrideAccess: false,
  })
  if (!profesional) return { error: 'El profesional no está disponible.', horarios: [] }

  // Los turnos no son públicos: la consulta se hace con permisos de servidor
  // y solo se devuelve la hora ocupada, nunca datos de otros pacientes.
  const reservados = await payload.find({
    collection: 'turnos',
    depth: 0,
    limit: 200,
    overrideAccess: true,
    pagination: false,
    select: { hora: true },
    where: {
      and: [
        { profesional: { equals: profesionalId } },
        { fecha: { equals: aFechaGuardada(fecha) } },
        { estado: { not_equals: 'cancelado' } },
      ],
    },
  })

  return {
    horarios: horariosLibres(
      profesional.atencion,
      fecha,
      reservados.docs.map((t) => t.hora),
    ),
  }
}

const esquemaSolicitud = z.object({
  apellido: z.string().trim().min(2, { error: 'Escribí tu apellido.' }).max(60),
  consentimiento: z.literal('si', {
    error: 'Necesitamos tu consentimiento para usar tus datos en la gestión del turno.',
  }),
  dni: z
    .string()
    .trim()
    .regex(/^\d{7,8}$/, { error: 'El DNI tiene que tener 7 u 8 números, sin puntos.' }),
  email: z.email({ error: 'Revisá el email: parece incompleto.' }),
  especialidad: z.coerce.number({ error: 'Elegí una especialidad.' }).int().positive({ error: 'Elegí una especialidad.' }),
  fecha: esFecha,
  hora: z.string().regex(/^\d{2}:\d{2}$/, { error: 'Elegí un horario.' }),
  motivo: z.string().trim().max(500, { error: 'El motivo puede tener hasta 500 caracteres.' }).optional(),
  nombre: z.string().trim().min(2, { error: 'Escribí tu nombre.' }).max(60),
  obraSocial: z.enum(OBRAS_SOCIALES.map((o) => o.value) as [string, ...string[]], {
    error: 'Elegí tu obra social o "Particular".',
  }),
  profesional: z.coerce.number({ error: 'Elegí un profesional.' }).int().positive({ error: 'Elegí un profesional.' }),
  telefono: z
    .string()
    .trim()
    .regex(/^[\d\s()+-]{6,30}$/, { error: 'Escribí un teléfono de contacto (solo números).' }),
})

type CampoSolicitud = keyof z.infer<typeof esquemaSolicitud>

export type EstadoSolicitud =
  | {
      errores?: Partial<Record<CampoSolicitud, string>>
      mensaje?: string
      ok: false
      valores?: Partial<Record<CampoSolicitud, string>>
    }
  | {
      codigo: string
      email: string
      especialidad: string
      fecha: string
      hora: string
      ok: true
      profesional: string
    }

/** Registra el pedido de turno. Queda "pendiente" hasta que recepción lo confirma. */
export async function solicitarTurno(
  _estadoAnterior: EstadoSolicitud | null,
  formData: FormData,
): Promise<EstadoSolicitud> {
  const entrada = Object.fromEntries(formData) as Record<string, string>

  // Campo trampa: invisible para personas, los bots suelen completarlo
  if (entrada.sitioWeb) return { mensaje: 'No pudimos procesar el pedido.', ok: false }

  const valores = Object.fromEntries(
    Object.entries(entrada).filter(([k]) => !k.startsWith('$') && k !== 'sitioWeb'),
  ) as Partial<Record<CampoSolicitud, string>>

  const resultado = esquemaSolicitud.safeParse({ ...entrada, motivo: entrada.motivo || undefined })
  if (!resultado.success) {
    const errores: Partial<Record<CampoSolicitud, string>> = {}
    for (const issue of resultado.error.issues) {
      const campo = issue.path[0] as CampoSolicitud
      if (campo && !errores[campo]) errores[campo] = issue.message
    }
    return { errores, mensaje: 'Revisá los datos marcados.', ok: false, valores }
  }

  const datos = resultado.data
  const hoy = fechaLocal()
  if (datos.fecha < hoy || datos.fecha > sumarDias(hoy, DIAS_DE_ANTICIPACION)) {
    return {
      errores: { fecha: `Podés pedir turnos desde hoy y hasta ${DIAS_DE_ANTICIPACION} días adelante.` },
      ok: false,
      valores,
    }
  }

  const payload = await getPayload({ config: configPromise })

  try {
    // overrideAccess: la colección no admite altas públicas; esta acción es el
    // único camino permitido y ya validó los datos. El hook validarTurno vuelve
    // a chequear agenda y superposición dentro de la misma operación.
    const turno = await payload.create({
      collection: 'turnos',
      data: {
        creadoDesde: 'web',
        especialidad: datos.especialidad,
        estado: 'pendiente',
        fecha: datos.fecha,
        hora: datos.hora,
        motivo: datos.motivo,
        paciente: {
          apellido: datos.apellido,
          dni: datos.dni,
          email: datos.email,
          nombre: datos.nombre,
          obraSocial: datos.obraSocial as (typeof OBRAS_SOCIALES)[number]['value'],
          telefono: datos.telefono,
        },
        profesional: datos.profesional,
      },
      depth: 1,
      overrideAccess: true,
    })

    const profesional = typeof turno.profesional === 'object' ? turno.profesional : null
    const especialidad = typeof turno.especialidad === 'object' ? turno.especialidad : null

    return {
      codigo: turno.codigo ?? '',
      email: datos.email,
      especialidad: especialidad?.nombre ?? '',
      fecha: fechaLegible(datos.fecha),
      hora: datos.hora,
      ok: true,
      profesional: profesional?.nombreCompleto ?? '',
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      const errores: Partial<Record<CampoSolicitud, string>> = {}
      for (const e of error.data.errors) {
        const campo = (e.path === 'profesional' || e.path === 'fecha' ? e.path : 'hora') as CampoSolicitud
        errores[campo] ??= e.message
      }
      return { errores, mensaje: 'No pudimos reservar ese horario.', ok: false, valores }
    }

    payload.logger.error({ err: error, msg: 'Error al registrar un turno desde el sitio' })
    return {
      mensaje: 'No pudimos registrar el turno por un problema técnico. Probá de nuevo o llamanos por teléfono.',
      ok: false,
      valores,
    }
  }
}
