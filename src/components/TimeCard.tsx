import React, { useEffect, useState } from 'react';
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
  mode24h?: boolean
  period?: "AM" | "PM"
  isDropTargetActive?: boolean

  onChangeTime?: (value: string) => void
  onChangePeriod?: (period: "AM" | "PM") => void
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

function maskTimeInput(
  value: string,
  mode24h: boolean
): string | null {
  const digits = value.replace(/\D/g, "").slice(0, 4)

  if (digits.length >= 2) {
    const hours = Number(digits.slice(0, 2))

    if (mode24h && hours > 23) {
      return null
    }

    if (!mode24h && (hours < 1 || hours > 12)) {
      return null
    }
  }

  if (
    digits.length >= 3 &&
    Number(digits[2]) > 5
  ) {
    return null
  }

  if (digits.length <= 2) {
    return digits
  }

  return `${digits.slice(0, 2)}:${digits.slice(2)}`
}

function completeTimeInput(
  value: string,
  mode24h: boolean
): string {
  const digits = value.replace(/\D/g, "").slice(0, 4)

  if (!mode24h && digits.length === 1) {
    return `0${digits}:00`
  }

  const completedDigits = digits.padEnd(4, "0")

  return `${completedDigits.slice(0, 2)}:${completedDigits.slice(2)}`
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
  mode24h = true,
  period = "AM",
  isDropTargetActive = false,
  onChangeTime,
  onChangePeriod,
  onRemove,
  dragHandleProps,
}: TimeCardProps) {
  const flag = countryCodeToFlagEmoji(countryCode)

  const [inputValue, setInputValue] = useState(timeText)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (!isEditing) {
      setInputValue(timeText)
    }
  }, [timeText, isEditing])

  function handleTimeInputChange(value: string) {
    const maskedValue = maskTimeInput(value, mode24h)

    if (maskedValue === null) {
      return
    }

    setInputValue(maskedValue)
  }

  function handleTimeInputBlur() {
    setIsEditing(false)

    const digits = inputValue.replace(/\D/g, "")

    if (!digits) {
      setInputValue(timeText)
      return
    }

    const completedTime = completeTimeInput(inputValue, mode24h)

    setInputValue(completedTime)
    onChangeTime?.(completedTime)
  }

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
          <View style={styles.editableTimeRow}>
            <TextInput
              style={[styles.timeText, styles.timeInput]}
              value={inputValue}
              onFocus={() => setIsEditing(true)}
              onChangeText={handleTimeInputChange}
              onBlur={handleTimeInputBlur}
              keyboardType="number-pad"
              selectTextOnFocus
              maxLength={5}
              accessibilityLabel={`Time for ${city}`}
            />

            {!mode24h && (
              <TouchableOpacity
                style={styles.periodButton}
                onPress={() =>
                  onChangePeriod?.(period === "AM" ? "PM" : "AM")
                }
                accessibilityRole="button"
                accessibilityLabel={`Change period from ${period}`}
              >
                <Text style={styles.periodButtonText}>
                  {period}
                </Text>
              </TouchableOpacity>
            )}
          </View>
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
    flex: 1,
    minWidth: 0,
    padding: 0,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#B8B8B8",
  },
  editableTimeRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  periodButton: {
    flexShrink: 0,
    marginTop: 2,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: "#705ADF",
  },
  periodButtonText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "600",
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