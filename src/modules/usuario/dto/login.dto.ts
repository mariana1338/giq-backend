// src/modules/usuario/dto/login.dto.ts
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  // El frontend envía el campo como 'usuario', pero en el backend es el 'correo' (email)
  // Usamos el decorador @IsEmail para asegurar que es un formato válido.
  @IsEmail({}, { message: 'El correo electrónico no es válido.' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio.' })
  email: string; // Nota: El campo debe llamarse 'email' para coincidir con lo que recibe el Controller/Service

  // Validamos que la contraseña exista y tenga una longitud mínima para prevenir ataques de fuerza bruta simples.
  @IsString({ message: 'La contraseña debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
  password: string;
}