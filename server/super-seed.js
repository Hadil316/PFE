// server/super-seed.js
const ASSET_ID = 6; // L'ID de ton equipement1
const API_URL = 'http://localhost:3000/measurements';

async function runSeed() {
    console.log("🚀 Injection massive de 30 jours de données...");

    // 1. Générer les 30 derniers jours (1 point par jour pour la vue mois/semaine)
    for (let i = 30; i >= 1; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(12, 0, 0); // Milieu de journée

        const data = {
            assetId: ASSET_ID,
            V1N: 230, V2N: 229, V3N: 231, V12: 400, V23: 401, V31: 399,
            I1: 20 + Math.random() * 5, I2: 19, I3: 21,
            TKW: Number((12 + Math.random() * 8).toFixed(2)), // Puissance variée
            IKWH: 1000 + (30 - i) * 25,
            HZ: 50, PF: 0.95,
            timestamp: date.toISOString()
        };
        await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        console.log(`✅ Jour -${i} créé`);
    }

    // 2. Générer les 12 dernières heures (1 point toutes les 5 minutes pour la vue JOUR)
    console.log("🕒 Génération des détails pour la vue JOUR...");
    for (let i = 144; i >= 0; i--) {
        const date = new Date();
        date.setMinutes(date.getMinutes() - (i * 5));
        
        // Simuler une baisse la nuit et hausse le jour
        const hour = date.getHours();
        const activity = (hour > 7 && hour < 19) ? 1.5 : 0.4;

        const data = {
            assetId: ASSET_ID,
            V1N: 230 + Math.random() * 2, V12: 400,
            I1: (15 * activity) + Math.random() * 2,
            TKW: Number(((10 * activity) + Math.random() * 5).toFixed(2)),
            timestamp: date.toISOString()
        };
        await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    }

    console.log("🏁 TERMINE ! Tout est prêt.");
}
runSeed();