import React, { useEffect, useState } from "react"
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  StyleSheet,
} from "react-native"

import { WeatherCard } from "../components/WeatherCard"
import { PlusIcon } from "../assets/svgs/plus-icon"
import { CloseIcon } from "../assets/svgs/close-icon"
import { SyncIcon } from "../assets/svgs/sync-icon"
import { useCurrentLocation } from "../hooks/useLocation"
import { fetchWeather, WeatherData } from "../services/weatherApi"
import { searchCities, GeoCityResult } from "../services/geocodingApi"
import { useSyncedSelection, BasicLocation } from "../context/SyncedSelectionContext"
import { getJSON, setJSON } from "../storage/storage"

type SavedCity = {
  id: string
  city: string
  country: string
  countryCode: string
  lat: number
  lon: number
}

const INITIAL_COMPARISON_CITIES: SavedCity[] = [
  {
    id: "berlin-52.52-13.405",
    city: "Berlin",
    country: "Germany",
    countryCode: "DE",
    lat: 52.52,
    lon: 13.405,
  },
  {
    id: "nyc-40.7128--74.006",
    city: "New York",
    country: "USA",
    countryCode: "US",
    lat: 40.7128,
    lon: -74.006,
  },
]

const POPULAR_CITIES: SavedCity[] = [
  {
    id: "london-51.5074--0.1278",
    city: "London",
    country: "United Kingdom",
    countryCode: "GB",
    lat: 51.5074,
    lon: -0.1278,
  },
  {
    id: "paris-48.8566-2.3522",
    city: "Paris",
    country: "France",
    countryCode: "FR",
    lat: 48.8566,
    lon: 2.3522,
  },
  {
    id: "tokyo-35.6762-139.6503",
    city: "Tokyo",
    country: "Japan",
    countryCode: "JP",
    lat: 35.6762,
    lon: 139.6503,
  },
  {
    id: "lisbon-38.7223--9.1393",
    city: "Lisbon",
    country: "Portugal",
    countryCode: "PT",
    lat: 38.7223,
    lon: -9.1393,
  },
  {
    id: "sydney--33.8688-151.2093",
    city: "Sydney",
    country: "Australia",
    countryCode: "AU",
    lat: -33.8688,
    lon: 151.2093,
  },
  {
    id: "saopaulo--23.5505--46.6333",
    city: "São Paulo",
    country: "Brazil",
    countryCode: "BR",
    lat: -23.5505,
    lon: -46.6333,
  },
  {
    id: "mexicocity-19.4326--99.1332",
    city: "Mexico City",
    country: "Mexico",
    countryCode: "MX",
    lat: 19.4326,
    lon: -99.1332,
  },
  {
    id: "capetown--33.9249-18.4241",
    city: "Cape Town",
    country: "South Africa",
    countryCode: "ZA",
    lat: -33.9249,
    lon: 18.4241,
  },
]

const STORAGE_WEATHER_CITIES = "weather:cities:v1"

