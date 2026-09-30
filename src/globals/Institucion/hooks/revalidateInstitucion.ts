import type { GlobalAfterChangeHook } from 'payload'

import { revalidateTag } from 'next/cache'

/** Invalida la caché de Next.js para que los cambios se vean al instante. */
export const revalidateInstitucion: GlobalAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info('Revalidando datos institucionales')

    revalidateTag('global_institucion', 'max')
  }

  return doc
}
