import axios from "axios"

export interface WeatherData {
  temp: number
  description: string
  icon: string
  rainChance?: number
  windKph?: number
  uvIndex?: number
}

const weatherApi = axios.create({
  baseURL: "https://api.open-meteo.com/v1",
})

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const resp = await weatherApi.get("/forecast", {
    params: {
      latitude: lat,
      longitude: lon,
      current_weather: true,
      hourly: "precipitation_probability,uv_index,wind_speed_10m",
      timezone: "auto",
    },
  })

  const data = resp.data
  const current = data.current_weather

  const code = current.weathercode
  const icon = weatherCodeToEmoji(code)
  const description = weatherCodeToText(code)

  const hourlyTimes: string[] = data.hourly?.time ?? []
  const currentTime: string | undefined = current.time

  let hourIndex = -1

  if (currentTime) {
    hourIndex = hourlyTimes.indexOf(currentTime)
  }

  if (hourIndex < 0 && currentTime && hourlyTimes.length > 0) {
    const currentMs = new Date(currentTime).getTime()

    hourIndex = hourlyTimes.findIndex((t) => {
      const tMs = new Date(t).getTime()
      return tMs >= currentMs
    })
  }

  return {
      temp: current.temperature,
      description,
      icon,
      windKph: current.windspeed,
      rainChance: 
        hourIndex >= 0 ? data.hourly?.precipitation_probability?.[hourIndex] : undefined,
      uvIndex: 
        hourIndex >= 0 ? data.hourly?.uv_index?.[hourIndex] : undefined,
  }
}

function weatherCodeToText(code: number): string {
  const map: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Drizzle",
    61: "Light rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Snowfall",
    80: "Rain showers",
  }
  return map[code] || "Unknown"
}

function weatherCodeToEmoji(code: number): string {
  if (code === 0) return "☀️"
  if (code <= 3) return "🌤️"
  if (code <= 45) return "🌫️"
  if (code <= 65) return "🌧️"
  if (code === 80) return "🌦️"
  return "❓"
}
