import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full h-full p-10 bg-[#f8fafc] overflow-y-auto">
      <h1 class="text-4xl font-black text-slate-900 mb-2 tracking-tighter">Historique des Alertes</h1>
      <p class="text-slate-500 mb-8 font-medium">Dépassements de seuils d'intensité détectés en temps réel.</p>

      <div class="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <table class="w-full text-left">
          <thead class="bg-slate-50 border-b border-slate-100">
            <tr>
              <th class="p-6 text-xs text-slate-400 uppercase tracking-widest">Date & Heure</th>
              <th class="p-6 text-xs text-slate-400 uppercase tracking-widest">Équipement</th>
              <th class="p-6 text-xs text-slate-400 uppercase tracking-widest">Message</th>
              <th class="p-6 text-xs text-slate-400 uppercase tracking-widest">Valeur Mesurée</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let a of alerts()" class="border-b border-slate-50 hover:bg-red-50/20 transition-all">
              <td class="p-6 text-sm font-bold text-slate-600">{{ a.timestamp | date:'dd/MM/yyyy HH:mm:ss' }}</td>
              <td class="p-6 font-black text-slate-900">{{ a.assetName }}</td>
              <td class="p-6 text-red-600 font-bold bg-red-50/50">{{ a.message }}</td>
              <td class="p-6 font-black text-red-600">{{ a.value }}A <span class="text-[10px] text-slate-400">(Seuil: {{a.threshold}}A)</span></td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="alerts().length === 0" class="p-20 text-center text-slate-300 font-bold italic">
          Aucune alerte enregistrée pour le moment. ✨
        </div>
      </div>
    </div>
  `
})
export class AlertsComponent implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  alerts = signal<any[]>([]);

  ngOnInit() {
    this.http.get<any[]>('http://localhost:3000/measurements/alerts/all', {
      headers: { Authorization: `Bearer ${this.auth.getToken()}` }
    }).subscribe(res => this.alerts.set(res));
  }
}