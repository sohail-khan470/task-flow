import { UserRepository } from '#/modules/users/user.repository.js';
import { AuthRepository } from './auth.repository.js';
import { ICreateUserDto } from './create-user.dto.js';
import * as hashService from '#/utils/hash.service.js';

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
      const user = await this.userRepository.findByEmail({ email: data.email });
      if (user) {
        throw new Error('User with this email already registered');
      }

      //hash password
      data.passwordHash = await hashService.hashPassword(data.passwordHash);

      return this.authRepository.register(data);
    } catch (error) {
      throw error;
    }
    //lower case email
  }
}
