import { Module } from '@nestjs/common';
import { ThresholdsService } from './thresholds.service';
import { ThresholdsController } from './thresholds.controller';

@Module({
  controllers: [ThresholdsController],
  providers: [ThresholdsService],
  exports: [ThresholdsService],
})
export class ThresholdsModule {}