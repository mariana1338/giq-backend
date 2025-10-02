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
  UseGuards,
} from '@nestjs/common';
import { CategoriaInstrumentoService } from './categoria-instrumento.service';
import { CreateCategoriaInstrumentoDto } from './dto/create-categoria-instrumento.dto';
import { UpdateCategoriaInstrumentoDto } from './dto/update-categoria-instrumento.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@UseGuards(AuthGuard('jwt'), RolesGuard)

@Controller('categoria-instrumento')
export class CategoriaInstrumentoController {
  constructor(
    private readonly categoriaInstrumentoService: CategoriaInstrumentoService,
  ) {}

  @Post()
  @Roles('administrador') // ⬅️ ¡SOLO ADMINISTRADORES AQUÍ!
  async create(
    @Body() createCategoriaInstrumentoDto: CreateCategoriaInstrumentoDto,
  ) {
    try {
      return await this.categoriaInstrumentoService.create(
        createCategoriaInstrumentoDto,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error inesperado al crear la categoría de instrumento.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.categoriaInstrumentoService.findAll();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error inesperado al obtener las categorías de instrumento.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  
  async findOne(@Param('id') id: string) {
    try {
      return await this.categoriaInstrumentoService.findOne(+id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error inesperado al obtener la categoría de instrumento por ID.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  @Roles('administrador') // ⬅️ ¡SOLO ADMINISTRADORES AQUÍ!
  async update(
    @Param('id') id: string,
    @Body() updateCategoriaInstrumentoDto: UpdateCategoriaInstrumentoDto,
  ) {
    try {
      return await this.categoriaInstrumentoService.update(
        +id,
        updateCategoriaInstrumentoDto,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error inesperado al actualizar la categoría de instrumento.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @Roles('administrador') // ⬅️ ¡SOLO ADMINISTRADORES AQUÍ!
  async remove(@Param('id') id: string) {
    try {
      await this.categoriaInstrumentoService.remove(+id);
      return { message: `Categoría con ID ${id} eliminada exitosamente.` };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error inesperado al eliminar la categoría de instrumento.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
