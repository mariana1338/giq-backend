import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstrumentoQuirurgico } from './entities/instrumento-quirurgico.entity';
import { CreateInstrumentoQuirurgicoDto } from './dto/create-instrumento-quirurgico.dto';
import { UpdateInstrumentoQuirurgicoDto } from './dto/update-instrumento-quirurgico.dto';
import { CategoriaInstrumento } from '../categoria-instrumento/entities/categoria-instrumento.entity';
import { Proveedor } from '../proveedor/entities/proveedor.entity';
import { UbicacionAlmacen } from '../ubicacion-almacen/entities/ubicacion-almacen.entity';

// Función de guarda de tipo para verificar si el error tiene una propiedad 'code' (como los errores de DB)
function isDatabaseError(error: any): error is { code: string } {
  return typeof error === 'object' && error !== null && 'code' in error;
}

@Injectable()
export class InstrumentoQuirurgicoService {
  constructor(
    @InjectRepository(InstrumentoQuirurgico)
    private readonly instrumentoQuirurgicoRepository: Repository<InstrumentoQuirurgico>,
    @InjectRepository(CategoriaInstrumento)
    private readonly categoriaRepository: Repository<CategoriaInstrumento>,
    @InjectRepository(Proveedor)
    private readonly proveedorRepository: Repository<Proveedor>,
    @InjectRepository(UbicacionAlmacen)
    private readonly ubicacionRepository: Repository<UbicacionAlmacen>,
  ) {}

  async create(
    createInstrumentoQuirurgicoDto: CreateInstrumentoQuirurgicoDto,
  ): Promise<InstrumentoQuirurgico> {
    const { categoriaId, proveedorId, ubicacionId, ...instrumentoData } =
      createInstrumentoQuirurgicoDto;

    const newInstrumento =
      this.instrumentoQuirurgicoRepository.create(instrumentoData);

    // Manejo de relaciones: busca y asigna las entidades relacionadas
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
      return await this.instrumentoQuirurgicoRepository.save(newInstrumento);
    } catch (error: unknown) {
      // Se tipa 'error' como 'unknown'
      // Se usa la guarda de tipo para verificar si es un error de base de datos con 'code'
      if (isDatabaseError(error) && error.code === 'ER_DUP_ENTRY') {
        throw new HttpException(
          'Ya existe un instrumento con este nombre o código.',
          HttpStatus.CONFLICT,
        );
      }
      // Para otros errores, lanza un error genérico 500
      throw new HttpException(
        'Error interno del servidor al crear el instrumento.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(): Promise<InstrumentoQuirurgico[]> {
    // `find()` con `eager: true` en las relaciones carga las entidades relacionadas automáticamente.
    return await this.instrumentoQuirurgicoRepository.find();
  }

  async findOne(id: number): Promise<InstrumentoQuirurgico> {
    const instrumento = await this.instrumentoQuirurgicoRepository.findOneBy({
      id,
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
    const instrumentoToUpdate =
      await this.instrumentoQuirurgicoRepository.findOneBy({
        id,
      });

    if (!instrumentoToUpdate) {
      throw new HttpException(
        `Instrumento con ID ${id} no encontrado para actualizar.`,
        HttpStatus.NOT_FOUND,
      );
    }

    const { categoriaId, proveedorId, ubicacionId, ...updateData } =
      updateInstrumentoQuirurgicoDto;

    // Actualiza las propiedades básicas del instrumento
    Object.assign(instrumentoToUpdate, updateData);

    // Actualiza las relaciones si se proporcionan los IDs
    if (categoriaId !== undefined) {
      if (categoriaId === null) {
        instrumentoToUpdate.categoria = null; // Desasocia la categoría (establece FK a NULL)
      } else {
        const categoria = await this.categoriaRepository.findOneBy({
          id: categoriaId,
        });
        if (!categoria) {
          throw new HttpException(
            `Categoría con ID ${categoriaId} no encontrada.`,
            HttpStatus.NOT_FOUND,
          );
        }
        instrumentoToUpdate.categoria = categoria;
      }
    }

    if (proveedorId !== undefined) {
      if (proveedorId === null) {
        instrumentoToUpdate.proveedor = null; // Desasocia el proveedor
      } else {
        const proveedor = await this.proveedorRepository.findOneBy({
          id: proveedorId,
        });
        if (!proveedor) {
          throw new HttpException(
            `Proveedor con ID ${proveedorId} no encontrado.`,
            HttpStatus.NOT_FOUND,
          );
        }
        instrumentoToUpdate.proveedor = proveedor;
      }
    }

    if (ubicacionId !== undefined) {
      if (ubicacionId === null) {
        instrumentoToUpdate.ubicacion = null; // Desasocia la ubicación
      } else {
        const ubicacion = await this.ubicacionRepository.findOneBy({
          id: ubicacionId,
        });
        if (!ubicacion) {
          throw new HttpException(
            `Ubicación con ID ${ubicacionId} no encontrada.`,
            HttpStatus.NOT_FOUND,
          );
        }
        instrumentoToUpdate.ubicacion = ubicacion;
      }
    }

    try {
      return await this.instrumentoQuirurgicoRepository.save(
        instrumentoToUpdate,
      );
    } catch (error: unknown) {
      // Se tipa 'error' como 'unknown'
      // Se usa la guarda de tipo para verificar si es un error de base de datos con 'code'
      if (isDatabaseError(error) && error.code === 'ER_DUP_ENTRY') {
        throw new HttpException(
          'Ya existe un instrumento con este nombre.',
          HttpStatus.CONFLICT,
        );
      }
      throw new HttpException(
        'Error interno del servidor al actualizar el instrumento.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.instrumentoQuirurgicoRepository.delete(id);
    if (result.affected === 0) {
      // Si `affected` es 0, significa que no se encontró ni eliminó ninguna fila.
      throw new HttpException(
        `Instrumento con ID ${id} no encontrado para eliminar.`,
        HttpStatus.NOT_FOUND,
      );
    }
    return true;
  }
}
