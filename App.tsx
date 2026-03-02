import React from 'react'
import BottomTabs from './src/navigation/BottomTabs'
import { LocationsProvider } from './src/context/LocationsContext'
import { SyncedSelectionProvider } from './src/context/SyncedSelectionContext'

export default function App() {
  return (
    <SyncedSelectionProvider>
      <LocationsProvider>
        <BottomTabs />
      </LocationsProvider>
    </SyncedSelectionProvider>
  )
}
