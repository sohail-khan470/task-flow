import { prisma } from '#/config/database.js';
import { User } from '#/generated/prisma/client.js';
import { UserRepository } from '#/modules/users/user.repository.js';
import { argon2d } from 'argon2';
import { ICreateUserDto } from './register-user.dto.js';

export class AuthRepository {
  constructor(private userRepository: UserRepository) {
    this.userRepository = new UserRepository();
  }

  async register(data: ICreateUserDto) {
    const repsonse = await this.userRepository.register(data);
    return repsonse;
  }

  async findUserByEmail(email: string) {
    const user = await this.userRepository.findByEmail({ email: email.toLocaleLowerCase() });
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

  async clearRefreshToken(userId: string) {
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedRefreshToken: null,
        refreshTokenExpiresAt: null,
        refreshTokenVersion: null,
      },
    });
  }

  async findById(userId: string) {
    const user = await this.userRepository.findById(userId);
    return user;
  }
}
