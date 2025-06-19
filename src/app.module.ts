import { Module } from '@nestjs/common';
import { CarsModule } from './cars/cars.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientesModule } from './clientes/clientes.module';
import { CuotasModule } from './cuotas/cuotas.module';


@Module({
  imports: [
    CarsModule,
    ConfigModule.forRoot(), // para poder cargar variables de entorno

    // TypeOrmModule.forRoot({ // conectando a la base de datos
    //   type: 'postgres',
    //   host: process.env.DB_HOST,
    //   port: Number(process.env.DB_PORT),
    //   database: process.env.DB_NAME,
    //   username: process.env.DB_USERNAME,
    //   password: process.env.DB_PASSWORD,      
    //   autoLoadEntities: true,
    //   synchronize: true,
    // }), ClientesModule, CuotasModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true, // ponlo en false en producción si no quieres que se altere el schema
    }),

  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
