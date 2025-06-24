import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { CuotasService } from './cuotas.service';
import { CreateCuotaDto } from './dto/create-cuota.dto';
import { UpdateCuotaDto } from './dto/update-cuota.dto';

@Controller('cuotas')
export class CuotasController {
  constructor(private readonly cuotasService: CuotasService) {}

  @Post()
  create(@Body() createCuotaDto: CreateCuotaDto) {
    return this.cuotasService.create(createCuotaDto);
  }

  @Get()
  findAll() {
    return this.cuotasService.findAll();
  }

  @Get('resumen/dia')
  findAllDia() {
    return this.cuotasService.findAllCuotasDelDia();
  }

  @Get('reporte/cuotabase/:clienteId')
  getCuotaBaseDelMes(@Param('clienteId', ParseIntPipe) clienteId: number) {
    return this.cuotasService.obtenerCuotaBaseDelMes(clienteId); // puede devolver null sin drama
  }


  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cuotasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCuotaDto: UpdateCuotaDto) {
    return this.cuotasService.update(+id, updateCuotaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cuotasService.remove(+id);
  }
}
