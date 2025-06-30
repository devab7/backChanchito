import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser'; // 👈 agregá esto arriba

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: ['http://localhost:4200', 'https://front-chancito.vercel.app'],
    credentials: true,
  });

  app.use(cookieParser()); // 👈 acá lo agregás

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
