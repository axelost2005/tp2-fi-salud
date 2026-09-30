'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import React, { useState } from 'react'

import type { Theme } from './types'

import { useTheme } from '..'
import { themeLocalStorageKey } from './types'

export const ThemeSelector: React.FC = () => {
  const { setTheme } = useTheme()
  const [value, setValue] = useState('')

  const onThemeChange = (themeToSet: Theme & 'auto') => {
    if (themeToSet === 'auto') {
      setTheme(null)
      setValue('auto')
    } else {
      setTheme(themeToSet)
      setValue(themeToSet)
    }
  }

  React.useEffect(() => {
    const preference = window.localStorage.getItem(themeLocalStorageKey)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza con localStorage (sistema externo) al montar
    setValue(preference ?? 'auto')
  }, [])

  return (
    <Select onValueChange={onThemeChange} value={value}>
      <SelectTrigger
        aria-label="Elegir tema de color"
        className="w-auto gap-2 border-none bg-transparent pl-0 text-inherit md:pl-3 [&_svg]:opacity-80"
      >
        <SelectValue placeholder="Tema" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="auto">Automático</SelectItem>
        <SelectItem value="light">Claro</SelectItem>
        <SelectItem value="dark">Oscuro</SelectItem>
      </SelectContent>
    </Select>
  )
}
