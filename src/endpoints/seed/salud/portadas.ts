import type { File } from 'payload'

import sharp from 'sharp'

/**
 * Portadas ilustradas para las novedades de ejemplo, generadas en el momento
 * a partir de un SVG (ícono + los dos ríos del isotipo) y convertidas a PNG
 * con sharp. Así el seed no depende de descargar imágenes de internet y las
 * fotos quedan con la identidad visual del sitio.
 *
 * Los trazos de los íconos son de Lucide (licencia ISC), copiados como texto
 * porque Next.js no permite usar react-dom/server dentro de una ruta.
 */
const iconos = {
  Apple:
    '<path d="M12 6.528V3a1 1 0 0 1 1-1h0"/><path d="M18.237 21A15 15 0 0 0 22 11a6 6 0 0 0-10-4.472A6 6 0 0 0 2 11a15.1 15.1 0 0 0 3.763 10 3 3 0 0 0 3.648.648 5.5 5.5 0 0 1 5.178 0A3 3 0 0 0 18.237 21"/>',
  Baby: '<path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/><path d="M15 12h.01"/><path d="M19.38 6.813A9 9 0 0 1 20.8 10.2a2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"/><path d="M9 12h.01"/>',
  HeartPulse:
    '<path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/><path d="M3.22 13H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>',
  Sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  Syringe:
    '<path d="m18 2 4 4"/><path d="m17 7 3-3"/><path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/><path d="m9 11 4 4"/><path d="m5 19-3 3"/><path d="m14 4 6 6"/>',
} as const

const paletas = {
  arena: { fondo: '#c98f45', icono: '#152a2b', rio1: '#10292a', rio2: '#f2f6f5' },
  rio: { fondo: '#0d6b62', icono: '#ffffff', rio1: '#c98f45', rio2: '#5ec4b6' },
  tinta: { fondo: '#10292a', icono: '#5ec4b6', rio1: '#deaa62', rio2: '#5ec4b6' },
  niebla: { fondo: '#e2f0ed', icono: '#0d6b62', rio1: '#c98f45', rio2: '#0d6b62' },
} as const

export type Portada = { icono: keyof typeof iconos; paleta: keyof typeof paletas }

const svgPortada = ({ icono, paleta }: Portada) => {
  const c = paletas[paleta]

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <rect width="1600" height="900" fill="${c.fondo}"/>
  <g fill="none" stroke-linecap="round" stroke-width="56" opacity="0.9">
    <path d="M-60 160C260 160 360 420 640 452L930 458" stroke="${c.rio1}"/>
    <path d="M-60 760C260 760 360 540 640 510L930 514" stroke="${c.rio2}"/>
  </g>
  <svg x="1040" y="266" width="440" height="440" viewBox="0 0 24 24" fill="none" stroke="${c.icono}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${iconos[icono]}</svg>
</svg>`
}

export const generarPortada = async (portada: Portada, nombre: string): Promise<File> => {
  const data = await sharp(Buffer.from(svgPortada(portada))).png({ compressionLevel: 9 }).toBuffer()

  return {
    data,
    mimetype: 'image/png',
    name: `${nombre}.png`,
    size: data.byteLength,
  }
}
