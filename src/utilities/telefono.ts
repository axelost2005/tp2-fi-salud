/** Convierte "(0299) 555-0100" en "tel:+542995550100" para que sea tocable en el celular. */
export const telHref = (telefono?: string | null) => {
  const digitos = (telefono || '').replace(/\D/g, '').replace(/^0/, '')
  return digitos ? `tel:+54${digitos}` : undefined
}
