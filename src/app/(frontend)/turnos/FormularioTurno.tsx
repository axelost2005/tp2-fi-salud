'use client'

import { CalendarCheck, CircleCheck, LoaderCircle } from 'lucide-react'
import Link from 'next/link'
import React, { startTransition, useActionState, useEffect, useId, useMemo, useState, useTransition } from 'react'

import { Button } from '@/components/ui/button'
import { describirAtencion, etiquetaObraSocial } from '@/utilities/cartilla'
import { cn } from '@/utilities/ui'
import { fechaLegible, proximasFechas } from '@/utilities/turnos'

import { consultarHorarios, type EstadoSolicitud, solicitarTurno } from './acciones'

export type EspecialidadOpcion = { id: number; nombre: string; slug: string }
export type ProfesionalOpcion = {
  atencion: { dias: string[]; duracionTurno: number; horaFin: string; horaInicio: string }
  especialidades: number[]
  id: number
  matricula: string
  nombreCompleto: string
  obrasSociales: string[]
}

type Errores = Extract<EstadoSolicitud, { ok: false }>['errores']

const claseCampo =
  'h-11 w-full rounded-lg border border-input bg-background px-3 text-base text-foreground aria-[invalid=true]:border-urgencia'

/** Opción tipo "chip" basada en un radio real: accesible con teclado y lector de pantalla. */
const OpcionChip: React.FC<{
  checked: boolean
  children: React.ReactNode
  name: string
  onChange: () => void
  value: string | number
}> = ({ checked, children, name, onChange, value }) => (
  <label
    className={cn(
      'inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border-2 px-4 py-2 text-center font-semibold transition-colors',
      'focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-ring',
      checked
        ? 'border-primary bg-primary text-primary-foreground'
        : 'border-border bg-background hover:border-primary/60',
    )}
  >
    <input checked={checked} className="sr-only" name={name} onChange={onChange} type="radio" value={value} />
    {children}
  </label>
)

const Paso: React.FC<{ children: React.ReactNode; error?: string; id: string; numero: number; titulo: string }> = ({
  children,
  error,
  id,
  numero,
  titulo,
}) => (
  <fieldset aria-describedby={error ? `${id}-error` : undefined} className="flex flex-col gap-4" id={id}>
    <legend className="mb-3 flex items-center gap-3 text-xl font-bold">
      <span
        aria-hidden
        className="inline-flex size-8 items-center justify-center rounded-full bg-secondary text-base text-secondary-foreground"
      >
        {numero}
      </span>
      {titulo}
    </legend>
    {children}
    {error && (
      <p className="font-semibold text-urgencia" id={`${id}-error`}>
        {error}
      </p>
    )}
  </fieldset>
)

