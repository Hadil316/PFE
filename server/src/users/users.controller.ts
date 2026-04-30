import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() { return this.usersService.findAll(); }

  @Post()
  create(@Body() data: any) { return this.usersService.create(data); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) { return this.usersService.update(+id, data); }

  @Patch(':id/password')
  updatePassword(@Param('id') id: string, @Body() body: { password: string }) {
    return this.usersService.updatePassword(+id, body.password);
  }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.usersService.remove(+id); }
}