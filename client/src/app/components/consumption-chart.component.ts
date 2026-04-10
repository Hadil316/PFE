import { Component, Input, OnChanges, SimpleChanges, signal, inject, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-consumption-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm mt-6">
      <div class="flex justify-between items-center mb-10">
        <div>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">Analyse Énergétique</h2>
          <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Historique consolidé (P, V, I)</p>
        </div>
        
        <div class="flex bg-slate-100 p-1.5 rounded-2xl border">
          <button (click)="setPeriod('day')" [class.bg-white]="period() === 'day'" class="px-6 py-2 rounded-xl text-[10px] font-black transition-all shadow-sm">JOUR</button>
          <button (click)="setPeriod('week')" [class.bg-white]="period() === 'week'" class="px-6 py-2 rounded-xl text-[10px] font-black transition-all shadow-sm mx-1">SEMAINE</button>
          <button (click)="setPeriod('month')" [class.bg-white]="period() === 'month'" class="px-5 py-2 rounded-xl text-[10px] font-black transition-all shadow-sm">MOIS</button>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-8">
        <!-- Graphique Temps Réel (EN HAUT) -->
        <div class="h-[300px] w-full relative">
          <p class="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">⚡ Temps Réel - Puissance (kW), Moyenne Tension (V) & Moyenne Intensité (A)</p>
          <canvas id="canvasRealtimeChart"></canvas>
        </div>

        <!-- Graphique Historique (EN BAS) -->
        <div class="h-[350px] w-full relative border-t pt-6">
          <p class="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">📊 Historique (Puissance, Tension, Intensité)</p>
          <canvas id="canvasMultiChart"></canvas>
          <div *ngIf="noData()" class="absolute inset-0 flex items-center justify-center bg-white/80">
            <p class="text-slate-400 font-bold text-sm italic">Collecte des données en cours...</p>
          </div>
        </div>
      </div>

      <div class="flex justify-center gap-12 mt-10">
        <div class="flex items-center gap-2"><span class="w-8 h-1 bg-blue-500 rounded-full"></span><span class="text-[10px] font-black text-slate-500 uppercase">Puissance (kW)</span></div>
        <div class="flex items-center gap-2"><span class="w-8 h-1 bg-amber-400 rounded-full"></span><span class="text-[10px] font-black text-slate-500 uppercase">Tension (V)</span></div>
        <div class="flex items-center gap-2"><span class="w-8 h-1 bg-emerald-500 rounded-full"></span><span class="text-[10px] font-black text-slate-500 uppercase">Intensité (A)</span></div>
      </div>
    </div>
  `
})
export class ConsumptionChartComponent implements OnChanges, OnInit, OnDestroy {
  @Input() assetId!: number;
  @Input() realtimeData!: any;

  private http = inject(HttpClient);
  
  period = signal<string>('day');
  noData = signal<boolean>(false);
  chart: any;
  realtimeChart: any;
  private refreshInterval: any;
  private realtimeDataPoints: { time: string, avgPower: number, avgVoltage: number, avgCurrent: number }[] = [];
  private maxRealtimePoints = 30;

  ngOnInit() {
    this.refreshInterval = setInterval(() => { if (this.assetId) this.fetchData(); }, 60000);
    this.initRealtimeChart();
  }

  ngOnDestroy() { 
    if (this.refreshInterval) clearInterval(this.refreshInterval);
    if (this.chart) this.chart.destroy();
    if (this.realtimeChart) this.realtimeChart.destroy();
  }

  ngOnChanges(changes: SimpleChanges) { 
    if (changes['assetId'] && this.assetId) this.fetchData();
    if (changes['realtimeData'] && changes['realtimeData'].currentValue) {
      this.updateRealtimeChart(changes['realtimeData'].currentValue);
    }
  }

  setPeriod(p: string) { this.period.set(p); this.fetchData(); }

  fetchData() {
    const token = localStorage.getItem('auth_token');
    this.http.get<any[]>(`http://localhost:3000/measurements/history/${this.assetId}?period=${this.period()}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (res: any[]) => {
        if (res && res.length > 0) { 
          this.noData.set(false); 
          this.initChart(res); 
        } else { 
          this.noData.set(true); 
          if (this.chart) this.chart.destroy(); 
        }
      },
      error: (err) => {
        console.error('Error fetching history:', err);
        this.noData.set(true);
      }
    });
  }

  initChart(data: any[]) {
    const labels = data.map(d => {
      const date = new Date(d.time);
      if (this.period() === 'day') {
        return `${date.getHours()}h${date.getMinutes().toString().padStart(2, '0')}`;
      } else {
        return `${date.getDate()}/${date.getMonth() + 1}`;
      }
    });

    if (this.chart) this.chart.destroy();

    this.chart = new Chart('canvasMultiChart', {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Puissance (kW)',
            data: data.map(d => d.avgPower),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.05)',
            borderWidth: 3,
            tension: 0.3,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointBackgroundColor: '#3b82f6',
            fill: true,
            yAxisID: 'y-power'
          },
          {
            label: 'Tension (V)',
            data: data.map(d => d.avgVoltage),
            borderColor: '#fbbf24',
            backgroundColor: 'rgba(251, 191, 36, 0.05)',
            borderWidth: 3,
            tension: 0.3,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointBackgroundColor: '#fbbf24',
            fill: true,
            yAxisID: 'y-voltage'
          },
          {
            label: 'Intensité (A)',
            data: data.map(d => d.avgCurrent),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.05)',
            borderWidth: 3,
            tension: 0.3,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointBackgroundColor: '#10b981',
            fill: true,
            yAxisID: 'y-current'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            position: 'top',
            labels: { font: { size: 11, weight: 'bold' } }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                let label = context.dataset.label || '';
                let rawValue = context.raw as number;
                if (rawValue === null || rawValue === undefined) return label;
                return `${label}: ${rawValue.toFixed(2)}`;
              }
            }
          }
        },
        scales: {
          'y-power': {
            type: 'linear',
            position: 'left',
            title: {
              display: true,
              text: 'Puissance (kW)',
              font: { size: 10, weight: 'bold' },
              color: '#3b82f6'
            },
            grid: { color: '#f8fafc' },
            ticks: { font: { size: 10 } }
          },
          'y-voltage': {
            type: 'linear',
            position: 'right',
            title: {
              display: true,
              text: 'Tension (V)',
              font: { size: 10, weight: 'bold' },
              color: '#fbbf24'
            },
            grid: { drawOnChartArea: false },
            ticks: { font: { size: 10 }, color: '#fbbf24' },
            min: 200,
            max: 250
          },
          'y-current': {
            type: 'linear',
            position: 'right',
            title: {
              display: true,
              text: 'Intensité (A)',
              font: { size: 10, weight: 'bold' },
              color: '#10b981'
            },
            grid: { drawOnChartArea: false },
            ticks: { font: { size: 10 }, color: '#10b981' }
          },
          x: {
            grid: { display: false },
            ticks: {
              maxTicksLimit: 12,
              font: { size: 9 },
              autoSkip: true
            },
            title: {
              display: true,
              text: this.period() === 'day' ? 'Heure' : 'Date',
              font: { size: 10, weight: 'bold' }
            }
          }
        }
      }
    });
  }

  initRealtimeChart() {
    if (this.realtimeChart) this.realtimeChart.destroy();
    
    this.realtimeChart = new Chart('canvasRealtimeChart', {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Puissance (kW)',
            data: [],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 3,
            tension: 0.3,
            pointRadius: 4,
            pointBackgroundColor: '#3b82f6',
            fill: true,
            yAxisID: 'y-power'
          },
          {
            label: 'Moyenne Tension (V)',
            data: [],
            borderColor: '#fbbf24',
            backgroundColor: 'rgba(251, 191, 36, 0.1)',
            borderWidth: 3,
            tension: 0.3,
            pointRadius: 4,
            pointBackgroundColor: '#fbbf24',
            fill: true,
            yAxisID: 'y-voltage'
          },
          {
            label: 'Moyenne Intensité (A)',
            data: [],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 3,
            tension: 0.3,
            pointRadius: 4,
            pointBackgroundColor: '#10b981',
            fill: true,
            yAxisID: 'y-current'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        plugins: { 
          legend: { 
            position: 'top',
            labels: { font: { size: 11, weight: 'bold' } }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                let label = context.dataset.label || '';
                let rawValue = context.raw as number;
                if (rawValue === null || rawValue === undefined) return label;
                let unit = '';
                if (label.includes('Puissance')) unit = 'kW';
                else if (label.includes('Tension')) unit = 'V';
                else if (label.includes('Intensité')) unit = 'A';
                return `${label}: ${rawValue.toFixed(2)} ${unit}`;
              }
            }
          }
        },
        scales: {
          'y-power': {
            type: 'linear',
            position: 'left',
            title: {
              display: true,
              text: 'Puissance (kW)',
              font: { size: 10, weight: 'bold' },
              color: '#3b82f6'
            },
            grid: { color: '#f8fafc' },
            ticks: { font: { size: 10 } }
          },
          'y-voltage': {
            type: 'linear',
            position: 'right',
            title: {
              display: true,
              text: 'Tension (V)',
              font: { size: 10, weight: 'bold' },
              color: '#fbbf24'
            },
            min: 200,
            max: 250,
            grid: { drawOnChartArea: false },
            ticks: { font: { size: 10 }, color: '#fbbf24' }
          },
          'y-current': {
            type: 'linear',
            position: 'right',
            title: {
              display: true,
              text: 'Intensité (A)',
              font: { size: 10, weight: 'bold' },
              color: '#10b981'
            },
            grid: { drawOnChartArea: false },
            ticks: { font: { size: 10 }, color: '#10b981' }
          },
          x: {
            title: { display: true, text: 'Temps', font: { size: 10, weight: 'bold' } },
            grid: { display: false },
            ticks: { maxTicksLimit: 10, font: { size: 9 } }
          }
        }
      }
    });
  }

  updateRealtimeChart(data: any) {
    if (!this.realtimeChart || !data) return;
    
    // Puissance
    const power = parseFloat(data.TKW) || 0;
    
    // Moyenne des tensions V1N, V2N, V3N
    const v1n = parseFloat(data.V1N) || 0;
    const v2n = parseFloat(data.V2N) || 0;
    const v3n = parseFloat(data.V3N) || 0;
    const avgVoltage = (v1n + v2n + v3n) / 3;
    
    // Moyenne des intensités I1, I2, I3
    const i1 = parseFloat(data.I1) || 0;
    const i2 = parseFloat(data.I2) || 0;
    const i3 = parseFloat(data.I3) || 0;
    const avgCurrent = (i1 + i2 + i3) / 3;
    
    const timestamp = data.timestamp ? new Date(data.timestamp) : new Date();
    const timeLabel = `${timestamp.getHours()}:${timestamp.getMinutes().toString().padStart(2, '0')}:${timestamp.getSeconds().toString().padStart(2, '0')}`;
    
    this.realtimeDataPoints.push({ time: timeLabel, avgPower: power, avgVoltage, avgCurrent });
    
    if (this.realtimeDataPoints.length > this.maxRealtimePoints) {
      this.realtimeDataPoints.shift();
    }
    
    this.realtimeChart.data.labels = this.realtimeDataPoints.map(p => p.time);
    this.realtimeChart.data.datasets[0].data = this.realtimeDataPoints.map(p => p.avgPower);
    this.realtimeChart.data.datasets[1].data = this.realtimeDataPoints.map(p => p.avgVoltage);
    this.realtimeChart.data.datasets[2].data = this.realtimeDataPoints.map(p => p.avgCurrent);
    
    this.realtimeChart.update('none');
  }
}