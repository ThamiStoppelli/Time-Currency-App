import axios from 'axios'
import Constants from 'expo-constants'

const WEATHER_KEY = Constants.manifest?.extra?.OPENWEATHER_KEY
const weatherApi = axios.create({
  baseURL: 'https://api.openweathermap.org/data/2.5',
})

export interface WeatherData {
  temp: number
  description: string
  icon: string
  // adicione o que precisar (umidade, velocidade do vento…)
}

/**
 * Retorna clima atual por lat/lon
 */
export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const resp = await weatherApi.get('/weather', {
    params: {
      lat,
      lon,
      units: 'metric',
      lang: 'pt',
      appid: WEATHER_KEY,
    },
  })
  const d = resp.data
  return {
    temp: d.main.temp,
    description: d.weather[0].description,
    icon: d.weather[0].icon,
  }
}
