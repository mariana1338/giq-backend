import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstrumentoQuirurgico } from './entities/instrumento-quirurgico.entity';
import { CreateInstrumentoQuirurgicoDto } from './dto/create-instrumento-quirurgico.dto';
import { UpdateInstrumentoQuirurgicoDto } from './dto/update-instrumento-quirurgico.dto';
import { CategoriaInstrumento } from '../categoria-instrumento/entities/categoria-instrumento.entity';
import { Proveedor } from '../proveedor/entities/proveedor.entity';
import { UbicacionAlmacen } from '../ubicacion-almacen/entities/ubicacion-almacen.entity';
import { NotificacionService } from '../notificacion/notificacion.service';
import { Usuario } from '../usuario/entities/usuario.entity';
import { MovimientoInventario } from '../movimiento/entities/movimiento.entity';
import { AddStockDto } from './dto/add-stock.dto';

@Injectable()
export class InstrumentoQuirurgicoService {
  constructor(
    @InjectRepository(InstrumentoQuirurgico)
    private readonly instrumentoRepository: Repository<InstrumentoQuirurgico>,
    @InjectRepository(CategoriaInstrumento)
    private readonly categoriaRepository: Repository<CategoriaInstrumento>,
    @InjectRepository(Proveedor)
    private readonly proveedorRepository: Repository<Proveedor>,
    @InjectRepository(UbicacionAlmacen)
    private readonly ubicacionRepository: Repository<UbicacionAlmacen>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(MovimientoInventario)
    private readonly movimientoRepository: Repository<MovimientoInventario>,
    private readonly notificacionService: NotificacionService,
  ) {}

