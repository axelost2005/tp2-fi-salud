'use client'

import type { Theme } from '@/providers/Theme/types'

import React, { createContext, useCallback, use, useState } from 'react'

export interface ContextType {
  headerTheme?: Theme | null
  setHeaderTheme: (theme: Theme | null) => void
}

const initialContext: ContextType = {
  headerTheme: undefined,
  setHeaderTheme: () => null,
}

const HeaderThemeContext = createContext(initialContext)

export const HeaderThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Sin valor inicial: el encabezado hereda el tema global salvo que una portada lo cambie.
  // (El template copiaba el tema del documento y quedaba desactualizado al cambiar de tema.)
  const [headerTheme, setThemeState] = useState<Theme | undefined | null>(undefined)

  const setHeaderTheme = useCallback((themeToSet: Theme | null) => {
    setThemeState(themeToSet)
  }, [])

  return <HeaderThemeContext value={{ headerTheme, setHeaderTheme }}>{children}</HeaderThemeContext>
}

export const useHeaderTheme = (): ContextType => use(HeaderThemeContext)
