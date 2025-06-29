import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { JwtAuthGuard } from 'src/login/guards/jwt-auth.guard';
import { RolesGuard } from 'src/login/guards/roles.guard';
import { Roles } from 'src/login/decorators/roles.decorator';

@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post()
  create(@Body() createClienteDto: CreateClienteDto) {
    return this.clientesService.create(createClienteDto);
  }

  @Get()
  findAll() {
    return this.clientesService.findAll();
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.clientesService.findOne(+id);
  // }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('mes') mes?: string
  ) {
    return this.clientesService.findOne(+id, mes);
  }


  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClienteDto: UpdateClienteDto) {
    return this.clientesService.update(+id, updateClienteDto);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.clientesService.remove(+id);
  // }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @Roles('ADMIN', 'SUPERADMIN') // Ambos roles podrán eliminar
  remove(@Param('id') id: string) {
    return this.clientesService.remove(+id);
  }





}

