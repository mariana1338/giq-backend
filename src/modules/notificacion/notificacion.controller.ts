// src/modules/notificacion/notificacion.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { NotificacionService } from './notificacion.service';
import { CreateNotificacionDto } from './dto/create-notificacion.dto';
import { Notificacion } from './entities/notificacion.entity';

@Controller('notificaciones')
export class NotificacionController {
  constructor(private readonly notificacionService: NotificacionService) {}

  @Post()
  async crearNotificacion(
    @Body() createNotificacionDto: CreateNotificacionDto,
  ): Promise<Notificacion> {
    return await this.notificacionService.crearNotificacion(
      createNotificacionDto,
    );
  }
}
