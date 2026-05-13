import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ThresholdsService } from './thresholds.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('thresholds')
export class ThresholdsController {
  constructor(private readonly thresholdsService: ThresholdsService) {}

  @Get()
  findAll() {
    return this.thresholdsService.findAll();
  }

  @Get('asset/:id')
  findByAsset(@Param('id') id: string) {
    return this.thresholdsService.findByAsset(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.thresholdsService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() data: any) {
    return this.thresholdsService.create(data);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.thresholdsService.update(+id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.thresholdsService.remove(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/toggle')
  toggleActive(@Param('id') id: string) {
    return this.thresholdsService.toggleActive(+id);
  }
}
