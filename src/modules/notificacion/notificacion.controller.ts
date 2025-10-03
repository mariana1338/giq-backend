// src/modules/notificacion/notificacion.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,         // 🔑 Importar Patch
  HttpCode,        // 🔑 Importar HttpCode para 204
  ParseIntPipe,
  NotFoundException,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { NotificacionService } from './notificacion.service';
import { CreateNotificacionDto } from './dto/create-notificacion.dto';
import { UpdateNotificacionDto } from './dto/update-notificacion.dto'; // 🔑 Asumimos este DTO para actualizar 'leida'
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('notificacion') // 🔑 Cambié a 'notificacion' para coincidir con el frontend JS
export class NotificacionController {
  constructor(private readonly notificacionService: NotificacionService) {}

  @Post()
  async create(@Body() createNotificacionDto: CreateNotificacionDto) {
    try {
      return await this.notificacionService.crearNotificacion(
        createNotificacionDto,
      );
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error inesperado al crear la notificación.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async findAll() {
    // Nota: Deberías considerar filtrar aquí por usuario si las notificaciones son personales
    return await this.notificacionService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.notificacionService.findOne(id);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error inesperado al buscar la notificación.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ------------------------------------------------------------------
  // 🔑 MÉTODOS AÑADIDOS PARA EL FUNCIONAMIENTO COMPLETO DEL FRONTEND
  // ------------------------------------------------------------------

  // 1. PATCH para actualizar el estado 'leida' de una única notificación
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNotificacionDto: UpdateNotificacionDto, // Espera { leida: boolean }
  ) {
    // Usamos el método update que implementaremos en el servicio
    return this.notificacionService.update(id, updateNotificacionDto);
  }

  // 2. PATCH para marcar TODAS como leídas (Botón "Marcar todas como leídas")
  @Patch('marcar-todas-leidas')
  @HttpCode(204) // No devuelve contenido, solo el estado de éxito
  marcarTodasLeidas() {
    return this.notificacionService.marcarTodasLeidas();
  }

  // 3. DELETE para eliminar TODAS las leídas (Botón "Eliminar leídas")
  @Delete('eliminar-leidas')
  @HttpCode(204) // No devuelve contenido, solo el estado de éxito
  eliminarLeidas() {
    return this.notificacionService.eliminarLeidas();
  }

  // DELETE para eliminar una sola notificación
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<any> {
    try {
      await this.notificacionService.remove(id);
      return { message: `Notificación con ID ${id} eliminada exitosamente.` };
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException(
        'Error inesperado al eliminar la notificación.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}