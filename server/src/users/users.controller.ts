import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController { // <--- لازم يكون اسمها UsersController مش AssetsController
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