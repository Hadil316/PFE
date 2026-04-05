// simulator.js - Version complète corrigée EMS VOLT

const API_URL = 'http://localhost:3000/measurements';

// IDs équipements
const devices = [11];

// compteur énergie cumulative par équipement
const energyCounter = {};

console.log("🚀 [EMS VOLT] Simulateur Industriel démarré...");

// génération données réalistes
function generateData(id) {

  // tensions simples ~230V
  const V1N = Number((228 + Math.random() * 6).toFixed(1));
  const V2N = Number((228 + Math.random() * 6).toFixed(1));
  const V3N = Number((228 + Math.random() * 6).toFixed(1));

  // tensions composées ~400V
  const V12 = Number((398 + Math.random() * 10).toFixed(1));
  const V23 = Number((398 + Math.random() * 10).toFixed(1));
  const V31 = Number((398 + Math.random() * 10).toFixed(1));

  // intensités réalistes
  const I1 = Number((12 + Math.random() * 6).toFixed(2));
  const I2 = Number((12 + Math.random() * 6).toFixed(2));
  const I3 = Number((12 + Math.random() * 6).toFixed(2));

  // fréquence
  const HZ = Number((49.98 + Math.random() * 0.04).toFixed(2));

  // facteur puissance
  const PF = Number((0.91 + Math.random() * 0.05).toFixed(2));

  // puissance active totale
  const TKW = Number(((V1N * I1 + V2N * I2 + V3N * I3) / 1000).toFixed(2));

  // énergie apparente
  const KVAH = Number((TKW / PF).toFixed(2));

  // énergie cumulative
  if (!energyCounter[id]) {
    energyCounter[id] = 0;
  }

  energyCounter[id] += TKW * 0.002;

  const IKWH = Number(energyCounter[id].toFixed(2));

  return {
    assetId: id,
    V1N,
    V2N,
    V3N,
    V12,
    V23,
    V31,
    I1,
    I2,
    I3,
    TKW,
    IKWH,
    HZ,
    PF,
    KVAH
  };
}

// envoi automatique toutes les 2 secondes
setInterval(async () => {

  console.log(`\n--- Push Batch [${new Date().toLocaleTimeString()}] ---`);

  for (let id of devices) {

    const data = generateData(id);

    try {

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {

        console.log(
          `✅ Device ${id} | ${data.TKW} kW | ${data.PF} PF | ${data.HZ} Hz | ${data.IKWH} kWh`
        );

      } else {

        const error = await response.text();

        console.log(`⚠️ Device ${id} erreur HTTP ${response.status} : ${error}`);
      }

    } catch (e) {

      console.log(`❌ Device ${id} connexion échouée : ${e.message}`);
    }
  }

}, 2000);