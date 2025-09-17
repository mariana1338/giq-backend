// src/modules/venta/venta.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { VentaService } from './venta.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { Venta } from './entities/venta.entity';

@Controller('ventas')
export class VentaController {
  constructor(private readonly ventaService: VentaService) {}

  @Post()
  async crearVenta(@Body() createVentaDto: CreateVentaDto): Promise<Venta> {
    return await this.ventaService.create(createVentaDto);
  }
}
