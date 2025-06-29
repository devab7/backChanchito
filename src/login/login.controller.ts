import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  Res,
  UnauthorizedException
} from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginDto } from './dto/login.dto';
import { Request, Response } from 'express';

@Controller('auth')
export class LoginController {

  constructor(private readonly loginService: LoginService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.loginService.login(loginDto, res);
  }

  @Get('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(
    @Req() req: Request & { cookies: any },
    @Res({ passthrough: true }) res: Response
  ) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) throw new UnauthorizedException('Token de refresco no encontrado');

    const payload = this.loginService.verifyRefreshToken(refreshToken);
    const newAccessToken = this.loginService.generateAccessToken(payload);

    return { accessToken: newAccessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict'
    });

    return { message: 'Sesión cerrada exitosamente' };
  }


  // @Post()
  // create(@Body() createLoginDto: CreateLoginDto) {
  //   return this.loginService.create(createLoginDto);
  // }

  // @Get()
  // findAll() {
  //   return this.loginService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.loginService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateLoginDto: UpdateLoginDto) {
  //   return this.loginService.update(+id, updateLoginDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.loginService.remove(+id);
  // }

}
