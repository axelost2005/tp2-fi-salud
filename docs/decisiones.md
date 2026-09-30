# Registro de decisiones

Decisiones tomadas durante el TP2, con su contexto, lo que se descartó y sus consecuencias. Se escribe en el momento en que se toma cada decisión; si una decisión cambia, se agrega una nueva que la reemplaza en lugar de borrar la anterior.

Escala de las matrices (la misma que propone la cátedra): **1** Malo · **2** Regular · **3** Bueno · **4** Excelente.

---

## D-01 · Framework: Next.js 16

**Contexto.** El Trabajo Final de la Tecnicatura es una plataforma de gestión de salud hecha con React. Se busca un framework que sirva para el TF, que tenga front y back y que no obligue a conectar dos sistemas (la consigna pide no agregar interoperabilidad).

**Criterios.** Los de la Unidad III para elegir framework: complejidad del proyecto, tiempo de aprendizaje y lenguaje de base, frecuencia de cambios, soporte, posición en el mercado y funcionalidades (seguridad, URLs y sesiones, internacionalización, ORM y controladores). Se agrega "template dentro del framework" por la actividad 2.

| Criterio | Next.js | NestJS | Express |
|---|---|---|---|
| Se ajusta al proyecto (portal + gestión de turnos) | 4 | 3 | 2 |
| Lenguaje de base / reutiliza el TF en React | 4 | 2 | 2 |
| Tiempo de aprendizaje | 3 | 2 | 4 |
| Frecuencia de cambios | 2 | 3 | 4 |
| Soporte (documentación, comunidad) | 4 | 4 | 3 |
| Posición en el mercado (descargas npm por semana, 22 al 28/09/2026) | 4 · 70 M | 3 · 17,5 M | 4 · 159 M |
| Funcionalidades | 3 | 4 | 1 |
| Seguridad | 3 | 4 | 2 |
| Template dentro del framework | 4 | 2 | 2 |
| **Total (sobre 36)** | **31** | **27** | **24** |

**Decisión.** Next.js 16 (App Router).

**Descartados.**
- **NestJS:** el más completo para APIs (módulos, guards, validación), pero es solo backend: el template tendría que ser una app React aparte, conectada por HTTP. Queda como plan B si el TF necesita un backend separado.
- **Express:** microframework: solo rutas y middleware ("los componentes absolutamente necesarios", según la unidad). Estructura, validación, vistas y seguridad se hacen a mano.
- **React solo:** su propia documentación lo define como "la biblioteca para interfaces de usuario web y nativas" y recomienda empezar con un framework. Es una librería, no un framework: no resuelve rutas, servidor ni datos.

**Consecuencias.** Next.js cambia seguido (puntaje 2 en frecuencia de cambios). Se mitiga fijando versiones exactas en `package.json`.

---

## D-02 · CMS: Payload 3

**Criterios.** Los de la Unidad III para elegir CMS: arquitectura, grado de desarrollo, soporte, posición en el mercado y opiniones, usabilidad, accesibilidad, seguridad, velocidad de descarga y funcionalidades ("no debe limitar las funcionalidades del proyecto"). Se agregan tiempo de aprendizaje, template con front (actividad 2) y licencia (software libre).

| Criterio | Payload | Strapi | Keystone |
|---|---|---|---|
| Arquitectura: CMS y sitio en un solo sistema | 4 | 2 | 2 |
| Grado de desarrollo | 3 | 4 | 3 |
| Soporte | 3 | 4 | 2 |
| Posición en el mercado (descargas npm por semana) | 4 · 1,04 M | 3 · 229 K | 1 · 15 K |
| Usabilidad del panel para personal no técnico | 4 | 4 | 3 |
| Accesibilidad del sitio que se puede construir | 4 | 3 | 3 |
| Seguridad (autenticación y permisos) | 4 | 3 | 4 |
| Velocidad de descarga | 4 | 3 | 3 |
| Funcionalidades para el dominio | 4 | 4 | 3 |
| Template con front para la actividad 2 | 4 | 2 | 1 |
| Tiempo de aprendizaje (equipo que sabe React y Node) | 3 | 4 | 3 |
| Licencia | 4 · MIT | 3 · MIT + Enterprise | 4 · MIT |
| **Total (sobre 48)** | **45** | **39** | **32** |

**Decisión.** Payload 3.90.2.

**Por qué.** Payload se instala adentro de la aplicación de Next.js: el panel, las APIs y el sitio son un solo sistema, y el sitio lee los datos con la Local API (llamadas a funciones, sin HTTP). Trae un template oficial con front (Next.js, Tailwind y shadcn/ui), control de acceso por documento y por campo, borradores, versiones, vista previa y plugins oficiales (formularios, SEO, búsqueda, redirecciones).

