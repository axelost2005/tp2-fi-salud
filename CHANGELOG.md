# Registro de cambios

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). Cada versión corresponde a una integración en `develop`; la 1.0.0 es la entrega del TP2.

## [1.0.0] · 02/10/2026 · Entrega del TP2

### Agregado
- Documentación: README, registro de decisiones, cambios respecto del template, pruebas ejecutadas y capturas antes/después.
- Pruebas automáticas: 17 unitarias, 9 de integración y 7 de punta a punta.
- Informe en PDF (17 páginas) con su generador, y tablero de tareas en Linear.
- Datos de la entrega en el informe: legajos, cátedra y enlaces al repositorio y al tablero.

### Corregido
- Instalación con pnpm 11: los permisos de scripts pasan a `pnpm-workspace.yaml`.
- Tipos de las pruebas de integración de turnos.

## [0.6.0] · Panel por rol
### Cambiado
- Cada rol ve en el menú del panel solo lo que gestiona, y la bienvenida muestra sus tareas.
### Corregido
- El editor de novedades no podía abrir notas con listas.
- Fechas de publicación en formato argentino; singular y plural en el tablero de turnos.

## [0.5.1] · Producción y concurrencia
### Agregado
- Migración inicial de PostgreSQL, aplicada sola en producción (`prodMigrations`).
### Corregido
- Índice único de agenda: dos pedidos simultáneos para el mismo horario ya no pueden guardarse los dos.
- El inicio y el listado de novedades se actualizan al publicar una nota.

## [0.5.0] · Módulo Turnos online
### Agregado
- Colección Turnos con reglas de agenda en el servidor y permisos por rol (una profesional ve solo su agenda).
- Página `/turnos` con formulario en cinco pasos y Server Actions validadas con zod.
- Tablero "Turnos de hoy" en el inicio del panel.
- Botones "Pedir turno" en la cartilla.
- Contenido de ejemplo de salud (inicio, contacto, menús, usuarios de demo) sin depender de internet.
### Seguridad
- La carga de datos de ejemplo (borra la base) solo la puede ejecutar un admin.

## [0.4.0] · Módulo Novedades de salud
### Cambiado
- La colección Posts pasa a ser Novedades: `/novedades`, con redirección desde `/posts`.
### Agregado
- "Revisado por" (relación con la cartilla), tiempo de lectura automático y aviso médico.
- Notas de ejemplo con portadas generadas.
### Corregido
- La paginación estática calculaba 10 notas por página y mostraba 12.

## [0.3.0] · Módulo Cartilla
### Agregado
- Colecciones Especialidades y Profesionales (matrícula validada, agenda de atención, obras sociales).
- Páginas `/especialidades`, `/especialidades/[slug]` y `/profesionales` con filtros que funcionan sin JavaScript.
- Bloque "Especialidades destacadas".
### Corregido
- Slugs en castellano: se conservan las letras con tilde y eñe.

## [0.2.0] · Usuarios y roles
### Agregado
- Roles admin, editor, recepción y profesional, con permisos en el servidor.
- El primer usuario queda como admin; nadie puede asignarse roles.

## [0.1.0] · Tema "Confluencia"
### Cambiado
- Paleta, tipografía, logo, encabezado, pie, portada, tarjetas y botones.
- Sitio y panel en español.
### Agregado
- Global "Datos institucionales" y barra con el teléfono de guardia.
### Corregido
- `pnpm lint` no funcionaba con eslint-config-next 16.

## [0.0.1] · Base
- Template *website* de Payload 3.90.2 sin modificar (tag `template-original`), con PostgreSQL.
