import { Role } from '#/generated/prisma/enums.js';

export interface AccessTokenPayload {
  email: string;
  id: string;
  role: Role;
}

export interface RefreshTokenPayload {
  sub: string;
  tokenVersion: number;
}