**Descartados.**
- **Strapi:** corre como servidor aparte; el sitio sería otra aplicación que consume su API, o sea, dos sistemas conectados (lo que el TP pide no hacer). Además, la auditoría de cambios (audit logs) es solo del plan Enterprise, y en salud la trazabilidad importa.
- **Keystone:** misma arquitectura headless (API GraphQL aparte), su starter no trae sitio con front y tiene unas 67 veces menos descargas que Payload.
- **Ghost y Apostrophe** (de la tabla de la cátedra): Ghost está pensado para blogs y newsletters, y sumarle turnos implicaría un servicio aparte. Apostrophe sí renderiza su front, pero su comunidad es chica (6,5 K descargas por semana) y está basado en MongoDB, cuando el dominio (turnos, profesionales, especialidades) es relacional.

**Nota.** Ni Next.js ni Payload están en la tabla de la consigna; la consigna dice "algunas opciones son", y esta decisión es la justificación.

---

## D-03 · Un solo proyecto: el CMS montado sobre el framework

**Decisión.** Un único proyecto donde Payload vive dentro de Next.js, como Django + Wagtail o Laravel + OctoberCMS en la tabla de la cátedra.

**Por qué.** Evita dos implementaciones separadas conectadas por API (interoperabilidad, que se deja para el próximo TP) y permite mostrar las dos herramientas en una sola demo. En el código cada una queda identificada: `src/app/(frontend)` y las Server Actions son Next.js; `src/collections`, `src/globals`, `src/access` y el panel `/admin` son Payload.

**Consecuencia.** Para el próximo TP (interoperabilidad), Payload ya genera APIs REST y GraphQL, así que conectar la plataforma con otros sistemas no requiere cambiar la base.

---

## D-04 · Base de datos: PostgreSQL en lugar de MongoDB

**Contexto.** El template viene configurado con MongoDB.

**Decisión.** PostgreSQL 16 con el adaptador oficial `@payloadcms/db-postgres`.

**Por qué.** Los datos del dominio son relacionales (turnos → profesional → especialidades) y hacen falta restricciones de la base, como el índice único que evita la doble reserva (D-10). Además, el equipo ya trabajó con PostgreSQL en la materia PWA.

---

## D-05 · Template: website oficial de Payload

**Decisión.** Template *website* de Payload 3.90.2 (MIT), equivalente a `create-payload-app -t website --db postgres`. Queda sin cambios en el tag `template-original`, con capturas en `docs/capturas/antes`.

**Por qué.** Es el template oficial, mantenido junto con el CMS, e incluye sitio público, constructor de páginas con bloques, blog, búsqueda, formularios, SEO y modo oscuro. Da una base real para mostrar el antes y el después.

---

## D-06 · Identidad visual "Confluencia"

**Decisión.**
- **Nombre:** "Confluencia Salud" (provisorio, se cambia en `src/config/sitio.ts`). Neuquén está en la confluencia de los ríos Limay y Neuquén.
- **Isologotipo:** dos cauces que corren juntos antes de unirse.
- **Paleta:** turquesa del río Limay como color principal, arena de las bardas solo como acento decorativo y rojo reservado para urgencias. Todos los pares de texto cumplen contraste WCAG AA (4,5:1 o más) en claro y oscuro.
- **Tipografía:** Atkinson Hyperlegible Next, diseñada por el Braille Institute para lectores con baja visión. Se sirve desde el proyecto (licencia OFL), así no depende de Google Fonts.
- **Base de lectura:** texto de 17 px con interlineado 1,6, botones de al menos 44 px de alto y foco de teclado siempre visible.

**Por qué.** Un sitio de salud lo usan personas mayores y personas con baja visión; la legibilidad es parte de la funcionalidad. Se evita la estética genérica de "clínica" (azul y blanco con fotos de stock).

**Descartado.** Mantener la paleta gris y la tipografía Geist del template: son neutras y no transmiten nada del dominio.

---

## D-07 · Español en todo el sistema

**Decisión.** Sitio en español rioplatense y panel de Payload en español (i18n con `@payloadcms/translations`), con etiquetas propias en colecciones, campos y bloques. Fechas en formato argentino.

**Por qué.** Quien carga los contenidos es personal administrativo, no programadores.

---

## D-08 · Módulos: cuatro (la consigna pide tres)

| Módulo | Tipo | Qué muestra del CMS o del framework |
|---|---|---|
| Usuarios y roles | Modificado (colección Users del template) | Control de acceso de Payload por colección y por campo |
| Cartilla | Nuevo (Especialidades + Profesionales) | Colecciones, relaciones, validaciones, hooks, páginas de Next.js y un bloque nuevo |
| Novedades de salud | Modificado (colección Posts del template) | Relación con la cartilla, hooks, plugins SEO y búsqueda |
| Turnos online | Nuevo | Server Actions de Next.js, reglas de negocio en hooks, permisos por fila, componente propio en el panel |

Si el tiempo de exposición no alcanza para los cuatro, se prioriza Turnos, Cartilla y Usuarios.

---

## D-09 · Permisos en el servidor, no en la interfaz

**Decisión.** Cuatro roles (admin, editor, recepción, profesional), guardados en el token de sesión (`saveToJWT`). Los permisos se definen en `access` de cada colección (servidor). Ocultar secciones del menú (`admin.hidden`) es solo una comodidad visual.

