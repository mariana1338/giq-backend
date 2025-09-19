// src/modules/notificacion/notificacion.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notificacion } from './entities/notificacion.entity';
import { InstrumentoQuirurgico } from '../instrumento-quirurgico/entities/instrumento-quirurgico.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { CreateNotificacionDto } from './dto/create-notificacion.dto'; // 💡 Importa el nuevo DTO

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

  async crearNotificacion(
    createNotificacionDto: CreateNotificacionDto, // 💡 Usa el DTO como parámetro
  ): Promise<Notificacion> {
    const { mensaje, id_usuario, id_instrumento } = createNotificacionDto; // 💡 Desestructura de forma segura

    const usuario = await this.usuarioRepository.findOne({
      where: { id_usuario },
    });
    const instrumento = await this.instrumentoRepository.findOne({
      where: { id_instrumento },
    });

    if (!usuario || !instrumento) {
      throw new NotFoundException(
        'Usuario o instrumento no encontrado para crear la notificación.',
      );
    }

    const nuevaNotificacion = this.notificacionRepository.create({
      mensaje,
      usuario,
      instrumento,
      fecha: new Date(),
    });

    return await this.notificacionRepository.save(nuevaNotificacion);
  }
}
