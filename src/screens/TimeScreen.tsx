import React, { useEffect, useState } from "react"
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Modal,
} from "react-native"
import Toggle from "../components/Toggle"
import { PlusIcon } from "../assets/svgs/plus-icon"
import { TimeCard } from "../components/TimeCard"
import { searchCities, GeoCityResult } from "../services/geocodingApi"

type TimeCity = {
  id: string
  city: string
  country: string
  countryCode: string
  timezone: string
}

const INITIAL_COMPARISON_CITIES: TimeCity[] = [
  {
    id: "nyc-America/New_York",
    city: "New York",
    country: "USA",
    countryCode: "US",
    timezone: "America/New_York",
  },
  {
    id: "la-America/Los_Angeles",
    city: "Los Angeles",
    country: "USA",
    countryCode: "US",
    timezone: "America/Los_Angeles",
  },
  {
    id: "berlin-Europe/Berlin",
    city: "Berlin",
    country: "Germany",
    countryCode: "DE",
    timezone: "Europe/Berlin",
  },
]

const POPULAR_TIME_CITIES: TimeCity[] = [
  {
    id: "london-Europe/London",
    city: "London",
    country: "United Kingdom",
    countryCode: "GB",
    timezone: "Europe/London",
  },
  {
    id: "lisbon-Europe/Lisbon",
    city: "Lisbon",
    country: "Portugal",
    countryCode: "PT",
    timezone: "Europe/Lisbon",
  },
  {
    id: "tokyo-Asia/Tokyo",
    city: "Tokyo",
    country: "Japan",
    countryCode: "JP",
    timezone: "Asia/Tokyo",
  },
  {
    id: "sydney-Australia/Sydney",
    city: "Sydney",
    country: "Australia",
    countryCode: "AU",
    timezone: "Australia/Sydney",
  },
  {
    id: "saopaulo-America/Sao_Paulo",
    city: "São Paulo",
    country: "Brazil",
    countryCode: "BR",
    timezone: "America/Sao_Paulo",
  },
  {
    id: "mexicocity-America/Mexico_City",
    city: "Mexico City",
    country: "Mexico",
    countryCode: "MX",
    timezone: "America/Mexico_City",
  },
  {
    id: "capetown-Africa/Johannesburg",
    city: "Cape Town",
    country: "South Africa",
    countryCode: "ZA",
    timezone: "Africa/Johannesburg",
  },
]

function formatTimeForZone(zone: string, mode24h: boolean, now: Date): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
      hour12: !mode24h,
      timeZone: zone,
    }).format(now)
  } catch {
    return "--:--"
  }
}

function offsetLabelForZone(zone: string, now: Date): string {
  try {
    const utc = new Date(
      now.toLocaleString("en-US", { timeZone: "UTC" })
    )
    const local = new Date(
      now.toLocaleString("en-US", { timeZone: zone })
    )

    const utcMs = utc.getTime()
    const localMs = local.getTime()

    if (!Number.isFinite(utcMs) || !Number.isFinite(localMs)) {
      return ""
    }

    const diffMinRaw = (localMs - utcMs) / 60000
    if (!Number.isFinite(diffMinRaw)) {
      return ""
    }

    const diffMin = Math.round(diffMinRaw)
    const sign = diffMin >= 0 ? "+" : "-"
    const abs = Math.abs(diffMin)
    const hours = Math.floor(abs / 60)
    const minutes = abs % 60
    const minutesPart = minutes ? `:${String(minutes).padStart(2, "0")}` : ""
    return `GMT${sign}${hours}${minutesPart}`
  } catch {
    return ""
  }
}

