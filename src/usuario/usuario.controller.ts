import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/login/guards/roles.guard';
import { Roles } from 'src/login/decorators/roles.decorator';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get(':id')
  @Roles('ADMIN', 'SUPERADMIN')
  findOne(@Param('id') id: number) {
    // lógica protegida
  }

  @Get('admin-area')
  @Roles('ADMIN')
  getAdminStuff() {
    return 'Zona de admins';
  }

  // @Post()
  // create(@Body() createUsuarioDto: CreateUsuarioDto) {
  //   return this.usuarioService.create(createUsuarioDto);
  // }

  // @Get()
  // findAll() {
  //   return this.usuarioService.findAll();
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
  //   return this.usuarioService.update(+id, updateUsuarioDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.usuarioService.remove(+id);
  // }

  

}
