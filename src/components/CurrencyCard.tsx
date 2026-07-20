import React from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity, GestureResponderHandlers } from "react-native"
import { TrashIcon } from "../../assets/svgs/trash-icon"

type CurrencyCardProps = {
  isFrom?: boolean
  isDropTargetActive?: boolean
  country: string
  countryCode: string
  currencyName: string
  currencyCode: string
  currencySymbol: string
  amountText: string
  editable?: boolean
  onChangeAmount?: (value: string) => void
  onRemove?: () => void
  dragHandleProps?: GestureResponderHandlers
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
  isDropTargetActive = false,
  country,
  countryCode,
  currencyName,
  currencyCode,
  currencySymbol,
  amountText,
  editable = false,
  onChangeAmount,
  onRemove,
  dragHandleProps,
}: CurrencyCardProps) {
  const flag = countryCodeToFlagEmoji(countryCode)

  return (
    <View
      style={[
        styles.card,
        isFrom && styles.fromCard,
        isDropTargetActive && styles.activeDropTarget,
      ]}
    >
      <Text style={styles.flag}>{flag}</Text>

      <View style={styles.infoColumn}>
        <Text style={styles.titleText}>
          {country} – {currencyName}{" "}
          <Text style={styles.codeText}>
            ({currencyCode})
          </Text>
        </Text>

        <View style={styles.amountRow}>
          <Text style={styles.symbolText}>
            {currencySymbol}
          </Text>

          {editable ? (
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              value={amountText}
              onChangeText={(value) => onChangeAmount?.(value)}
            />
          ) : (
            <Text style={styles.amountText}>
              {amountText}
            </Text>
          )}
        </View>
      </View>

      {!isFrom && (
        <View style={styles.actionsColumn}>
          <View
            style={styles.dragHandle}
            accessibilityRole="button"
            accessibilityLabel={`Drag ${currencyName} to set it as the reference currency`}
            {...dragHandleProps}
          >
            <View style={styles.dragDotsRow}>
              <View style={styles.dragDot} />
              <View style={styles.dragDot} />
            </View>

            <View style={styles.dragDotsRow}>
              <View style={styles.dragDot} />
              <View style={styles.dragDot} />
            </View>

            <View style={styles.dragDotsRow}>
              <View style={styles.dragDot} />
              <View style={styles.dragDot} />
            </View>
          </View>

          {onRemove && (
            <TouchableOpacity
              style={styles.trashButton}
              onPress={onRemove}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${currencyName}`}
            >
              <TrashIcon size={18} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 76,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "transparent",
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  fromCard: {
    backgroundColor: "#EAE4FF",
  },
  activeDropTarget: {
    borderColor: "#705ADF",
    backgroundColor: "#E4DAFF",
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
    color: "#111",
  },
  amountText: {
    flex: 1,
    paddingVertical: 2,
    fontSize: 16,
    color: "#111",
  },
  actionsColumn: {
    alignSelf: "stretch",
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: 10,
  },
  dragHandle: {
    minWidth: 34,
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center",
    cursor: "grab" as any,
  },
  dragDotsRow: {
    flexDirection: "row",
    gap: 3,
    marginVertical: 1.5,
  },
  dragDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#777",
  },
  trashButton: {
    minWidth: 34,
    minHeight: 30,
    alignItems: "center",
    justifyContent: "center",
  },
})