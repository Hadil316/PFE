// server/multi-simulator.js
// Simule des mesures pour tous les assets pour générer de l'historique

const ASSET_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

// Configurations pour chaque type d'asset
const ASSET_CONFIG = {
  1: { name: 'SITE', basePower: 100, baseCurrent: 150 },
  2: { name: 'TGBT', basePower: 80, baseCurrent: 120 },
  3: { name: 'TGBT', basePower: 60, baseCurrent: 90 },
  4: { name: 'ARMOIRE', basePower: 40, baseCurrent: 60 },
  5: { name: 'ARMOIRE', basePower: 35, baseCurrent: 50 },
  6: { name: 'LIGNE', basePower: 25, baseCurrent: 40 },
  7: { name: 'LIGNE', basePower: 20, baseCurrent: 35 },
  8: { name: 'LIGNE', basePower: 15, baseCurrent: 25 },
  9: { name: 'EQUIPEMENT', basePower: 10, baseCurrent: 15 },
  10: { name: 'EQUIPEMENT', basePower: 8, baseCurrent: 12 },
  11: { name: 'EQUIPEMENT', basePower: 30, baseCurrent: 45 }
};

async function generateHistoricalData(assetId) {
  const config = ASSET_CONFIG[assetId] || { basePower: 20, baseCurrent: 30 };
  
  console.log(`\n📊 Génération historique pour Asset ${assetId}...`);
  
  // Générer 48 heures de données (une mesure par heure)
  for (let i = 48; i >= 0; i--) {
    const date = new Date();
    date.setHours(date.getHours() - i);
    
    // Variation selon l'heure de la journée
    const hour = date.getHours();
    const isPeakHour = (hour >= 8 && hour <= 11) || (hour >= 17 && hour <= 21);
    const multiplier = isPeakHour ? 1.3 : 0.7;
    
    const data = {
      assetId: assetId,
      V1N: Number((230 + (Math.random() - 0.5) * 10).toFixed(1)),
      V2N: Number((230 + (Math.random() - 0.5) * 10).toFixed(1)),
      V3N: Number((230 + (Math.random() - 0.5) * 10).toFixed(1)),
      V12: Number((400 + (Math.random() - 0.5) * 15).toFixed(1)),
      V23: Number((400 + (Math.random() - 0.5) * 15).toFixed(1)),
      V31: Number((400 + (Math.random() - 0.5) * 15).toFixed(1)),
      I1: Number((config.baseCurrent * multiplier * (0.8 + Math.random() * 0.4)).toFixed(1)),
      I2: Number((config.baseCurrent * multiplier * (0.8 + Math.random() * 0.4)).toFixed(1)),
      I3: Number((config.baseCurrent * multiplier * (0.8 + Math.random() * 0.4)).toFixed(1)),
      TKW: Number((config.basePower * multiplier * (0.9 + Math.random() * 0.2)).toFixed(2)),
      IKWH: Number((config.basePower * (48 - i) + Math.random() * 10).toFixed(2)),
      HZ: Number((50 + (Math.random() - 0.5) * 0.3).toFixed(2)),
      PF: Number((0.9 + Math.random() * 0.08).toFixed(2)),
      KVAH: Number((config.basePower * 1.1 * (48 - i) + Math.random() * 10).toFixed(2)),
      timestamp: date.toISOString()
    };

    try {
      const res = await fetch('http://localhost:3000/measurements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (res.ok) {
        process.stdout.write('.');
      }
    } catch (e) {
      console.log(`\n❌ Erreur pour asset ${assetId}: Backend offline`);
      return false;
    }
  }
  console.log(` ✅ Asset ${assetId} terminé`);
  return true;
}

async function main() {
  console.log('🚀 Démarrage du générateur de données historiques...\n');
  
  for (const assetId of ASSET_IDS) {
    await generateHistoricalData(assetId);
    await new Promise(r => setTimeout(r, 500)); // Pause entre assets
  }
  
  console.log('\n✅ Toutes les données historiques ont été générées!');
}

main();