import { IsNotEmpty, IsInt, IsString, IsNumber, Min } from 'class-validator';

export class CreateMovimientoDto {
  // El ID del instrumento al que se aplica la venta/movimiento
  @IsNotEmpty()
  @IsInt()
  instrumentoId: number; 

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  cantidad: number; // Cantidad vendida/movida

  // El frontend solo enviará 'salida' o 'entrada'
  @IsNotEmpty()
  @IsString()
  tipo_movimiento: string; 

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  precio: number; // Precio unitario de la transacción

  // Asumimos que el usuario ID es enviado o se obtiene del JWT
  @IsNotEmpty()
  @IsInt()
  usuarioId: number; 
}