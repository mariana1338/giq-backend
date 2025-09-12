import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UbicacionAlmacenService } from './ubicacion-almacen.service';
import { UbicacionAlmacenController } from './ubicacion-almacen.controller';
import { UbicacionAlmacen } from './entities/ubicacion-almacen.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UbicacionAlmacen])],
  controllers: [UbicacionAlmacenController],
  providers: [UbicacionAlmacenService],
  exports: [UbicacionAlmacenService], // Exporta el servicio si otros módulos lo necesitan
})
export class UbicacionAlmacenModule {}
