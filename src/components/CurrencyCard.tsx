import React from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native"
import { TrashIcon } from "../../assets/svgs/trash-icon"
import { SwitchIcon } from "../../assets/svgs/switch-icon"

type CurrencyCardProps = {
  isFrom?: boolean
  country: string
  countryCode: string
  currencyName: string
  currencyCode: string
  currencySymbol: string
  amountText: string
  onChangeAmount: (value: string) => void
  onRemove?: () => void
  onSwap?: () => void
}

function countryCodeToFlagEmoji(code: string) {
  if (!code) return "🌍"
  const upper = code.toUpperCase()
  const A = 0x1f1e6
  return upper
    .split("")
    .map((char) => String.fromCodePoint(A + char.charCodeAt(0) - 65))
    .join("")
}

export function CurrencyCard({
  isFrom = false,
  country,
  countryCode,
  currencyName,
  currencyCode,
  currencySymbol,
  amountText,
  onChangeAmount,
  onRemove,
  onSwap,
}: CurrencyCardProps) {
  const flag = countryCodeToFlagEmoji(countryCode)

  return (
    <View style={[styles.card, isFrom && styles.fromCard]}>
      <Text style={styles.flag}>{flag}</Text>

      <View style={styles.infoColumn}>
        <Text style={styles.titleText}>
          {country} – {currencyName}{" "}
          <Text style={styles.codeText}>({currencyCode})</Text>
        </Text>

        <View style={styles.amountRow}>
          <Text style={styles.symbolText}>{currencySymbol}</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={amountText}
            onChangeText={onChangeAmount}
          />
        </View>
      </View>

      <View style={styles.actionsColumn}>
        {/* Swap */}
        {onSwap && (
          <TouchableOpacity style={styles.swapButton} onPress={onSwap}>
            <SwitchIcon size={20} />
          </TouchableOpacity>
        )}

        {/* Remove nos cards "To" apenas */}
        {!isFrom && onRemove && (
          <TouchableOpacity style={styles.trashButton} onPress={onRemove}>
            <TrashIcon size={18} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#fff", /* #F4F4F7 */
    marginBottom: 8,
  },
  fromCard: {
    backgroundColor: "#EAE4FF",
  },
  flag: {
    fontSize: 22,
    marginRight: 10,
  },
  infoColumn: {
    flex: 1,
  },
  titleText: {
    fontWeight: "600",
    fontSize: 14,
  },
  codeText: {
    fontWeight: "400",
    color: "#555",
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  symbolText: {
    fontSize: 18,
    marginRight: 6,
  },
  input: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 2,
    fontSize: 16,
  },
  actionsColumn: {
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginLeft: 8,
  },
  swapButton: {
    padding: 4,
    marginBottom: 4,
  },
  swapText: {
    fontSize: 18,
  },
  trashButton: {
    padding: 4,
  },
})