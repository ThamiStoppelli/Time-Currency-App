import React, { useEffect, useState } from 'react'
import { View, Text, Button, FlatList, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Image } from 'react-native'
import { useLocations } from '../context/LocationsContext'
import { fetchTimeForZone, fetchAllTimezones } from '../services/timeApi'
import Toggle from '../components/Toggle'
import { formatTime } from '../utils/dateUtils';

interface TimezoneItem {
  zone: string
  datetime: string
}

export default function TimeScreen() {
  const { locations, addLocation, removeLocation } = useLocations()

  const [localTime, setLocalTime] = useState<string | null>(null)
  const [localLoading, setLocalLoading] = useState(true);

  const [timezonesList, setTimezonesList] = useState<string[]>([]);
  const [allLoaded, setAllLoaded] = useState(false);
  const [customZones, setCustomZones] = useState<TimezoneItem[]>([])

  const [inputZone, setInputZone] = useState('')
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [mode24h, setMode24h] = useState(false);

  // 1. Device's timezone
  useEffect(() => {
    let isMounted = true;

    const tzUser = Intl.DateTimeFormat().resolvedOptions().timeZone;

    fetchTimeForZone(tzUser)
      .then((data) => {
        if (isMounted) {
          setLocalTime(data.datetime);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch local time for', tzUser, err);
      })
      .finally(() => {
        if (isMounted) {
          setLocalLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [])

  // 2. Load all IANA timezone names (for autocomplete)
  useEffect(() => {
    let isMounted = true;

    fetchAllTimezones()
      .then((zones) => {
        if (isMounted) {
          setTimezonesList(zones);
        }
      })
      .catch((err) => {
        console.error('Failed to load timezone list', err);
      })
      .finally(() => {
        if (isMounted) {
          setAllLoaded(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [])

  // 3. Para cada “locação” extra (locations), buscar a hora
  useEffect(() => {
    // If no extra locations, clear customZones:
    if (locations.length === 0) {
      setCustomZones([]);
      return;
    }

    let isMounted = true;
    Promise.all(
      locations.map((loc) =>
        fetchTimeForZone(loc.name)
          .then((data) => ({ zone: loc.name, datetime: data.datetime }))
          .catch((err) => {
            console.error('Failed to fetch time for', loc.name, err);
            // If one fails, we just skip it
            return null;
          })
      )
    ).then((results) => {
      if (!isMounted) return;
      // Filter out any nulls (failed fetches)
      const valid: TimezoneItem[] = results.filter(
        (r): r is TimezoneItem => r !== null
      );
      setCustomZones(valid);
    });

    return () => {
      isMounted = false;
    };
  }, [locations])

  // 4. Compute “searchResults” whenever inputZone or timezonesList changes
  useEffect(() => {
    if (inputZone.trim() === '') {
      setSearchResults([]);
      return;
    }
    const q = inputZone.toLowerCase();
    const matches = timezonesList
      .filter((tz) => tz.toLowerCase().includes(q))
      .slice(0, 10);
    setSearchResults(matches);
  }, [inputZone, timezonesList]);

    if (localLoading || !allLoaded) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#705ADF" />
      </View>
    );
  }

  const isPurple = !mode24h;
  const addIcon = isPurple
    ? require('../assets/images/add-purple.svg')
    : require('../assets/images/add-blue.svg');

  return (
    <View style={styles.container}>

      <View style={styles.headerRow}>
        <Text style={styles.title}>
          Current Time
        </Text>
        <Toggle
          initial={!mode24h}
          onToggle={val => setMode24h(!val)}
          activeColor="#705ADF"
          inactiveColor="#3C3B6E"
          textOn="AM | PM"
          textOff="24 hours"
        />
      </View>
      
      {/* <Text style={styles.title}>
        Hora local: {' '}
        {localTime 
        ? formatTime(localTime, mode24h) 
        : 'Carregando...'}
      </Text> */}

      {/* Autocomplete Input for new zones */}
      <TextInput
        style={styles.input}
        placeholder="Ex: Brazil/Fortaleza"
        value={inputZone}
        onChangeText={setInputZone}
      />

      <Text style={styles.title}>
        Comparison
      </Text>

      {searchResults.length > 0 && (
        <FlatList
          style={styles.suggestionList}
          data={searchResults}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.suggestionItem}
              onPress={() => {
                if (!locations.some((loc) => loc.name === item)) {
                  addLocation({
                    id: item,
                    name: item,
                    latitude: 0,
                    longitude: 0,
                  });
                }
                setInputZone('');
                setSearchResults([]);
              }}
            >
              <Text style={styles.suggestionText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Fallback “Add zone” Button (in case you want to allow manual) */}
      <Button
        title="Adicionar zona"
        onPress={() => {
          const trimmed = inputZone.trim();
          if (trimmed.length > 0 && timezonesList.includes(trimmed)) {
            if (!locations.some((loc) => loc.name === trimmed)) {
              addLocation({
                id: trimmed,
                name: trimmed,
                latitude: 0,
                longitude: 0,
              });
            }
          } else {
            alert(
              'Zona inválida. Escolha um valor existente na lista de sugestão.'
            );
          }
          setInputZone('');
        }}
      />

      {/* imagem add-blue.png e add-grey.png */}
      <Image source={addIcon} style={styles.addIcon} resizeMode="contain" />

      {/* — Show each custom timezone in a list — */}
      <FlatList
        data={customZones}
        keyExtractor={(item) => item.zone}
        contentContainerStyle={{ paddingTop: 12 }}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>Nenhuma zona adicionada</Text>
        )}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.zoneText}>
              {item.zone.split('/')[1]}:
            </Text>
            <Text style={styles.timeText}>
              {formatTime(item.datetime, mode24h)}
            </Text>
            <TouchableOpacity
              onPress={() => removeLocation(item.zone as any)}
              style={styles.removeButton}
            >
              <Text style={styles.removeButtonText}>–</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16,
    margin: 6 
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // gap: 12,
    marginTop: 8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { 
    fontSize: 18, 
    marginBottom: 12,
    marginTop: 20
  },
  row: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  zoneText: { 
    fontWeight: 'bold' 
  },
  input: {
    borderColor: '#ccc', 
    borderWidth: 1, 
    padding: 8, 
    marginVertical: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 24,
  },
  timeText: {
    fontSize: 16,
    marginRight: 12,
  },
  suggestionList: {
    maxHeight: 160,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 12,
    borderRadius: 4,
  },
  suggestionItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  suggestionText: {
    fontSize: 14,
  },
  removeButton: {
    backgroundColor: '#E74C3C',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  removeButtonText: { 
    color: '#FFF', 
    fontSize: 18, 
    lineHeight: 18 
  },
  addIcon: {
    width: 32,
    height: 32,
    marginTop: 12,
  }
})

/*
Usa useCurrentLocation() para pegar coords do dispositivo.

Chama fetchTimeForZone(timezone) para obter hora atual local.

Mapeia cada “location extra” (armazenada no Context) para buscar fetchTimeForZone(loc.name).
 */