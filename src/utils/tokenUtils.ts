import jwt from 'jsonwebtoken';

export interface TokenPayload {
  id: string;
  email: string;
}

export class TokenUtils {
  static generateAccessToken(payload: TokenPayload): string {
    const secret = process.env.JWT_SECRET || 'default-secret';
    return jwt.sign(payload, secret, { expiresIn: '15m' });
  }

  static generateRefreshToken(payload: TokenPayload): string {
    const secret = process.env.REFRESH_TOKEN_SECRET || 'refresh-secret';
    return jwt.sign(payload, secret, { expiresIn: '7d' });
  }

  static verifyAccessToken(token: string): TokenPayload | null {
    try {
      const secret = process.env.JWT_SECRET || 'default-secret';
      return jwt.verify(token, secret) as TokenPayload;
    } catch {
      return null;
    }
  }

  static verifyRefreshToken(token: string): TokenPayload | null {
    try {
      const secret = process.env.REFRESH_TOKEN_SECRET || 'refresh-secret';
      return jwt.verify(token, secret) as TokenPayload;
    } catch {
      return null;
    }
  }

  static decodeToken(token: string): TokenPayload | null {
    try {
      return jwt.decode(token) as TokenPayload;
    } catch {
      return null;
    }
  }
}
