# Cambios respecto del template

Consigna 2.b: lista de las modificaciones hechas al template *website* de Payload. El template original está en el tag `template-original` y sus capturas en `docs/capturas/antes`; la solución, en `docs/capturas/despues`.

Para ver todos los archivos modificados: `git diff template-original main --stat`.

## Estilos e identidad

| Elemento | Template original | Solución | Archivos |
|---|---|---|---|
| Paleta | Grises neutros | Paleta "Confluencia": turquesa (principal), arena (acento), rojo (urgencias) y verdes grisáceos; claro y oscuro con contraste AA | `src/app/(frontend)/globals.css` |
| Tipografía | Geist | Atkinson Hyperlegible Next (legibilidad para baja visión), autoalojada | `src/app/(frontend)/fonts.ts`, `fonts/` |
| Tamaño de texto | 16 px | 17 px con interlineado 1,6 | `globals.css` |
| Logo | Logo de Payload (imagen externa) | Isologotipo propio en SVG + nombre en texto | `src/components/Logo/` |
| Favicon e imagen para redes | De Payload | Propios | `public/favicon.*`, `public/og-confluencia.png` |
| Botones | Rectangulares, 40 px | Píldora, 44 px mínimo, foco visible | `src/components/ui/button.tsx` |
| Tarjetas | Imagen de alto variable, categorías en mayúsculas, "No image" | Imagen 16:10, categorías como etiquetas, isotipo si no hay foto, tiempo de lectura | `src/components/Card/` |
| Textos enriquecidos | Colores fijos | Atados a los tokens del tema | `tailwind.config.mjs` |
| Animación | No había | Los ríos del inicio se dibujan una sola vez (respeta "reducir movimiento") | `globals.css`, `RiosIlustracion.tsx` |

## Estructura y componentes

| Elemento | Template original | Solución | Archivos |
|---|---|---|---|
| Barra superior | No existía | Teléfono de guardia 24 h siempre visible, horario y dirección | `src/Header/TopBar.tsx` |
| Encabezado | Links en una fila, sin versión móvil | Menú de escritorio, botón destacado "Pedir turno" configurable y menú accesible para celulares | `src/Header/` |
| Pie de página | Logo y links | Datos de contacto, enlaces, selector de tema y aviso de datos ficticios | `src/Footer/Component.tsx` |
| Portadas | Alto, medio y bajo impacto (con foto) | Nueva portada "Confluencia" (texto + ilustración de marca) | `src/heros/Confluencia/` |
| Encabezado de nota | Título blanco sobre la foto | Título sobre fondo liso, datos de autoría y lectura, foto debajo | `src/heros/PostHero/` |
| Datos de contacto | Escritos en el código | Global "Datos institucionales" editable desde el panel | `src/globals/Institucion/` |
| Bloques | CTA, contenido, imagen, listado, formulario | + "Especialidades destacadas" | `src/blocks/EspecialidadesDestacadas/` |
| Accesibilidad | Sin cambios | Enlace "Saltar al contenido", `lang="es"`, texto alternativo obligatorio en imágenes | `layout.tsx`, `collections/Media.ts` |

## Contenido e idioma

| Elemento | Template original | Solución |
|---|---|---|
| Idioma del sitio | Inglés | Español rioplatense |
| Idioma del panel | Inglés | Español, con etiquetas propias en colecciones, campos y bloques |
| Fechas | MM/DD/AAAA | "12 de agosto de 2026" en el sitio y dd/MM/aaaa en el panel |
| URLs | `/posts`, slugs sin tildes (`clnica-mdica`) | `/novedades` (con redirección desde `/posts`), `clinica-medica` |
| Contenido de ejemplo | Notas sobre tecnología y finanzas, imágenes descargadas de GitHub | Cartilla, notas de salud, turnos y usuarios de demo, generados sin internet |
| Panel | Bienvenida para desarrolladores | Bienvenida y menú según el rol, tablero "Turnos de hoy", logo propio |
