import { Component, signal, OnInit, inject, OnDestroy, NgZone } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ConsumptionChartComponent } from './consumption-chart.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule, ConsumptionChartComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private zone = inject(NgZone);
  public authService = inject(AuthService);

  selectedAsset = signal<any>(null);
  private monitorInterval: any;

  liveData = signal({
    V1N: '000', V2N: '000', V3N: '000', V12: '000', V23: '000', V31: '000',
    I1: '0.0', I2: '0.0', I3: '0.0', TKW: '0.00', IKWH: '0.00', HZ: '00.00', PF: '0.00',
    timestamp: new Date()
  });

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const id = Number(params['id']);
      if (id && !isNaN(id)) {
        this.zone.run(() => {
          this.resetLiveData();
          this.fetchAssetDetails(id);
          this.startMonitoring(id);
        });
      }
    });
  }

  private resetLiveData() {
    this.liveData.set({
      V1N: '000', V2N: '000', V3N: '000', V12: '000', V23: '000', V31: '000',
      I1: '0.0', I2: '0.0', I3: '0.0', TKW: '0.00', IKWH: '0.00', HZ: '00.00', PF: '0.00',
      timestamp: new Date()
    });
  }

  fetchAssetDetails(id: number) {
    const token = this.authService.getToken();
    this.http.get<any>(`http://localhost:3000/assets/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: (res) => this.selectedAsset.set(res),
      error: () => this.selectedAsset.set(null)
    });
  }

  startMonitoring(id: number) {
    if (this.monitorInterval) clearInterval(this.monitorInterval);
    this.monitorInterval = setInterval(() => {
      const token = this.authService.getToken();
      this.http.get<any>(`http://localhost:3000/measurements/latest/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).subscribe({
        next: (res) => {
          this.zone.run(() => {
            if (res) this.liveData.set({ ...res, timestamp: res.timestamp || new Date() });
          });
        },
        error: () => this.resetLiveData()
      });
    }, 2000);
  }

  ngOnDestroy() { if (this.monitorInterval) clearInterval(this.monitorInterval); }
}