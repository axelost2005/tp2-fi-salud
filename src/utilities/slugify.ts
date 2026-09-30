/**
 * Convierte un texto en un slug para URLs respetando el castellano:
 * "Clínica médica" → "clinica-medica", "Pediatría y niñez" → "pediatria-y-ninez".
 *
 * El slugify por defecto de Payload elimina los caracteres acentuados en vez
 * de convertirlos ("Clínica médica" → "clnica-mdica"), por eso se reemplaza
 * en todas las colecciones que tienen slug.
 */
export const slugifyEs = (texto?: string | null): string | undefined => {
  if (!texto) return undefined

  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quita tildes y diéresis (la ñ queda como n)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Versión compatible con la opción `slugify` de `slugField()` de Payload. */
export const slugifyPayload = ({ valueToSlugify }: { valueToSlugify?: unknown }) =>
  slugifyEs(typeof valueToSlugify === 'string' ? valueToSlugify : undefined)
