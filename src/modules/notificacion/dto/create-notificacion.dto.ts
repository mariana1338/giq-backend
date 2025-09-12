// src/modules/notificacion/dto/create-notificacion.dto.ts
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateNotificacionDto {
  @IsString()
  @IsNotEmpty()
  mensaje: string;

  @IsNumber()
  @IsNotEmpty()
  id_usuario: number;

  @IsNumber()
  @IsNotEmpty()
  id_instrumento: number;
}
