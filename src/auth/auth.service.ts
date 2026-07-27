import { UserRepository } from '#/modules/users/user.repository.js';
import { AuthRepository } from './auth.repository.js';
import { ICreateUserDto } from './register-user.dto.js';
import * as hashService from '#/utils/hash.service.js';
import * as jwtService from '#/utils/jwt.service.js';
import { TokenPayload } from './auth.payload.js';
import { randomBytes } from 'node:crypto';

export class AuthService {
  constructor(
    private authRepository: AuthRepository,
    private userRepository: UserRepository
  ) {
    this.userRepository = new UserRepository();
    this.authRepository = new AuthRepository(userRepository);
  }

  async register(data: ICreateUserDto) {
    try {
      data.email = data.email.toLowerCase();
      //check if user with email already registered
      const existingUser = await this.userRepository.findByEmail({ email: data.email });
      if (existingUser) {
        throw new Error('User with this email already registered');
      }

      //hash password
      const hashedPassword = (data.passwordHash = await hashService.hashPassword(
        data.passwordHash
      ));
      const refreshTokenString = randomBytes(32).toString('hex');
      const refreshToken = await hashService.hashRefreshToken(refreshTokenString);
      const refreshTokenExpiry = new Date();
      refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7);

      const user = await this.authRepository.register({
        ...data,
        passwordHash: hashedPassword,
        refreshToken: refreshToken,
        refreshTokenExpiry: refreshTokenExpiry,
      });

      const tokenPayload: TokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
      };
      const accessToken = jwtService.signAccessToken(tokenPayload);

      {
        accessToken: accessToken;
        refreshToken: refreshToken;
        user: {
          id: user.id;
          email: user.email;
          name: user.name;
          role: user.role;
        }
      }
      return { accessToken, refreshToken };
    } catch (error) {
      throw error;
    }
  }
}
