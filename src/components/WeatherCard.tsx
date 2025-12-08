import React, { useMemo, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native"
import { TrashIcon } from "../assets/svgs/trash-icon"

type WeatherCardProps = {
  city: string
  country: string
  countryCode: string
  temperature: number  
  condition: string 
  icon?: string
  rainChance?: number
  uvIndex?: number
  windKph?: number
  feelsLike?: number
  isLocal?: boolean
  onRemove?: () => void
  onPressDetails?: () => void
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

export function WeatherCard({
  city,
  country,
  countryCode,
  temperature,
  condition,
  icon = "☀️",
  rainChance,
  uvIndex,
  windKph,
  feelsLike,
  isLocal,
  onRemove,
  onPressDetails,
}: WeatherCardProps) {
  const flag = countryCodeToFlagEmoji(countryCode)
  const [expanded, setExpanded] = useState(false)

  const hasDetails =
    typeof rainChance === "number" ||
    typeof uvIndex === "number" ||
    typeof windKph === "number"

  const uvLabel = useMemo(() => {
    if (typeof uvIndex !== "number") return undefined
    if (uvIndex <= 2) return "Low"
    if (uvIndex <= 5) return "Moderate"
    if (uvIndex <= 7) return "High"
    if (uvIndex <= 10) return "Very high"
    return "Extreme"
  }, [uvIndex])

  const rainLabel = useMemo(() => {
    if (typeof rainChance !== "number") return undefined
    if (rainChance < 20) return "Low chance of rain"
    if (rainChance < 50) return "Possible showers"
    return "Likely rain"
  }, [rainChance])

  const windLabel = useMemo(() => {
    if (typeof windKph !== "number") return undefined
    if (windKph < 10) return "Calm"
    if (windKph < 20) return "Breezy"
    if (windKph < 30) return "Windy"
    return "Strong wind"
  }, [windKph])

  const travelHint = useMemo(() => {
    if (!hasDetails) return undefined

    const temp = temperature
    const uv = uvIndex
    const rain = rainChance

    if (rain && rain >= 60) {
      return "Good day for indoor plans or flexible activities."
    }
    if (uv && uv >= 8 && temp >= 28) {
      return "Great for the beach, but avoid midday sun and use strong sunscreen."
    }
    if (temp >= 24 && (rain ?? 0) < 30) {
      return "Nice weather for walking, sightseeing and outdoor cafés."
    }
    if (temp <= 10 && (rain ?? 0) < 40) {
      return "Cool and fresh, perfect for city walks with a light jacket."
    }
    return "Overall okay weather, just adapt clothes to temperature."
  }, [hasDetails, temperature, uvIndex, rainChance])

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.card, isLocal && styles.localCard]}
      onPress={onPressDetails}
    >
      {/* Flag + icon */}
      <View style={styles.leftColumn}>
        <Text style={styles.flag}>{flag}</Text>
        <Text style={styles.mainIcon}>{icon}</Text>
      </View>

      {/* Main info */}
      <View style={styles.centerColumn}>
        <View style={styles.titleRow}>
          <Text style={styles.cityText}>{city}</Text>
          <Text style={styles.countryText}> – {country}</Text>
        </View>

        <View style={styles.tempRow}>
          <Text style={styles.tempText}>{Math.round(temperature)}°C</Text>
          {typeof feelsLike === "number" && (
            <Text style={styles.feelsText}>
              Feels like {Math.round(feelsLike)}°
            </Text>
          )}
        </View>

        <Text style={styles.conditionText}>{condition}</Text>

        {/* Details toggle */}
        {hasDetails && (
          <TouchableOpacity
            style={styles.detailsToggleRow}
            onPress={() => setExpanded((prev) => !prev)}
            activeOpacity={0.7}
          >
            <Text style={styles.detailsToggleText}>
              {expanded ? "Hide details" : "Show details"}
            </Text>
            <Text style={styles.detailsToggleChevron}>
              {expanded ? "▲" : "▼"}
            </Text>
          </TouchableOpacity>
        )}

        {/* Accordion content */}
        {expanded && (
          <View style={styles.detailsContainer}>
            {typeof rainChance === "number" && (
              <View style={styles.detailLine}>
                <Text style={styles.detailLabel}>Rain</Text>
                <Text style={styles.detailValue}>
                  {rainChance}%{rainLabel ? ` · ${rainLabel}` : ""}
                </Text>
              </View>
            )}

            {typeof uvIndex === "number" && (
              <View style={styles.detailLine}>
                <Text style={styles.detailLabel}>UV</Text>
                <Text style={styles.detailValue}>
                  {uvIndex}
                  {uvLabel ? ` · ${uvLabel}` : ""}
                </Text>
              </View>
            )}

            {typeof windKph === "number" && (
              <View style={styles.detailLine}>
                <Text style={styles.detailLabel}>Wind</Text>
                <Text style={styles.detailValue}>
                  {Math.round(windKph)} km/h
                  {windLabel ? ` · ${windLabel}` : ""}
                </Text>
              </View>
            )}

            {travelHint && (
              <Text style={styles.travelHint}>{travelHint}</Text>
            )}
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.rightColumn}>
        {!isLocal && onRemove && (
          <TouchableOpacity onPress={onRemove} style={styles.trashButton}>
            <TrashIcon size={18} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#F4F4F7",
    marginBottom: 10,
  },
  localCard: {
    backgroundColor: "#EAE4FF",
  },
  leftColumn: {
    alignItems: "center",
    marginRight: 10,
  },
  flag: {
    fontSize: 22,
  },
  mainIcon: {
    fontSize: 26,
    marginTop: 2,
  },
  centerColumn: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 2,
  },
  cityText: {
    fontSize: 16,
    fontWeight: "600",
  },
  countryText: {
    fontSize: 14,
    color: "#555",
  },
  tempRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 4,
  },
  tempText: {
    fontSize: 18,
    fontWeight: "500",
    marginRight: 8,
  },
  feelsText: {
    fontSize: 12,
    color: "#555",
  },
  conditionText: {
    marginTop: 2,
    fontSize: 13,
    color: "#333",
  },

  detailsToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  detailsToggleText: {
    fontSize: 12,
    color: "#705ADF",
    fontWeight: "500",
  },
  detailsToggleChevron: {
    marginLeft: 4,
    fontSize: 10,
    color: "#705ADF",
  },
  detailsContainer: {
    marginTop: 6,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#ECECF4",
  },
  detailLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: "#555",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 12,
    color: "#333",
  },
  travelHint: {
    marginTop: 6,
    fontSize: 11,
    color: "#333",
  },

  rightColumn: {
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginLeft: 8,
  },
  trashButton: {
    padding: 4,
  },
})