const Campo: React.FC<{
  autoComplete?: string
  defaultValue?: string
  error?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  label: string
  name: string
  type?: string
}> = ({ autoComplete, defaultValue, error, inputMode, label, name, type = 'text' }) => {
  const id = useId()
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-semibold" htmlFor={id}>
        {label}
      </label>
      <input
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={Boolean(error)}
        autoComplete={autoComplete}
        className={claseCampo}
        defaultValue={defaultValue}
        id={id}
        inputMode={inputMode}
        name={name}
        type={type}
      />
      {error && (
        <p className="text-sm font-semibold text-urgencia" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * Formulario de turnos (componente de cliente). Guía en cinco pasos y usa
 * dos Server Actions: una para consultar horarios libres cada vez que se
 * elige un día y otra para registrar el pedido. Con useActionState, los
 * errores de validación del servidor vuelven al formulario y se muestran
 * junto a cada campo.
 */
type Props = {
  especialidadInicial: number | null
  especialidades: EspecialidadOpcion[]
  profesionalInicial: number | null
  profesionales: ProfesionalOpcion[]
}

/** Envoltorio que permite "empezar de nuevo": cambiar la key vuelve a montar el formulario con el estado inicial. */
export const FormularioTurno: React.FC<Props> = (props) => {
  const [version, setVersion] = useState(0)
  return <FormularioTurnoInterno key={version} {...props} onReiniciar={() => setVersion((v) => v + 1)} />
}

const FormularioTurnoInterno: React.FC<Props & { onReiniciar: () => void }> = ({
  especialidadInicial,
  especialidades,
  onReiniciar,
  profesionalInicial,
  profesionales,
}) => {
  const [estado, enviar, enviando] = useActionState(solicitarTurno, null)
  const [especialidadId, setEspecialidadId] = useState<number | null>(especialidadInicial)
  const [profesionalId, setProfesionalId] = useState<number | null>(profesionalInicial)
  const [fecha, setFecha] = useState<string | null>(null)
  const [hora, setHora] = useState<string | null>(null)
  const [horarios, setHorarios] = useState<string[] | null>(null)
  const [errorHorarios, setErrorHorarios] = useState<string | null>(null)
  const [cargandoHorarios, iniciarCarga] = useTransition()
  const idEspecialidad = useId()
  const idObraSocial = useId()

  const errores: Errores = estado && !estado.ok ? estado.errores : undefined
  const valores = estado && !estado.ok ? estado.valores : undefined

  const opcionesProfesional = useMemo(
    () => (especialidadId ? profesionales.filter((p) => p.especialidades.includes(especialidadId)) : []),
    [especialidadId, profesionales],
  )
  const profesional = profesionales.find((p) => p.id === profesionalId) ?? null
  const fechas = useMemo(() => (profesional ? proximasFechas(profesional.atencion) : []), [profesional])

  const cargarHorarios = (idProfesional: number, dia: string) => {
    iniciarCarga(async () => {
      const respuesta = await consultarHorarios(idProfesional, dia)
      setHorarios(respuesta.horarios)
      setErrorHorarios(respuesta.error ?? null)
      setHora(null)
    })
  }

  // Si el servidor avisa que el horario se ocupó mientras la persona completaba
  // el formulario, se vuelven a pedir los horarios libres de ese día.
  useEffect(() => {
    if (errores?.hora && profesionalId && fecha) cargarHorarios(profesionalId, fecha)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado])

  if (estado?.ok) {
    return (
      <section
        aria-live="polite"
        className="flex flex-col gap-5 rounded-2xl border border-primary/40 bg-secondary/50 p-6 md:p-8"
      >
        <CircleCheck aria-hidden className="size-12 text-primary" />
        <h2 className="text-2xl font-bold">Recibimos tu pedido de turno</h2>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-muted-foreground">Código de turno</dt>
            <dd className="text-2xl font-bold tracking-wide">{estado.codigo}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Profesional</dt>
            <dd className="font-semibold">
              {estado.profesional} ({estado.especialidad})
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Día y hora</dt>
            <dd className="font-semibold first-letter:uppercase">
              {estado.fecha}, {estado.hora} h
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Te vamos a escribir a</dt>
            <dd className="font-semibold break-all">{estado.email}</dd>
          </div>
        </dl>
        <p>
          El turno queda <b>pendiente de confirmación</b>. Recepción lo revisa y te confirma por email o por
          teléfono. Guardá el código por si necesitás cancelarlo.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={onReiniciar} type="button">
            Pedir otro turno
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>
      </section>
    )
  }

  const obrasSociales = Array.from(new Set([...(profesional?.obrasSociales ?? []), 'particular']))

  return (
    <form
      className="flex flex-col gap-10"
      noValidate
      onSubmit={(e) => {
        // Se envía a mano (y no con action={...}) para que React no resetee el
        // formulario después de cada intento: así no se pierden las opciones
        // elegidas ni lo escrito cuando el servidor devuelve errores.
        e.preventDefault()
        const datos = new FormData(e.currentTarget)
        startTransition(() => enviar(datos))
      }}
    >
      {estado && !estado.ok && estado.mensaje && (
        <div className="rounded-2xl border border-urgencia/50 bg-error/40 p-5" role="alert">
          <p className="font-bold">{estado.mensaje}</p>
          {errores && Object.keys(errores).length > 0 && (
            <ul className="mt-2 list-disc pl-5">
              {Object.entries(errores).map(([campo, mensaje]) => (
                <li key={campo}>{mensaje}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <Paso error={errores?.especialidad} id="paso-especialidad" numero={1} titulo="Especialidad">
        <label className="sr-only" htmlFor={idEspecialidad}>
          Especialidad
        </label>
        <select
          className={cn(claseCampo, 'max-w-md')}
          id={idEspecialidad}
          name="especialidad"
          onChange={(e) => {
            setEspecialidadId(e.target.value ? Number(e.target.value) : null)
            setProfesionalId(null)
            setFecha(null)
            setHora(null)
            setHorarios(null)
          }}
          value={especialidadId ?? ''}
        >
          <option value="">Elegí una especialidad</option>
          {especialidades.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nombre}
            </option>
          ))}
        </select>
      </Paso>

      {especialidadId && (
        <Paso error={errores?.profesional} id="paso-profesional" numero={2} titulo="Profesional">
          {opcionesProfesional.length === 0 ? (
            <p className="text-muted-foreground">Por ahora no hay profesionales con turnos online en esta especialidad.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {opcionesProfesional.map((p) => (
                <label
                  className={cn(
                    'flex cursor-pointer flex-col gap-1 rounded-2xl border-2 p-4 transition-colors',
                    'focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-ring',
                    p.id === profesionalId ? 'border-primary bg-secondary/60' : 'border-border hover:border-primary/60',
                  )}
                  key={p.id}
                >
                  <input
                    checked={p.id === profesionalId}
                    className="sr-only"
                    name="profesional"
                    onChange={() => {
                      setProfesionalId(p.id)
                      setFecha(null)
                      setHora(null)
                      setHorarios(null)
                    }}
                    type="radio"
                    value={p.id}
                  />
                  <span className="font-bold">{p.nombreCompleto}</span>
                  <span className="text-sm text-muted-foreground">Matrícula {p.matricula}</span>
                  <span className="text-[0.95rem]">{describirAtencion(p.atencion)}</span>
                </label>
              ))}
            </div>
          )}
        </Paso>
      )}

      {profesional && (
        <Paso error={errores?.fecha} id="paso-fecha" numero={3} titulo="Día">
          {fechas.length === 0 ? (
            <p className="text-muted-foreground">No hay días disponibles en las próximas semanas.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {fechas.map((f) => (
                <OpcionChip
                  checked={f === fecha}
                  key={f}
                  name="fecha"
                  onChange={() => {
                    setFecha(f)
                    setHorarios(null)
                    cargarHorarios(profesional.id, f)
                  }}
                  value={f}
                >
                  <span className="first-letter:uppercase">{fechaLegible(f)}</span>
                </OpcionChip>
              ))}
            </div>
          )}
        </Paso>
      )}

      {profesional && fecha && (
        <Paso error={errores?.hora} id="paso-hora" numero={4} titulo="Horario">
          {cargandoHorarios || horarios === null ? (
            <p className="flex items-center gap-2 text-muted-foreground" role="status">
              <LoaderCircle aria-hidden className="size-5 animate-spin motion-reduce:animate-none" />
              Buscando horarios libres…
            </p>
          ) : errorHorarios ? (
            <p className="font-semibold text-urgencia">{errorHorarios}</p>
          ) : horarios.length === 0 ? (
            <p className="text-muted-foreground">No quedan horarios libres ese día. Probá con otra fecha.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {horarios.map((h) => (
                <OpcionChip checked={h === hora} key={h} name="hora" onChange={() => setHora(h)} value={h}>
                  {h}
                </OpcionChip>
              ))}
            </div>
          )}
        </Paso>
      )}

      {profesional && fecha && hora && (
        <Paso id="paso-datos" numero={5} titulo="Tus datos">
          <div className="grid gap-5 sm:grid-cols-2">
            <Campo autoComplete="given-name" defaultValue={valores?.nombre} error={errores?.nombre} label="Nombre" name="nombre" />
            <Campo autoComplete="family-name" defaultValue={valores?.apellido} error={errores?.apellido} label="Apellido" name="apellido" />
            <Campo defaultValue={valores?.dni} error={errores?.dni} inputMode="numeric" label="DNI (sin puntos)" name="dni" />
            <Campo autoComplete="tel" defaultValue={valores?.telefono} error={errores?.telefono} inputMode="tel" label="Teléfono" name="telefono" type="tel" />
            <Campo autoComplete="email" defaultValue={valores?.email} error={errores?.email} label="Email" name="email" type="email" />
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold" htmlFor={idObraSocial}>
                Obra social
              </label>
              <select
                aria-invalid={Boolean(errores?.obraSocial)}
                className={claseCampo}
                defaultValue={valores?.obraSocial ?? ''}
                id={idObraSocial}
                name="obraSocial"
              >
                <option value="">Elegí una opción</option>
                {obrasSociales.map((o) => (
                  <option key={o} value={o}>
                    {etiquetaObraSocial(o)}
                  </option>
                ))}
              </select>
              {errores?.obraSocial && <p className="text-sm font-semibold text-urgencia">{errores.obraSocial}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold" htmlFor="motivo">
              Motivo de la consulta <span className="font-normal text-muted-foreground">(opcional)</span>
            </label>
            <textarea
              className="min-h-24 w-full rounded-lg border border-input bg-background p-3 text-base"
              defaultValue={valores?.motivo}
              id="motivo"
              maxLength={500}
              name="motivo"
            />
          </div>

          {/* Campo trampa para bots: oculto para las personas */}
          <div aria-hidden className="absolute left-[-9999px]">
            <label>
              Sitio web
              <input autoComplete="off" name="sitioWeb" tabIndex={-1} type="text" />
            </label>
          </div>

          <label className="flex items-start gap-3">
            <input
              aria-invalid={Boolean(errores?.consentimiento)}
              className="mt-1 size-5 accent-[var(--primary)]"
              defaultChecked={valores?.consentimiento === 'si'}
              name="consentimiento"
              type="checkbox"
              value="si"
            />
            <span>
              Acepto que mis datos se usen solo para gestionar este turno (Ley 25.326 de protección de datos
              personales).
            </span>
          </label>
          {errores?.consentimiento && <p className="font-semibold text-urgencia">{errores.consentimiento}</p>}

          <div className="flex flex-wrap items-center gap-4">
            <Button disabled={enviando} size="lg" type="submit">
              {enviando ? (
                <>
                  <LoaderCircle aria-hidden className="animate-spin motion-reduce:animate-none" />
                  Enviando…
                </>
              ) : (
                <>
                  <CalendarCheck aria-hidden />
                  Pedir el turno
                </>
              )}
            </Button>
            <p className="text-sm text-muted-foreground first-letter:uppercase">
              {fechaLegible(fecha)} a las {hora} h con {profesional.nombreCompleto}
            </p>
          </div>
        </Paso>
      )}
    </form>
  )
}
