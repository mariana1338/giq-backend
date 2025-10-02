import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUsuarioDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
  @MaxLength(100, {
    message: 'El nombre no puede tener más de $constraint1 caracteres.',
  })
  nombre: string;

  @IsEmail({}, { message: 'El correo electrónico no es válido.' })
  @IsNotEmpty({ message: 'El correo electrónico no puede estar vacío.' })
  @MaxLength(255, {
    message:
      'El correo electrónico no puede tener más de $constraint1 caracteres.',
  })
  correo: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'La contraseña no puede estar vacía.' })
  @MinLength(8, {
    message: 'La contraseña debe tener al menos $constraint1 caracteres.',
  })
  password: string;

  @IsString({ message: 'El rol debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El rol no puede estar vacío.' })
  rol: string;
}
