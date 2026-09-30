import type { FieldHook } from 'payload'

/** Recorre el JSON del editor Lexical y junta todo el texto. */
const extraerTexto = (nodo: unknown): string => {
  if (!nodo || typeof nodo !== 'object') return ''
  const { children, text } = nodo as { children?: unknown[]; text?: unknown }
  const propio = typeof text === 'string' ? text : ''
  const hijos = Array.isArray(children) ? children.map(extraerTexto).join(' ') : ''
  return `${propio} ${hijos}`
}

/**
 * Hook de campo (nuevo): calcula los minutos de lectura de una novedad a
 * partir de su contenido, a 200 palabras por minuto. Se recalcula cada vez
 * que se guarda, así nunca queda desactualizado.
 */
export const calcularTiempoLectura: FieldHook = ({ data, originalDoc }) => {
  const contenido = (data?.content ?? originalDoc?.content) as { root?: unknown } | undefined
  const palabras = extraerTexto(contenido?.root).split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(palabras / 200))
}
