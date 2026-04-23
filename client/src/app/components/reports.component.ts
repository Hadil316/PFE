import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full h-full p-10 bg-[#f8fafc] overflow-y-auto custom-scrollbar">
      
      <!-- HEADER -->
      <div class="mb-10 flex justify-between items-end">
        <div>
          <h1 class="text-4xl font-black bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent tracking-tight mb-2 uppercase">
            Centre d'Exploitation
          </h1>
          <p class="text-slate-500 font-medium italic text-sm">Générez des rapports d'analyse complets pour chaque point de mesure.</p>
        </div>
        
        <div class="bg-white rounded-2xl px-6 py-3 border-2 border-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.1)] flex items-center gap-3">
          <span class="text-emerald-500 text-xl">📄</span>
          <span class="text-xs font-black text-slate-700 uppercase tracking-widest">Rapports Prêts</span>
        </div>
      </div>

      <!-- GRAND CONTENEUR LUMINEUX -->
      <div class="bg-white/70 backdrop-blur-sm rounded-[2.5rem] shadow-[0_0_60px_rgba(59,130,246,0.1)] border border-white p-12">
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          
          <!-- CARTES DE RAPPORTS -->
          <div *ngFor="let asset of assets()" 
               class="bg-white rounded-[2.5rem] p-8 border-2 transition-all hover:scale-[1.03] flex flex-col justify-between min-h-[350px]"
               [class.border-purple-100]="asset.type === 'TGBT'" [class.shadow-[0_0_25px_rgba(168,85,247,0.1)]]="asset.type === 'TGBT'"
               [class.border-orange-100]="asset.type === 'ARMOIRE'" [class.shadow-[0_0_25px_rgba(245,158,11,0.1)]]="asset.type === 'ARMOIRE'"
               [class.border-emerald-100]="asset.type === 'LIGNE'" [class.shadow-[0_0_25px_rgba(16,185,129,0.1)]]="asset.type === 'LIGNE'"
               [class.border-pink-100]="asset.type === 'EQUIPEMENT'" [class.shadow-[0_0_25px_rgba(244,114,182,0.1)]]="asset.type === 'EQUIPEMENT'">
            
            <div>
              <div class="flex justify-between items-start mb-8">
                <!-- SYGLES STYLE CAPTURE 5 -->
                <div class="w-12 h-12 rounded-2xl bg-white shadow-md border border-slate-50 flex items-center justify-center">
                   <svg *ngIf="asset.type === 'TGBT'" class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                   <svg *ngIf="asset.type === 'ARMOIRE'" class="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                   <svg *ngIf="asset.type === 'LIGNE'" class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                   <svg *ngIf="asset.type === 'EQUIPEMENT'" class="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/></svg>
                </div>

                <span [class]="'px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] ' + 
                      (asset.type === 'TGBT' ? 'bg-purple-50 text-purple-600' : 
                       asset.type === 'ARMOIRE' ? 'bg-orange-50 text-orange-500' : 
                       asset.type === 'LIGNE' ? 'bg-emerald-50 text-emerald-500' : 'bg-pink-50 text-pink-500')">
                  {{ asset.type }}
                </span>
              </div>

              <h3 class="text-2xl font-black text-slate-800 mb-6 tracking-tight uppercase">{{ asset.name }}</h3>
              
              <ul class="space-y-3 mb-10">
                <li class="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                   <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Analyse Tension / Courant
                </li>
                <li class="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                   <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Bilan Puissance (TKW)
                </li>
                <li class="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                   <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Stabilité Réseau (Hz)
                </li>
              </ul>
            </div>
            
            <!-- BOUTON EXPORTER STYLE CAPTURE 2 (TRANSPARENT ET ARRONDI) -->
            <button (click)="download(asset.id)" 
                    [class]="'w-full py-4 rounded-full font-black text-[10px] uppercase tracking-widest transition-all border-2 shadow-sm flex items-center justify-center gap-2 ' + 
                    (asset.type === 'TGBT' ? 'bg-purple-500/5 text-purple-600 border-purple-200 hover:bg-purple-600 hover:text-white' : 
                     asset.type === 'ARMOIRE' ? 'bg-orange-500/5 text-orange-600 border-orange-200 hover:bg-orange-600 hover:text-white' : 
                     asset.type === 'LIGNE' ? 'bg-emerald-500/5 text-emerald-600 border-emerald-200 hover:bg-emerald-600 hover:text-white' : 
                     'bg-pink-500/5 text-pink-600 border-pink-200 hover:bg-pink-600 hover:text-white')">
              📥 Exporter Rapport (.CSV)
            </button>
          </div>
        </div>

        <div *ngIf="assets().length === 0" class="p-20 text-center text-slate-300 font-bold italic">
            Chargement de la hiérarchie industrielle...
        </div>
      </div>
    </div>
  `
})
export class ReportsComponent implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  assets = signal<any[]>([]);

  ngOnInit() {
    const token = this.auth.getToken();
    this.http.get<any[]>('http://localhost:3000/assets/tree', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe(res => {
      const list: any[] = [];
      const flatten = (items: any[]) => {
        items.forEach(i => {
          list.push(i);
          if (i.children && i.children.length > 0) flatten(i.children);
        });
      };
      if (res) {
        flatten(res);
        this.assets.set(list.filter(a => a.type !== 'SITE'));
      }
    });
  }

  download(id: number) {
    window.open(`http://localhost:3000/measurements/report/${id}`, '_blank');
  }
}