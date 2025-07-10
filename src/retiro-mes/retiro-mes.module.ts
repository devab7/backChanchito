import { forwardRef, Module } from '@nestjs/common';
import { RetiroMesService } from './retiro-mes.service';
import { RetiroMesController } from './retiro-mes.controller';
import { RetiroMes } from './entities/retiro-mes.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientesModule } from 'src/clientes/clientes.module';

@Module({
  controllers: [RetiroMesController],
  providers: [RetiroMesService],
  imports: [
    TypeOrmModule.forFeature([RetiroMes]),
    forwardRef(() => ClientesModule), // ✅ rompe el ciclo aquí
  ],
  exports: [RetiroMesService],
})
export class RetiroMesModule {}
