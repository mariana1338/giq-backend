// src/modules/venta/venta.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VentaService } from './venta.service';
import { VentaController } from './venta.controller';
import { Venta } from './entities/venta.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { InstrumentoQuirurgico } from '../instrumento-quirurgico/entities/instrumento-quirurgico.entity';
import { NotificacionModule } from '../notificacion/notificacion.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Venta, Usuario, InstrumentoQuirurgico]),
    NotificacionModule,
  ],
  controllers: [VentaController],
  providers: [VentaService],
  exports: [VentaService],
})
export class VentaModule {}
