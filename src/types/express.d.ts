import { Role } from '#/generated/prisma/enums.ts';

declare global {
  namespace Express {
    interface User {
      id: string;
      role: Role;
    }
  }
}
