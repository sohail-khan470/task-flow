export interface AccessTokenPayload {
  email: string;
  id: string;
  role: string;
}

export interface RefreshTokenPayload {
  sub: string;
  tokenVersion: number;
}
