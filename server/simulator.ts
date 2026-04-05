// On met l'ID 11 car c'est "equipement 1" dans ta base de données 
// et c'est ce que ton Dashboard Angular essaie de lire.
const ASSET_ID = 11; 

setInterval(async () => {
  // Génération de fausses données réalistes pour un système industriel triphasé
  const data = {
    assetId: ASSET_ID,
    
    // Tensions simples (autour de 230V)
    V1N: (230 + Math.random() * 2).toFixed(1),
    V2N: (230 + Math.random() * 2).toFixed(1),
    V3N: (230 + Math.random() * 2).toFixed(1),
    
    // Tensions composées (autour de 400V)
    V12: (400 + Math.random() * 4).toFixed(1),
    V23: (400 + Math.random() * 4).toFixed(1),
    V31: (400 + Math.random() * 4).toFixed(1),
    
    // Courants (autour de 45A)
    I1: (45 + Math.random() * 5).toFixed(1),
    I2: (45 + Math.random() * 5).toFixed(1),
    I3: (45 + Math.random() * 5).toFixed(1),
    
    // Puissances et autres
    TKW: (30 + Math.random() * 2).toFixed(2),     // Puissance totale (kW)
    IKWH: (1500 + Math.random() * 1).toFixed(2),  // Énergie cumulée (kWh)
    HZ: (49.9 + Math.random() * 0.2).toFixed(2),  // Fréquence (Hz)
    PF: (0.92 + Math.random() * 0.05).toFixed(2), // Cos Phi / Power Factor
    KVAH: (1600 + Math.random() * 1).toFixed(2),  // Énergie apparente
  };

  try {
    await fetch('http://localhost:3000/measurements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    console.log("⚡ [Simulator] Pushed to Asset " + ASSET_ID + " | Power:", data.TKW + " kW");
  } catch (e) { 
    console.log("Backend offline"); 
  }
}, 2000);