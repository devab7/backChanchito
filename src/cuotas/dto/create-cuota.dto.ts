import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateCuotaDto {

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number) // Convierte strings del body (como "123.45") en tipo number para que pase la validación
  importe: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  clienteId: number;

  
  
}