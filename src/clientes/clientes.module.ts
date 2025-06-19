import { Module } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { ClientesController } from './clientes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Cliente } from './entities/cliente.entity';
import { Cuota } from 'src/cuotas/entities/cuota.entity';

@Module({
  controllers: [ClientesController],
  providers: [ClientesService],
  imports: [
    TypeOrmModule.forFeature([ Cliente, Cuota ])
  ],
})
export class ClientesModule {}
