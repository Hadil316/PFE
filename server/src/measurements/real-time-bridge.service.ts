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
          // WebSocket utilisé UNIQUEMENT pour affichage temps réel
          // L'enregistrement se fait via HTTP POST séparément

          // LOGIQUE ALERTES SPRINT 3
          const maxI = Math.max(p.I1, p.I2, p.I3);
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