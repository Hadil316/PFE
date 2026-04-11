import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { MeasurementsService } from './measurements.service';
import { RealTimeBridgeService } from './real-time-bridge.service'; // <-- AJOUTÉ
import { JwtAuthGuard } from '../auth/jwt.guard'; 

@Controller('measurements')
export class MeasurementsController {
  constructor(
    private readonly measurementsService: MeasurementsService,
    private readonly bridgeService: RealTimeBridgeService, // <-- AJOUTÉ
  ) {}

  @Post()
  create(@Body() data: any) {
    return this.measurementsService.create(data);
  }

  @UseGuards(JwtAuthGuard)
  @Get('latest/:id')
  async getLatest(@Param('id') id: string) {
    // --- LOGIQUE DE CONNEXION UNIQUE ---
    // Chaque fois que le dashboard demande les données d'un ID, 
    // on demande au bridge de couper les autres et d'activer cet ID.
    await this.bridgeService.activateOnly(+id);
    
    return this.measurementsService.findLatest(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('history/:id')
  getHistory(@Param('id') id: string, @Query('period') period: string) {
    return this.measurementsService.findHistory(+id, period || 'day');
  }
}