**Reglas principales.**
- Solo un admin crea usuarios y cambia roles; nadie puede darse roles a sí mismo.
- El primer usuario de una base vacía queda como admin.
- Una profesional ve solo sus turnos: la regla devuelve una condición (`profesional = su ficha`) que Payload agrega a la consulta, así los datos de otros pacientes nunca salen de la base.
- Una profesional solo puede cambiar el estado y las notas de sus turnos, no los datos del paciente (permisos por campo).

---

## D-10 · Turnos: reglas en tres capas y protección contra la doble reserva

**Decisión.**
1. **Formulario (navegador):** solo ofrece días de atención y horarios libres. Es comodidad, no seguridad.
2. **Server Action (servidor):** valida todo lo que llega con zod.
3. **Hook de la colección (servidor):** comprueba que el profesional atienda esa especialidad y ese día, que el horario sea parte de su agenda, que la fecha no haya pasado y que no haya otro turno en ese horario. Corre siempre, venga el turno del sitio o del panel.
4. **Base de datos:** campo oculto `claveAgenda` ("profesional|fecha|hora") con índice único. Si dos personas envían el mismo horario al mismo tiempo, las dos pueden pasar el control del hook, pero la base acepta solo una. En los turnos cancelados la clave queda vacía (NULL), así el horario se puede volver a reservar.

**Por qué.** Todo lo que viene del navegador se puede manipular, y el paso de "buscar si está libre y después guardar" no es atómico.

---

## D-11 · Server Actions en lugar de una API REST pública para turnos

**Decisión.** La API REST de la colección Turnos no admite altas públicas. El formulario usa dos Server Actions de Next.js: `consultarHorarios` (devuelve solo horas libres) y `solicitarTurno`.

**Por qué.** Una API REST abierta permitiría listar turnos o crear pedidos sin pasar por las validaciones del formulario. La Server Action es el único camino para el público y valida todo en el servidor. También evita la interoperabilidad: el formulario llama a funciones del mismo sistema.

---

## D-12 · Fechas de los turnos al mediodía UTC

**Contexto.** Argentina está en UTC−3. Un turno del 2 de octubre guardado como medianoche local queda como 1 de octubre en UTC y puede mostrarse un día antes.

**Decisión.** La fecha se guarda como el día elegido a las 12:00 UTC y la hora aparte, como texto "HH:MM". Las funciones de `utilities/turnos.ts` hacen todos los cálculos en hora de Argentina.

---

## D-13 · Datos de salud: mínimos y protegidos

**Decisión.**
- Consentimiento explícito para usar los datos solo para gestionar el turno (Ley 25.326 de protección de datos personales).
- Solo se piden los datos necesarios; el motivo de consulta es opcional.
- Las notas internas no se muestran al paciente.
- El panel no usa Gravatar, así no se envía el email del personal a un servicio externo.
- Campo trampa invisible contra bots en el formulario de turnos.
- Aviso visible de que los turnos online no son un canal de urgencias, con el teléfono de guardia.

---

## D-14 · Datos de ejemplo sin internet y solo para admins

**Contexto.** El seed del template descargaba imágenes de GitHub y lo podía ejecutar cualquier usuario logueado, aunque borra toda la base.

**Decisión.** El seed carga cartilla, novedades, turnos y usuarios de demo sin descargar nada (las portadas se generan con sharp) y solo lo puede ejecutar un admin.

**Por qué.** La demo en clase no puede depender de la red de la facultad, y una operación que borra todo tiene que estar restringida.

---

## D-15 · Migraciones para producción

**Decisión.** En desarrollo Payload sincroniza el esquema solo ("push"). Para producción hay una migración inicial en `src/migrations` que se aplica sola al iniciar (`prodMigrations`).

**Probado:** base vacía → `pnpm build` (aplica la migración) → `pnpm start` → primer usuario → datos de ejemplo → todas las rutas responden.

---

## D-16 · URLs en castellano

**Decisión.** Las novedades se publican en `/novedades` (el template usaba `/posts`) con redirección permanente desde las URLs viejas. Los slugs respetan tildes y eñes ("Clínica médica" → `clinica-medica`); el slugify de Payload las eliminaba (`clnica-mdica`). Las rutas públicas se definen en un solo archivo (`utilities/rutas.ts`).

---

## D-17 · Correcciones al template

Problemas del template que aparecieron durante el trabajo y se corrigieron (cada uno en su commit):

| Problema | Corrección |
|---|---|
| `pnpm lint` fallaba con eslint-config-next 16 | Configuración flat nativa |
| La paginación estática calculaba 10 notas por página y mostraba 12 | Misma constante para las dos cosas |
| El teléfono del formulario de contacto era un campo numérico (perdía el 0 y los guiones) | Campo de texto |
| El seed (que borra la base) lo podía ejecutar cualquier usuario | Solo admin |
| Publicar una nota no actualizaba el inicio ni el listado | Se revalidan `/` y `/novedades` |
| El editor no tenía listas | Listas con y sin números |
| El encabezado copiaba el tema al cargar y quedaba desactualizado al cambiarlo | Hereda el tema global |
| Las tarjetas usaban refs y eventos de mouse para ser clickeables | Enlace estirado en CSS, sin JavaScript |
