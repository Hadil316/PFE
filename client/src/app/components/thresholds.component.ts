import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { AssetStateService } from '../services/asset-state.service';

interface Threshold {
  id: number;
  assetId: number;
  parameter: string;
  minValue: number | null;
  maxValue: number | null;
  isActive: number;
}

interface Asset {
  id: number;
  name: string;
  type: string;
}

@Component({
  selector: 'app-thresholds',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="w-full h-full p-10 bg-[#f8fafc] overflow-y-auto custom-scrollbar">
      
      <!-- HEADER -->
      <div class="mb-10 flex justify-between items-end px-4">
        <div>
          <h1 class="text-4xl font-black bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent tracking-tight mb-2 uppercase">
            Seuils d'Alerte
          </h1>
          <p class="text-slate-400 font-bold italic text-sm uppercase tracking-widest">Configurez les seuils de surveillance</p>
        </div>
        
        <button (click)="showAddModal.set(true)" 
                class="px-8 py-3 bg-cyan-500/10 text-cyan-600 border-2 border-cyan-500/20 rounded-full font-black text-[12px] uppercase shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:bg-cyan-500 hover:text-white transition-all flex items-center gap-2">
          <span>➕</span> Ajouter Seuil
        </button>
      </div>

      <!-- FILTRE PAR ASSET -->
      <div class="mb-8 flex gap-4 items-center">
        <label class="text-sm font-bold text-slate-600 uppercase">Filtrer par :</label>
        <select (change)="filterByAsset($event)" class="px-4 py-2 rounded-xl border-2 border-slate-200 font-bold text-sm">
          <option value="0">Tous les équipements</option>
          <option *ngFor="let asset of assets()" [value]="asset.id">{{ asset.name }} ({{ asset.type }})</option>
        </select>
      </div>

      <!-- LISTE DES SEUILS -->
      <div class="bg-white/70 backdrop-blur-sm rounded-[2.5rem] shadow-[0_0_60px_rgba(59,130,246,0.1)] border border-white p-8">
        
        <div class="grid gap-4">
          <div *ngFor="let threshold of filteredThresholds()" 
               class="bg-white rounded-2xl p-6 border-2 transition-all hover:shadow-lg"
               [class.border-emerald-100]="threshold.isActive"
               [class.border-red-100]="!threshold.isActive">
            
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center"
                     [class.bg-emerald-100]="threshold.isActive"
                     [class.bg-red-100]="!threshold.isActive">
                  <span class="text-2xl">{{ getParamIcon(threshold.parameter) }}</span>
                </div>
                <div>
                  <h3 class="text-lg font-black text-slate-800 uppercase">{{ threshold.parameter }}</h3>
                  <p class="text-xs font-bold text-slate-400 uppercase">
                    Équipement ID: {{ threshold.assetId }}
                    <span class="mx-2">|</span>
                    <span [class.text-emerald-500]="threshold.isActive" [class.text-red-500]="!threshold.isActive">
                      {{ threshold.isActive ? '● ACTIF' : '○ INACTIF' }}
                    </span>
                  </p>
                </div>
              </div>
              
              <div class="flex items-center gap-6">
                <div class="text-center">
                  <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">Min</p>
                  <p class="text-lg font-black text-red-500">{{ threshold.minValue || '-' }}</p>
                </div>
                <div class="text-center">
                  <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">Max</p>
                  <p class="text-lg font-black text-red-500">{{ threshold.maxValue || '-' }}</p>
                </div>
                
                <div class="flex gap-2">
                  <button (click)="toggleThreshold(threshold)" 
                          class="px-4 py-2 rounded-xl font-black text-[10px] uppercase transition-all"
                          [class.bg-emerald-100]="!threshold.isActive"
                          [class.text-emerald-600]="!threshold.isActive"
                          [class.bg-red-100]="threshold.isActive"
                          [class.text-red-600]="threshold.isActive">
                    {{ threshold.isActive ? 'Désactiver' : 'Activer' }}
                  </button>
                  <button (click)="editThreshold(threshold)" 
                          class="px-4 py-2 bg-blue-100 text-blue-600 rounded-xl font-black text-[10px] uppercase hover:bg-blue-600 hover:text-white transition-all">
                    Modifier
                  </button>
                  <button (click)="deleteThreshold(threshold.id)" 
                          class="px-4 py-2 bg-red-100 text-red-600 rounded-xl font-black text-[10px] uppercase hover:bg-red-600 hover:text-white transition-all">
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div *ngIf="filteredThresholds().length === 0" class="p-12 text-center text-slate-300 font-bold italic">
            Aucun seuil configuré. Cliquez sur "Ajouter Seuil" pour commencer.
          </div>
        </div>
      </div>

      <!-- MODAL AJOUTER/MODIFIER -->
      <div *ngIf="showAddModal()" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-[2rem] p-8 w-[500px] shadow-2xl">
          <h2 class="text-2xl font-black text-slate-800 mb-6 uppercase">
            {{ editingThreshold() ? 'Modifier' : 'Ajouter' }} un Seuil
          </h2>
          
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Équipement</label>
              <select [(ngModel)]="formAssetId" class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 font-bold">
                <option *ngFor="let asset of assets()" [value]="asset.id">{{ asset.name }} ({{ asset.type }})</option>
              </select>
            </div>
            
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Paramètre</label>
              <select [(ngModel)]="formParameter" class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 font-bold">
                <option value="V1N">Tension V1N (V)</option>
                <option value="V2N">Tension V2N (V)</option>
                <option value="V3N">Tension V3N (V)</option>
                <option value="V12">Tension V12 (V)</option>
                <option value="V23">Tension V23 (V)</option>
                <option value="V31">Tension V31 (V)</option>
                <option value="I1">Courant I1 (A)</option>
                <option value="I2">Courant I2 (A)</option>
                <option value="I3">Courant I3 (A)</option>
                <option value="TKW">Puissance (kW)</option>
                <option value="HZ">Fréquence (Hz)</option>
                <option value="PF">Facteur de Puissance</option>
              </select>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Valeur Min</label>
                <input type="number" [(ngModel)]="formMinValue" placeholder="Ex: 220" 
                       class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 font-bold">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Valeur Max</label>
                <input type="number" [(ngModel)]="formMaxValue" placeholder="Ex: 240" 
                       class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 font-bold">
              </div>
            </div>
          </div>
          
          <div class="flex gap-4 mt-8">
            <button (click)="saveThreshold()" 
                    class="flex-1 py-3 bg-cyan-500 text-white rounded-xl font-black uppercase hover:bg-cyan-600 transition-all">
              Enregistrer
            </button>
            <button (click)="closeModal()" 
                    class="flex-1 py-3 bg-slate-200 text-slate-600 rounded-xl font-black uppercase hover:bg-slate-300 transition-all">
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; height: 100%; }
  `]
})
export class ThresholdsComponent implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private assetService = inject(AssetStateService);

  thresholds = signal<Threshold[]>([]);
  assets = signal<Asset[]>([]);
  filteredThresholds = signal<Threshold[]>([]);
  selectedAssetId = signal<number>(0);
  
  showAddModal = signal<boolean>(false);
  editingThreshold = signal<Threshold | null>(null);
  
  formAssetId: number = 0;
  formParameter: string = 'V1N';
  formMinValue: number | null = null;
  formMaxValue: number | null = null;

  ngOnInit() {
    this.loadAssets();
    this.loadThresholds();
  }

  loadAssets() {
    const token = this.auth.getToken();
    this.http.get<any[]>('http://localhost:3000/assets/tree', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe(res => {
      const list: Asset[] = [];
      const flatten = (items: any[]) => {
        items.forEach(i => {
          list.push({ id: i.id, name: i.name, type: i.type });
          if (i.children && i.children.length > 0) flatten(i.children);
        });
      };
      if (res) {
        flatten(res);
        this.assets.set(list);
        if (list.length > 0) this.formAssetId = list[0].id;
      }
    });
  }

  loadThresholds() {
    const token = this.auth.getToken();
    this.http.get<Threshold[]>('http://localhost:3000/thresholds', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe(res => {
      this.thresholds.set(res || []);
      this.applyFilter();
    });
  }

  filterByAsset(event: any) {
    this.selectedAssetId.set(+event.target.value);
    this.applyFilter();
  }

  applyFilter() {
    const assetId = this.selectedAssetId();
    if (assetId === 0) {
      this.filteredThresholds.set(this.thresholds());
    } else {
      this.filteredThresholds.set(this.thresholds().filter(t => t.assetId === assetId));
    }
  }

  getParamIcon(param: string): string {
    const icons: any = {
      V1N: '⚡', V2N: '⚡', V3N: '⚡', V12: '⚡', V23: '⚡', V31: '⚡',
      I1: '🔌', I2: '🔌', I3: '🔌',
      TKW: '📊', HZ: '📈', PF: '🎯'
    };
    return icons[param] || '📌';
  }

  toggleThreshold(threshold: Threshold) {
    const token = this.auth.getToken();
    this.http.put(`http://localhost:3000/thresholds/${threshold.id}/toggle`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe(() => this.loadThresholds());
  }

  editThreshold(threshold: Threshold) {
    this.editingThreshold.set(threshold);
    this.formAssetId = threshold.assetId;
    this.formParameter = threshold.parameter;
    this.formMinValue = threshold.minValue;
    this.formMaxValue = threshold.maxValue;
    this.showAddModal.set(true);
  }

  deleteThreshold(id: number) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce seuil?')) return;
    const token = this.auth.getToken();
    this.http.delete(`http://localhost:3000/thresholds/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe(() => this.loadThresholds());
  }

  saveThreshold() {
    const token = this.auth.getToken();
    const data = {
      assetId: this.formAssetId,
      parameter: this.formParameter,
      minValue: this.formMinValue,
      maxValue: this.formMaxValue,
      isActive: true
    };

    if (this.editingThreshold()) {
      this.http.put(`http://localhost:3000/thresholds/${this.editingThreshold()!.id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe(() => {
        this.closeModal();
        this.loadThresholds();
      });
    } else {
      this.http.post('http://localhost:3000/thresholds', data, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe(() => {
        this.closeModal();
        this.loadThresholds();
      });
    }
  }

  closeModal() {
    this.showAddModal.set(false);
    this.editingThreshold.set(null);
    this.formMinValue = null;
    this.formMaxValue = null;
  }
}
