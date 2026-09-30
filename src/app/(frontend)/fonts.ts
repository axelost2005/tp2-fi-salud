import localFont from 'next/font/local'

/**
 * Atkinson Hyperlegible Next: tipografía diseñada por el Braille Institute
 * para lectores con baja visión. Se sirve desde el propio proyecto (licencia
 * SIL OFL, ver fonts/OFL.txt), así el sitio no depende de Google Fonts y
 * funciona sin conexión durante la demo.
 */
export const atkinson = localFont({
  src: [
    {
      path: './fonts/atkinson-hyperlegible-next-latin-normal.woff2',
      style: 'normal',
      weight: '200 800',
    },
    {
      path: './fonts/atkinson-hyperlegible-next-latin-italic.woff2',
      style: 'italic',
      weight: '200 800',
    },
  ],
  display: 'swap',
  variable: '--font-atkinson',
})
