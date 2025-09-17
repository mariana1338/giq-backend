// src/modules/venta/dto/create-venta.dto.ts
import { IsNotEmpty, IsNumber, IsDate } from 'class-validator';

export class CreateVentaDto {
  @IsNumber()
  @IsNotEmpty()
  id_usuario: number;

  @IsNumber()
  @IsNotEmpty()
  id_instrumento_quirurgico: number;

  @IsNumber()
  @IsNotEmpty()
  cantidad: number;

  @IsNumber()
  @IsNotEmpty()
  precio: number;

  @IsDate() // 💡 Cambia a @IsDate()
  @IsNotEmpty()
  fecha: Date;
}
