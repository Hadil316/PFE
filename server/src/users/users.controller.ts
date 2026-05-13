import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() { return this.usersService.findAll(); }

  @Get('permissions/all')
  getAllPermissions() { 
    console.log('[DEBUG] GET /users/permissions/all called');
    return this.usersService.getAllPermissions(); 
  }

  @Get(':id/permissions')
  getUserPermissions(@Param('id') id: string) {
    console.log('[DEBUG] GET /users/:id/permissions called with id:', id);
    return this.usersService.getUserPermissions(+id);
  }

  @Post()
  create(@Body() data: any) { 
    console.log('[DEBUG] POST /users called with data:', data);
    return this.usersService.create(data); 
  }

  @Post(':id/permissions')
  assignPermissions(@Param('id') id: string, @Body() body: { permissionIds: number[] }) {
    console.log('[DEBUG] POST /users/:id/permissions called with id:', id, 'permissions:', body);
    return this.usersService.assignPermissions(+id, body.permissionIds);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) { 
    console.log('[DEBUG] PATCH /users/:id called with id:', id, 'data:', data);
    return this.usersService.update(+id, data); 
  }

  @Patch(':id/password')
  updatePassword(@Param('id') id: string, @Body() body: { password: string }) {
    return this.usersService.updatePassword(+id, body.password);
  }

  @Delete(':id')
  remove(@Param('id') id: string) { 
    console.log('[DEBUG] DELETE /users/:id called with id:', id);
    return this.usersService.remove(+id); 
  }
}
