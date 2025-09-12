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

// Función de guarda de tipo para verificar si el error tiene una propiedad 'code' (como los errores de DB)
function isDatabaseError(error: any): error is { code: string } {
  return typeof error === 'object' && error !== null && 'code' in error;
}

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
    private readonly notificacionService: NotificacionService,
  ) {}

  async create(
    createInstrumentoQuirurgicoDto: CreateInstrumentoQuirurgicoDto,
  ): Promise<InstrumentoQuirurgico> {
    const { categoriaId, proveedorId, ubicacionId, ...instrumentoData } =
      createInstrumentoQuirurgicoDto;

    const newInstrumento = this.instrumentoRepository.create(instrumentoData);

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
      return await this.instrumentoRepository.save(newInstrumento);
    } catch (error: unknown) {
      if (isDatabaseError(error) && error.code === 'ER_DUP_ENTRY') {
        throw new HttpException(
          'Ya existe un instrumento con este nombre o código.',
          HttpStatus.CONFLICT,
        );
      }
      throw new HttpException(
        'Error interno del servidor al crear el instrumento.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(): Promise<InstrumentoQuirurgico[]> {
    return await this.instrumentoRepository.find();
  }

  async findOne(id: number): Promise<InstrumentoQuirurgico> {
    const instrumento = await this.instrumentoRepository.findOne({
      where: { id_instrumento: id },
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
      updateInstrumentoQuirurgicoDto.cantidadStock <= instrumento.stockMinimo
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
    const result = await this.instrumentoRepository.delete(id);
    if (result.affected === 0) {
      throw new HttpException(
        `Instrumento con ID ${id} no encontrado para eliminar.`,
        HttpStatus.NOT_FOUND,
      );
    }
    return true;
  }
}
