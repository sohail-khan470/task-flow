import argon2 from 'argon2';
import { randomBytes } from 'node:crypto';

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return argon2.verify(hash, password);
}

// Generate a random token and return both the token and its hash
export async function generateRefreshToken(): Promise<{ token: string; hash: string }> {
  const token = randomBytes(32).toString('hex');
  const hash = await argon2.hash(token);
  return { token, hash };
}

// Hash an existing token (useful when you already have the token)
export async function hashToken(token: string): Promise<string> {
  return argon2.hash(token);
}

// Verify refresh token against its hash
export async function verifyHashToken(rawToken: string, hash: string): Promise<boolean> {
  return argon2.verify(hash, rawToken);
}
