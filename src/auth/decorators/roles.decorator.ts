// src/auth/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

// Definimos los roles que el sistema maneja
export type Role = 'usuario' | 'administrador';

// La clave 'roles' es la metadata que el guard buscará
export const ROLES_KEY = 'roles';

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);