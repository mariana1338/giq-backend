import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';

export class CreateProveedorDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del proveedor no puede estar vacío.' })
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'El contacto del proveedor no puede estar vacío.' })
  @IsEmail(
    {},
    { message: 'El contacto debe ser un correo electrónico válido.' },
  ) // <-- Descomenta esta línea
  contacto: string;

  @IsString()
  @IsOptional()
  direccion?: string;
}
