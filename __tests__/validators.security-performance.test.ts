import { describe, expect, it } from 'vitest';
import { Validators } from '../src/utils/validators';

describe('Validators security and performance', () => {
  it('sanitizes dangerous angle brackets from user input', () => {
    const malicious = '<script>alert(1)</script>hello<world>';
    const sanitized = Validators.sanitizeString(malicious);

    expect(sanitized.includes('<')).toBe(false);
    expect(sanitized.includes('>')).toBe(false);
    expect(sanitized).toContain('scriptalert(1)/scripthelloworld');
  });

  it('enforces strong password policy', () => {
    expect(Validators.isStrongPassword('weakpass')).toBe(false);
    expect(Validators.isStrongPassword('Strongpass')).toBe(false);
    expect(Validators.isStrongPassword('Strong123')).toBe(true);
  });

  it('handles bulk validation quickly for API throughput', () => {
    const emails = Array.from({ length: 5000 }, (_, i) => `user${i}@example.com`);
    const start = Date.now();

    const validCount = emails.filter((email) => Validators.isValidEmail(email)).length;

    const elapsed = Date.now() - start;
    expect(validCount).toBe(5000);
    expect(elapsed).toBeLessThan(200);
  });
});
