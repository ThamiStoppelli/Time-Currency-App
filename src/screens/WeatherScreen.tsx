// src/screens/WeatherScreen.tsx
import React, { useEffect, useState } from 'react'
import { View, Text, Button, FlatList, TextInput, ActivityIndicator, Image, StyleSheet } from 'react-native'
import { useCurrentLocation } from '../hooks/useLocation'
import { fetchWeather, WeatherData } from '../services/weatherApi'
import { useLocations } from '../context/LocationsContext'

interface WeatherItem {
  name: string
  data: WeatherData
}

export default function WeatherScreen() {
  const { coords, error: locError } = useCurrentLocation()
  const { locations, addLocation, removeLocation } = useLocations()
  const [localWeather, setLocalWeather] = useState<WeatherData | null>(null)
  const [otherWeather, setOtherWeather] = useState<WeatherItem[]>([])
  const [inputCity, setInputCity] = useState('') // para permitir digitar "São Paulo,BR"

  // 1. Buscar clima local a partir das coords
  useEffect(() => {
    if (coords) {
      fetchWeather(coords.latitude, coords.longitude).then(data => setLocalWeather(data))
    }
  }, [coords])

  // 2. Para cada “location” extra, buscar clima
  useEffect(() => {
    Promise.all(
      locations.map(loc =>
        fetchWeather(loc.latitude, loc.longitude).then(data => ({
          name: loc.name,
          data,
        }))
      )
    ).then(arr => setOtherWeather(arr))
  }, [locations])

  if (locError) return <Text>{locError}</Text>
  if (!coords || !localWeather) return <ActivityIndicator />

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Clima local: {localWeather.temp.toFixed(1)}°C, {localWeather.description}
      </Text>

      <FlatList
        data={otherWeather}
        keyExtractor={item => item.name}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.cityText}>{item.name}</Text>
            <Image
              source={{ uri: `https://openweathermap.org/img/wn/${item.data.icon}@2x.png` }}
              style={{ width: 50, height: 50 }}
            />
            <Text>{item.data.temp.toFixed(1)}°C</Text>
            <Button title="–" onPress={() => removeLocation(item.name as any)} />
          </View>
        )}
      />

      {/* Para adicionar nova cidade, precisamos converter nome→coords. */}
      <TextInput
        style={styles.input}
        placeholder="Ex: São Paulo,BR"
        value={inputCity}
        onChangeText={setInputCity}
      />
      <Button
        title="Adicionar cidade"
        onPress={async () => {
          if (!inputCity.trim()) return
          // Aqui você pode usar Expo Location geocode:
          // const res = await Location.geocodeAsync(inputCity)
          // se res[0] existir, use res[0].latitude e longitude
          // mas, para simplicidade, suponha que já temos objeto loc:
          // você poderia usar uma API de geocoding (ex: OpenCage Geocoder)
          // Exemplo (pseudo):
          // const resGeo = await geocodeCity(inputCity)
          // addLocation({ id: inputCity, name: inputCity, latitude: resGeo.lat, longitude: resGeo.lon })

          // Por ora, só adicionamos nome fixo (demonstração):
          addLocation({ id: inputCity, name: inputCity, latitude: coords.latitude, longitude: coords.longitude })
          setInputCity('')
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, marginBottom: 12 },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 8,
  },
  cityText: { fontWeight: 'bold' },
  input: {
    borderColor: '#ccc', borderWidth: 1, padding: 8, marginVertical: 12,
  },
})

/* para converter “nome da cidade” → lat/lon:
Location.geocodeAsync(cidade) (módulo expo-location),

Usa useCurrentLocation() para pegar coords.

Chama fetchWeather(lat, lon) para obter clima local.

Para cada “location extra”, chama fetchWeather(loc.latitude, loc.longitude).

Exibe temperatura, descrição e ícone vindo de https://openweathermap.org/img/wn/${icon}.png.
 */