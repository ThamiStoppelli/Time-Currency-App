import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react"

export type BasicLocation = {
  city?: string
  country: string
  countryCode: string
  // lat?: number
  // lon?: number
}

type SourceScreen = "weather" | "time" | null

type SyncedSelectionContextValue = {
  syncedLocations: BasicLocation[]
  sourceScreen: SourceScreen
  version: number
  setSynced: (source: Exclude<SourceScreen, null>, locations: BasicLocation[]) => void
}

const SyncedSelectionContext =
  createContext<SyncedSelectionContextValue | undefined>(undefined)

export function SyncedSelectionProvider({ children }: { children: ReactNode }) {
  const [syncedLocations, setSyncedLocations] = useState<BasicLocation[]>([])
  const [sourceScreen, setSourceScreen] = useState<SourceScreen>(null)
  const [version, setVersion] = useState(0);

  function setSynced(source: Exclude<SourceScreen, null>, locations: BasicLocation[]) {
    const seen = new Set<string>()
    const unique = locations.filter(loc => {
      // const key = `${loc.countryCode}-${loc.city}`
      const key = `${loc.countryCode}-${(loc.city ?? "").toLowerCase().trim()}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    setSyncedLocations(unique)
    setSourceScreen(source)
    setVersion(v => v + 1)
  }

  return (
    <SyncedSelectionContext.Provider
      value={{ 
        syncedLocations,
        sourceScreen,
        version, 
        setSynced
      }}
    >
      {children}
    </SyncedSelectionContext.Provider>
  )
}

export function useSyncedSelection() {
  const ctx = useContext(SyncedSelectionContext)
  if (!ctx) {
    throw new Error("useSyncedSelection must be used inside SyncedSelectionProvider")
  }
  return ctx
}
