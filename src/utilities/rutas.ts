import type { CollectionSlug } from 'payload'

/**
 * Rutas públicas de cada colección, en un solo lugar.
 * El template armaba las URLs como `/${colección}/${slug}` en varios archivos,
 * lo que obligaba a que la URL fuera igual al nombre interno ("posts").
 * Con este mapa la colección "posts" se publica en /novedades.
 */
export const rutaDeColeccion: Partial<Record<CollectionSlug, string>> = {
  especialidades: '/especialidades',
  pages: '',
  posts: '/novedades',
}

/** URL pública de un documento: hrefDocumento('posts', 'mi-nota') → "/novedades/mi-nota". */
export const hrefDocumento = (coleccion: CollectionSlug, slug?: string | null): string => {
  const prefijo = rutaDeColeccion[coleccion] ?? `/${coleccion}`
  if (!slug) return prefijo || '/'
  if (coleccion === 'pages' && slug === 'home') return '/'
  return `${prefijo}/${slug}`
}
