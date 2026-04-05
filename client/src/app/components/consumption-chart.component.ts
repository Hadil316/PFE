import { Component, Input, OnChanges, SimpleChanges, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-consumption-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mt-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-black text-slate-900 tracking-tight">Analyse Énergétique</h2>
        
        <div class="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button (click)="setPeriod('day')" 
                  [class.bg-white]="period() === 'day'" 
                  class="px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all shadow-sm">JOUR</button>
          <button (click)="setPeriod('week')" 
                  [class.bg-white]="period() === 'week'" 
                  class="px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all shadow-sm">SEMAINE</button>
          <button (click)="setPeriod('month')" 
                  [class.bg-white]="period() === 'month'" 
                  class="px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all shadow-sm">MOIS</button>
        </div>
      </div>

      <div class="h-[320px] w-full relative">
        <canvas id="canvasChart"></canvas>
        <div *ngIf="noData()" class="absolute inset-0 flex items-center justify-center bg-white/80">
          <p class="text-slate-400 font-bold text-sm">En attente de données du simulateur...</p>
        </div>
      </div>
    </div>
  `
})
export class ConsumptionChartComponent implements OnChanges {
  @Input() assetId!: number;
  private http = inject(HttpClient);
  
  period = signal<string>('day');
  noData = signal<boolean>(false);
  chart: any;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['assetId'] && this.assetId) {
      this.fetchData();
    }
  }

  setPeriod(p: string) {
    this.period.set(p);
    this.fetchData();
  }

  fetchData() {
    const token = localStorage.getItem('auth_token');
    this.http.get<any[]>(`http://localhost:3000/measurements/history/${this.assetId}?period=${this.period()}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe((res: any[]) => {
      if (res && res.length > 0) {
        this.noData.set(false);
        this.initChart(res);
      } else {
        this.noData.set(true);
        if (this.chart) this.chart.destroy();
      }
    });
  }

  initChart(data: any[]) {
    const labels = data.map(d => {
      const date = new Date(d.time);
      if (this.period() === 'day') {
        return `${date.getHours()}h:${date.getMinutes().toString().padStart(2, '0')}`;
      }
      return `${date.getDate()}/${date.getMonth() + 1}`;
    });

    const values = data.map(d => d.avgPower);

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart('canvasChart', {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Puissance (kW)',
          data: values,
          borderColor: '#3b82f6',
          borderWidth: 4,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointHitRadius: 15,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#3b82f6',
          pointBorderWidth: 3,
          fill: true,
          // --- CORRECTION DE L'ERREUR ICI ---
          backgroundColor: (context: any) => {
            const chart = context.chart;
            const {ctx, chartArea} = chart;
            if (!chartArea) {
              return 'rgba(59, 130, 246, 0.1)'; // Retourne une couleur simple si l'aire n'est pas prête
            }
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
            gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
            return gradient;
          },
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#f1f5f9' },
            ticks: { font: { size: 10, weight: 'bold' }, color: '#64748b' }
          },
          x: {
            grid: { display: false },
            ticks: { font: { size: 10, weight: 'bold' }, color: '#64748b' }
          }
        }
      }
    });
  }
}