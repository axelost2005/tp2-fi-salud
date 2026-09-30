import { postgresAdapter } from '@payloadcms/db-postgres'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'
import { es } from '@payloadcms/translations/languages/es'

import { migrations } from './migrations'

import { Categories } from './collections/Categories'
import { Especialidades } from './collections/Especialidades'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Profesionales } from './collections/Profesionales'
import { Turnos } from './collections/Turnos'
import { Users } from './collections/Users'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { Institucion } from './globals/Institucion/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'
import { sitio } from './config/sitio'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {
      // Mensaje en la pantalla de ingreso al panel
      beforeLogin: ['@/components/BeforeLogin'],
      // Bienvenida en el inicio del panel
      beforeDashboard: ['@/components/BeforeDashboard', '@/components/TurnosDeHoy'],
      // Logo e ícono propios en lugar de los de Payload
      graphics: {
        Icon: '@/components/AdminGraphics#IconoAdmin',
        Logo: '@/components/AdminGraphics#LogoAdmin',
      },
    },
    meta: {
      icons: [{ rel: 'icon', type: 'image/svg+xml', url: '/favicon.svg' }],
      titleSuffix: ` — ${sitio.nombre}`,
    },
    // Sin Gravatar: no se envía el hash del email del personal a un servicio externo
    avatar: 'default',
    // Fechas del panel en formato argentino
    dateFormat: 'dd/MM/yyyy HH:mm',
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Celular',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Escritorio',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    // En desarrollo Payload sincroniza el esquema solo ("push"). En producción
    // aplica estas migraciones al iniciar, así una base vacía queda lista.
    prodMigrations: migrations,
  }),
  collections: [Pages, Posts, Media, Categories, Especialidades, Profesionales, Turnos, Users],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer, Institucion],
  // Panel de administración en español
  i18n: {
    fallbackLanguage: 'es',
    supportedLanguages: { es },
  },
  plugins,
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        const secret = process.env.CRON_SECRET
        if (!secret) return false

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${secret}`
      },
    },
    tasks: [],
  },
})
