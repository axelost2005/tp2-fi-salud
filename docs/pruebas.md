# Pruebas ejecutadas

Registro de las pruebas automáticas y manuales. Última ejecución: 30/09/2026, sobre la base de desarrollo con los datos de ejemplo.

## Automáticas

| Tipo | Comando | Qué prueba | Resultado |
|---|---|---|---|
| Unitarias | `pnpm test:unit` | Reglas de agenda (horarios, días, fechas en hora de Argentina), código de turno, textos de la cartilla, slugs y rutas. No necesita base. | 17 de 17 |
| Integración | `pnpm test:int` | Con la Local API de Payload: turno válido, horario fuera de agenda, día sin atención, doble reserva, cancelar libera el horario, una profesional ve solo sus turnos, sin sesión no se leen turnos, una profesional no puede cambiar datos del paciente. | 9 de 9 |
| Punta a punta | `pnpm test:e2e` | Con Playwright en un navegador real: inicio, filtros de la cartilla, redirección de `/posts`, pedido de turno completo (con error de consentimiento), panel en español, listado de turnos, alta de página. | 7 de 7 |
| Tipos | `npx tsc --noEmit` | Todo el proyecto con TypeScript estricto | Sin errores |
| Estilo | `pnpm lint` | ESLint | 0 errores (4 avisos en archivos del template) |

Las pruebas de integración y de punta a punta necesitan la base de desarrollo con los datos de ejemplo cargados; las de punta a punta, además, el servidor corriendo (`pnpm dev`).

## Manuales

| Prueba | Resultado |
|---|---|
| Un anónimo intenta crear o listar turnos por la API REST | 403 en los dos casos |
| Recepción lista turnos | Ve los 11 turnos de ejemplo |
| Una profesional lista turnos | Ve solo los 5 suyos |
| Una profesional edita un turno ajeno | 403 |
| Una profesional cambia estado y nombre del paciente de un turno propio | Cambia el estado; el nombre queda igual |
| Un editor intenta crear un usuario o darse rol admin | 403 / el rol no cambia |
| Un editor lee los mensajes de contacto | 403 |
| Un anónimo edita los datos institucionales | 403 |
| Recepción ejecuta la carga de datos de ejemplo | 403 (solo admin) |
| 8 pedidos simultáneos para el mismo horario | 1 aceptado, 7 rechazados |
| Actualizar a mano una clave de agenda duplicada en PostgreSQL | La base la rechaza (índice único) |
| Instalación desde cero en producción: base vacía → build → start → primer usuario → datos de ejemplo | Migración aplicada, primer usuario admin, todas las rutas 200 |
| Formulario de turnos con DNI inválido y sin consentimiento | Errores junto a cada campo, sin perder lo escrito ni lo elegido |
| El horario recién reservado se vuelve a ofrecer | No |
| Sitio en celular (390 px), modo oscuro y menú móvil | Correcto (capturas en `docs/capturas/despues`) |
