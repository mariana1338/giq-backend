import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpException, // Importa HttpException para manejo de errores
} from '@nestjs/common';
import { InstrumentoQuirurgicoService } from './instrumento-quirurgico.service';
import { CreateInstrumentoQuirurgicoDto } from './dto/create-instrumento-quirurgico.dto';
import { UpdateInstrumentoQuirurgicoDto } from './dto/update-instrumento-quirurgico.dto';

@Controller('instrumentos-quirurgicos') // Ruta base para este controlador
export class InstrumentoQuirurgicoController {
  constructor(
    private readonly instrumentoQuirurgicoService: InstrumentoQuirurgicoService,
  ) {}

  @Post()
  async create(
    @Body() createInstrumentoQuirurgicoDto: CreateInstrumentoQuirurgicoDto,
  ) {
    try {
      return await this.instrumentoQuirurgicoService.create(
        createInstrumentoQuirurgicoDto,
      );
    } catch (error) {
      // Re-lanza HttpException si ya es una, o envuelve otros errores inesperados
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error inesperado al crear el instrumento quirúrgico.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.instrumentoQuirurgicoService.findAll();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error inesperado al obtener los instrumentos quirúrgicos.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const instrumento = await this.instrumentoQuirurgicoService.findOne(+id); // Convierte el ID a número
      // El servicio ya lanza HttpException si no lo encuentra, por lo que no es necesario un if aquí
      return instrumento;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error inesperado al obtener el instrumento quirúrgico por ID.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateInstrumentoQuirurgicoDto: UpdateInstrumentoQuirurgicoDto,
  ) {
    try {
      const updatedInstrumento = await this.instrumentoQuirurgicoService.update(
        +id,
        updateInstrumentoQuirurgicoDto,
      );
      return updatedInstrumento;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error inesperado al actualizar el instrumento quirúrgico.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.instrumentoQuirurgicoService.remove(+id);
      return { message: `Instrumento con ID ${id} eliminado exitosamente.` };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error inesperado al eliminar el instrumento quirúrgico.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
