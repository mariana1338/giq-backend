// src/modules/categoria-instrumento/dto/update-categoria-instrumento.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoriaInstrumentoDto } from './create-categoria-instrumento.dto';

// PartialType hace que todas las propiedades de CreateCategoriaInstrumentoDto sean opcionales.
// Esto es útil para las operaciones de actualización (PATCH), ya que no siempre se actualizan todos los campos.
export class UpdateCategoriaInstrumentoDto extends PartialType(
  CreateCategoriaInstrumentoDto,
) {}
