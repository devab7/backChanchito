import { Transform, Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from "class-validator";
import { TipoPago } from "src/enums/tipo-pago.enum";

export class CreateCuotaDto {

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number) // para convertir datos tipo "123" a 123
  cuota: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  clienteId: number;

  @Transform(({ value }) => value === '' ? undefined : value)
  @IsOptional()
  @IsEnum(TipoPago, {
    message: 'Solo se permite: Efectivo, Interbank o BCP'
  })
  tipoPago?: TipoPago;
  
}