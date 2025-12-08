import React, { createContext, useState, ReactNode, useContext, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

export interface Location {
  id: string
  name: string  
  latitude: number
  longitude: number
}

interface LocationsContextData {
  locations: Location[]
  addLocation: (loc: Location) => void
  removeLocation: (id: string) => void
}

const LocationsContext = createContext<LocationsContextData | undefined>(undefined)

export function LocationsProvider({ children }: { children: ReactNode }) {
  const [locations, setLocations] = useState<Location[]>([])

  useEffect(() => {
    AsyncStorage.getItem('@app:locations').then(json => {
      if (json) setLocations(JSON.parse(json))
    })
  }, [])

  useEffect(() => {
    AsyncStorage.setItem('@app:locations', JSON.stringify(locations))
  }, [locations])

  const addLocation = (loc: Location) => {
    if (!locations.some(l => l.id === loc.id)) {
      setLocations(prev => [...prev, loc])
    }
  }

  const removeLocation = (id: string) => {
    setLocations(prev => prev.filter(l => l.id !== id))
  }

  return (
    <LocationsContext.Provider value={{ locations, addLocation, removeLocation }}>
      {children}
    </LocationsContext.Provider>
  )
}

export function useLocations() {
  const context = useContext(LocationsContext)
  if (!context) throw new Error('useLocations must be used within LocationsProvider')
  return context
}
