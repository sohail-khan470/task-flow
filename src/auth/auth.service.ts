import { UserRepository } from '#/modules/users/user.repository.js';
import { AuthRepository } from './auth.repository.js';
import { ICreateUserDto } from './register-user.dto.js';
import * as hashService from '#/utils/hash.service.js';
import * as jwtService from '#/utils/jwt.service.js';
import { AccessTokenPayload, RefreshTokenPayload } from './auth.payload.js';
import { ILoginUserDto } from './login-user.dto.js';
import { UnauthorizedError } from '#/utils/error.js';

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

      const refreshToken = await hashService.generateHashToken();
      const refreshTokenExpiry = new Date();
      refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7);

      const user = await this.authRepository.register({
        ...data,
        passwordHash: hashedPassword,
        refreshToken: refreshToken,
        refreshTokenExpiry: refreshTokenExpiry,
      });

      const tokenPayload: AccessTokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
      };
      const accessToken = jwtService.sign(tokenPayload);

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
    const accessToken = jwtService.sign(accessTokenPayload);
    const refreshToken = await jwtService.sign({});
    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string) {
    //user will send the token,
    //check the token if valid or not.
    //if valid ,extract the payload and then compare db with payload data
    //if version and userId matches then generate new token and return it
    //catch the errors

    const token = await jwtService.verify(refreshToken);
    if (!token) {
      throw new UnauthorizedError('Invalid refresh token please login again');
    }

    const { sub: userId, tokenVersion } = token;
    if (Date.now() > exp * 1000) {
      throw new UnauthorizedError('Invalid refresh token please login again');
    }

    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError('Invalid refresh token please login again');
    }
    const tokenPayload: AccessTokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = jwtService.sign(tokenPayload);
    return { accessToken };
  }
}
