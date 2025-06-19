import { Module } from '@nestjs/common';
import { CuotasService } from './cuotas.service';
import { CuotasController } from './cuotas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
// entities
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { Cuota } from './entities/cuota.entity';

@Module({
  controllers: [CuotasController],
  providers: [CuotasService],
  imports: [
    TypeOrmModule.forFeature([ Cuota, Cliente ])
  ],
})
export class CuotasModule {}
