import { Module } from '@nestjs/common';
import { CarsModule } from './cars/cars.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientesModule } from './clientes/clientes.module';
import { CuotasModule } from './cuotas/cuotas.module';
import { UsuarioModule } from './usuario/usuario.module';
import { LoginModule } from './login/login.module';

// console.log('>>> DATABASE_URL desde NestJS:', process.env.DATABASE_URL); // 👈 Aquí imprimimos el valor real

@Module({
  imports: [
    CarsModule,
    
    ConfigModule.forRoot(), // para poder cargar variables de entorno

    ConfigModule.forRoot({
      ignoreEnvFile: true,
      isGlobal: true, // 👈 esto es clave para que ConfigService esté disponible en todos los módulos
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
    // }), ClientesModule, CuotasModule, UsuarioModule, LoginModule,

    
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbUrl = config.get<string>('DATABASE_URL');
        console.log('>>> DATABASE_URL con ConfigService:', dbUrl);
        return {
          type: 'postgres',
          url: dbUrl,
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),
    ClientesModule, 
    CuotasModule


  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
