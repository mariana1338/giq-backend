// src/auth/interfaces/jwt-payload.interface.ts
export interface JwtPayload {
  email: string;
  sub: number; // Generalmente el ID del usuario
  rol: 'administrador' | 'usuario';
}