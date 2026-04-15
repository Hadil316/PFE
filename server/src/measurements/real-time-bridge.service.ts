import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../db/database.provider';
import * as schema from '../db/schema';
import { MeasurementsService } from './measurements.service';
import WebSocket from 'ws';
import { eq } from 'drizzle-orm';

@Injectable()
export class RealTimeBridgeService implements OnModuleInit {
  private activeSocket: WebSocket | null = null;
  private activeAssetId: number | null = null;
  private disconnectTimer: NodeJS.Timeout | null = null;

  constructor(@Inject(DATABASE_CONNECTION) private db: any, private measurementsService: MeasurementsService) {}

  async onModuleInit() {}

  async activateOnly(assetId: number) {
    this.resetDisconnectTimer();
    if (this.activeAssetId === assetId && this.activeSocket?.readyState === WebSocket.OPEN) return;
    this.stopCurrentConnection();
    const [asset] = await this.db.select().from(schema.assets).where(eq(schema.assets.id, assetId));
    if (asset && asset.webSocketLink) this.createSocketConnection(asset);
  }

  private createSocketConnection(asset: any) {
    this.activeAssetId = asset.id;
    try {
      this.activeSocket = new WebSocket(asset.webSocketLink);
      this.activeSocket.on('message', async (data) => {
        try {
          const p = JSON.parse(data.toString());
          await this.measurementsService.create({
            assetId: asset.id, V1N: p.V1N, V2N: p.V2N, V3N: p.V3N, V12: p.V12, V23: p.V23, V31: p.V31,
            I1: p.I1, I2: p.I2, I3: p.I3, TKW: p.TKW, IKWH: p.KWH, HZ: p.HZ, PF: p.PF, KVAH: p.KVAH,
            timestamp: new Date()
          });

          // LOGIQUE ALERTES SPRINT 3
          const maxI = Math.max(p.I1, p.I2, p.I3);
          if (asset.maxCurrent && maxI > asset.maxCurrent) {
            await this.db.insert(schema.alerts).values({
              assetId: asset.id, message: `Surcharge détectée sur ${asset.name}`,
              value: maxI, threshold: asset.maxCurrent
            });
          }
        } catch (e) {}
      });
    } catch (e) {}
  }

  private stopCurrentConnection() {
    if (this.activeSocket) { this.activeSocket.terminate(); this.activeSocket = null; }
  }

  private resetDisconnectTimer() {
    if (this.disconnectTimer) clearTimeout(this.disconnectTimer);
    this.disconnectTimer = setTimeout(() => this.stopCurrentConnection(), 10000);
  }
}