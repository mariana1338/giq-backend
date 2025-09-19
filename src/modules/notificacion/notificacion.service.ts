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

  async remove(id: number): Promise<void> {
    const result = await this.notificacionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Notificación con ID ${id} no encontrada.`);
    }
  }
}
