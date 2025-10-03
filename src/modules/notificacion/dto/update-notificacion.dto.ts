// src/modules/notificacion/dto/update-notificacion.dto.ts
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificacionDto {
  /**
   * Campo clave que se actualiza para marcar la notificación como leída o no leída.
   */
  @IsOptional()
  @IsBoolean()
  leida?: boolean;
}