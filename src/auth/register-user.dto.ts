export enum Role {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export interface ICreateUserDto {
  name: string;
  email: string;
  passwordHash: string;
  role?: Role;
  refreshToken: string;
  refreshTokenExpiry: Date;
}
