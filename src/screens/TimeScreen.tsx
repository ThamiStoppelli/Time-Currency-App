import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Modal } from 'react-native'
import { useLocations } from '../context/LocationsContext'
import Toggle from '../components/Toggle'
import { PlusIcon } from '../assets/svgs/plus-icon'
import { TimeCard } from '../components/TimeCard'

interface TimezoneItem {
  zone: string
  datetime: string
}

type CityOption = {
  id: string
  city: string
  country: string
  countryCode: string
  timezone: string
  gmtOffsetLabel: string
  offsetMinutes: number
}

type LocationItem = {
  id: string
  name: string
  latitude: number
  longitude: number
}

//mock
const MOCK_CITIES: CityOption[] = [
  {
    id: "nyc",
    city: "New York",
    country: "USA",
    countryCode: "US",
    timezone: "America/New_York",
    gmtOffsetLabel: "GMT-5",
    offsetMinutes: -5 * 60,
  },
  {
    id: "la",
    city: "Los Angeles",
    country: "USA",
    countryCode: "US",
    timezone: "America/Los_Angeles",
    gmtOffsetLabel: "GMT-8",
    offsetMinutes: -8 * 60,
  },
  {
    id: "fortaleza",
    city: "Fortaleza",
    country: "Brazil",
    countryCode: "BR",
    timezone: "America/Fortaleza",
    gmtOffsetLabel: "GMT-3",
    offsetMinutes: -3 * 60,
  },
  {
    id: "london",
    city: "London",
    country: "UK",
    countryCode: "GB",
    timezone: "Europe/London",
    gmtOffsetLabel: "GMT+0",
    offsetMinutes: 0,
  },
  {
    id: "berlin",
    city: "Berlin",
    country: "Germany",
    countryCode: "DE",
    timezone: "Europe/Berlin",
    gmtOffsetLabel: "GMT+1",
    offsetMinutes: 1 * 60,
  },
]

function formatTimeSimple(date: Date, mode24h: boolean): string {
  let hours = date.getHours()
  const minutes = date.getMinutes()

  if (mode24h) {
    const hh = String(hours).padStart(2, "0")
    const mm = String(minutes).padStart(2, "0")
    return `${hh}:${mm}`
  } else {
    const ampm = hours >= 12 ? "PM" : "AM"
    const normalized = hours % 12 || 12
    const hh = String(normalized).padStart(2, "0")
    const mm = String(minutes).padStart(2, "0")
    return `${hh}:${mm} ${ampm}`
  }
}

// encontra meta da cidade pelo timezone salvo no context
function findCityMetaByZone(zone: string): CityOption | undefined {
  return MOCK_CITIES.find((c) => c.timezone === zone)
}

