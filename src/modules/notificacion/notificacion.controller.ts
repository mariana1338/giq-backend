// src/modules/notificacion/notificacion.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { NotificacionService } from './notificacion.service';
import { CreateNotificacionDto } from './dto/create-notificacion.dto'; // 💡 Importa el DTO

@Controller('notificaciones')
export class NotificacionController {
  constructor(private readonly notificacionService: NotificacionService) {}

  @Post()
  async crearNotificacion(
    @Body() createNotificacionDto: CreateNotificacionDto,
  ) {
    try {
      return await this.notificacionService.crearNotificacion(
        createNotificacionDto,
      );
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error inesperado al crear la notificación.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
