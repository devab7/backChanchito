import { IsInt, Min, Max } from 'class-validator';

export class RetirarMesDto {
  @IsInt({ message: 'El clienteId debe ser un número entero' })
  clienteId: number;

  @IsInt({ message: 'El mes debe ser un número entero' })
  @Min(1, { message: 'El mes debe estar entre 1 y 12' })
  @Max(12, { message: 'El mes debe estar entre 1 y 12' })
  mes: number; // ✔️ No enviamos el año, lo infiere el backend con ahoraLima()
}
