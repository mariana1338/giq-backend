import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proveedor } from './entities/proveedor.entity';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';

// Función de guarda de tipo para verificar si el error tiene una propiedad 'code' (como los errores de DB)
function isDatabaseError(error: any): error is { code: string } {
  return typeof error === 'object' && error !== null && 'code' in error;
}

@Injectable()
export class ProveedorService {
  constructor(
    @InjectRepository(Proveedor)
    private readonly proveedorRepository: Repository<Proveedor>,
  ) {}

  async create(createProveedorDto: CreateProveedorDto): Promise<Proveedor> {
    const newProveedor = this.proveedorRepository.create(createProveedorDto);
    try {
      return await this.proveedorRepository.save(newProveedor);
    } catch (error: unknown) {
      // Se tipa 'error' como 'unknown' para mayor seguridad
      // Se usa la guarda de tipo para verificar si es un error de base de datos con 'code'
      if (isDatabaseError(error) && error.code === 'ER_DUP_ENTRY') {
        throw new HttpException(
          'Ya existe un proveedor con este contacto.',
          HttpStatus.CONFLICT,
        );
      }
      throw new HttpException(
        'Error interno del servidor al crear el proveedor.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(): Promise<Proveedor[]> {
    return await this.proveedorRepository.find();
  }

  async findOne(id: number): Promise<Proveedor> {
    const proveedor = await this.proveedorRepository.findOneBy({ id });
    if (!proveedor) {
      throw new HttpException(
        `Proveedor con ID ${id} no encontrado.`,
        HttpStatus.NOT_FOUND,
      );
    }
    return proveedor;
  }

  async update(
    id: number,
    updateProveedorDto: UpdateProveedorDto,
  ): Promise<Proveedor> {
    const proveedorToUpdate = await this.proveedorRepository.findOneBy({ id });
    if (!proveedorToUpdate) {
      throw new HttpException(
        `Proveedor con ID ${id} no encontrado para actualizar.`,
        HttpStatus.NOT_FOUND,
      );
    }
    Object.assign(proveedorToUpdate, updateProveedorDto);
    try {
      return await this.proveedorRepository.save(proveedorToUpdate);
    } catch (error: unknown) {
      // Se tipa 'error' como 'unknown' para mayor seguridad
      // Se usa la guarda de tipo para verificar si es un error de base de datos con 'code'
      if (isDatabaseError(error) && error.code === 'ER_DUP_ENTRY') {
        throw new HttpException(
          'Ya existe un proveedor con este contacto.',
          HttpStatus.CONFLICT,
        );
      }
      throw new HttpException(
        'Error interno del servidor al actualizar el proveedor.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.proveedorRepository.delete(id);
    if (result.affected === 0) {
      throw new HttpException(
        `Proveedor con ID ${id} no encontrado para eliminar.`,
        HttpStatus.NOT_FOUND,
      );
    }
    return true;
  }
}
