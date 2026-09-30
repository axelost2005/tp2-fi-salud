import type { RequiredDataFromCollectionSlug } from 'payload'

import { lexical } from './salud/lexical'

/**
 * Formulario de contacto de ejemplo (plugin Form Builder). Cambios respecto
 * del template: textos en español, "Asunto" como lista desplegable y el
 * teléfono como texto (el template lo pedía como número y perdía el 0 inicial
 * y los guiones).
 */
export const contactForm: RequiredDataFromCollectionSlug<'forms'> = {
  title: 'Formulario de contacto',
  submitButtonLabel: 'Enviar mensaje',
  confirmationType: 'message',
  confirmationMessage: lexical([
    { tipo: 'h2', texto: 'Recibimos tu mensaje' },
    { tipo: 'p', texto: 'Te respondemos dentro de las 48 horas hábiles. Gracias por escribirnos.' },
  ]),
  emails: [
    {
      emailFrom: '"Confluencia Salud" <no-responder@confluenciasalud.com.ar>',
      emailTo: '{{email}}',
      subject: 'Recibimos tu mensaje',
      message: lexical([
        {
          tipo: 'p',
          texto: 'Hola {{nombre}}: recibimos tu consulta y te vamos a responder dentro de las 48 horas hábiles.',
        },
      ]),
    },
  ],
  fields: [
    { name: 'nombre', blockName: 'nombre', blockType: 'text', label: 'Nombre y apellido', required: true, width: 50 },
    { name: 'email', blockName: 'email', blockType: 'email', label: 'Email', required: true, width: 50 },
    { name: 'telefono', blockName: 'telefono', blockType: 'text', label: 'Teléfono', required: false, width: 50 },
    {
      name: 'asunto',
      blockName: 'asunto',
      blockType: 'select',
      label: 'Asunto',
      required: true,
      width: 50,
      options: [
        { label: 'Consulta administrativa', value: 'administrativa' },
        { label: 'Obras sociales y facturación', value: 'obras-sociales' },
        { label: 'Sugerencias o reclamos', value: 'sugerencias' },
        { label: 'Otro', value: 'otro' },
      ],
    },
    { name: 'mensaje', blockName: 'mensaje', blockType: 'textarea', label: 'Mensaje', required: true, width: 100 },
  ],
}
