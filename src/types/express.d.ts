// file: src/types/express.d.ts
// This is a type declaration file — write it completely.

import { Role } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: Role;
      };
    }
  }
}