export default function TimeScreen() {
  const { locations, addLocation, removeLocation } = useLocations()

  const [mode24h, setMode24h] = useState(false)
  const [now, setNow] = useState<Date>(new Date())
  const [localZone, setLocalZone] = useState<string | null>(null)
  const [loadingLocal, setLoadingLocal] = useState(true)

  // modal + search 
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [citySearch, setCitySearch] = useState("")

  // 1) pegar timezone do device
  useEffect(() => {
    try {
      const tzUser = Intl.DateTimeFormat().resolvedOptions().timeZone
      setLocalZone(tzUser)
    } catch (e) {
      console.warn("Could not resolve device timezone", e)
      setLocalZone("Local/Device")
    } finally {
      setLoadingLocal(false)
    }
  }, [])

  // 2) atualizar "now" a cada 30s para os horários se manterem atualizados
  useEffect(() => {
    const id = setInterval(() => {
      setNow(new Date())
    }, 30_000)

    return () => clearInterval(id)
  }, [])

  if (loadingLocal) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#705ADF" />
      </View>
    )
  }

  const isPurple = !mode24h;

  // calcular horário UTC a partir do now local
  const utcMillis = now.getTime() + now.getTimezoneOffset() * 60_000

  // Filtro de cidades mockadas no modal
  const filteredCities = MOCK_CITIES.filter((city) => {
    if (!citySearch.trim()) return true
    const q = citySearch.toLowerCase()
    return (
      city.city.toLowerCase().includes(q) ||
      city.country.toLowerCase().includes(q)
    )
  })

  function handleSelectCity(option: CityOption) {
    // compatibilidade com LocationsContext -> usa timezone como name
    if (!locations.some((loc) => loc.name === option.timezone)) {
      addLocation({
        id: option.timezone,
        name: option.timezone,
        latitude: 0,
        longitude: 0,
      })
    }
    setCitySearch("")
    setIsModalVisible(false)
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Current Time</Text>
        <Toggle
          initial={!mode24h}
          onToggle={val => setMode24h(!val)}
          activeColor="#705ADF"
          inactiveColor="#3C3B6E"
          textOn="AM | PM"
          textOff="24 hours"
        />
      </View>
      
      {/* Card da localização atual */}
      {localZone && (
        <TimeCard
          city={localZone.split("/")[1] || "Current"}
          country={localZone.split("/")[0] || "Local"}
          countryCode={"BR"} // mock
          gmtOffset={"Local"}
          timeText={formatTimeSimple(now, mode24h)}
          isLocal
        />
      )}

      <Text style={[styles.title, { marginTop: 16 }]}>Comparison</Text>

      {/* Lista de zonas adicionadas (baseada no LocationsContext) */}
      <FlatList
        data={locations as LocationItem[]}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 32 }}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>Nenhuma zona adicionada</Text>
        )}
        ListFooterComponent={() => (
          <View style={styles.addButtonContainer}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setIsModalVisible(true)}
            >
              <PlusIcon
                size={32}
                bgColor={isPurple ? "#705ADF" : "#3C3B6E"}
              />
            </TouchableOpacity>
          </View>
        )}
        renderItem={({ item }) => {
          const meta = findCityMetaByZone(item.name)

          if (!meta) {
            return (
              <TimeCard
                city={item.name.split("/")[1] ?? item.name}
                country={item.name.split("/")[0] ?? ""}
                countryCode={""}
                gmtOffset={""}
                timeText={"--:--"}
                onRemove={() => removeLocation(item.name as any)}
              />
            )
          }

          const cityUtcMillis = utcMillis + meta.offsetMinutes * 60_000
          const cityDate = new Date(cityUtcMillis)
          const timeText = formatTimeSimple(cityDate, mode24h)

          return (
            <TimeCard
              city={meta.city}
              country={meta.country}
              countryCode={meta.countryCode}
              gmtOffset={meta.gmtOffsetLabel}
              timeText={timeText}
              onRemove={() => removeLocation(item.name as any)}
            />
          )
        }}
      />

      {/* Modal de busca de cidades */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add city</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Type city or country"
              value={citySearch}
              onChangeText={setCitySearch}
            />

            <FlatList
              data={filteredCities}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleSelectCity(item)}
                >
                  <Text style={styles.modalItemText}>
                    {item.country}, {item.city} ({item.gmtOffsetLabel})
                  </Text>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16,
    margin: 6 
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { 
    fontSize: 18, 
    marginBottom: 12,
    marginTop: 20
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    marginVertical: 24,
  },
  addButtonContainer: {
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  addButton: {
    padding: 8,
    borderRadius: 999,
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#705ADF",
    fontWeight: "600",
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "70%",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  modalInput: {
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 8,
    marginBottom: 12,
    borderRadius: 6,
  },
  modalItem: {
    paddingVertical: 8,
  },
  modalItemText: {
    fontSize: 14,
  },
  modalCloseButton: {
    marginTop: 12,
    alignSelf: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#705ADF",
  },
  modalCloseButtonText: {
    color: "#FFF",
    fontWeight: "500",
  },
})

/*
Usa useCurrentLocation() para pegar coords do dispositivo.

Chama fetchTimeForZone(timezone) para obter hora atual local.

Mapeia cada “location extra” (armazenada no Context) para buscar fetchTimeForZone(loc.name).
 */