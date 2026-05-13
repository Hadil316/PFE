import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../db/database.provider';
import * as schema from '../db/schema';
import WebSocket from 'ws';
import { eq } from 'drizzle-orm';

@Injectable()
export class RealTimeBridgeService implements OnModuleInit {
  private activeSocket: WebSocket | null = null;
  private activeAssetId: number | null = null;
  private connectingAssetId: number | null = null;
  private wasOpen = false;
  private disconnectTimer: NodeJS.Timeout | null = null;

  constructor(@Inject(DATABASE_CONNECTION) private db: any) {}

  async onModuleInit() {}

  async activateOnly(assetId: number) {
    this.resetDisconnectTimer();

    if (this.activeAssetId === assetId && this.activeSocket?.readyState === WebSocket.OPEN) return;
    if (this.connectingAssetId === assetId && this.activeSocket?.readyState === WebSocket.CONNECTING) return;

    if (this.activeAssetId !== assetId) {
      this.stopCurrentConnection();
    }

    const [asset] = await this.db.select().from(schema.assets).where(eq(schema.assets.id, assetId));
    if (asset && asset.webSocketLink) {
      this.connectingAssetId = asset.id;
      this.createSocketConnection(asset);
    }
  }

  private createSocketConnection(asset: any) {
    try {
      this.activeSocket = new WebSocket(asset.webSocketLink);

      this.activeSocket.on('open', () => {
        this.activeAssetId = asset.id;
        this.connectingAssetId = null;
        this.wasOpen = true;
      });

      this.activeSocket.on('message', async (data) => {
        try {
          const p = JSON.parse(data.toString());
          // Enregistre les données temps réel dans la table measurements.
          // Cela permet au dashboard de récupérer le dernier point via /measurements/latest/:id.
          await this.db.insert(schema.measurements).values({
            assetId: asset.id,
            V1N: Number(p.V1N ?? p.v1n ?? 0),
            V2N: Number(p.V2N ?? p.v2n ?? 0),
            V3N: Number(p.V3N ?? p.v3n ?? 0),
            V12: Number(p.V12 ?? p.v12 ?? 0),
            V23: Number(p.V23 ?? p.v23 ?? 0),
            V31: Number(p.V31 ?? p.v31 ?? 0),
            I1: Number(p.I1 ?? p.i1 ?? 0),
            I2: Number(p.I2 ?? p.i2 ?? 0),
            I3: Number(p.I3 ?? p.i3 ?? 0),
            TKW: Number(p.TKW ?? p.tkw ?? 0),
            IKWH: Number(p.IKWH ?? p.ikwh ?? 0),
            HZ: Number(p.HZ ?? p.hz ?? 0),
            PF: Number(p.PF ?? p.pf ?? 0),
            KVAH: Number(p.KVAH ?? p.kvah ?? 0),
            timestamp: p.timestamp ? new Date(p.timestamp) : new Date(),
          });

          // LOGIQUE ALERTES SPRINT 3
          const maxI = Math.max(p.I1 ?? p.i1 ?? 0, p.I2 ?? p.i2 ?? 0, p.I3 ?? p.i3 ?? 0);
          if (asset.maxCurrent && maxI > asset.maxCurrent) {
            await this.db.insert(schema.alerts).values({
              assetId: asset.id, message: `Surcharge détectée sur ${asset.name}`,
              value: maxI, threshold: asset.maxCurrent
            });
          }
        } catch (e) {
          console.warn('WebSocket message handling error:', e);
        }
      });

      this.activeSocket.on('error', (err) => {
        console.warn('WebSocket error:', err?.toString?.() || err);
        if (this.activeSocket?.readyState !== WebSocket.OPEN) {
          this.stopCurrentConnection();
        }
      });

      this.activeSocket.on('unexpected-response', (_req, res) => {
        console.warn('WebSocket unexpected response:', res.statusCode, res.statusMessage);
        this.stopCurrentConnection();
      });

      this.activeSocket.on('close', () => {
        if (this.activeSocket) {
          this.activeSocket = null;
        }
        this.connectingAssetId = null;
        this.activeAssetId = null;
        this.wasOpen = false;
      });
    } catch (e) {
      console.warn('WebSocket connection failed:', e);
      this.connectingAssetId = null;
      this.activeAssetId = null;
      this.wasOpen = false;
    }
  }

  private stopCurrentConnection() {
    if (this.activeSocket) {
      this.activeSocket.terminate();
      this.activeSocket = null;
    }
    this.activeAssetId = null;
    this.connectingAssetId = null;
    this.wasOpen = false;
  }

  private resetDisconnectTimer() {
    if (this.disconnectTimer) clearTimeout(this.disconnectTimer);
    this.disconnectTimer = setTimeout(() => this.stopCurrentConnection(), 10000);
  }
}
