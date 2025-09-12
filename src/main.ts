import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter'; // Importa el filtro de excepciones
import { TransformInterceptor } from './common/interceptors/transform.interceptor'; // Importa el interceptor

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar el ValidationPipe globalmente para aplicar validaciones de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades del payload que no están definidas en el DTO
      forbidNonWhitelisted: true, // Lanza un error si hay propiedades no definidas en el DTO
      transform: true, // Transforma los payloads a instancias de DTO (ej. string a number)
      transformOptions: {
        enableImplicitConversion: true, // Intenta convertir tipos automáticamente (ej. IDs de string a number)
      },
    }),
  );

  // Registrar filtros e interceptores globales
  // No hay "unsafe construction" si los módulos se encuentran y son válidos.

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Habilitar CORS si tu frontend (ej. React, Angular, Vue) estará en un dominio diferente
  app.enableCors({
    origin: '*', // O especifica tus dominios: ['http://localhost:4200', 'https://tu-dominio.com']
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`La aplicación está corriendo en: ${await app.getUrl()}`);
}
// Llamada a bootstrap(). El error de promesa se resuelve con el 'await' dentro de la función.
bootstrap();
