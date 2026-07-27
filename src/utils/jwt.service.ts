import { env } from '#/config/server-config.js';
import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
import { AccessTokenPayload } from '#/auth/auth.payload.js';

export async function sign(payload: AccessTokenPayload) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export async function verify(token: string) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
}
