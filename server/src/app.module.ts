import { Module } from '@nestjs/common';
import { DbModule } from './db/db.module';
import { UsersModule } from './users/users.module';
import { AssetsModule } from './assets/assets.module';
import { MeasurementsModule } from './measurements/measurements.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [DbModule, UsersModule, AssetsModule, MeasurementsModule, AuthModule],
})
export class AppModule {}