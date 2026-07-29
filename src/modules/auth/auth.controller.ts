import { AuthService } from './auth.service.js';
import { Request, RequestHandler, Response } from 'express';
import { UserRepository } from '../users/user.repository.js';
import { AuthRepository } from './auth.repository.js';
import { successResponse, errorResponse } from '#/utils/response.js';

export class AuthController {
  constructor(private authService: AuthService) {
    this.authService = new AuthService(
      new AuthRepository(new UserRepository()),
      new UserRepository()
    );
  }

  register: RequestHandler = async (req: Request, res: Response) => {
    try {
      const data = await this.authService.register(req.body);

      // Construct the standard response payload, then send it with a 201 Created status
      const response = successResponse(data);
      return res.status(201).json(response);
    } catch (error) {
      // Extract a safe message from the caught error
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';

      // Construct the error payload using your utility, then send with a 500 status
      const response = errorResponse('REGISTRATION_FAILED', message, error);
      return res.status(500).json(response);
    }
  };

  login: RequestHandler = async (req: Request, res: Response) => {
    try {
      const data = await this.authService.login(req.body);

      // Construct the standard response payload, then send it with a 200 OK status
      const response = successResponse(data);
      return res.status(200).json(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';

      // You might want to use 401 Unauthorized for login failures specifically
      const response = errorResponse('LOGIN_FAILED', message, error);
      return res.status(500).json(response);
    }
  };
}
