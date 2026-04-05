// server/seed-history.js
const ASSET_ID = 6; 

async function seed() {
    console.log("🌱 Tentative d'injection d'historique...");
    
    for (let i = 24; i >= 0; i--) {
        const date = new Date();
        date.setHours(date.getHours() - i); 

        const data = {
            assetId: ASSET_ID,
            // On envoie des chiffres ronds pour être sûr
            V1N: 230, V2N: 229, V3N: 231,
            V12: 400, V23: 401, V31: 399,
            I1: 15, I2: 14, I3: 16,
            TKW: Number((10 + Math.random() * 10).toFixed(2)),
            IKWH: Number((50 + (24-i)).toFixed(2)),
            HZ: 50, PF: 0.95, KVAH: 60,
            // On convertit la date en format ISO pour NestJS
            timestamp: date.toISOString() 
        };

        try {
            const res = await fetch('http://localhost:3000/measurements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            
            if (res.ok) {
                console.log(`✅ ${date.getHours()}h : Succès`);
            } else {
                const err = await res.json();
                console.log(`❌ ${date.getHours()}h : Erreur ${res.status} - ${err.message || 'Détail inconnu'}`);
            }
        } catch (e) {
            console.log("❌ Serveur injoignable");
            break;
        }
    }
}
seed();