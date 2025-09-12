import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UbicacionAlmacen } from './entities/ubicacion-almacen.entity';
import { CreateUbicacionAlmacenDto } from './dto/create-ubicacion-almacen.dto';
import { UpdateUbicacionAlmacenDto } from './dto/update-ubicacion-almacen.dto';

// Función de guarda de tipo para verificar si el error tiene una propiedad 'code' (como los errores de DB)
function isDatabaseError(error: any): error is { code: string } {
  return typeof error === 'object' && error !== null && 'code' in error;
}

@Injectable()
export class UbicacionAlmacenService {
  constructor(
    @InjectRepository(UbicacionAlmacen)
    private readonly ubicacionAlmacenRepository: Repository<UbicacionAlmacen>,
  ) {}

  async create(
    createUbicacionAlmacenDto: CreateUbicacionAlmacenDto,
  ): Promise<UbicacionAlmacen> {
    const newUbicacion = this.ubicacionAlmacenRepository.create(
      createUbicacionAlmacenDto,
    );
    try {
      return await this.ubicacionAlmacenRepository.save(newUbicacion);
    } catch (error: unknown) {
      // Se tipa 'error' como 'unknown' para mayor seguridad
      // Se usa la guarda de tipo para verificar si es un error de base de datos con 'code'
      if (isDatabaseError(error) && error.code === 'ER_DUP_ENTRY') {
        throw new HttpException(
          'Ya existe una ubicación con este nombre.',
          HttpStatus.CONFLICT,
        );
      }
      throw new HttpException(
        'Error interno del servidor al crear la ubicación.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(): Promise<UbicacionAlmacen[]> {
    return await this.ubicacionAlmacenRepository.find();
  }

  async findOne(id: number): Promise<UbicacionAlmacen> {
    const ubicacion = await this.ubicacionAlmacenRepository.findOneBy({ id });
    if (!ubicacion) {
      throw new HttpException(
        `Ubicación con ID ${id} no encontrada.`,
        HttpStatus.NOT_FOUND,
      );
    }
    return ubicacion;
  }

  async update(
    id: number,
    updateUbicacionAlmacenDto: UpdateUbicacionAlmacenDto,
  ): Promise<UbicacionAlmacen> {
    const ubicacionToUpdate = await this.ubicacionAlmacenRepository.findOneBy({
      id,
    });
    if (!ubicacionToUpdate) {
      throw new HttpException(
        `Ubicación con ID ${id} no encontrada para actualizar.`,
        HttpStatus.NOT_FOUND,
      );
    }
    Object.assign(ubicacionToUpdate, updateUbicacionAlmacenDto);
    try {
      return await this.ubicacionAlmacenRepository.save(ubicacionToUpdate);
    } catch (error: unknown) {
      // Se tipa 'error' como 'unknown' para mayor seguridad
      // Se usa la guarda de tipo para verificar si es un error de base de datos con 'code'
      if (isDatabaseError(error) && error.code === 'ER_DUP_ENTRY') {
        throw new HttpException(
          'Ya existe una ubicación con este nombre.',
          HttpStatus.CONFLICT,
        );
      }
      throw new HttpException(
        'Error interno del servidor al actualizar la ubicación.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.ubicacionAlmacenRepository.delete(id);
    if (result.affected === 0) {
      throw new HttpException(
        `Ubicación con ID ${id} no encontrada para eliminar.`,
        HttpStatus.NOT_FOUND,
      );
    }
    return true;
  }
}
