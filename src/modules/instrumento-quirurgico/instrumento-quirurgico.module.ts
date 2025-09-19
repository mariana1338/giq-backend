// src/modules/instrumento-quirurgico/instrumento-quirurgico.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstrumentoQuirurgicoService } from './instrumento-quirurgico.service';
import { InstrumentoQuirurgicoController } from './instrumento-quirurgico.controller';
import { InstrumentoQuirurgico } from './entities/instrumento-quirurgico.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { CategoriaInstrumento } from '../categoria-instrumento/entities/categoria-instrumento.entity';
import { Proveedor } from '../proveedor/entities/proveedor.entity';
import { UbicacionAlmacen } from '../ubicacion-almacen/entities/ubicacion-almacen.entity';
import { NotificacionModule } from '../notificacion/notificacion.module';
import { MovimientoInventario } from '../movimiento/entities/movimiento.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InstrumentoQuirurgico,
      Usuario,
      CategoriaInstrumento,
      Proveedor,
      UbicacionAlmacen,
      MovimientoInventario, //
    ]),
    NotificacionModule,
  ],
  controllers: [InstrumentoQuirurgicoController],
  providers: [InstrumentoQuirurgicoService],
  exports: [InstrumentoQuirurgicoService],
})
export class InstrumentoQuirurgicoModule {}
