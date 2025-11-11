import axios from 'axios'

const currencyApi = axios.create({
  baseURL: 'https://api.exchangerate.host',
})

export interface RatesResponse {
  base: string
  date: string
  rates: Record<string, number>
}

/**
 * Retorna taxas de câmbio da currency “base” para symbols listados.
 * Ex: base='USD', symbols=['BRL','EUR']
 */
export async function fetchRates(base: string, symbols: string[]): Promise<RatesResponse> {
  const resp = await currencyApi.get('/latest', {
    params: { base, symbols: symbols.join(',') },
  })
  return resp.data
}
