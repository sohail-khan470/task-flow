export enum Role {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export interface ICreateUserDto {
  name: string;
  email: string;
  passwordHash: string;
  role?: Role;
  tokenVersion: number;
  refreshToken: string;
  refreshTokenExpiry: Date;
}
