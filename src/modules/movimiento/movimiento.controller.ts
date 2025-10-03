// src/modules/movimiento/movimiento.controller.ts

import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { MovimientoService } from './movimiento.service';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';

@Controller('movimientos-inventario')
export class MovimientoController {
  constructor(private readonly movimientoService: MovimientoService) {}

  @Post()
  async create(@Body() createMovimientoDto: CreateMovimientoDto) {
    // Usamos el pipe de validación (debe estar configurado en main.ts)
    // El servicio se encarga de la lógica de stock.
    return await this.movimientoService.create(createMovimientoDto);
  }

  @Get()
  async findAll(
    // 🔑 CLAVE: Ahora el controlador acepta los 4 parámetros del Query String
    @Query('nombreFiltro') nombreFiltro?: string,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
    @Query('tipoMovimiento') tipoMovimiento?: string,
  ) {
    // 🔑 CLAVE: Los parámetros se pasan TODOS al servicio
    const movimientos = await this.movimientoService.findAll(
      nombreFiltro,
      fechaDesde,
      fechaHasta,
      tipoMovimiento,
    );
    
    // Formato de respuesta esperado por el frontend
    return { 
        data: movimientos 
    };
  }
}