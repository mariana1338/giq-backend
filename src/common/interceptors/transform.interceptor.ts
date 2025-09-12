import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express'; // Importación de Response de Express

// Define una interfaz para estandarizar la estructura de tus respuestas exitosas
export interface StandardResponse<T> {
  statusCode: number;
  message?: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, StandardResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // Obtenemos la respuesta HTTP. TypeScript ya infiere el tipo 'Response' si todo está bien configurado.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const httpResponse = context.switchToHttp().getResponse(); // Se eliminó 'as Response'

        return {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          statusCode: httpResponse.statusCode, // Ahora TypeScript sabe que statusCode existe
          message: 'Operación exitosa',
          data: data as T, // Asegura que los datos son del tipo T esperado
        } as StandardResponse<T>; // Castea el objeto completo a StandardResponse<T>
      }),
    );
  }
}
