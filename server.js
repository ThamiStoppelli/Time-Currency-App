// Express app that “forwards” requests to WorldTimeAPI

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors()); 

const timezonesFile = path.join(__dirname, 'timezones.json');
let localZones = [];
try {
  const json = fs.readFileSync(timezonesFile, 'utf-8');
  localZones = JSON.parse(json);
  console.log(`🐢 Carregados ${localZones.length} fusos de timezones.json`);
} catch (e) {
  console.warn('Não consegui ler timezones.json:', e.message);
}

const WORLD_TIME_BASE = 'https://worldtimeapi.org/api/timezone';

app.get('/api/timezone', async (req, res) => {
  try {
    const resp = await axios.get(WORLD_TIME_BASE, { timeout: 5000 });
    // Se funcionar, devolve o array vindo da Internet
    res.json(resp.data);
  } catch (err) {
    console.warn('Falha ao buscar lista remota de fusos, usando fallback local.');
    if (localZones.length > 0) {
      res.json(localZones);
    } else {
      res.status(500).json({ error: 'Não foi possível obter lista de fusos (nem online nem local).' });
    }
  }
});

app.get('/api/timezone/:zone', async (req, res) => {
  const { zone } = req.params;
  try {
    const resp = await axios.get(`${WORLD_TIME_BASE}/${encodeURIComponent(zone)}`, { timeout: 5000 });
    res.json(resp.data);
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return res.status(404).json({ error: `Timezone não encontrado: ${zone}` });
    }
    console.error(`Falha ao buscar hora para "${zone}":`, err.message);
    res.status(500).json({ error: `Não foi possível obter hora para ${zone}` });
  }
});

// other proxy routes (e.g. a currency or weather proxy)

// Start the server on port 4000 (or process.env.PORT if set)
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`⏳ Proxy server listening on http://localhost:${PORT}`);
});
