# Confluencia Salud - TP2 Frameworks e Interoperabilidad

Portal público y gestión de turnos para una plataforma de salud, hecho con **Next.js 16** (framework) y **Payload CMS 3** (gestor de contenidos) sobre **PostgreSQL**.

Trabajo Práctico N.º 2 "CMS y Frameworks Web" de Frameworks e Interoperabilidad, Tecnicatura Universitaria en Desarrollo Web, Facultad de Informática, Universidad Nacional del Comahue.

**Integrantes:** Axel Ostrovsky y Tomás Sánchez.

> Todos los datos del sitio (profesionales, matrículas, pacientes, teléfonos) son **ficticios**.

## Qué hay en este repositorio

| Parte | Qué es | Dónde |
|---|---|---|
| Template original | Template *website* oficial de Payload 3.90.2, sin cambios | tag `template-original` (commit `d584c53`) |
| Tema "Confluencia" | Modificación del template: marca, paleta, tipografía, encabezado, pie y textos en español | rama `feature/tema-salud` |
| Módulo 1: Usuarios y roles | Módulo modificado: roles del personal y permisos | rama `feature/usuarios-roles` |
| Módulo 2: Cartilla | Módulo nuevo: especialidades y profesionales | rama `feature/cartilla` |
| Módulo 3: Novedades de salud | Módulo modificado (era "Posts") | rama `feature/novedades` |
| Módulo 4: Turnos online | Módulo nuevo: pedido y gestión de turnos | rama `feature/turnos` |
| Capturas antes/después | Para comparar el template con la solución | `docs/capturas/antes` y `docs/capturas/despues` |
| Registro de decisiones | Qué se decidió, por qué y qué se descartó | [`docs/decisiones.md`](docs/decisiones.md) |
| Cambios respecto del template | Lista de modificaciones (consigna 2.b) | [`docs/cambios-template.md`](docs/cambios-template.md) |
| Pruebas | Pruebas automáticas y manuales con resultados | [`docs/pruebas.md`](docs/pruebas.md) |
| Informe | PDF de la entrega | [`docs/informe/TP2_Ostrovsky_Sanchez.pdf`](docs/informe/TP2_Ostrovsky_Sanchez.pdf) |
| Tablero | Tareas del trabajo en Linear, con la rama de cada una | [Linear](https://linear.app/casdjkojadkasjdjka/project/tp2-cms-y-frameworks-web-3aabda23a78c) y copia en [`docs/tablero.md`](docs/tablero.md) |
| Registro de cambios | Cambios por versión | [`CHANGELOG.md`](CHANGELOG.md) |

La consigna pide al menos tres módulos; hay cuatro. Si hace falta recortar para la exposición, Turnos es el más completo y el que mejor muestra el framework.

## Requisitos

- Node.js 20.9 o superior (probado con 22 y 24)
- pnpm 9, 10 u 11 (`npm install -g pnpm`)
- PostgreSQL 16: con Docker (`docker compose up -d db`) o instalado en la compu
- Git

> Si el TF u otro proyecto ya usa los puertos 3000 o 5432, apagalo antes de levantar este.

## Cómo levantarlo (desarrollo)

```bash
# 1. Dependencias
pnpm install

# 2. Base de datos (con Docker; si tenés Postgres instalado, creá la base "tp2_salud")
docker compose up -d db

# 3. Variables de entorno
cp .env.example .env
# Editá PAYLOAD_SECRET con un texto largo y aleatorio

# 4. Servidor de desarrollo
pnpm dev
```

Después:

1. Abrí <http://localhost:3000/admin> y creá el primer usuario. **El primer usuario queda como administrador.**
2. En el inicio del panel tocá **"Cargar datos de ejemplo"**. Borra la base y carga la cartilla, las novedades, los turnos y los usuarios de demo. No necesita internet.
3. Abrí <http://localhost:3000>.

En desarrollo Payload sincroniza solo el esquema de la base ("push"). Si cambia una colección y la consola pregunta *"Accept warnings and push schema to database?"*, se puede responder `y` en una base de prueba.

**Si `pnpm install` falla con `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION`:** pnpm 11 rechaza los paquetes publicados hace menos de 24 horas y lo calcula con el reloj de la compu. Revisá la fecha con `date`; en una máquina virtual con el reloj atrasado, `sudo timedatectl set-ntp true` la sincroniza.

### Usuarios de demo

Se crean al cargar los datos de ejemplo:

| Rol | Email | Contraseña | Qué ve en el panel |
|---|---|---|---|
| Administrador/a | el que creaste en el paso 1 | la tuya | Todo |
| Recepción | `recepcion@tp2salud.local` | `Recepcion1234!` | Turnos, mensajes de contacto y cartilla |
| Profesional | `lmendez@tp2salud.local` | `Profesional1234!` | Solo su agenda de turnos |
| Editor/a | `comunicacion@tp2salud.local` | `Editor1234!` | Páginas, novedades, cartilla y datos del sitio |

## Producción

```bash
pnpm build   # en una base vacía aplica la migración inicial (src/migrations)
pnpm start
```

En producción Payload no sincroniza el esquema: usa las migraciones. Si cambia una colección, generá una nueva con `pnpm db:migrate:create nombre`.

## Scripts

| Script | Para qué |
|---|---|
| `pnpm dev` | Servidor de desarrollo en <http://localhost:3000> |
| `pnpm build` / `pnpm start` | Compilación y servidor de producción |
| `pnpm lint` | ESLint |
| `pnpm test:unit` | Pruebas unitarias (no necesitan base) |
| `pnpm test:int` | Pruebas de integración (base con datos de ejemplo) |
| `pnpm test:e2e` | Pruebas de punta a punta con Playwright (servidor corriendo; la primera vez: `npx playwright install chromium`) |
| `pnpm generate:types` | Regenera `src/payload-types.ts` después de cambiar una colección |
| `pnpm generate:importmap` | Regenera el mapa de componentes del panel |
| `pnpm db:migrate` / `pnpm db:migrate:create` | Migraciones de la base |

## Cómo está organizado

Next.js y Payload corren en **una sola aplicación**. Payload se instala dentro de la carpeta `app` de Next.js y el sitio lee los datos con la **Local API** de Payload (llamadas a funciones dentro del mismo proceso, sin HTTP). Por eso no hay interoperabilidad entre sistemas, como pide la consigna.

```
src/
├── app/
│   ├── (frontend)/            Sitio público (Next.js App Router)
│   │   ├── especialidades/    Módulo Cartilla
│   │   ├── profesionales/     Cartilla con filtros
│   │   ├── novedades/         Módulo Novedades (antes /posts)
│   │   └── turnos/            Módulo Turnos: página, formulario y Server Actions
│   └── (payload)/             Panel /admin y APIs REST y GraphQL de Payload
├── access/roles.ts            Roles y reglas de acceso
├── collections/               Colecciones de Payload (tablas + panel + API)
│   ├── Especialidades/  Profesionales/  Turnos/   ← nuevas
│   └── Posts/  Users/  Pages/  Media/  Categories  ← del template, modificadas
├── globals/Institucion/       Datos de contacto editables
├── blocks/                    Bloques del constructor de páginas
├── components/                Componentes de React
├── heros/                     Portadas de página (incluye la nueva "Confluencia")
├── utilities/                 Funciones compartidas (turnos, cartilla, slugs, rutas)
├── endpoints/seed/            Datos de ejemplo
├── migrations/                Migraciones de PostgreSQL
└── payload.config.ts          Configuración central de Payload
```

## Flujo de trabajo con Git

- `main`: versión estable para entregar.
- `develop`: integración.
- `feature/*` y `fix/*`: una rama por tarea; se integran a `develop` con merge sin fast-forward (`--no-ff`), así cada módulo queda visible en el historial.
- Commits con prefijo según el tipo de cambio: `feat`, `fix`, `docs`, `chore`.

Para ver la historia con las ramas: `git log --oneline --graph --all`.

Para comparar el template con la solución: `git diff template-original main --stat`.

## Créditos y licencias

- Template *website* de Payload: MIT. <https://github.com/payloadcms/payload/tree/main/templates/website>
- Tipografía Atkinson Hyperlegible Next (Braille Institute): SIL Open Font License 1.1. Ver `src/app/(frontend)/fonts/OFL.txt`.
- Íconos: Lucide (ISC).
