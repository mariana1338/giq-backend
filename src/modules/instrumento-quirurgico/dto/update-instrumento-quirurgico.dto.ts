import { PartialType } from '@nestjs/mapped-types';
import { CreateInstrumentoQuirurgicoDto } from './create-instrumento-quirurgico.dto';

// PartialType hace que todas las propiedades del DTO base sean opcionales.
// Esto es ideal para las actualizaciones (PATCH), donde no todos los campos son obligatorios.
export class UpdateInstrumentoQuirurgicoDto extends PartialType(
  CreateInstrumentoQuirurgicoDto,
) {}
