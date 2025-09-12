import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUbicacionAlmacenDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la ubicación no puede estar vacío.' })
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;
}
