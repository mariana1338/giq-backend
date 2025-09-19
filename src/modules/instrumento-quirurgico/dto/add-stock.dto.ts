import { IsNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class AddStockDto {
  @IsNumber({}, { message: 'La cantidad debe ser un número.' })
  @IsNotEmpty({ message: 'La cantidad no puede estar vacía.' })
  @Type(() => Number)
  cantidad: number;

  @IsNumber({}, { message: 'El ID de usuario debe ser un número.' })
  @IsNotEmpty({ message: 'El ID de usuario no puede estar vacío.' })
  @Type(() => Number)
  id_usuario: number;
}
