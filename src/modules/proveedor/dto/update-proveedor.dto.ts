import { PartialType } from '@nestjs/mapped-types';
import { CreateProveedorDto } from './create-proveedor.dto';

// PartialType hace que todas las propiedades de CreateProveedorDto sean opcionales
export class UpdateProveedorDto extends PartialType(CreateProveedorDto) {}
