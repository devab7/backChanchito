import { forwardRef, Module } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { ClientesController } from './clientes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Cliente } from './entities/cliente.entity';
import { Cuota } from 'src/cuotas/entities/cuota.entity';
import { RetiroMesModule } from 'src/retiro-mes/retiro-mes.module';

@Module({
  controllers: [ClientesController],
  providers: [ClientesService],
  imports: [
    TypeOrmModule.forFeature([ Cliente, Cuota ]),
    forwardRef(() => RetiroMesModule), // ✅ rompe el ciclo aquí
  ],
  exports: [TypeOrmModule]
})
export class ClientesModule {}
