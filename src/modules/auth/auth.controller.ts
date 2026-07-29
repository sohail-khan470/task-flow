import { AuthService } from './auth.service.js';
import { Request, Response } from 'express';
import { UserRepository } from '../users/user.repository.js';
import { AuthRepository } from './auth.repository.js';
export class AuthController {
  constructor(private authService: AuthService) {
    this.authService = new AuthService(
      new AuthRepository(new UserRepository()),
      new UserRepository()
    );
  }
}
