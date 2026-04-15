import { Component, Input, OnChanges, SimpleChanges, signal, inject, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-consumption-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8">
      <!-- 1. GRAPHIQUE TEMPS RÉEL -->
      <div class="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-black text-slate-900 uppercase tracking-tighter">⚡ Suivi en Direct (P, V, I)</h2>
          <span class="flex items-center gap-2 text-[10px] font-bold text-emerald-500 animate-pulse">● LIVE MONITORING</span>
        </div>
        <div class="h-[280px] w-full"><canvas #realtimeCanvas></canvas></div>
      </div>

      <!-- 2. GRAPHIQUE HISTORIQUE -->
      <div class="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div class="flex justify-between items-center mb-8">
          <h2 class="text-xl font-black text-slate-900 uppercase tracking-tighter">📊 Analyse Historique</h2>
          <div class="flex bg-slate-100 p-1 rounded-xl border">
            <button (click)="setPeriod('day')" [class.bg-white]="period() === 'day'" class="px-4 py-1.5 rounded-lg text-[10px] font-black shadow-sm transition-all">JOUR</button>
            <button (click)="setPeriod('week')" [class.bg-white]="period() === 'week'" class="px-4 py-1.5 rounded-lg text-[10px] font-black shadow-sm mx-1 transition-all">SEMAINE</button>
            <button (click)="setPeriod('month')" [class.bg-white]="period() === 'month'" class="px-4 py-1.5 rounded-lg text-[10px] font-black shadow-sm transition-all">MOIS</button>
          </div>
        </div>
        <div class="h-[350px] w-full relative">
           <canvas #historyCanvas></canvas>
           <div *ngIf="noData()" class="absolute inset-0 flex items-center justify-center bg-white/90">
             <p class="text-slate-400 font-bold text-sm italic">Collecte des données en cours...</p>
           </div>
        </div>
        <div class="flex justify-center gap-8 mt-6">
          <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-blue-500"></span><span class="text-[9px] font-black text-slate-500 uppercase">Puissance (kW)</span></div>
          <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-orange-500"></span><span class="text-[9px] font-black text-slate-500 uppercase">Tension (V)</span></div>
          <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-emerald-500"></span><span class="text-[9px] font-black text-slate-500 uppercase">Intensité (A)</span></div>
        </div>
      </div>
    </div>
  `
})
export class ConsumptionChartComponent implements OnChanges, OnInit, OnDestroy {
  @Input() assetId!: number;
  @Input() realtimeData!: any; 

  @ViewChild('realtimeCanvas') realtimeCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('historyCanvas') historyCanvas!: ElementRef<HTMLCanvasElement>;

  private http = inject(HttpClient);
  period = signal<string>('day');
  noData = signal<boolean>(false);
  
  private rtChart: any;
  private histChart: any;
  private refreshInterval: any;

  ngOnInit() {
    this.refreshInterval = setInterval(() => { if (this.assetId) this.fetchHistory(); }, 30000);
  }

  ngOnDestroy() { 
    if (this.refreshInterval) clearInterval(this.refreshInterval);
    if (this.rtChart) this.rtChart.destroy();
    if (this.histChart) this.histChart.destroy();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['assetId'] && this.assetId) this.fetchHistory();
    if (changes['realtimeData'] && this.realtimeData) this.updateRealtimeChart();
  }

  setPeriod(p: string) {
    this.period.set(p);
    this.fetchHistory();
  }

  private updateRealtimeChart() {
    if (!this.realtimeCanvas || !this.realtimeData) return;
    if (!this.rtChart) this.initRealtimeChart();

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.rtChart.data.labels.push(time);
    
    // CORRECTION : On met à jour les 3 datasets
    this.rtChart.data.datasets[0].data.push(parseFloat(this.realtimeData.TKW || 0));
    this.rtChart.data.datasets[1].data.push(parseFloat(this.realtimeData.V1N || 0));
    this.rtChart.data.datasets[2].data.push(parseFloat(this.realtimeData.I1 || 0));
    
    if (this.rtChart.data.labels.length > 20) {
      this.rtChart.data.labels.shift();
      this.rtChart.data.datasets.forEach((d: any) => d.data.shift());
    }
    this.rtChart.update('none');
  }

  private initRealtimeChart() {
    this.rtChart = new Chart(this.realtimeCanvas.nativeElement, {
      type: 'line',
      data: { labels: [], datasets: [
        { label: 'Puissance', data: [], borderColor: '#3b82f6', borderWidth: 3, tension: 0.4, pointRadius: 0, yAxisID: 'y' },
        { label: 'Tension', data: [], borderColor: '#f59e0b', borderWidth: 3, tension: 0.4, pointRadius: 0, yAxisID: 'yV' },
        { label: 'Intensité', data: [], borderColor: '#10b981', borderWidth: 3, tension: 0.4, pointRadius: 0, yAxisID: 'y' }
      ]},
      options: { 
        responsive: true, maintainAspectRatio: false, animation: false,
        plugins: { legend: { display: false } }, 
        scales: { 
          x: { display: true, ticks: { font: { size: 9 }, autoSkip: true, maxTicksLimit: 8 } },
          y: { position: 'left', beginAtZero: true, title: { display: true, text: 'kW / A', font: { size: 10 } } },
          yV: { position: 'right', min: 0, max: 500, title: { display: true, text: 'Volts', font: { size: 10 } }, grid: { display: false } }
        } 
      }
    });
  }

  fetchHistory() {
    const token = localStorage.getItem('auth_token');
    this.http.get<any[]>(`http://localhost:3000/measurements/history/${this.assetId}?period=${this.period()}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe((res: any[]) => { 
        if (res && res.length > 0) {
            this.noData.set(false);
            this.initHistoryChart(res); 
        } else {
            this.noData.set(true);
            if (this.histChart) this.histChart.destroy();
        }
    });
  }

  private initHistoryChart(data: any[]) {
    if (!this.historyCanvas) return;
    const labels = data.map(d => {
      const date = new Date(d.time);
      return this.period() === 'day' ? `${date.getHours()}h:${date.getMinutes()}` : `${date.getDate()}/${date.getMonth() + 1}`;
    });

    if (this.histChart) this.histChart.destroy();
    this.histChart = new Chart(this.historyCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          { label: 'Puissance', data: data.map(d => d.avgpower), borderColor: '#3b82f6', borderWidth: 3, tension: 0.4, yAxisID: 'y', pointRadius: 0 },
          { label: 'Tension', data: data.map(d => d.avgvoltage), borderColor: '#f59e0b', borderWidth: 3, tension: 0.4, yAxisID: 'yV', pointRadius: 0 },
          { label: 'Intensité', data: data.map(d => d.avgcurrent), borderColor: '#10b981', borderWidth: 3, tension: 0.4, yAxisID: 'y', pointRadius: 0 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { type: 'linear', position: 'left', grid: { color: '#f1f5f9' }, title: { display: true, text: 'kW / A' } },
          yV: { type: 'linear', position: 'right', min: 0, max: 500, grid: { display: false }, title: { display: true, text: 'Volts' } },
          x: { ticks: { maxTicksLimit: 10 } }
        }
      }
    });
  }
}