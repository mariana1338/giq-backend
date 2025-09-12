import { PartialType } from '@nestjs/mapped-types';
import { CreateUsuarioDto } from './create-usuario.dto';
import {
  IsString,
  IsEmail,
  MaxLength,
  IsOptional,
  MinLength,
} from 'class-validator';

export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @MaxLength(100, {
    message: 'El nombre no puede tener más de $constraint1 caracteres.',
  })
  nombre?: string;

  @IsOptional()
  @IsString({ message: 'El apellido debe ser una cadena de texto.' })
  @MaxLength(100, {
    message: 'El apellido no puede tener más de $constraint1 caracteres.',
  })
  apellido?: string;

  @IsOptional()
  @IsEmail({}, { message: 'El correo electrónico no es válido.' })
  @MaxLength(255, {
    message:
      'El correo electrónico no puede tener más de $constraint1 caracteres.',
  })
  correo?: string;

  @IsOptional()
  @IsString({ message: 'La contraseña debe ser una cadena de texto.' })
  @MinLength(8, {
    message: 'La contraseña debe tener al menos $constraint1 caracteres.',
  })
  contraseña?: string;

  @IsOptional()
  @IsString({ message: 'El rol debe ser una cadena de texto.' })
  rol?: string;
}
