import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

/**
 * Ayuda para escribir contenido de ejemplo: convierte párrafos de texto
 * plano al formato JSON del editor Lexical que usa Payload.
 */
type NodoTexto = {
  type: 'text'
  detail: number
  format: number
  mode: 'normal'
  style: string
  text: string
  version: number
}

const nodoTexto = (text: string, negrita = false): NodoTexto => ({
  type: 'text',
  detail: 0,
  format: negrita ? 1 : 0,
  mode: 'normal',
  style: '',
  text,
  version: 1,
})

export type Bloque =
  | { tipo: 'p'; texto: string }
  | { tipo: 'h1' | 'h2' | 'h3'; texto: string }
  | { tipo: 'lista'; items: string[] }

const convertir = (b: Bloque) => {
  if (b.tipo === 'p') {
    return {
      type: 'paragraph',
      children: [nodoTexto(b.texto)],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      textFormat: 0,
      version: 1,
    }
  }
  if (b.tipo === 'lista') {
    return {
      type: 'list',
      children: b.items.map((item, i) => ({
        type: 'listitem',
        children: [nodoTexto(item)],
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        value: i + 1,
        version: 1,
      })),
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      listType: 'bullet',
      start: 1,
      tag: 'ul',
      version: 1,
    }
  }
  return {
    type: 'heading',
    children: [nodoTexto(b.texto)],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    tag: b.tipo,
    version: 1,
  }
}

/** Arma un documento Lexical a partir de una lista de bloques simples. */
export const lexical = (bloques: Bloque[]): DefaultTypedEditorState =>
  ({
    root: {
      type: 'root',
      children: bloques.map(convertir),
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }) as unknown as DefaultTypedEditorState

/** Atajo para textos de un solo párrafo o varios. */
export const parrafos = (...textos: string[]) => lexical(textos.map((texto) => ({ tipo: 'p', texto })))
