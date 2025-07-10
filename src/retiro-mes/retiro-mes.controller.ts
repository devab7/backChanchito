import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RetiroMesService } from './retiro-mes.service';
import { RetirarMesDto } from './dto/retirar-mes.dto';
import { RetiroMes } from './entities/retiro-mes.entity';

@Controller('retiro-mes')
export class RetiroMesController {
  constructor(private readonly retiroMesService: RetiroMesService) {}

  @Post()
  async retirarMes(@Body() dto: RetirarMesDto): Promise<RetiroMes> {
    return await this.retiroMesService.retirarMes(dto);
  }

  @Get()
  findAll() {
    return this.retiroMesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.retiroMesService.findOne(+id);
  }


}


