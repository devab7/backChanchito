// import { PartialType } from '@nestjs/mapped-types';
// import { CreateClienteDto } from './create-cliente.dto';

// export class UpdateClienteDto extends PartialType(CreateClienteDto) {}


import { Type } from 'class-transformer';
import { IsString, IsOptional, IsDateString, Length, IsDate } from 'class-validator';

export class UpdateClienteDto {
  
  @IsOptional()
  @IsString()
  @Length(8, 8)
  dni?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  nombres?: string;

  @IsOptional()
  @IsString()
  @Length(9, 9)
  telefono?: string;

  @IsOptional()
  @IsString()
  @Length(1, 200)
  direccion?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  lugarNacimiento?: string;

  @IsOptional()
  @IsString()
  @Length(9, 9)
  telefono2?: string;

  // @IsOptional()
  // @IsDateString()
  // cumple?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  cumple?: Date;

}
