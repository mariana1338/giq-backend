// src/modules/venta/venta.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Venta } from './entities/venta.entity';
import { CreateVentaDto } from './dto/create-venta.dto';
import { Usuario } from '../usuario/entities/usuario.entity';
import { InstrumentoQuirurgico } from '../instrumento-quirurgico/entities/instrumento-quirurgico.entity';
import { NotificacionService } from '../notificacion/notificacion.service';

@Injectable()
export class VentaService {
  constructor(
    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(InstrumentoQuirurgico)
    private readonly instrumentoRepository: Repository<InstrumentoQuirurgico>,
    private readonly notificacionService: NotificacionService,
  ) {}

  async create(createVentaDto: CreateVentaDto): Promise<Venta> {
    const { id_usuario, id_instrumento_quirurgico, cantidad, precio } =
      createVentaDto;

    // 1. Busca el usuario y el instrumento por sus IDs
    const usuario = await this.usuarioRepository.findOneBy({ id_usuario });
    const instrumento = await this.instrumentoRepository.findOneBy({
      id_instrumento: id_instrumento_quirurgico,
    });

    if (!usuario) {
      throw new NotFoundException(
        `Usuario con ID ${id_usuario} no encontrado.`,
      );
    }
    if (!instrumento) {
      throw new NotFoundException(
        `Instrumento con ID ${id_instrumento_quirurgico} no encontrado.`,
      );
    }

    // 2. Valida que haya suficiente stock
    if (instrumento.cantidadStock < cantidad) {
      throw new BadRequestException(
        'No hay suficiente stock para realizar la venta.',
      );
    }

    // 3. Decrementa el stock del instrumento
    instrumento.cantidadStock -= cantidad;

    // 4. Crea la nueva entidad de venta
    const nuevaVenta = this.ventaRepository.create({
      cantidad,
      precio,
      fecha: createVentaDto.fecha,
      usuario,
      instrumento,
    });

    try {
      // 5. Guarda el instrumento actualizado y la nueva venta en la base de datos
      await this.instrumentoRepository.save(instrumento);
      const ventaGuardada = await this.ventaRepository.save(nuevaVenta);

      // 6. Verifica si se debe generar una notificación de stock bajo
      if (instrumento.cantidadStock <= instrumento.stockMinimo) {
        const mensaje = `Alerta de Stock Bajo: El instrumento ${instrumento.nombre} tiene solo ${instrumento.cantidadStock} unidades.`;
        const usuarioAdmin = await this.usuarioRepository.findOne({
          where: { rol: 'admin' },
        });

        if (usuarioAdmin) {
          await this.notificacionService.crearNotificacion({
            mensaje,
            id_usuario: usuarioAdmin.id_usuario,
            id_instrumento: instrumento.id_instrumento,
          });
        }
      }

      return ventaGuardada;
    } catch (_error) {
      // 💡 Cambiado de 'error' a '_error' para evitar la advertencia
      throw new BadRequestException(
        'Error al procesar la venta. Inténtelo de nuevo.',
      );
    }
  }

  // Puedes añadir otros métodos como findAll, findOne, etc.
}
