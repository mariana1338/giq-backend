// src/modules/instrumento-quirurgico/instrumento-quirurgico.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpException,
  ParseIntPipe,
  UseGuards,
  Query, // 🔑 Importar Query para recibir parámetros de búsqueda
} from '@nestjs/common';
import { InstrumentoQuirurgicoService } from './instrumento-quirurgico.service';
import { CreateInstrumentoQuirurgicoDto } from './dto/create-instrumento-quirurgico.dto';
import { UpdateInstrumentoQuirurgicoDto } from './dto/update-instrumento-quirurgico.dto';
import { AddStockDto } from './dto/add-stock.dto';
import { AuthGuard } from '@nestjs/passport';
import { InstrumentoQuirurgico } from './entities/instrumento-quirurgico.entity'; // Asegúrate de importar la entidad

@UseGuards(AuthGuard('jwt'))
@Controller('instrumentos-quirurgicos')
export class InstrumentoQuirurgicoController {
  constructor(
    private readonly instrumentoQuirurgicoService: InstrumentoQuirurgicoService,
  ) {}

  @Post()
  async create(
    @Body() createInstrumentoQuirurgicoDto: CreateInstrumentoQuirurgicoDto,
  ): Promise<InstrumentoQuirurgico> {
    try {
      return await this.instrumentoQuirurgicoService.create(
        createInstrumentoQuirurgicoDto,
      );
    } catch (error: unknown) {
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
  async findAll(
      // 🔑 CORRECCIÓN: Captura el parámetro de consulta 'nombre' (opcional)
      @Query('nombre') nombre?: string 
  ): Promise<InstrumentoQuirurgico[]> {
    try {
        // Pasa el filtro de nombre al servicio
      return await this.instrumentoQuirurgicoService.findAll(nombre); 
    } catch (error: unknown) {
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
  async findOne(@Param('id') id: string): Promise<InstrumentoQuirurgico> {
    try {
      const instrumento = await this.instrumentoQuirurgicoService.findOne(+id);
      return instrumento;
    } catch (error: unknown) {
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
  ): Promise<InstrumentoQuirurgico> {
    try {
      const updatedInstrumento = await this.instrumentoQuirurgicoService.update(
        +id,
        updateInstrumentoQuirurgicoDto,
      );
      return updatedInstrumento;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error inesperado al actualizar el instrumento quirúrgico.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id/add-stock')
  async addStock(@Param('id') id: string, @Body() addStockDto: AddStockDto): Promise<InstrumentoQuirurgico> {
    try {
      return await this.instrumentoQuirurgicoService.addStock(+id, addStockDto);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error inesperado al añadir o retirar stock.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    try {
      await this.instrumentoQuirurgicoService.remove(id);
      return { message: `Instrumento con ID ${id} eliminado exitosamente.` };
    } catch (error: unknown) {
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