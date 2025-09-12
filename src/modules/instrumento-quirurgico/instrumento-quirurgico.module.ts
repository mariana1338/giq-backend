import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstrumentoQuirurgicoService } from './instrumento-quirurgico.service';
import { InstrumentoQuirurgicoController } from './instrumento-quirurgico.controller';
import { InstrumentoQuirurgico } from './entities/instrumento-quirurgico.entity';
// Importa las entidades relacionadas para que TypeORM las inyecte en el servicio
import { CategoriaInstrumento } from '../categoria-instrumento/entities/categoria-instrumento.entity';
import { Proveedor } from '../proveedor/entities/proveedor.entity';
import { UbicacionAlmacen } from '../ubicacion-almacen/entities/ubicacion-almacen.entity';
import { NotificacionModule } from '../notificacion/notificacion.module'; // Importa el módulo de notificaciones
import { Usuario } from '../usuario/entities/usuario.entity'; // Importa la entidad Usuario

@Module({
  imports: [
    // `forFeature` registra las entidades que este módulo usará
    TypeOrmModule.forFeature([
      InstrumentoQuirurgico,
      CategoriaInstrumento,
      Proveedor,
      UbicacionAlmacen,
      Usuario, // Agrega la entidad Usuario para poder inyectar su repositorio
    ]),
    NotificacionModule, // Agrega el módulo de notificaciones para usar su servicio
  ],
  controllers: [InstrumentoQuirurgicoController],
  providers: [InstrumentoQuirurgicoService],
  // Exporta el servicio si otros módulos necesitan usarlo
  exports: [InstrumentoQuirurgicoService],
})
export class InstrumentoQuirurgicoModule {}
