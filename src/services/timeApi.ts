import axios from 'axios';

// const PROXY_BASE = 'http://localhost:4000/api';
const PROXY_BASE = 'http://192.168.0.110:4000/api';

// 1. Fetch the full list of IANA timezone names, via our proxy
export async function fetchAllTimezones(): Promise<string[]> {
    try {
    const response = await axios.get<string[]>(`${PROXY_BASE}/timezone`);
    return response.data;
  } catch (err) {
    console.error('Falha ao buscar lista remota de fusos, usando fallback local.', err);
    // Aqui você devolve o JSON local que está no bundle do app
    const local = require('../../timezones.json') as string[];
    return local;
  }
}

export interface TimeApiResult {
  datetime: string;
}

export async function fetchTimeForZone(
  zone: string
): Promise<TimeApiResult> {
  try {
    const response = await axios.get<TimeApiResult>(`${PROXY_BASE}/timezone/${encodeURIComponent(zone)}`);
    return response.data;
  } catch (err) {
    console.error(`Falha ao buscar hora do fuso "${zone}" no proxy:`, err);
    throw err;
  }
}
