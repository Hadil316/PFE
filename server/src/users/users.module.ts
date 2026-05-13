import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PermissionsInitializerService } from './permissions-initializer.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PermissionsInitializerService],
  exports: [UsersService]
})
export class UsersModule {}
