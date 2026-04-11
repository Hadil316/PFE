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

  constructor(
    @Inject(DATABASE_CONNECTION) private db: any,
    private measurementsService: MeasurementsService,
  ) {}

  async onModuleInit() {
    console.log('🔌 Pont WebSocket Intelligent prêt');
  }

  /**
   * Active le WebSocket et gère la déconnexion automatique si l'utilisateur quitte
   */
  async activateOnly(assetId: number) {
    // 1. Réinitialiser le timer à chaque appel (Watchdog)
    // Si l'utilisateur est sur le dashboard, cette fonction est appelée toutes les 2s
    this.resetDisconnectTimer();

    if (this.activeAssetId === assetId && this.activeSocket?.readyState === WebSocket.OPEN) {
      return;
    }

    // 2. Déconnecter l'ancien si changement d'asset
    this.stopCurrentConnection();

    // 3. Chercher le lien dans la DB
    const [asset] = await this.db
      .select()
      .from(schema.assets)
      .where(eq(schema.assets.id, assetId));

    if (!asset || !asset.webSocketLink) {
      this.activeAssetId = null;
      return;
    }

    this.createSocketConnection(asset);
  }

  private createSocketConnection(asset: any) {
    const url = asset.webSocketLink;
    this.activeAssetId = asset.id;

    try {
      this.activeSocket = new WebSocket(url);

      this.activeSocket.on('open', () => {
        console.log(`✅ CONNECTÉ : ${asset.name}`);
      });

      this.activeSocket.on('message', async (data) => {
        try {
          const parsed = JSON.parse(data.toString());
          await this.measurementsService.create({
            assetId: asset.id,
            V1N: parsed.V1N, V2N: parsed.V2N, V3N: parsed.V3N,
            V12: parsed.V12, V23: parsed.V23, V31: parsed.V31,
            I1: parsed.I1, I2: parsed.I2, I3: parsed.I3,
            TKW: parsed.TKW, IKWH: parsed.KWH, HZ: parsed.HZ, PF: parsed.PF, KVAH: parsed.KVAH,
            timestamp: new Date(),
          });
        } catch (e) {}
      });

      this.activeSocket.on('error', () => this.stopCurrentConnection());
      this.activeSocket.on('close', () => { this.activeSocket = null; });

    } catch (error) {
      console.error(`❌ Erreur connexion ${asset.name}`);
    }
  }

  private stopCurrentConnection() {
    if (this.activeSocket) {
      console.log(`🔌 DÉCONNEXION de l'équipement (Signal perdu ou changement)`);
      this.activeSocket.terminate();
      this.activeSocket = null;
      this.activeAssetId = null;
    }
  }

  private resetDisconnectTimer() {
    // Si un timer existe, on l'annule
    if (this.disconnectTimer) clearTimeout(this.disconnectTimer);

    // On crée un nouveau timer de 10 secondes
    // Si pendant 10s le dashboard ne demande rien, on coupe tout.
    this.disconnectTimer = setTimeout(() => {
      console.log('⏱️ Watchdog: Aucun utilisateur détecté sur le Dashboard.');
      this.stopCurrentConnection();
    }, 10000); 
  }
}