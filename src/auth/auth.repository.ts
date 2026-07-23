import { prisma } from '#/config/database.js';
import { UserRepository } from '#/modules/users/user.repository.js';
import { argon2d } from 'argon2';

export class AuthRepository {
  constructor(private userRepository: UserRepository) {
    this.userRepository = new UserRepository();
  }

  async findUserByEmail(email: string) {
    const user = await this.userRepository.findByEmail({ email });
    return user;
  }

  async storeRefreshToken(
    userId: string,
    hashedToken: string,
    expiresAt: Date,
    newTokenVersion: number
  ) {
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedRefreshToken: hashedToken,
        refreshTokenExpiresAt: expiresAt,
        refreshTokenVersion: newTokenVersion,
      },
    });
  }
}
