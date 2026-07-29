import { UserRepository } from '#/modules/users/user.repository.js';
import { AuthRepository } from './auth.repository.js';
import { ICreateUserDto } from './register-user.dto.js';
import * as hashService from '#/utils/hash.service.js';
import * as jwtService from '#/utils/jwt.service.js';
import { AccessTokenPayload, RefreshTokenPayload } from './auth.payload.js';
import { ILoginUserDto } from './login-user.dto.js';
import { UnauthorizedError } from '#/utils/error.js';
import { TokenExpiredError } from 'jsonwebtoken';

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

      const hashTokenPayload = { sub: data.email, tokenVersion: data.tokenVersion };
      const refreshToken = await jwtService.signRefreshToken(hashTokenPayload);
      const hashedRefreshToken = await hashService.hashToken(refreshToken);
      const refreshTokenExpiry = new Date();
      refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7);

      const user = await this.authRepository.register({
        ...data,
        passwordHash: hashedPassword,
        refreshToken: hashedRefreshToken,
        refreshTokenExpiry: refreshTokenExpiry,
      });

      const tokenPayload: AccessTokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
      };
      const accessToken = jwtService.signAccessToken(tokenPayload);

      return {
        accessToken: accessToken,
        refreshToken: hashedRefreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async login(data: ILoginUserDto) {
    const email = data.email.toLowerCase();
    const user = await this.authRepository.findUserByEmail(email);

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }
    const isValid = await hashService.verifyPassword(data.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }
    const accessTokenPayload: AccessTokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const refreshTokenPayload: RefreshTokenPayload = {
      sub: user.id,
      tokenVersion: user.tokenVersion,
    };
    const accessToken = jwtService.signAccessToken(accessTokenPayload);
    const refreshToken = await jwtService.signRefreshToken(refreshTokenPayload);
    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string) {
    try {
      const token = await jwtService.verify(refreshToken);

      //extract payload
      const { sub: userId, tokenVersion } = token as RefreshTokenPayload;

      const user = await this.authRepository.findById(userId);
      if (!user || user.tokenVersion !== tokenVersion) {
        throw new UnauthorizedError('Invalid refresh token please login again');
      }
      if (!user.refreshTokenHash) {
        throw new UnauthorizedError('Invalid refresh token please login again');
      }
      const isValid = await hashService.verifyHashToken(refreshToken, user.refreshTokenHash);
      if (!isValid) {
        await this.authRepository.clearRefreshToken(userId);
        throw new UnauthorizedError('Invalid refresh token please login again');
      }

      const tokenPayload: AccessTokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
      };
      const accessToken = jwtService.signAccessToken(tokenPayload);
      refreshToken = await jwtService.signRefreshToken({
        sub: user.id,
        tokenVersion: user.tokenVersion,
      });
      const hashedToken = await hashService.hashToken(refreshToken);
      await this.authRepository.updateRefreshToken(userId, hashedToken, new Date());
      user.refreshTokenExpiresAt = new Date();

      return { refreshToken, accessToken };
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedError('Invalid refresh token please login again');
      }
      throw error;
    }
  }
}
