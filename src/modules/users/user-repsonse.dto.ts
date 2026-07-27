import { Role } from '#/generated/prisma/enums.js';

export interface IUserResponse {
  id: string;
  name: string;
  email: string;
  role: Role;
  tokenVersion: number;
  createdAt: Date;
}
