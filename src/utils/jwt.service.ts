import { env } from '#/config/server-config.js';
import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
import { TokenPayload } from '#/auth/auth.payload.js';

export async function signAccessToken(payload: TokenPayload) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export async function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
}

export async function hashRefreshToken(token: string) {
  return argon2.hash(token);
}

export async function verifyRefreshToken(password: string, hash: string) {
  return argon2.verify(hash, password);
}
