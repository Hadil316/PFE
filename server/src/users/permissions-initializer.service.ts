import { Injectable, OnModuleInit } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../db/database.provider';
import * as schema from '../db/schema';

@Injectable()
export class PermissionsInitializerService implements OnModuleInit {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: any
  ) {}

  async onModuleInit() {
    await this.initializePermissions();
  }

  private async initializePermissions() {
    try {
      const permissions = [
        { code: 'VIEW_DASHBOARD', name: 'Voir le tableau de bord', description: 'Accès au tableau de bord principal' },
        { code: 'VIEW_REPORTS', name: 'Voir les rapports', description: 'Accès aux rapports mensuels/annuels' },
        { code: 'VIEW_INVOICES', name: 'Voir les factures', description: 'Accès aux factures et facturation' },
        { code: 'VIEW_ALERTS', name: 'Voir les alertes', description: 'Voir les alertes et anomalies' },
        { code: 'MANAGE_THRESHOLDS', name: 'Gérer les seuils', description: 'Modifier les seuils d\'alerte' },
        { code: 'MANAGE_ASSETS', name: 'Gérer les équipements', description: 'Créer/modifier/supprimer les équipements' },
        { code: 'MANAGE_USERS', name: 'Gérer les utilisateurs', description: 'Créer/modifier/supprimer les utilisateurs' },
        { code: 'VIEW_CONSUMPTION', name: 'Voir la consommation', description: 'Voir les données temps réel et historiques' },
        { code: 'EXPORT_DATA', name: 'Exporter les données', description: 'Exporter les données en CSV/PDF' },
        { code: 'VIEW_BILLING', name: 'Voir la facturation', description: 'Accès aux détails de facturation' }
      ];

      for (const perm of permissions) {
        try {
          // Try to insert, ignore if already exists
          await this.db.insert(schema.permissions).values(perm);
        } catch (e) {
          // Permission already exists, skip
          console.log(`Permission ${perm.code} already exists`);
        }
      }

      console.log('✅ Permissions initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing permissions:', error);
    }
  }
}
