import { env } from '#/config/server-config.js';
import jwt from 'jsonwebtoken';
import { AccessTokenPayload, RefreshTokenPayload } from '#/auth/auth.payload.js';

// export async function sign(payload: AccessTokenPayload | RefreshTokenPayload) {
//   return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
//     expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
//   });
// }

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'] | number,
  });
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'] | number,
  });
}

export async function verify(token: string) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
}
