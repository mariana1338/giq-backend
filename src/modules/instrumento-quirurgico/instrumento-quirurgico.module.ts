import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstrumentoQuirurgicoService } from './instrumento-quirurgico.service';
import { InstrumentoQuirurgicoController } from './instrumento-quirurgico.controller';
import { InstrumentoQuirurgico } from './entities/instrumento-quirurgico.entity';
// Importa las entidades relacionadas para que TypeORM las inyecte en el servicio
import { CategoriaInstrumento } from '../categoria-instrumento/entities/categoria-instrumento.entity';
import { Proveedor } from '../proveedor/entities/proveedor.entity';
import { UbicacionAlmacen } from '../ubicacion-almacen/entities/ubicacion-almacen.entity';

@Module({
  imports: [
    // `forFeature` registra las entidades que este módulo usará
    TypeOrmModule.forFeature([
      InstrumentoQuirurgico,
      CategoriaInstrumento,
      Proveedor,
      UbicacionAlmacen,
    ]),
  ],
  controllers: [InstrumentoQuirurgicoController],
  providers: [InstrumentoQuirurgicoService],
  // Exporta el servicio si otros módulos necesitan usarlo (ej. para inyectar InstrumentoQuirurgicoService en otro servicio)
  exports: [InstrumentoQuirurgicoService],
})
export class InstrumentoQuirurgicoModule {}
