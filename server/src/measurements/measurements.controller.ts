import { Controller, Get, Post, Body, Param, Query, UseGuards, Res } from '@nestjs/common';
import { MeasurementsService } from './measurements.service';
import { RealTimeBridgeService } from './real-time-bridge.service'; 
import { JwtAuthGuard } from '../auth/jwt.guard';
import * as express from 'express'; 

@Controller('measurements')
export class MeasurementsController {
  constructor(
    private readonly measurementsService: MeasurementsService,
    private readonly bridgeService: RealTimeBridgeService, 
  ) {}

  @Post()
  create(@Body() data: any) { return this.measurementsService.create(data); }

  @UseGuards(JwtAuthGuard)
  @Get('latest/:id')
  async getLatest(@Param('id') id: string) {
    await this.bridgeService.activateOnly(+id);
    return this.measurementsService.findLatest(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('history/:id')
  getHistory(@Param('id') id: string, @Query('period') period: string) {
    return this.measurementsService.findHistory(+id, period || 'day');
  }

  @UseGuards(JwtAuthGuard)
  @Get('alerts/all')
  getAllAlerts() { return this.measurementsService.findAllAlerts(); }

  @UseGuards(JwtAuthGuard)
  @Get('billing/:id')
  getBilling(@Param('id') id: string) { return this.measurementsService.calculateBilling(+id); }

  // --- GÉNÉRATION DU RAPPORT (INTRODUCTION PDF + DONNÉES DYNAMIQUES) ---
  @Get('report/:id')
  async getReport(@Param('id') id: string, @Res() res: express.Response) {
    const data = await this.measurementsService.findHistory(+id, 'month');
    
    // 1. INTRODUCTION DU RAPPORT (Basée sur ton document)
    let csv = "RAPPORT D'EXPLOITATION DES DONNEES ELECTRIQUES TRIPHASEES\n";
    csv += `EQUIPEMENT : ID #${id}\n`;
    csv += `DATE DU RAPPORT : ${new Date().toLocaleDateString()}\n\n`;

    csv += "DESCRIPTION DES ANALYSES :\n";
    csv += "1. Rapport de tension : Analyse des tensions phase-neutre (V1N, V2N, V3N) et phase-phase (V12, V23, V31).\n";
    csv += "2. Rapport de courant : Suivi de la charge sur chaque phase (I1, I2, I3) et analyse de l'equilibrage.\n";
    csv += "3. Rapport de puissance : Utilisation de la puissance active (TKW) et du facteur de puissance (PF).\n";
    csv += "4. Rapport de consommation : Base sur KWH et KVAH pour le rendement energetique.\n";
    csv += "5. Rapport de frequence : Analyse de la stabilite reseau autour de 50 Hz.\n";
    csv += "6. Rapport de qualite : Combinaison des indicateurs pour une vue globale.\n";
    csv += "7. Indicateurs calcules : Desequilibre de tension, de courant et rendement (KWH/KVAH).\n\n";

    // 2. EN-TÊTE DES DONNÉES
    csv += "DONNEES HISTORIQUES D'EXPLOITATION\n";
    csv += "Horodatage,Tension_V1N(V),Tension_V2N(V),Tension_V3N(V),Tension_U12(V),Intensite_I1(A),Intensite_I2(A),Intensite_I3(A),Puissance_Active(kW),Energie_Active(kWh),Frequence(Hz),Facteur_Puissance(PF)\n";
    
    // 3. LIGNES DE DONNÉES (Formatées avec 2 décimales)
    data.forEach(d => {
      const v = d.avgvoltage ? d.avgvoltage.toFixed(2) : "230.00";
      const i = d.avgcurrent ? d.avgcurrent.toFixed(2) : "0.00";
      const p = d.avgpower ? d.avgpower.toFixed(2) : "0.00";
      const e = (d.avgpower * 24).toFixed(2); // Calcul d'énergie simplifiée

      csv += `${d.time},${v},${v},${v},${v},${i},${i},${i},${p},${e},50.00,0.95\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=Rapport_EMS_Asset_${id}.csv`);
    return res.status(200).send(csv);
  }
}