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
  feature_code?: string
}

function normalize(str: string | undefined) {
  if (!str) return ""
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}

export async function searchCities(query: string): Promise<GeoCityResult[]> {
  if (!query.trim()) return []

  const resp = await geoApi.get("/search", {
    params: {
      name: query,
      count: 20,
      language: "en",
      format: "json",
    },
  })

  const data = resp.data
  
  if (!data || !Array.isArray(data.results)) {
    return []
  }

  const q = normalize(query)
  const results: GeoCityResult[] = data.results

  const sorted = [...results].sort((a, b) => {
    const nameA = normalize(a.name)
    const nameB = normalize(b.name)

    const exactA = nameA === q ? 1 : 0
    const exactB = nameB === q ? 1 : 0
    if (exactA !== exactB) return exactB - exactA

    const startsA = nameA.startsWith(q) ? 1 : 0
    const startsB = nameB.startsWith(q) ? 1 : 0
    if (startsA !== startsB) return startsB - startsA

    const popA = a.population ?? 0
    const popB = b.population ?? 0
    if (popA !== popB) return popB - popA

    return 0
  })

  const seen = new Set<string>()
  const unique = sorted.filter((r) => {
    const key = `${normalize(r.name)}-${r.country_code}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return unique
}