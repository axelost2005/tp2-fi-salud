import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'
import { sitio } from '@/config/sitio'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description: sitio.descripcion,
  locale: sitio.locale,
  images: [
    {
      url: `${getServerSideURL()}/og-confluencia.png`,
    },
  ],
  siteName: sitio.nombre,
  title: sitio.nombre,
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
