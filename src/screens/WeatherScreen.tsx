import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Modal, StyleSheet } from 'react-native'
import { WeatherCard } from "../components/WeatherCard"
import { PlusIcon } from "../assets/svgs/plus-icon"
import { useCurrentLocation } from "../hooks/useLocation"

type WeatherCity = {
  id: string
  city: string
  country: string
  countryCode: string
  temperature: number
  feelsLike: number
  condition: string
  icon: string
  rainChance: number
  uvIndex: number
  windKph: number
}

// MOCK inicial de cidades (depois trocamos por API real)
const MOCK_WEATHER_CITIES: WeatherCity[] = [
  {
    id: "fortaleza",
    city: "Fortaleza",
    country: "Brazil",
    countryCode: "BR",
    temperature: 30,
    feelsLike: 34,
    condition: "Sunny with some clouds",
    icon: "🌤",
    rainChance: 10,
    uvIndex: 9,
    windKph: 18,
  },
  {
    id: "berlin",
    city: "Berlin",
    country: "Germany",
    countryCode: "DE",
    temperature: 12,
    feelsLike: 10,
    condition: "Cloudy",
    icon: "☁️",
    rainChance: 20,
    uvIndex: 2,
    windKph: 13,
  },
  {
    id: "nyc",
    city: "New York",
    country: "USA",
    countryCode: "US",
    temperature: 18,
    feelsLike: 18,
    condition: "Clear sky",
    icon: "🌙",
    rainChance: 5,
    uvIndex: 4,
    windKph: 9,
  },
  {
    id: "cusco",
    city: "Cusco",
    country: "Peru",
    countryCode: "PE",
    temperature: 9,
    feelsLike: 7,
    condition: "Cool and dry",
    icon: "🌥",
    rainChance: 15,
    uvIndex: 8,
    windKph: 16,
  },
  {
    id: "bkk",
    city: "Bangkok",
    country: "Thailand",
    countryCode: "TH",
    temperature: 33,
    feelsLike: 38,
    condition: "Hot and humid",
    icon: "🌡",
    rainChance: 40,
    uvIndex: 11,
    windKph: 11,
  },
]

function getCityMetaById(id: string): WeatherCity | undefined {
  return MOCK_WEATHER_CITIES.find((c) => c.id === id)
}

export default function WeatherScreen() {
  const { coords, error: locError } = useCurrentLocation()

  const [loadingLocal, setLoadingLocal] = useState(true)
  const [localCityId, setLocalCityId] = useState<string>("fortaleza")

  // cidades selecionadas para comparação (não inclui a local, que é separada)
  const [selectedCityIds, setSelectedCityIds] = useState<string[]>([
    "berlin",
    "nyc",
  ])

  // modal de adicionar cidade
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [search, setSearch] = useState("")

  // simular descoberta de cidade local (por enquanto mapeado fixo)
  useEffect(() => {
    // quando tivermos API real, aqui fazemos coords → cidade
    if (coords) {
      // mock: se tem coords, usa Fortaleza
      setLocalCityId("fortaleza")
    }
    setLoadingLocal(false)
  }, [coords])

  const localCity = useMemo(
    () => getCityMetaById(localCityId),
    [localCityId]
  )

  const comparisonCities = useMemo(
    () =>
      selectedCityIds
        .map((id) => getCityMetaById(id))
        .filter((c): c is WeatherCity => !!c),
    [selectedCityIds]
  )

  const availableForAdd = useMemo(
    () =>
      MOCK_WEATHER_CITIES.filter(
        (c) =>
          c.id !== localCityId &&
          !selectedCityIds.includes(c.id) &&
          (
            c.city.toLowerCase().includes(search.toLowerCase()) ||
            c.country.toLowerCase().includes(search.toLowerCase())
          )
      ),
    [search, selectedCityIds, localCityId]
  )

  if (locError) {
    return (
      <View style={styles.centered}>
        <Text>{locError}</Text>
      </View>
    )
  }

  if (loadingLocal || !localCity) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#705ADF" />
      </View>
    )
  }

  const isPurple = true // se um dia quiser um toggle de unidades (°C/°F), dá para usar isso

  function handleRemoveCity(id: string) {
    setSelectedCityIds((prev) => prev.filter((cid) => cid !== id))
  }

  function handleAddCity(id: string) {
    setSelectedCityIds((prev) => [...prev, id])
    setIsModalVisible(false)
    setSearch("")
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Current Weather</Text>

      <WeatherCard
        isLocal
        city={localCity.city}
        country={localCity.country}
        countryCode={localCity.countryCode}
        temperature={localCity.temperature}
        feelsLike={localCity.feelsLike}
        condition={localCity.condition}
        icon={localCity.icon}
        rainChance={localCity.rainChance}
        uvIndex={localCity.uvIndex}
        windKph={localCity.windKph}
      />

      <Text style={[styles.sectionTitle, { marginTop: 16 }]}>
        Comparison
      </Text>

      <FlatList
        data={comparisonCities}
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
        renderItem={({ item }) => (
          <WeatherCard
            city={item.city}
            country={item.country}
            countryCode={item.countryCode}
            temperature={item.temperature}
            feelsLike={item.feelsLike}
            condition={item.condition}
            icon={item.icon}
            rainChance={item.rainChance}
            uvIndex={item.uvIndex}
            windKph={item.windKph}
            onRemove={() => handleRemoveCity(item.id)}
            // onPressDetails={() => { /* no futuro: forecast detalhado */ }}
          />
        )}
      />

      {/* Modal: adicionar cidade */}
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
              placeholder="Search by city or country"
              value={search}
              onChangeText={setSearch}
            />

            <FlatList
              data={availableForAdd}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleAddCity(item.id)}
                >
                  <Text style={styles.modalItemText}>
                    {item.country}, {item.city}
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