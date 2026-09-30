import { HeaderClient } from './Component.client'
import { TopBar } from './TopBar'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

export async function Header() {
  const [headerData, institucion] = await Promise.all([
    getCachedGlobal('header', 1)(),
    getCachedGlobal('institucion', 0)(),
  ])

  return (
    <>
      <TopBar institucion={institucion} />
      <HeaderClient data={headerData} />
    </>
  )
}
