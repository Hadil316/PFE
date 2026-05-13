import { Controller, Get, Post, Body, Param, Delete, Patch } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('assets')
@UseGuards(JwtAuthGuard)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get('tree')
  findAll() {
    try {
      return this.assetsService.findAll();
    } catch (e: any) {
      console.error("Erreur dans le controller:", e.message || e);
      return { error: e.message || 'Erreur inconnue', data: [] };
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assetsService.findOne(+id);
  }

  @Post()
  create(@Body() data: any) {
    return this.assetsService.create(data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assetsService.remove(+id);
  }

  // ✅ AJOUT PATCH pour modifier
  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.assetsService.update(+id, data);
  }
}
