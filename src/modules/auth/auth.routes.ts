import { Router } from 'express';

const router: Router = Router();

//register,

router.post('/register');

//login

router.post('/login');

export const authRouter: Router = Router();
