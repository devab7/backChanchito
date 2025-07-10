import { Transform, Type } from "class-transformer";
import { IsEnum, IsISO8601, IsNotEmpty, IsNumber, IsOptional } from "class-validator";
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


  // 🛠️ TEMPORAL: ESTO RETIRAR PARA PRODUCCIÓN
  @IsOptional()
  @IsISO8601({}, { message: 'creadoEn debe ser ISO válido' })
  creadoEn?: string;

  @IsOptional()
  @IsISO8601({}, { message: 'actualizadoEn debe ser ISO válido' })
  actualizadoEn?: string;
  // 🛠️ TEMPORAL: ESTO RETIRAR PARA PRODUCCIÓN
  
}