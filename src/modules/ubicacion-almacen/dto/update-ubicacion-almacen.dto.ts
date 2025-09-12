import { PartialType } from '@nestjs/mapped-types';
import { CreateUbicacionAlmacenDto } from './create-ubicacion-almacen.dto';

// PartialType hace que todas las propiedades de CreateUbicacionAlmacenDto sean opcionales
export class UpdateUbicacionAlmacenDto extends PartialType(
  CreateUbicacionAlmacenDto,
) {}
