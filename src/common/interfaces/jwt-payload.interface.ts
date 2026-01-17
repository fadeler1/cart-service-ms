export interface JwtPayload {
  sub: string;
  email?: string;
  type?: 'registered' | 'guest';
  iat?: number;
  exp?: number;
}
