import { Module } from '@nestjs/common';
import { CarsModule } from './cars/cars.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientesModule } from './clientes/clientes.module';
import { CuotasModule } from './cuotas/cuotas.module';

console.log('>>> DATABASE_URL desde NestJS:', process.env.DATABASE_URL); // 👈 Aquí imprimimos el valor real

@Module({
  imports: [
    CarsModule,
    // ConfigModule.forRoot(), // para poder cargar variables de entorno
    ConfigModule.forRoot({
      ignoreEnvFile: true, // esto evita usar .env local y fuerza variables del entorno (como las de Railway)
    }),

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

    
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        console.log('>>> DATABASE_URL cargado dinámicamente:', process.env.DATABASE_URL);
        return {
          type: 'postgres',
          url: process.env.DATABASE_URL,
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),

  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
