// App.tsx
import React from 'react'
import BottomTabs from './src/navigation/BottomTabs'
import { LocationsProvider } from './src/context/LocationsContext'

export default function App() {
  return (
    <LocationsProvider>
      <BottomTabs />
    </LocationsProvider>
  )
}
