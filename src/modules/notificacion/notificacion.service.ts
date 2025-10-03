// src/modules/notificacion/notificacion.service.ts

import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notificacion } from './entities/notificacion.entity';
import { CreateNotificacionDto } from './dto/create-notificacion.dto';
import { UpdateNotificacionDto } from './dto/update-notificacion.dto'; // 🔑 Importación CLAVE
import { Usuario } from '../usuario/entities/usuario.entity';
import { InstrumentoQuirurgico } from '../instrumento-quirurgico/entities/instrumento-quirurgico.entity';

@Injectable()
export class NotificacionService {
  constructor(
    @InjectRepository(Notificacion)
    private readonly notificacionRepository: Repository<Notificacion>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(InstrumentoQuirurgico)
    private readonly instrumentoRepository: Repository<InstrumentoQuirurgico>,
  ) {}

  // ------------------------------------------------------------------
  // CREACIÓN
  // ------------------------------------------------------------------
  async crearNotificacion(
    createNotificacionDto: CreateNotificacionDto,
  ): Promise<Notificacion> {
    const { id_usuario, id_instrumento, ...notificacionData } =
      createNotificacionDto;

    const usuario = await this.usuarioRepository.findOneBy({ id_usuario });
    if (!usuario) {
      throw new NotFoundException(
        `Usuario con ID ${id_usuario} no encontrado.`,
      );
    }

    const instrumento = await this.instrumentoRepository.findOneBy({
      id_instrumento,
    });
    if (!instrumento) {
      throw new NotFoundException(
        `Instrumento con ID ${id_instrumento} no encontrado.`,
      );
    }

    const nuevaNotificacion = this.notificacionRepository.create({
      ...notificacionData,
      usuario,
      instrumento,
      leida: false,
    });

    try {
      return await this.notificacionRepository.save(nuevaNotificacion);
    } catch (error) {
      throw new HttpException(
        'Error al crear la notificación.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ------------------------------------------------------------------
  // LECTURA Y UTILIDADES
  // ------------------------------------------------------------------

  /**
   * Busca una alerta activa (no leída) para un instrumento específico.
   * Usado por InstrumentoService para prevenir notificaciones duplicadas de stock bajo.
   */
  async findAlertaActiva(idInstrumento: number): Promise<Notificacion | null> {
    return await this.notificacionRepository.findOne({
      where: {
        instrumento: { id_instrumento: idInstrumento },
        leida: false,
      },
      order: { fecha: 'DESC' },
    });
  }

  async findAll(): Promise<Notificacion[]> {
    return await this.notificacionRepository.find({
      relations: ['usuario', 'instrumento'],
    });
  }

  async findOne(id: number): Promise<Notificacion> {
    const notificacion = await this.notificacionRepository.findOne({
      where: { id_notificacion: id },
      relations: ['usuario', 'instrumento'],
    });
    if (!notificacion) {
      throw new NotFoundException(`Notificación con ID ${id} no encontrada.`);
    }
    return notificacion;
  }

  // ------------------------------------------------------------------
  // 🔑 ACTUALIZACIÓN (Update simple y masiva)
  // ------------------------------------------------------------------
  /**
   * Actualiza el estado de una única notificación (ej. { leida: true/false }).
   */
  async update(id: number, updateDto: UpdateNotificacionDto): Promise<Notificacion> {
      const notificacion = await this.notificacionRepository.findOneBy({ id_notificacion: id });
      if (!notificacion) {
          throw new NotFoundException(`Notificación con ID ${id} no encontrada.`);
      }

      // Fusionar y guardar
      this.notificacionRepository.merge(notificacion, updateDto);
      return this.notificacionRepository.save(notificacion);
  }

  /**
   * Marca todas las notificaciones pendientes (leida=false) como leídas.
   */
  async marcarTodasLeidas() {
      return this.notificacionRepository.createQueryBuilder()
          .update(Notificacion)
          .set({ leida: true })
          .where("leida = :leidaStatus", { leidaStatus: false })
          .execute();
  }

  // ------------------------------------------------------------------
  // ELIMINACIÓN
  // ------------------------------------------------------------------
  async remove(id: number): Promise<void> {
    const result = await this.notificacionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Notificación con ID ${id} no encontrada.`);
    }
  }

  /**
   * Elimina todas las notificaciones que ya han sido leídas.
   */
  async eliminarLeidas() {
    return this.notificacionRepository.createQueryBuilder()
        .delete()
        .from(Notificacion)
        .where("leida = :leidaStatus", { leidaStatus: true })
        .execute();
  }
}