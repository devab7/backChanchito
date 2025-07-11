import { Type } from 'class-transformer';
import { IsString, IsOptional, IsDateString, Length, IsDate } from 'class-validator';

export class CreateClienteDto {
    
  @IsString()
  @Length(8, 8)
  dni: string;

  @IsString()
  @Length(1, 100)
  nombres: string;

  @IsString()
  @Length(9, 9)
  telefono: string;

  @IsOptional()
  @IsString()
  // @Length(1, 200)
  direccion?: string;

  @IsOptional()
  @IsString()
  // @Length(1, 100)
  lugarNacimiento?: string;

  @IsOptional()
  @IsString()
  // @Length(9, 9)
  telefono2?: string;

  // @IsOptional()
  // @IsDateString()
  // cumple?: string;

  @IsOptional()
  @IsDateString()
  cumple?: string;



}
