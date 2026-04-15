import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { AssetStateService } from '../services/asset-state.service';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full h-full p-10 bg-[#f8fafc] overflow-y-auto">
      <div class="mb-10 flex justify-between items-end">
        <div>
           <h1 class="text-4xl font-black text-slate-900 tracking-tight uppercase">
             Facture : {{ assetName() }}
           </h1>
           <p class="text-slate-500 font-bold italic text-sm">Basée sur les données réelles de consommation mensuelle</p>
        </div>
        <div class="flex gap-4 no-print">
          <button (click)="loadBillingData()" class="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition flex items-center gap-2">
            <span>🔄</span> Recalculer
          </button>
          <button (click)="window.print()" class="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2">
            <span>🖨️</span> Imprimer
          </button>
        </div>
      </div>

      <!-- TABLEAU STYLE STEG -->
      <div class="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden max-w-5xl mx-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-800 text-white">
              <th class="p-5 text-[10px] uppercase tracking-[0.2em]">Désignation / Libellé</th>
              <th class="p-5 text-[10px] uppercase tracking-[0.2em] text-center">Consommation</th>
              <th class="p-5 text-[10px] uppercase tracking-[0.2em] text-center">Prix Unitaire</th>
              <th class="p-5 text-[10px] uppercase tracking-[0.2em] text-right">Montant (DT)</th>
            </tr>
          </thead>
          <tbody class="text-slate-700 font-medium">
            <tr class="bg-[#4ade80] text-white font-black">
              <td colspan="3" class="p-4 px-6 italic uppercase tracking-wider">Énergie Active (kWh)</td>
              <td class="p-4 text-right">MONTANT HT</td>
            </tr>
            <tr class="border-b">
              <td class="p-4 px-10">Consommation Jour (Tarif Normal)</td>
              <td class="p-4 text-center font-bold">{{ (bill().activeEnergy * 0.4) | number:'1.2-2' }}</td>
              <td class="p-4 text-center">{{ bill().rateJour | number:'1.3-3' }}</td>
              <td class="p-4 text-right font-bold">{{ (bill().activeEnergy * 0.4 * bill().rateJour) | number:'1.3-3' }}</td>
            </tr>
            <tr class="border-b">
              <td class="p-4 px-10 text-blue-600">Pointe (Matin & Soir)</td>
              <td class="p-4 text-center font-bold text-blue-600">{{ (bill().activeEnergy * 0.2) | number:'1.2-2' }}</td>
              <td class="p-4 text-center text-blue-600">{{ bill().ratePointeMatin | number:'1.3-3' }}</td>
              <td class="p-4 text-right font-bold text-blue-600">{{ (bill().activeEnergy * 0.2 * bill().ratePointeMatin) | number:'1.3-3' }}</td>
            </tr>
            <tr class="border-b">
              <td class="p-4 px-10">Consommation Nuit</td>
              <td class="p-4 text-center font-bold">{{ (bill().activeEnergy * 0.4) | number:'1.2-2' }}</td>
              <td class="p-4 text-center">{{ bill().rateNuit | number:'1.3-3' }}</td>
              <td class="p-4 text-right font-bold">{{ (bill().activeEnergy * 0.4 * bill().rateNuit) | number:'1.3-3' }}</td>
            </tr>
            
            <tr class="bg-slate-50 font-black">
              <td colspan="3" class="p-4 text-blue-800 text-right uppercase tracking-widest text-sm">Sous-Total 1 (Énergie HT)</td>
              <td class="p-4 text-right text-blue-800 text-lg">{{ calculateEnergyHT() | number:'1.3-3' }} DT</td>
            </tr>

            <tr class="border-b">
              <td class="p-4 px-6 font-bold italic">Redevance de Puissance (Prime)</td>
              <td class="p-4 text-center">Souscription Annuelle</td>
              <td class="p-4 text-center">11.000 / kW</td>
              <td class="p-4 text-right font-bold">{{ bill().primePuissance | number:'1.3-3' }}</td>
            </tr>

            <tr class="border-b">
              <td colspan="3" class="p-4 px-6 font-bold">TVA sur Consommation (19%)</td>
              <td class="p-4 text-right font-bold text-red-500">{{ calculateTVA() | number:'1.3-3' }}</td>
            </tr>

            <tr class="bg-slate-900 text-white font-black">
              <td colspan="3" class="p-8 text-2xl uppercase tracking-[0.3em]">Total Net à Payer (TTC)</td>
              <td class="p-8 text-3xl text-right text-emerald-400">
                {{ calculateTotal() | number:'1.3-3' }} DT
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <p class="mt-8 text-xs text-slate-400 text-center uppercase tracking-widest font-bold">
        Système de Gestion d'Énergie VOLT EMS - PFE 2024
      </p>
    </div>
  `,
  styles: [`
    @media print {
      .no-print { display: none !important; }
      .p-10 { padding: 0 !important; }
      body { background: white !important; }
    }
  `]
})
export class BillingComponent implements OnInit {
  private http = inject(HttpClient);
  public authService = inject(AuthService); // Nom corrigé ici
  private assetService = inject(AssetStateService);
  window = window;

  assetName = signal<string>('Non sélectionné');
  bill = signal<any>({ 
    activeEnergy: 0, 
    rateJour: 0.290, 
    ratePointeMatin: 0.417, 
    rateSoir: 0.377, 
    rateNuit: 0.222, 
    primePuissance: 22000.000 
  });

  ngOnInit() {
    this.loadBillingData();
  }

  loadBillingData() {
    const selected = this.assetService.selectedAsset();
    const id = selected ? selected.id : 3; // On prend l'ID sélectionné ou l'ID 3 par défaut
    this.assetName.set(selected ? selected.name : 'TGBT Principal');

    const token = this.authService.getToken();
    if (!token) return;

    this.http.get<any>(`http://localhost:3000/measurements/billing/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe(res => {
      if (res) {
        this.bill.set(res);
        console.log("Facture mise à jour : ", res);
      }
    });
  }

  calculateEnergyHT() {
    const b = this.bill();
    return (b.activeEnergy * 0.4 * b.rateJour) + 
           (b.activeEnergy * 0.2 * b.ratePointeMatin) + 
           (b.activeEnergy * 0.4 * b.rateNuit);
  }

  calculateTVA() {
    return (this.calculateEnergyHT() + this.bill().primePuissance) * 0.19;
  }

  calculateTotal() {
    const surchargeMunicipale = this.bill().activeEnergy * 0.005;
    return this.calculateEnergyHT() + this.bill().primePuissance + this.calculateTVA() + surchargeMunicipale;
  }
}