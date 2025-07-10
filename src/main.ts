import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser'; // 👈 agregá esto arriba

async function bootstrap() {

    // console.log('>> DB URL:', process.env.DATABASE_URL); // 👈 Aquí lo verás en logs de Railway
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: ['http://localhost:4200'],
    // origin: ['https://www.chanchitorojo.com'],
    credentials: true,
  });


  app.use(cookieParser()); // 👈 acá lo agregás

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );
  console.log('✅ NestJS está por iniciar...');
  await app.listen(process.env.PORT ?? 3000);
  // await app.listen(process.env.PORT ?? 3000, '0.0.0.0');

}
bootstrap();
