// src/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role, ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Obtener el rol REQUERIDO por la ruta (del decorador @Roles)
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(), // Para el método (ej: @Post(''))
      context.getClass(),   // Para el controlador (ej: @Controller(''))
    ]);

    // Si la ruta no tiene @Roles(), el acceso está permitido por defecto del guard
    if (!requiredRoles) {
      return true; 
    }

    // 2. Obtener el usuario y su ROL REAL (inyectado por el JwtStrategy)
    const { user } = context.switchToHttp().getRequest();

    // 3. Verificar si el rol del usuario está en la lista de roles requeridos
    return requiredRoles.some((role) => user.rol === role);
  }
}