export default function WeatherScreen() {
  const { coords, error: locError } = useCurrentLocation()
  const [hydrated, setHydrated] = useState(false)

  const [loadingLocal, setLoadingLocal] = useState(true)
  const [localCity, setLocalCity] = useState<SavedCity | null>(null)
  
  const [cities, setCities] = useState<SavedCity[]>(INITIAL_COMPARISON_CITIES)

  const [weatherById, setWeatherById] = useState<Record<string, WeatherData | null>>({})
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set())

  const { syncedLocations, sourceScreen, version, setSynced } = useSyncedSelection()

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [search, setSearch] = useState("")
  const [searchResults, setSearchResults] = useState<SavedCity[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  // hydrate
  useEffect(() => {
    let cancelled = false
    async function hydrate() {
      const saved = await getJSON<SavedCity[]>(STORAGE_WEATHER_CITIES, INITIAL_COMPARISON_CITIES)
      if (!cancelled) {
        setCities(saved)
        setHydrated(true)
      }
    }
    hydrate()
    return () => { cancelled = true }
  }, [])

  // save cities
  useEffect(() => {
    if (!hydrated) return
    setJSON(STORAGE_WEATHER_CITIES, cities)
  }, [hydrated, cities])

  useEffect(() => {
    let cancelled = false
    async function init() {
      try {
        const tzUser = Intl.DateTimeFormat().resolvedOptions().timeZone
        const cityPart = tzUser?.split("/").pop()?.replaceAll("_", " ")
        if (!cityPart) throw new Error("No city part from timezone")

        const results = await searchCities(cityPart)
        const first = results[0]
        if (!first) throw new Error("No geocoding results")

        const next: SavedCity = {
          id: `${first.name}-${first.latitude}-${first.longitude}`,
          city: first.name,
          country: first.country,
          countryCode: first.country_code,
          lat: first.latitude,
          lon: first.longitude,
        }

        if (!cancelled) setLocalCity(next)
      } catch (e) {
        console.warn("Could not resolve local city for weather", e)
        if (!cancelled) setLocalCity(null)
      } finally {
        if (!cancelled) setLoadingLocal(false)
      }
    }

    init()
    return () => { cancelled = true }
  }, [])

  function filterOutExisting(list: SavedCity[]): SavedCity[] {
    const allIds = new Set<string>([
      ...(localCity ? [localCity.id] : []),
      ...cities.map(c => c.id),
    ])
    return list.filter(c => !allIds.has(c.id))
  }

  async function loadWeatherForCity(city: SavedCity) {
    setLoadingIds(prev => {
      const copy = new Set(prev)
      copy.add(city.id)
      return copy
    })

    try {
      const data = await fetchWeather(city.lat, city.lon)
      setWeatherById(prev => ({
        ...prev,
        [city.id]: data,
      }))
    } catch (err) {
      console.error("Erro ao buscar clima para", city.id, err)
      setWeatherById(prev => ({
        ...prev,
        [city.id]: null,
      }))
    } finally {
      setLoadingIds(prev => {
        const copy = new Set(prev)
        copy.delete(city.id)
        return copy
      })
    }
  }

  useEffect(() => {
    if (localCity) {
      loadWeatherForCity(localCity)
    }
  }, [localCity?.id])

  useEffect(() => {
    cities.forEach(city => {
      if (!weatherById[city.id]) {
        loadWeatherForCity(city)
      }
    })
  }, [cities.map(c => c.id).join(","), weatherById])

  // sync
  useEffect(() => {
    let cancelled = false

    async function applySyncedFromOthers() {
      if (!syncedLocations.length) return
      if (sourceScreen === "weather") return

      const mapped: SavedCity[] = []

      for (const loc of syncedLocations) {
        const query = loc.city ?? loc.country
        if (!query) continue

        try {
          const results = await searchCities(query)
          const best = results[0]
          if (!best) continue

          mapped.push({
            id: `${best.name}-${best.latitude}-${best.longitude}`,
            city: best.name,
            country: best.country,
            countryCode: best.country_code,
            lat: best.latitude,
            lon: best.longitude,
          })
        } catch (e) {
          console.warn("Erro ao aplicar syncedLocations no WeatherScreen", e)
        }
      }

      if (!cancelled && mapped.length > 0) {
        setCities(mapped)
      }
    }

    applySyncedFromOthers()
    return () => { cancelled = true }
  }, [version, syncedLocations, sourceScreen])

  useEffect(() => {
    if (!isModalVisible) return

    if (!search.trim()) {
      setSearchResults([])
      setSearchError(null)
      return
    }

    const timeout = setTimeout(() => {
      loadSearch(search)
    }, 400)

    return () => clearTimeout(timeout)
  }, [search, isModalVisible])

  async function loadSearch(query: string) {
    try {
      setSearchLoading(true)
      setSearchError(null)

      const results = await searchCities(query)

      const mapped: SavedCity[] = results.map((r: GeoCityResult) => ({
        id: `${r.name}-${r.latitude}-${r.longitude}`,
        city: r.name,
        country: r.country,
        countryCode: r.country_code,
        lat: r.latitude,
        lon: r.longitude,
      }))

      const filtered = filterOutExisting(mapped)
      setSearchResults(filtered)
    } catch (err) {
      console.error("Erro ao buscar cidades", err)
      setSearchError("Error searching cities. Try again.")
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }

  function handleRemoveCity(id: string) {
    setCities(prev => prev.filter(c => c.id !== id))
  }

  function handleAddCity(city: SavedCity) {
    setCities(prev => [...prev, city])
    setIsModalVisible(false)
    setSearch("")
    setSearchResults([])
    loadWeatherForCity(city)
  }

  function renderWeatherCard(meta: SavedCity, isLocal?: boolean) {
    const weather = weatherById[meta.id]
    const loading = loadingIds.has(meta.id)

    const temp = weather?.temp ?? NaN
    const condition = loading
      ? "Loading..."
      : weather?.description ?? "No data"
    const icon = weather?.icon ?? "☀️"

    return (
      <WeatherCard
        isLocal={isLocal}
        city={meta.city}
        country={meta.country}
        countryCode={meta.countryCode}
        temperature={temp}
        feelsLike={undefined}
        condition={condition}
        icon={icon}
        rainChance={weather?.rainChance}
        uvIndex={weather?.uvIndex}
        windKph={weather?.windKph}
        onRemove={!isLocal ? () => handleRemoveCity(meta.id) : undefined}
        onPressDetails={undefined}
      />
    )
  }

  if (locError) {
    return (
      <View style={styles.centered}>
        <Text>{locError}</Text>
      </View>
    )
  }

  if (loadingLocal || !localCity || !hydrated) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#705ADF" />
      </View>
    )
  }

  const modalListData = search.trim()
    ? searchResults
    : filterOutExisting(POPULAR_CITIES)

  const isPurple = true // celcius | farenheit

  function handleSyncWithApp() {
    const toSync = cities.map(c => ({
      city: c.city,
      country: c.country,
      countryCode: c.countryCode,
    }))
    setSynced("weather", toSync)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Current Weather</Text>
      {renderWeatherCard(localCity, true)}

      <View style={styles.comparisonHeaderRow}>
        <Text style={styles.sectionTitle}>Comparison</Text>

        <TouchableOpacity
          style={styles.syncButton}
          onPress={handleSyncWithApp}
        >
          <SyncIcon size={14} />
          <Text style={styles.syncButtonText}>Sync</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={cities}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 32 }}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>Nenhuma cidade adicionada</Text>
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
        renderItem={({ item }) => renderWeatherCard(item)}
      />

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* <Text style={styles.modalTitle}>Add city</Text> */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add city</Text>

              <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.modalXButton}>
                <CloseIcon size={18} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Search by city or country"
              value={search}
              onChangeText={setSearch}
            />

            {searchLoading && (
              <View style={{ paddingVertical: 8 }}>
                <ActivityIndicator size="small" color="#705ADF" />
              </View>
            )}

            {searchError && (
              <Text style={{ color: "red", marginBottom: 8 }}>{searchError}</Text>
            )}

            <FlatList
              data={modalListData}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleAddCity(item)}
                >
                  <Text style={styles.modalItemText}>
                    {item.country}, {item.city}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                !searchLoading
                  ? () => (
                      <Text style={{ color: "#666", marginTop: 8 }}>
                        {search.trim()
                          ? `No results for "${search}"`
                          : "All suggested cities are already added."}
                      </Text>
                    )
                  : null
              }
            />

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Done</Text>
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
    margin: 6,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
    marginTop: 20,
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
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    // marginBottom: 12,
  },
  modalXButton: {
    padding: 8,
    borderRadius: 999,
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
    comparisonHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    marginBottom: 4,
  },
  syncButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#705ADF",
  },
  syncButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 12,
  },
})
