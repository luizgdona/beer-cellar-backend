import { Router } from 'express';
import { AuthService } from '../services/AuthService';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { LoginSchema, RegisterSchema, RefreshTokenSchema } from '../schemas/auth.schemas';
import { Logger } from '../utils/logger';

const router = Router();
const authService = new AuthService();

// Register new user
router.post('/register', validate(RegisterSchema), async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const { user, accessToken, refreshToken } = await authService.register(email, password, name);
    
    Logger.info('User registered successfully', { email });
    
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error) {
    Logger.error('Registration failed', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Registration failed',
    });
  }
});

// Login user
router.post('/login', validate(LoginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.login(email, password);
    
    Logger.info('User logged in', { email });
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error) {
    Logger.error('Login failed', error);
    res.status(401).json({
      success: false,
      error: error instanceof Error ? error.message : 'Login failed',
    });
  }
});

// Refresh token
router.post('/refresh', validate(RefreshTokenSchema), async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshToken(refreshToken);
    
    res.json({
      success: true,
      data: { tokens },
    });
  } catch (error) {
    Logger.error('Token refresh failed', error);
    res.status(401).json({
      success: false,
      error: error instanceof Error ? error.message : 'Token refresh failed',
    });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = await authService.getUserById(req.user!.id);
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    Logger.error('Failed to get user', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user information',
    });
  }
});

// Logout (client-side primarily, but can invalidate token on backend with Redis)
router.post('/logout', authenticateToken, (req: AuthRequest, res) => {
  Logger.info('User logged out', { userId: req.user!.id });
  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
