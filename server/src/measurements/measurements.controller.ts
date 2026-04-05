import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { MeasurementsService } from './measurements.service';
// CORRECTION ICI : Remplacement du tiret '-' par un point '.'
import { JwtAuthGuard } from '../auth/jwt.guard'; 

@Controller('measurements')
export class MeasurementsController {
  constructor(private readonly measurementsService: MeasurementsService) {}

  @Post()
  create(@Body() data: any) {
    return this.measurementsService.create(data);
  }

  @UseGuards(JwtAuthGuard)
  @Get('latest/:id')
  getLatest(@Param('id') id: string) {
    return this.measurementsService.findLatest(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('history/:id')
  getHistory(@Param('id') id: string, @Query('period') period: string) {
    return this.measurementsService.findHistory(+id, period || 'day');
  }
}