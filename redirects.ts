import type { NextConfig } from 'next'

export const redirects: NextConfig['redirects'] = async () => {
  const internetExplorerRedirect = {
    destination: '/ie-incompatible.html',
    has: [
      {
        type: 'header' as const,
        key: 'user-agent',
        value: '(.*Trident.*)', // all ie browsers
      },
    ],
    permanent: false,
    source: '/:path((?!ie-incompatible.html$).*)', // all pages except the incompatibility page
  }

  // Las novedades se publicaban en /posts (nombre del template); los enlaces viejos siguen funcionando
  const postsANovedades = {
    destination: '/novedades/:ruta*',
    permanent: true,
    source: '/posts/:ruta*',
  }

  return [internetExplorerRedirect, postsANovedades]
}
