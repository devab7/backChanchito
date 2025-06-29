import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
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

  @Get('reporte/dia')
  findAllDia() {
    return this.cuotasService.findAllCuotasDelDia();
  }

  // @Get('base-del-mes/:id')
  // getCuotaBaseDelMes(@Param('id', ParseIntPipe) id: number) {
  //   return this.cuotasService.obtenerCuotaBaseDelMes(id); // puede devolver null sin drama
  // }

  @Get('base-del-mes/:id')
  getCuotaBaseDelMes(
    @Param('id') id: number,
    @Query('mes') mes?: string
  ) {
    return this.cuotasService.obtenerCuotaBaseDelMes(id, mes);
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
