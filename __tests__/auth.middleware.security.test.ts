import { describe, expect, it, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import { authenticateToken, AuthRequest } from '../src/middleware/auth';

type MockResponse = {
  status: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
};

function createMockResponse(): MockResponse {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res;
}

describe('authenticateToken middleware security', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  it('rejects requests without token', () => {
    const req = { headers: {} } as AuthRequest;
    const res = createMockResponse();
    const next = vi.fn();

    authenticateToken(req, res as any, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token missing' });
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects invalid tokens', () => {
    const req = { headers: { authorization: 'Bearer invalid.token.value' } } as unknown as AuthRequest;
    const res = createMockResponse();
    const next = vi.fn();

    authenticateToken(req, res as any, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('accepts valid token and populates req.user', () => {
    const token = jwt.sign({ id: 'u-1', email: 'safe@example.com' }, process.env.JWT_SECRET as string);
    const req = { headers: { authorization: `Bearer ${token}` } } as unknown as AuthRequest;
    const res = createMockResponse();
    const next = vi.fn();

    authenticateToken(req, res as any, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toMatchObject({ id: 'u-1', email: 'safe@example.com' });
  });
});
