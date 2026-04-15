import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full h-full p-10 bg-[#f8fafc] overflow-y-auto">
      <div class="mb-12">
        <h1 class="text-4xl font-black text-slate-900 mb-2 tracking-tighter uppercase">Centre d'Exploitation</h1>
        <p class="text-slate-500 font-medium italic">Générez des rapports d'analyse complets pour chaque point de mesure.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div *ngFor="let asset of assets()" class="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-2xl transition-all group">
          <div>
            <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black mb-6 shadow-inner text-xl">
              {{ asset.id }}
            </div>
            <h3 class="text-2xl font-black text-slate-900 mb-1">{{ asset.name }}</h3>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">{{ asset.type }}</p>
            
            <ul class="text-[10px] font-bold text-slate-500 space-y-2 mb-8">
              <li><span class="text-emerald-500 mr-2">✔</span> ANALYSE TENSION / COURANT</li>
              <li><span class="text-emerald-500 mr-2">✔</span> BILAN PUISSANCE (TKW)</li>
              <li><span class="text-emerald-500 mr-2">✔</span> STABILITÉ RÉSEAU (HZ)</li>
            </ul>
          </div>
          
          <button (click)="download(asset.id)" class="w-full py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-3">
            <span>📥</span> EXPORTER RAPPORT
          </button>
        </div>
      </div>

      <div *ngIf="assets().length === 0" class="p-20 text-center text-slate-300 font-bold italic">
          Chargement de la hiérarchie industrielle...
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
        this.assets.set(list.filter(a => a.type !== 'SITE')); // On affiche tout sauf le Site global
      }
    });
  }

  download(id: number) {
    window.open(`http://localhost:3000/measurements/report/${id}`, '_blank');
  }
}