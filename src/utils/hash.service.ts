import argon2 from 'argon2';
import { randomBytes } from 'node:crypto';

export async function hashPassword(password: string) {
  return argon2.hash(password);
}

export async function verifyPassword(password: string, hash: string) {
  return argon2.verify(hash, password);
}

//hash refresh token
export async function generateHashToken() {
  const randomString: any = randomBytes(32).toString('hex');
  return await argon2.hash(randomString);
}

//verify refresh token
export async function verifyHashToken(rawString: string, hash: string) {
  return argon2.verify(hash, rawString);
}