export default function TimeScreen() {
  const [mode24h, setMode24h] = useState(false)
  const [now, setNow] = useState<Date>(new Date())

  const [localZone, setLocalZone] = useState<string | null>(null)
  const [localCountryCode, setLocalCountryCode] = useState<string>("")
  const [loadingLocal, setLoadingLocal] = useState(true)

  const [cities, setCities] = useState<TimeCity[]>(INITIAL_COMPARISON_CITIES)

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [citySearch, setCitySearch] = useState("")
  const [searchResults, setSearchResults] = useState<TimeCity[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        const tzUser = Intl.DateTimeFormat().resolvedOptions().timeZone
        setLocalZone(tzUser)

        if (tzUser) {
          const cityPart = tzUser.split("/")[1]?.replace("_", " ")
          if (cityPart) {
            try {
              const results = await searchCities(cityPart)
              if (!cancelled && results.length > 0) {
                setLocalCountryCode(results[0].country_code)
              }
            } catch (e) {
              console.warn("Could not fetch local country from geocoding", e)
            }
          }
        }
      } catch (e) {
        console.warn("Could not resolve device timezone", e)
        setLocalZone(null)
      } finally {
        if (!cancelled) {
          setLoadingLocal(false)
        }
      }
    }

    init()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      setNow(new Date())
    }, 30_000)

    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!isModalVisible) return

    if (!citySearch.trim()) {
      setSearchResults([])
      setSearchError(null)
      return
    }

    const timeout = setTimeout(() => {
      loadSearch(citySearch)
    }, 400)

    return () => clearTimeout(timeout)
  }, [citySearch, isModalVisible])

  function filterOutExisting(list: TimeCity[]): TimeCity[] {
    const existingIds = new Set(cities.map(c => c.id))
    return list.filter(c => !existingIds.has(c.id))
  }

  async function loadSearch(query: string) {
    try {
      setSearchLoading(true)
      setSearchError(null)

      const results = await searchCities(query)

      const mapped: TimeCity[] = results
        .filter((r: GeoCityResult) => !!r.timezone)
        .map((r: GeoCityResult) => ({
          id: `${r.name}-${r.timezone}`,
          city: r.name,
          country: r.country,
          countryCode: r.country_code,
          timezone: r.timezone,
        }))

      setSearchResults(filterOutExisting(mapped))
    } catch (err) {
      console.error("Erro ao buscar cidades (time)", err)
      setSearchError("Error searching cities. Try again.")
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }

  function handleAddCity(city: TimeCity) {
    setCities(prev => [...prev, city])
    setIsModalVisible(false)
    setCitySearch("")
    setSearchResults([])
  }

  function handleRemoveCity(id: string) {
    setCities(prev => prev.filter(c => c.id !== id))
  }

  function renderTimeCard(city: TimeCity) {
    const timeText = formatTimeForZone(city.timezone, mode24h, now)
    const offsetLabel = offsetLabelForZone(city.timezone, now)

    return (
      <TimeCard
        city={city.city}
        country={city.country}
        countryCode={city.countryCode}
        gmtOffset={offsetLabel}
        timeText={timeText}
        onRemove={() => handleRemoveCity(city.id)}
      />
    )
  }

  if (loadingLocal) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#705ADF" />
      </View>
    )
  }

  const isPurple = !mode24h

  const modalListData = citySearch.trim()
    ? searchResults
    : filterOutExisting(POPULAR_TIME_CITIES)

  const localCityName =
    localZone?.split("/")[1]?.replace("_", " ") ?? "Current"
  const localCountryName =
    localZone?.split("/")[0]?.replace("_", " ") ?? "Local"
  const localOffsetLabel = localZone
    ? offsetLabelForZone(localZone, now)
    : "Local"
  const localTimeText = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: !mode24h,
  }).format(now)

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

      <TimeCard
        city={localCityName}
        country={localCountryName}
        countryCode={localCountryCode}
        gmtOffset={localOffsetLabel}
        timeText={localTimeText}
        isLocal
      />

      <Text style={[styles.title, { marginTop: 16 }]}>Comparison</Text>

      <FlatList
        data={cities}
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
        renderItem={({ item }) => renderTimeCard(item)}
      />

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

            {searchLoading && (
              <View style={{ paddingVertical: 8 }}>
                <ActivityIndicator size="small" color="#705ADF" />
              </View>
            )}

            {searchError && (
              <Text style={{ color: "red", marginBottom: 8 }}>
                {searchError}
              </Text>
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
                        {citySearch.trim()
                          ? `No results for "${citySearch}"`
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
    margin: 6,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
