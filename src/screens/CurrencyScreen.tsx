// src/screens/CurrencyScreen.tsx
import React, { useEffect, useState, useMemo } from "react"
import {
  View,
  Text,
  FlatList,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from "react-native"
import { useCurrentLocation } from "../hooks/useLocation"
import { CurrencyCard } from "../components/CurrencyCard"
import { PlusIcon } from "../assets/svgs/plus-icon"

// metadados de moedas mockadas
type CurrencyMeta = {
  code: string       // ex: "BRL"
  country: string    // ex: "Brazil"
  countryCode: string // ex: "BR"
  name: string       // ex: "Real"
  symbol: string     // ex: "R$"
  rateToUSD: number  // 1 unidade dessa moeda = X USD
}

const CURRENCIES: CurrencyMeta[] = [
  {
    code: "BRL",
    country: "Brazil",
    countryCode: "BR",
    name: "Real",
    symbol: "R$",
    rateToUSD: 0.18,
  },
  {
    code: "USD",
    country: "USA",
    countryCode: "US",
    name: "Dollar",
    symbol: "$",
    rateToUSD: 1,
  },
  {
    code: "EUR",
    country: "Germany",
    countryCode: "DE",
    name: "Euro",
    symbol: "€",
    rateToUSD: 1.08,
  },
  {
    code: "GBP",
    country: "United Kingdom",
    countryCode: "GB",
    name: "Pound",
    symbol: "£",
    rateToUSD: 1.25,
  },
  {
    code: "PEN",
    country: "Peru",
    countryCode: "PE",
    name: "Sol",
    symbol: "S/",
    rateToUSD: 0.27,
  },
  {
    code: "PYG",
    country: "Paraguay",
    countryCode: "PY",
    name: "Guarani",
    symbol: "₲",
    rateToUSD: 0.00013,
  },
]

function getCurrencyMeta(code: string): CurrencyMeta | undefined {
  return CURRENCIES.find((c) => c.code === code)
}

// converte baseUSD → amount na moeda
function amountForCurrency(baseUSD: number, meta: CurrencyMeta): number {
  if (meta.rateToUSD === 0) return 0
  return baseUSD / meta.rateToUSD
}

export default function CurrencyScreen() {
  const { coords, error: locError } = useCurrentLocation()

  // sempre mantemos: vetor de códigos, onde o primeiro é o "From"
  const [selectedCodes, setSelectedCodes] = useState<string[]>(["BRL", "USD", "EUR"])
  // valor base em USD que usamos para calcular todas as moedas
  const [baseUSD, setBaseUSD] = useState<number>(100)

  // modal + busca
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [search, setSearch] = useState("")

  // loading/location mock
  const [loadingLocal, setLoadingLocal] = useState(true)
  const [localCurrencyCode, setLocalCurrencyCode] = useState<string>("BRL")

  // descobre moeda local (mock por enquanto)
  useEffect(() => {
    // aqui poderíamos usar coords → país → moeda
    // por enquanto: se tem coords, assume BRL
    if (coords) {
      setLocalCurrencyCode("BRL")
      // opcional: garantir que BRL seja o primeiro
      setSelectedCodes((prev) => {
        if (prev.includes("BRL")) {
          const without = prev.filter((c) => c !== "BRL")
          return ["BRL", ...without]
        }
        return ["BRL", ...prev]
      })
    }
    setLoadingLocal(false)
  }, [coords])

  const fromCode = selectedCodes[0]
  const toCodes = selectedCodes.slice(1)

  const fromMeta = useMemo(() => getCurrencyMeta(fromCode), [fromCode])

  // moedas disponíveis no modal (as que ainda não foram selecionadas)
  const availableForAdd = useMemo(
    () =>
      CURRENCIES.filter(
        (c) =>
          !selectedCodes.includes(c.code) &&
          (c.code.toLowerCase().includes(search.toLowerCase()) ||
            c.country.toLowerCase().includes(search.toLowerCase()) ||
            c.name.toLowerCase().includes(search.toLowerCase()))
      ),
    [search, selectedCodes]
  )

  if (locError) {
    return (
      <View style={styles.centered}>
        <Text>{locError}</Text>
      </View>
    )
  }

  if (loadingLocal || !fromMeta) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#705ADF" />
      </View>
    )
  }

  const isPurple = true // se depois quiser um toggle AM/PM aqui também, dá pra usar

  // handler: quando o usuário muda o valor em qualquer card
  function handleChangeAmountForCurrency(code: string, valueStr: string) {
    // troca vírgula por ponto para aceitar "250,50"
    const normalized = valueStr.replace(",", ".")
    const amount = parseFloat(normalized)
    if (isNaN(amount)) {
      // se usuário apagar tudo, podemos considerar 0
      setBaseUSD(0)
      return
    }

    const meta = getCurrencyMeta(code)
    if (!meta) return

    // amount * rateToUSD = USD
    const newBaseUSD = amount * meta.rateToUSD
    setBaseUSD(newBaseUSD)
  }

  // handler: remover uma moeda (somente To)
  function handleRemoveCurrency(code: string) {
    setSelectedCodes((prev) => prev.filter((c) => c !== code))
  }

  // handler: adicionar moeda (do modal)
  function handleAddCurrency(code: string) {
    setSelectedCodes((prev) => [...prev, code])
    setIsModalVisible(false)
    setSearch("")
  }

  // handler: swap entre From e um To
  function handleSwapWithFrom(code: string) {
    setSelectedCodes((prev) => {
      const index = prev.indexOf(code)
      if (index <= 0) return prev
      const arr = [...prev]
      const tmp = arr[0]
      arr[0] = arr[index]
      arr[index] = tmp
      return arr
    })
  }

  // valor exibido para cada card como string
  function getAmountTextByCode(code: string): string {
    const meta = getCurrencyMeta(code)
    if (!meta) return ""
    const amount = amountForCurrency(baseUSD, meta)
    // formato simples com 2 casas decimais
    return amount.toFixed(2)
  }

  return (
    <View style={styles.container}>
      {/* FROM SECTION */}
      <Text style={styles.sectionTitle}>From</Text>

      <CurrencyCard
        isFrom
        country={fromMeta.country}
        countryCode={fromMeta.countryCode}
        currencyName={fromMeta.name}
        currencyCode={fromMeta.code}
        currencySymbol={fromMeta.symbol}
        amountText={getAmountTextByCode(fromMeta.code)}
        onChangeAmount={(value) => handleChangeAmountForCurrency(fromMeta.code, value)}
        // a troca com To é feita a partir dos cards "To", então aqui não tem onSwap
      />

      {/* TO SECTION */}
      <Text style={[styles.sectionTitle, { marginTop: 16 }]}>To</Text>

      <FlatList
        data={toCodes}
        keyExtractor={(code) => code}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 32 }}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>Nenhuma moeda adicionada</Text>
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
        renderItem={({ item: code }) => {
          const meta = getCurrencyMeta(code)
          if (!meta) return null

          return (
            <CurrencyCard
              country={meta.country}
              countryCode={meta.countryCode}
              currencyName={meta.name}
              currencyCode={meta.code}
              currencySymbol={meta.symbol}
              amountText={getAmountTextByCode(meta.code)}
              onChangeAmount={(value) => handleChangeAmountForCurrency(meta.code, value)}
              onRemove={() => handleRemoveCurrency(meta.code)}
              onSwap={() => handleSwapWithFrom(meta.code)}
            />
          )
        }}
      />

      {/* MODAL DE ADIÇÃO DE MOEDA */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add currency</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Search by code, country or name"
              value={search}
              onChangeText={setSearch}
            />

            <FlatList
              data={availableForAdd}
              keyExtractor={(item) => item.code}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleAddCurrency(item.code)}
                >
                  <Text style={styles.modalItemText}>
                    {item.country} – {item.name} ({item.code})
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
