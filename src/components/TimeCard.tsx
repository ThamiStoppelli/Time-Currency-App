import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, GestureResponderHandlers } from 'react-native';
import { TrashIcon } from '../../assets/svgs/trash-icon';

type TimeCardProps = {
  city: string
  country: string
  countryCode: string
  gmtOffset: string
  timeText: string

  isLocal?: boolean
  isFrom?: boolean
  editable?: boolean
  isDropTargetActive?: boolean

  onChangeTime?: (value: string) => void
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

export function TimeCard({
  city,
  country,
  countryCode,
  gmtOffset,
  timeText,
  isLocal = false,
  isFrom = false,
  editable = false,
  isDropTargetActive = false,
  onChangeTime,
  onRemove,
  dragHandleProps,
}: TimeCardProps) {
  const flag = countryCodeToFlagEmoji(countryCode)

  return (
    <View style={[
      styles.card,
      (isLocal || isFrom) && styles.fromCard,
      isDropTargetActive && styles.activeDropTarget,
    ]}>
      <Text style={styles.flag}>{flag}</Text>

      <View style={styles.infoColumn}>
        <Text style={styles.locationText}>
          {country}, {city}
          {gmtOffset ? (
            <Text style={styles.gmtText}> ({gmtOffset})</Text>
          ) : null}
        </Text>
        {editable ? (
          <TextInput
            style={[styles.timeText, styles.timeInput]}
            value={timeText}
            onChangeText={(value) => onChangeTime?.(value)}
            keyboardType="numbers-and-punctuation"
            selectTextOnFocus
            accessibilityLabel={`Time for ${city}`}
          />
        ) : (
          <Text style={styles.timeText}>{timeText}</Text>
        )}
      </View>

      {dragHandleProps && (
        <View
          style={styles.dragHandle}
          accessibilityRole="button"
          accessibilityLabel={`Drag ${city} to set as reference`}
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
      )}

      {!isLocal && !isFrom && onRemove && (
        <TouchableOpacity onPress={onRemove} style={styles.trashButton}>
          <TrashIcon size={18} />
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 68,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  fromCard: {
    backgroundColor: "#EAE4FF",
  },
  activeDropTarget: {
    borderColor: "#705ADF",
    backgroundColor: "#F3F0FF",
  },
  flag: {
    fontSize: 22,
    marginRight: 10,
  },
  infoColumn: {
    flex: 1,
  },
  locationText: {
    fontWeight: "600",
    fontSize: 14,
  },
  gmtText: {
    fontWeight: "400",
    color: "#555",
  },
  timeText: {
    fontSize: 16,
    marginTop: 2,
    color: "#111",
  },
  timeInput: {
    padding: 0,
    minWidth: 80,
  },
  dragHandle: {
    paddingHorizontal: 10,
    paddingVertical: 12,
    gap: 3,
  },
  dragDotsRow: {
    flexDirection: "row",
    gap: 3,
  },
  dragDot: {
    width: 3,
    height: 3,
    borderRadius: 999,
    backgroundColor: "#777",
  },
  trashButton: {
    paddingLeft: 8,
    paddingVertical: 4,
  },
});