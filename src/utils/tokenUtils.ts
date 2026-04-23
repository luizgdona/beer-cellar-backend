import jwt from 'jsonwebtoken';
import { appConfig } from '../config/app.config';

export interface TokenPayload {
  id: string;
  email: string;
}

export class TokenUtils {
  static generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, appConfig.jwt.secret, { expiresIn: '15m' });
  }

  static generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, appConfig.jwt.refreshSecret, { expiresIn: '7d' });
  }

  static verifyAccessToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, appConfig.jwt.secret) as TokenPayload;
    } catch {
      return null;
    }
  }

  static verifyRefreshToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, appConfig.jwt.refreshSecret) as TokenPayload;
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
