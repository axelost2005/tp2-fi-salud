import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath } from 'next/cache'

/**
 * Cuando cambia una especialidad o un profesional se invalidan las páginas
 * que los muestran, así el sitio se actualiza sin volver a compilar.
 */
const revalidar = (payload: { logger: { info: (msg: string) => void } }, slug?: string | null) => {
  payload.logger.info('Revalidando páginas de la cartilla')
  revalidatePath('/')
  revalidatePath('/especialidades')
  revalidatePath('/profesionales')
  if (slug) revalidatePath(`/especialidades/${slug}`)
}

export const revalidarCartilla: CollectionAfterChangeHook = ({ doc, previousDoc, req }) => {
  if (!req.context.disableRevalidate) {
    revalidar(req.payload, doc?.slug)
    if (previousDoc?.slug && previousDoc.slug !== doc?.slug) {
      revalidatePath(`/especialidades/${previousDoc.slug}`)
    }
  }
  return doc
}

export const revalidarCartillaAlBorrar: CollectionAfterDeleteHook = ({ doc, req }) => {
  if (!req.context.disableRevalidate) revalidar(req.payload, doc?.slug)
  return doc
}
