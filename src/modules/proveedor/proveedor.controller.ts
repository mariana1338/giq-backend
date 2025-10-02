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
import { ProveedorService } from './proveedor.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { AuthGuard } from '@nestjs/passport'; // Importa el Guard de JWT
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';


// Aplica el Guard de JWT y el Guard de Roles a todas las rutas de este controlador
@UseGuards(AuthGuard('jwt'), RolesGuard) 
@Controller('proveedor')
export class ProveedorController {
  constructor(private readonly proveedorService: ProveedorService) {}

  @Post()
  @Roles('administrador') // ⬅️ ¡SOLO ADMINISTRADORES AQUÍ!
  async create(@Body() createProveedorDto: CreateProveedorDto) {
    try {
      return await this.proveedorService.create(createProveedorDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error inesperado al crear el proveedor.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.proveedorService.findAll();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error inesperado al obtener los proveedores.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.proveedorService.findOne(+id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error inesperado al obtener el proveedor por ID.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  @Roles('administrador') // ⬅️ ¡SOLO ADMINISTRADORES AQUÍ!
  async update(
    @Param('id') id: string,
    @Body() updateProveedorDto: UpdateProveedorDto,
  ) {
    try {
      return await this.proveedorService.update(+id, updateProveedorDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error inesperado al actualizar el proveedor.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @Roles('administrador') // ⬅️ ¡SOLO ADMINISTRADORES AQUÍ!
  async remove(@Param('id') id: string) {
    try {
      await this.proveedorService.remove(+id);
      return { message: `Proveedor con ID ${id} eliminado exitosamente.` };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error inesperado al eliminar el proveedor.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
