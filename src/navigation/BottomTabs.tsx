// BottomTabs.tsx
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import TimeScreen from '../screens/TimeScreen'
import WeatherScreen from '../screens/WeatherScreen'
import CurrencyScreen from '../screens/CurrencyScreen'
import { NavigationContainer } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'

const Tab = createBottomTabNavigator()

export default function BottomTabs() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName = ''
            if (route.name === 'Time') iconName = 'time-outline'
            else if (route.name === 'Weather') iconName = 'cloud-outline'
            else if (route.name === 'Currency') iconName = 'cash-outline'
            return <Ionicons name={iconName as any} size={size} color={color} />
          },
          tabBarActiveTintColor: '#2a9d8f',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="Time" component={TimeScreen} />
        <Tab.Screen name="Weather" component={WeatherScreen} />
        <Tab.Screen name="Currency" component={CurrencyScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  )
}
