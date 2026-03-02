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
import { CloseIcon } from "../assets/svgs/close-icon"
import { fetchRates } from "../services/currencyApi"
import { CURRENCIES, CurrencyMeta } from "../data/currencyMeta"
import { getJSON, setJSON } from "../storage/storage"

function getCurrencyMeta(code: string): CurrencyMeta | undefined {
  return CURRENCIES.find((c) => c.code === code)
}

const STORAGE_CURRENCY_CODES = "currency:codes:v1"
const STORAGE_CURRENCY_AMOUNT = "currency:amount:v1"

export default function CurrencyScreen() {
  const { coords, error: locError } = useCurrentLocation()
  const [selectedCodes, setSelectedCodes] = useState<string[]>(["BRL", "USD", "EUR"])
  const [baseAmount, setBaseAmount] = useState<number>(100)
  const [hydrated, setHydrated] = useState(false)

  const [rates, setRates] = useState<Record<string, number>>({})
  const [loadingRates, setLoadingRates] = useState(false)

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [search, setSearch] = useState("")

  const [loadingLocal, setLoadingLocal] = useState(true)
  const [localCurrencyCode, setLocalCurrencyCode] = useState<string>("BRL")

  // hydrate
  useEffect(() => {
    let cancelled = false
    async function hydrate() {
      const savedCodes = await getJSON<string[]>(
        STORAGE_CURRENCY_CODES,
        ["BRL", "USD", "EUR"]
      )
      const savedAmount = await getJSON<number>(STORAGE_CURRENCY_AMOUNT, 100)

      if (!cancelled) {
        setSelectedCodes(savedCodes)
        setBaseAmount(savedAmount)
        setHydrated(true)
      }
    }
    hydrate()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!hydrated) return

    if (coords) {
      setLocalCurrencyCode("BRL")

      setSelectedCodes(prev => {
        if (prev.includes("BRL")) return prev
        return ["BRL", ...prev]
      })
    }

    setLoadingLocal(false)
  }, [coords, hydrated])

  // persist selectedCodes
  useEffect(() => {
    if (!hydrated) return
    setJSON(STORAGE_CURRENCY_CODES, selectedCodes)
  }, [hydrated, selectedCodes])

  // persist baseAmount
  useEffect(() => {
    if (!hydrated) return
    setJSON(STORAGE_CURRENCY_AMOUNT, baseAmount)
  }, [hydrated, baseAmount])

  const fromCode = selectedCodes[0]
  const toCodes = selectedCodes.slice(1)

  const fromMeta = useMemo(() => getCurrencyMeta(fromCode), [fromCode])

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

  useEffect(() => {
    async function loadRates() {
      if (!fromCode || toCodes.length === 0) {
        setRates({})
        return
      }
      try {
        setLoadingRates(true)
        const res = await fetchRates(fromCode, toCodes)
        setRates(res.rates ?? {})
      } catch (err) {
        console.error("Erro ao buscar taxas", err)
      } finally {
        setLoadingRates(false)
      }
    }
    loadRates()
  }, [fromCode, toCodes.join(",")])

  if (locError) {
    return (
      <View style={styles.centered}>
        <Text>{locError}</Text>
      </View>
    )
  }

  if (loadingLocal || !fromMeta || !hydrated) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#705ADF" />
      </View>
    )
  }

  const isPurple = true

  function handleChangeAmountForCurrency(code: string, valueStr: string) {
    const normalized = valueStr.replace(",", ".")
    const amount = parseFloat(normalized)
    
    if (isNaN(amount)) {
      setBaseAmount(0)
      return
    }

    if (code === fromCode) {
      setBaseAmount(amount)
      return
    }

    const rate = rates[code]
    if (!rate) return
    const newBase = amount / rate
    setBaseAmount(newBase)
  }

  function getAmountTextByCode(code: string): string {
    if (code === fromCode) {
      return baseAmount.toFixed(2)
    }
    const rate = rates[code]
    if (!rate) return "--"
    const converted = baseAmount * rate
    return converted.toFixed(2)
  }

  function handleRemoveCurrency(code: string) {
    setSelectedCodes((prev) => prev.filter((c) => c !== code))
  }

  function handleAddCurrency(code: string) {
    setSelectedCodes((prev) => [...prev, code])
    setIsModalVisible(false)
    setSearch("")
  }

  function handleSwapWithFrom(code: string) {
    if (code === fromCode) return
    const rate = rates[code]
    if (!rate) return

    const amountInTarget = baseAmount * rate
    setBaseAmount(amountInTarget)

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

  return (
    <View style={styles.container}>
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
      />

            <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionTitle, { marginTop: 16, marginBottom: 0 }]}>
          To
        </Text>
      </View>

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

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* <Text style={styles.modalTitle}>Add currency</Text> */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add currency</Text>

              <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.modalXButton}>
                <CloseIcon size={18} />
              </TouchableOpacity>
            </View>

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
    sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    marginBottom: 4,
  },
})
