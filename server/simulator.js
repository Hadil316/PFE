// simulator.js - Version corrigée avec l'ID 6
const API_URL = 'http://localhost:3000/measurements';

// MODIFICATION ICI : On met 6 au lieu de 11 pour correspondre à ton "equipement1"
const devices = [6]; 

const energyCounter = {};
console.log("🚀 [EMS VOLT] Simulateur démarré sur l'ID 6...");

function generateData(id) {
  const V1N = Number((228 + Math.random() * 6).toFixed(1));
  const V2N = Number((228 + Math.random() * 6).toFixed(1));
  const V3N = Number((228 + Math.random() * 6).toFixed(1));
  const V12 = 400.5, V23 = 399.8, V31 = 401.2;
  const I1 = Number((12 + Math.random() * 6).toFixed(2));
  const I2 = Number((12 + Math.random() * 6).toFixed(2));
  const I3 = Number((12 + Math.random() * 6).toFixed(2));
  const HZ = Number((49.98 + Math.random() * 0.04).toFixed(2));
  const PF = Number((0.91 + Math.random() * 0.05).toFixed(2));
  const TKW = Number(((V1N * I1 + V2N * I2 + V3N * I3) / 1000).toFixed(2));

  if (!energyCounter[id]) energyCounter[id] = 100;
  energyCounter[id] += TKW * 0.002;

  return {
    assetId: id,
    V1N, V2N, V3N, V12, V23, V31,
    I1, I2, I3, TKW, HZ, PF,
    IKWH: Number(energyCounter[id].toFixed(2)),
    timestamp: new Date().toISOString()
  };
}

setInterval(async () => {
  for (let id of devices) {
    const data = generateData(id);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        console.log(`✅ Données envoyées pour l'ID ${id} (${data.TKW} kW)`);
      }
    } catch (e) {
      console.log(`❌ Erreur de connexion au Backend`);
    }
  }
}, 2000);