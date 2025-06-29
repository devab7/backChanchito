import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';

@Injectable()
export class LoginService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly jwtService: JwtService
  ) {}

  // async login(loginDto: LoginDto, res: Response) {

  //   const usuario = await this.usuarioRepository.findOne({
  //     where: { username: loginDto.username }
  //   });

  //   if (!usuario) {
  //     throw new UnauthorizedException('Credenciales inválidas');
  //   }

  //   const passwordValido = await bcrypt.compare(loginDto.password, usuario.password);

  //   if (!passwordValido) {
  //     throw new UnauthorizedException('Credenciales inválidas');
  //   }

  //   const payload = {
  //     sub: usuario.id,
  //     username: usuario.username,
  //     rol: usuario.rol
  //   };

  //   const accessToken = this.jwtService.sign(payload, {
  //     secret: process.env.JWT_SECRET,
  //     expiresIn: '15m'
  //   });

  //   const refreshToken = this.jwtService.sign(payload, {
  //     secret: process.env.JWT_REFRESH_SECRET,
  //     expiresIn: '7d'
  //   });

  //   // Guardás el refresh token en cookie segura
  //   res.cookie('refresh_token', refreshToken, {
  //     httpOnly: true,
  //     secure: true, // solo por HTTPS en producción
  //     sameSite: 'strict',
  //     maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
  //   });

  //   return {
  //     accessToken,
  //     usuario: {
  //       id: usuario.id,
  //       username: usuario.username,
  //       rol: usuario.rol
  //     }
  //   };
  // }

  async login(loginDto: LoginDto, res: Response) {
  console.time('⏱ Login completo');

  console.time('🔍 Buscar usuario');
  const usuario = await this.usuarioRepository.findOne({
    where: { username: loginDto.username }
  });
  console.timeEnd('🔍 Buscar usuario');

  if (!usuario) {
    console.timeEnd('⏱ Login completo');
    throw new UnauthorizedException('Credenciales inválidas');
  }

  console.time('🔐 Validar contraseña');
  const passwordValido = await bcrypt.compare(loginDto.password, usuario.password);
  console.timeEnd('🔐 Validar contraseña');

  if (!passwordValido) {
    console.timeEnd('⏱ Login completo');
    throw new UnauthorizedException('Credenciales inválidas');
  }

  const payload = {
    sub: usuario.id,
    username: usuario.username,
    rol: usuario.rol
  };

  console.time('🎟 Generar tokens');
  const accessToken = this.jwtService.sign(payload, {
    secret: process.env.JWT_SECRET,
    expiresIn: '15m'
  });

  const refreshToken = this.jwtService.sign(payload, {
    secret: process.env.JWT_REFRESH_SECRET,
    expiresIn: '7d'
  });
  console.timeEnd('🎟 Generar tokens');

  console.time('🍪 Setear cookie');
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  console.timeEnd('🍪 Setear cookie');

  console.timeEnd('⏱ Login completo');

  return {
    accessToken,
    usuario: {
      id: usuario.id,
      username: usuario.username,
      rol: usuario.rol
    }
  };
}


  verifyRefreshToken(token: string) {
  try {
    return this.jwtService.verify(token, {
      secret: process.env.JWT_REFRESH_SECRET
    });
  } catch (error) {
    throw new UnauthorizedException('Refresh token inválido o expirado');
  }
  }

  generateAccessToken(payload: any) {
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m'
    });
  }


}
