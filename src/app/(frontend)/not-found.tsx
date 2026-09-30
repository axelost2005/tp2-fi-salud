import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="container py-28">
      <div className="prose max-w-none">
        <h1 style={{ marginBottom: 0 }}>404</h1>
        <p className="mb-4">No encontramos la página que buscás. Puede que el enlace esté mal escrito o que la página ya no exista.</p>
      </div>
      <Button asChild variant="default">
        <Link href="/">Volver al inicio</Link>
      </Button>
    </div>
  )
}