  async create(
    createInstrumentoQuirurgicoDto: CreateInstrumentoQuirurgicoDto,
  ): Promise<InstrumentoQuirurgico> {
    const {
      categoriaId,
      proveedorId,
      ubicacionId,
      id_usuario,
      ...instrumentoData
    } = createInstrumentoQuirurgicoDto;

    const newInstrumento = this.instrumentoRepository.create(instrumentoData);

    const usuario = await this.usuarioRepository.findOneBy({ id_usuario });
    if (!usuario) {
      throw new NotFoundException(
        `Usuario con ID ${id_usuario} no encontrado.`,
      );
    }

    if (categoriaId) {
      const categoria = await this.categoriaRepository.findOneBy({
        id: categoriaId,
      });
      if (!categoria) {
        throw new HttpException(
          `Categoría con ID ${categoriaId} no encontrada.`,
          HttpStatus.NOT_FOUND,
        );
      }
      newInstrumento.categoria = categoria;
    }

    if (proveedorId) {
      const proveedor = await this.proveedorRepository.findOneBy({
        id: proveedorId,
      });
      if (!proveedor) {
        throw new HttpException(
          `Proveedor con ID ${proveedorId} no encontrado.`,
          HttpStatus.NOT_FOUND,
        );
      }
      newInstrumento.proveedor = proveedor;
    }

    if (ubicacionId) {
      const ubicacion = await this.ubicacionRepository.findOneBy({
        id: ubicacionId,
      });
      if (!ubicacion) {
        throw new HttpException(
          `Ubicación con ID ${ubicacionId} no encontrada.`,
          HttpStatus.NOT_FOUND,
        );
      }
      newInstrumento.ubicacion = ubicacion;
    }

    try {
      const instrumentoGuardado =
        await this.instrumentoRepository.save(newInstrumento);

      if (instrumentoGuardado && usuario) {
        const movimiento = this.movimientoRepository.create({
          cantidad: instrumentoGuardado.cantidadStock,
          tipo_movimiento: 'entrada',
          precio:
            instrumentoGuardado.cantidadStock *
            instrumentoGuardado.precioUnitario,
          instrumento: instrumentoGuardado,
          usuario,
        });

        await this.movimientoRepository.save(movimiento);
      } else {
        throw new HttpException(
          'Error al guardar el instrumento o encontrar el usuario.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return instrumentoGuardado;
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new HttpException(
          'Ya existe un instrumento con este nombre o código.',
          HttpStatus.CONFLICT,
        );
      }
      throw error;
    }
  }

  async findAll(): Promise<InstrumentoQuirurgico[]> {
    // ✅ CORRECCIÓN CLAVE: Cargar las relaciones para que el frontend vea el nombre de la categoría
    return await this.instrumentoRepository.find({
      relations: ['categoria', 'proveedor', 'ubicacion'],
    });
  }

  async findOne(id: number): Promise<InstrumentoQuirurgico> {
    // ✅ CORRECCIÓN: Cargar las relaciones también para findOne (necesario para la edición)
    const instrumento = await this.instrumentoRepository.findOne({
      where: { id_instrumento: id },
      relations: ['categoria', 'proveedor', 'ubicacion'],
    });
    if (!instrumento) {
      throw new HttpException(
        `Instrumento con ID ${id} no encontrado.`,
        HttpStatus.NOT_FOUND,
      );
    }
    return instrumento;
  }

  async update(
    id: number,
    updateInstrumentoQuirurgicoDto: UpdateInstrumentoQuirurgicoDto,
  ): Promise<InstrumentoQuirurgico> {
    const instrumento = await this.instrumentoRepository.findOne({
      where: { id_instrumento: id },
    });
    if (!instrumento) {
      throw new NotFoundException(
        `Instrumento Quirurgico con ID '${id}' no encontrado.`,
      );
    }

    if (
      updateInstrumentoQuirurgicoDto.cantidadStock !== undefined &&
      updateInstrumentoQuirurgicoDto.cantidadStock <=
        instrumento.cantidadStockMinima
    ) {
      const mensaje = `¡Alerta de Stock Bajo! El instrumento ${instrumento.nombre} tiene solo ${updateInstrumentoQuirurgicoDto.cantidadStock} unidades.`;

      const usuarioAdmin = await this.usuarioRepository.findOne({
        where: { rol: 'admin' },
      });

      if (usuarioAdmin) {
        await this.notificacionService.crearNotificacion({
          mensaje: mensaje,
          id_usuario: usuarioAdmin.id_usuario,
          id_instrumento: instrumento.id_instrumento,
        });
      }
    }

    this.instrumentoRepository.merge(
      instrumento,
      updateInstrumentoQuirurgicoDto,
    );
    return await this.instrumentoRepository.save(instrumento);
  }

  async remove(id: number): Promise<boolean> {
    const instrumento = await this.instrumentoRepository.findOne({
      where: { id_instrumento: id },
    });

    if (!instrumento) {
      throw new HttpException(
        `Instrumento con ID ${id} no encontrado.`,
        HttpStatus.NOT_FOUND,
      );
    }

    await this.movimientoRepository.delete({
      instrumento: { id_instrumento: instrumento.id_instrumento },
    });

    const result = await this.instrumentoRepository.delete(id);

    if (result.affected === 0) {
      throw new HttpException(
        `Instrumento con ID ${id} no encontrado para eliminar.`,
        HttpStatus.NOT_FOUND,
      );
    }
    return true;
  }

  async addStock(
    id: number,
    addStockDto: AddStockDto,
  ): Promise<InstrumentoQuirurgico> {
    const { cantidad, id_usuario } = addStockDto;

    const instrumento = await this.instrumentoRepository.findOneBy({
      id_instrumento: id,
    });

    if (!instrumento) {
      throw new NotFoundException(
        `Instrumento Quirúrgico con ID ${id} no encontrado.`,
      );
    }

    const usuario = await this.usuarioRepository.findOneBy({
      id_usuario: id_usuario,
    });
    if (!usuario) {
      throw new NotFoundException(
        `Usuario con ID ${id_usuario} no encontrado.`,
      );
    }

    const tipoMovimiento = cantidad > 0 ? 'entrada' : 'salida';
    const nuevaCantidadStock = instrumento.cantidadStock + cantidad;

    if (nuevaCantidadStock < 0) {
      throw new HttpException(
        'El stock no puede ser menor a cero.',
        HttpStatus.BAD_REQUEST,
      );
    }

    instrumento.cantidadStock = nuevaCantidadStock;

    const precioMovimiento =
      tipoMovimiento === 'entrada'
        ? Math.abs(cantidad) * instrumento.precioUnitario
        : Math.abs(cantidad) * instrumento.precioVenta;

    const instrumentoActualizado =
      await this.instrumentoRepository.save(instrumento);

    const movimiento = this.movimientoRepository.create({
      cantidad: Math.abs(cantidad),
      tipo_movimiento: tipoMovimiento,
      precio: precioMovimiento,
      instrumento: instrumentoActualizado,
      usuario,
    });

    await this.movimientoRepository.save(movimiento);

    return instrumentoActualizado;
  }
}