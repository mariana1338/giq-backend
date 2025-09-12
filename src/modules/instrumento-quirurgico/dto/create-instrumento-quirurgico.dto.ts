import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInstrumentoQuirurgicoDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del instrumento no puede estar vacío.' })
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber({}, { message: 'El precio unitario debe ser un número.' })
  @Min(0, { message: 'El precio unitario no puede ser negativo.' })
  @Type(() => Number) // Asegura que el valor se transforme a número
  precioUnitario: number;

  @IsNumber({}, { message: 'El precio de venta debe ser un número.' })
  @Min(0, { message: 'El precio de venta no puede ser negativo.' })
  @Type(() => Number)
  precioVenta: number;

  @IsNumber(
    {},
    { message: 'La cantidad mínima en stock debe ser un número entero.' },
  )
  @Min(0, { message: 'La cantidad mínima en stock no puede ser negativa.' })
  @Type(() => Number)
  cantidadStockMinima: number;

  @IsNumber({}, { message: 'La cantidad en stock debe ser un número entero.' })
  @Min(0, { message: 'La cantidad en stock no puede ser negativa.' })
  @Type(() => Number)
  cantidadStock: number;

  @IsDateString(
    {},
    {
      message:
        'La fecha de adquisición debe ser una fecha válida (YYYY-MM-DD).',
    },
  )
  @IsOptional()
  fechaAdquisicion?: string; // Usamos string para la entrada, TypeORM lo convertirá a Date

  @IsNumber({}, { message: 'El ID de categoría debe ser un número.' })
  @IsOptional()
  @Type(() => Number)
  categoriaId?: number;

  @IsNumber({}, { message: 'El ID de proveedor debe ser un número.' })
  @IsOptional()
  @Type(() => Number)
  proveedorId?: number;

  @IsNumber({}, { message: 'El ID de ubicación debe ser un número.' })
  @IsOptional()
  @Type(() => Number)
  ubicacionId?: number;
}
