import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TrashIcon } from '../assets/svgs/trash-icon';

type TimeCardProps = {
  city: string
  country: string
  countryCode: string
  gmtOffset: string
  timeText: string
  isLocal?: boolean
  onRemove?: () => void
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
  onRemove,
}: TimeCardProps) {
  const flag = countryCodeToFlagEmoji(countryCode)

  return (
    <View style={[styles.card, isLocal && styles.localCard]}>
      <Text style={styles.flag}>{flag}</Text>

      <View style={styles.infoColumn}>
        <Text style={styles.locationText}>
          {country}, {city} 
          {gmtOffset ? (
            <Text style={styles.gmtText}> ({gmtOffset})</Text>
          ) : null}
        </Text>
        <Text style={styles.timeText}>{timeText}</Text>
      </View>

      {!isLocal && onRemove && (
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
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#F4F4F7",
    marginBottom: 8,
  },
  localCard: {
    backgroundColor: "#EAE4FF",
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
  },
  trashButton: {
    paddingLeft: 8,
    paddingVertical: 4,
  },
});