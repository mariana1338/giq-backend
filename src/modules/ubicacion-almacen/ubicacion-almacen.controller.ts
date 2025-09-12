import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UbicacionAlmacenService } from './ubicacion-almacen.service';
import { CreateUbicacionAlmacenDto } from './dto/create-ubicacion-almacen.dto';
import { UpdateUbicacionAlmacenDto } from './dto/update-ubicacion-almacen.dto';

@Controller('ubicacion-almacen')
export class UbicacionAlmacenController {
  constructor(
    private readonly ubicacionAlmacenService: UbicacionAlmacenService,
  ) {}

  @Post()
  async create(@Body() createUbicacionAlmacenDto: CreateUbicacionAlmacenDto) {
    try {
      return await this.ubicacionAlmacenService.create(
        createUbicacionAlmacenDto,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error inesperado al crear la ubicación de almacén.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.ubicacionAlmacenService.findAll();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error inesperado al obtener las ubicaciones de almacén.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.ubicacionAlmacenService.findOne(+id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error inesperado al obtener la ubicación de almacén por ID.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUbicacionAlmacenDto: UpdateUbicacionAlmacenDto,
  ) {
    try {
      return await this.ubicacionAlmacenService.update(
        +id,
        updateUbicacionAlmacenDto,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error inesperado al actualizar la ubicación de almacén.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.ubicacionAlmacenService.remove(+id);
      return { message: `Ubicación con ID ${id} eliminada exitosamente.` };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error inesperado al eliminar la ubicación de almacén.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
