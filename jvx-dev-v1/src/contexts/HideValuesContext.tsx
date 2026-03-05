import { createContext, useContext, useState, useCallback } from "react"

interface HideValuesContextType {
  valuesHidden: boolean
  toggleValues: () => void
  /** Retorna "••••••" se valores estiverem ocultos, senão retorna o valor original */
  sensitive: (value: string | number) => string
}

const HideValuesContext = createContext<HideValuesContextType>({
  valuesHidden: false,
  toggleValues: () => {},
  sensitive: (v) => String(v),
})

export function HideValuesProvider({ children }: { children: React.ReactNode }) {
  const [valuesHidden, setValuesHidden] = useState(false)

  const toggleValues = useCallback(() => {
    setValuesHidden(prev => !prev)
  }, [])

  const sensitive = useCallback(
    (value: string | number) => (valuesHidden ? "••••••" : String(value)),
    [valuesHidden]
  )

  return (
    <HideValuesContext.Provider value={{ valuesHidden, toggleValues, sensitive }}>
      {children}
    </HideValuesContext.Provider>
  )
}

export const useHideValues = () => {
  const context = useContext(HideValuesContext)
  if (!context) throw new Error("useHideValues must be used within HideValuesProvider")
  return context
}
