import bcryptjs from 'bcryptjs';
import { UserRepository } from '../repositories/UserRepository';
import { User } from '../entities/User';
import { TokenUtils, TokenPayload } from '../utils/tokenUtils';
import { Logger } from '../utils/logger';
import { EmailService } from './EmailService';

const emailService = new EmailService();

export class AuthService {
  async register(
    email: string,
    password: string,
    name: string
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcryptjs.hash(password, 12);
    const user = await UserRepository.createUser(email, hashedPassword, name);

    const tokenPayload: TokenPayload = { id: user.id, email: user.email };
    const accessToken = TokenUtils.generateAccessToken(tokenPayload);
    const refreshToken = TokenUtils.generateRefreshToken(tokenPayload);

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(user.email, user.name || 'User');
    } catch (error) {
      Logger.warn('Failed to send welcome email', error);
    }

    return { user, accessToken, refreshToken };
  }

  async login(email: string, password: string): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isValidPassword = await bcryptjs.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    const tokenPayload: TokenPayload = { id: user.id, email: user.email };
    const accessToken = TokenUtils.generateAccessToken(tokenPayload);
    const refreshToken = TokenUtils.generateRefreshToken(tokenPayload);

    return { user, accessToken, refreshToken };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const decoded = TokenUtils.verifyRefreshToken(refreshToken);
    if (!decoded) {
      throw new Error('Invalid refresh token');
    }

    const user = await UserRepository.findById(decoded.id);
    if (!user) {
      throw new Error('User not found');
    }

    const tokenPayload: TokenPayload = { id: user.id, email: user.email };
    const newAccessToken = TokenUtils.generateAccessToken(tokenPayload);
    const newRefreshToken = TokenUtils.generateRefreshToken(tokenPayload);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async getUserById(id: string): Promise<User> {
    const user = await UserRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}
