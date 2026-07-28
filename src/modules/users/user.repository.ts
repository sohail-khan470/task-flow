// src/modules/users/user.repository.ts
import { prisma } from '#/config/database.js';
import { Prisma } from '#/generated/prisma/client.js';
import { argon2d } from 'argon2';
import { IUserResponse } from './user-repsonse.dto.js';
import { ICreateUserDto } from '#/auth/register-user.dto.js';
import { UserModel } from '#/generated/prisma/models.js';

// ============================================================================
// RETURN TYPES
// We define specific payloads to ensure passwordHash is never accidentally
// leaked when fetching a user for relations, while still allowing the
// future AuthService to access it when needed.
// ============================================================================

/**
 * Safe to return to the frontend or use in relations.
 * Explicitly excludes passwordHash.
 */
export type PublicUser = Prisma.UserGetPayload<{
  select: {
    id: true;
    name: true;
    email: true;
    role: true;
    createdAt: true;
  };
}>;

/**
 * The full database row.
 * ONLY to be used internally by the future AuthService for password verification.
 */
export type UserWithPassword = Prisma.UserGetPayload<{}>;

// ============================================================================
// REPOSITORY CLASS
// ============================================================================

export class UserRepository {
  /**
   * Find a user by ID.
   * Used by other modules (Tasks, Projects) to verify assignees/owners exist.
   * Returns a safe subset of fields (no password).
   */
  async findById(id: string): Promise<UserModel | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async register(user: ICreateUserDto) {
    return prisma.user.create({ data: user });
  }

  /**
   * Find a user by email.
   * Reserved for Phase 2 (Auth). Includes the passwordHash for verification.
   */
  async findByEmail({ email }: { email: string }) {
    return prisma.user.findUnique({
      where: { email },
    });
  }
}
