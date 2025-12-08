import axios from "axios"

const geoApi = axios.create({
  baseURL: "https://geocoding-api.open-meteo.com/v1",
})

export interface GeoCityResult {
  id: number
  name: string
  country: string
  country_code: string
  latitude: number
  longitude: number
  population?: number
  admin1?: string
  timezone?: string 
}

export async function searchCities(query: string): Promise<GeoCityResult[]> {
  if (!query.trim()) return []

  const resp = await geoApi.get("/search", {
    params: {
      name: query,
      count: 10,
      language: "en",
      format: "json",
    },
  })

  const data = resp.data
  
  if (!data || !Array.isArray(data.results)) {
    return []
  }

  return data.results as GeoCityResult[]
}
