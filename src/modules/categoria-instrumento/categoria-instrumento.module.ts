import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriaInstrumentoService } from './categoria-instrumento.service';
import { CategoriaInstrumentoController } from './categoria-instrumento.controller';
import { CategoriaInstrumento } from './entities/categoria-instrumento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CategoriaInstrumento])],
  controllers: [CategoriaInstrumentoController],
  providers: [CategoriaInstrumentoService],
  exports: [CategoriaInstrumentoService], // Exporta el servicio si otros módulos lo necesitan
})
export class CategoriaInstrumentoModule {}
