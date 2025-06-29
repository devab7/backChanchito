import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { LoginController } from './login.controller';
import { LoginService } from './login.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { UsuarioModule } from 'src/usuario/usuario.module';
import { JwtStrategy } from 'src/login/strategies/jwt.strategy';
import { RolesGuard } from 'src/login/guards/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario]),
    UsuarioModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' }
    })
  ],
  controllers: [LoginController],
  providers: [LoginService, JwtStrategy, RolesGuard]
})
export class LoginModule {}

