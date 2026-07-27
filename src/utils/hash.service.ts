import argon2 from 'argon2';

export async function hashPassword(password: string) {
  return argon2.hash(password);
}

export async function verifyPassword(password: string, hash: string) {
  return argon2.verify(hash, password);
}

//hash refresh token
export async function hashRefreshToken(token: string) {
  return (await argon2.hash(token)).toString();
}

//verify refresh token
export async function verifyRefreshToken(password: string, hash: string) {
  return argon2.verify(hash, password);
}
