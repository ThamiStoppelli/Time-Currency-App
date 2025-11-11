// src/screens/CurrencyScreen.tsx
import React, { useEffect, useState } from 'react'
import { View, Text, Button, FlatList, TextInput, ActivityIndicator, StyleSheet } from 'react-native'
import { useCurrentLocation } from '../hooks/useLocation'
import { fetchRates } from '../services/currencyApi'
import { useLocations } from '../context/LocationsContext'

interface RateItem {
  code: string
  rate: number
}

export default function CurrencyScreen() {
  const { coords, error: locError } = useCurrentLocation()
  const { locations, addLocation, removeLocation } = useLocations()
  const [localCurrency, setLocalCurrency] = useState<string | null>(null)
  const [rates, setRates] = useState<RateItem[]>([])
  const [amount, setAmount] = useState<string>('1')
  const [inputCurrency, setInputCurrency] = useState('')

  // 1. Descobrir o currency code local do usuário a partir da geolocalização
  useEffect(() => {
    if (coords) {
      // Em vez de tentar converter lat/lon→currency, podemos usar:
      // Intl.DateTimeFormat().resolvedOptions().timeZone e mapear pra country_code → currency
      // Ou usar uma API de geocoding que retorne o country code e daí outro map de country→currency.
      // Para simplificar, imagine que já sabemos:
      setLocalCurrency('BRL')
    }
  }, [coords])

  // 2. Para cada local extra, buscar currency code “ex: USD”
  //    Na prática, você guardaria o currency code no objeto Location, por ex: { id:'NY',name:'New York,US',currency:'USD' }
  //    Aqui só demonstro com valores “fixos”
  const otherCurrencies = locations.map(loc => ({
    code: loc.name.split(',')[1], // supondo que name="São Paulo,BR" → pega "BR"
  }))

  // 3. Fazer fetchRates toda vez que “amount” ou “localCurrency” ou “otherCurrencies” mudarem
  useEffect(() => {
    if (!localCurrency) return
    const symbols = otherCurrencies.map(o => o.code)
    if (symbols.length === 0) return

    fetchRates(localCurrency, symbols).then(res => {
      // res.rates ex: { USD: 0.18, EUR: 0.17 }
      const arr = Object.entries(res.rates).map(([code, r]) => ({ code, rate: r }))
      setRates(arr)
    })
  }, [localCurrency, otherCurrencies, amount])

  if (locError) return <Text>{locError}</Text>
  if (!coords || !localCurrency) return <ActivityIndicator />

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Moeda local: {localCurrency}</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <FlatList
        data={rates}
        keyExtractor={item => item.code}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.currencyText}>{item.code}:</Text>
            <Text>
              {(parseFloat(amount) * item.rate).toFixed(2)}
            </Text>
            <Button title="–" onPress={() => removeLocation(item.code)} />
          </View>
        )}
      />

      <TextInput
        style={styles.input}
        placeholder="Ex: USD"
        value={inputCurrency}
        onChangeText={setInputCurrency}
      />
      <Button
        title="Adicionar moeda"
        onPress={() => {
          if (!inputCurrency.trim()) return
          addLocation({
            id: inputCurrency,
            name: `Dummy City,${inputCurrency}`, // só pra exemplificar
            latitude: 0,
            longitude: 0,
          })
          setInputCurrency('')
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
  currencyText: { fontWeight: 'bold' },
  input: {
    borderColor: '#ccc', borderWidth: 1, padding: 8, marginVertical: 12,
  },
})

/*Em produção, usar uma API como REST Countries para pegar país pelo latitude/longitude e extrair o currency daquele país. 

Usa useCurrentLocation() para pegar coords.

Converte coords → country code → currency code local (ex.: ‘BRL’).

O usuário pode adicionar “currency codes” extras (ex.: ‘USD’, ‘EUR’), que ficam em locations do Context.

Chama fetchRates(base, [‘USD’,‘EUR’,…]) para obter objeto rates.

Renderiza lista de conversões multiplicando amount * rate.
*/