import axios from "axios"

const currencyApi = axios.create({
  baseURL: "https://open.er-api.com/v6",
})

export interface RatesResponse {
  base: string
  date: string
  rates: Record<string, number>
}

export async function fetchRates(base: string, symbols: string[]): Promise<RatesResponse> {
  const resp = await currencyApi.get(`/latest/${base}`)

  // console.log("Raw rates response:", resp.data)

  const data = resp.data as {
    result: string
    base_code: string
    time_last_update_utc: string
    rates: Record<string, number>
  }

  if (data.result !== "success" || !data.rates) {
    console.warn("Unexpected rates response shape", data)
    return {
      base,
      date: data.time_last_update_utc ?? "",
      rates: {},
    }
  }

  const filteredRates: Record<string, number> = {}
  for (const code of symbols) {
    if (data.rates[code]) {
      filteredRates[code] = data.rates[code]
    }
  }

  return {
    base: data.base_code,
    date: data.time_last_update_utc,
    rates: filteredRates,
  }
}
