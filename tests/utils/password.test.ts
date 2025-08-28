import { PasswordService } from '@/utils/password';

describe('PasswordService', () => {
  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      const plainPassword = 'TestPassword123!';
      const hashedPassword = await PasswordService.hashPassword(plainPassword);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(plainPassword);
      expect(hashedPassword.length).toBeGreaterThan(50); // bcrypt hashes are typically 60 chars
    });

    it('should generate different hashes for the same password', async () => {
      const plainPassword = 'TestPassword123!';
      const hash1 = await PasswordService.hashPassword(plainPassword);
      const hash2 = await PasswordService.hashPassword(plainPassword);

      expect(hash1).not.toBe(hash2); // bcrypt uses random salt
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const plainPassword = 'TestPassword123!';
      const hashedPassword = await PasswordService.hashPassword(plainPassword);

      const isValid = await PasswordService.verifyPassword(plainPassword, hashedPassword);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const plainPassword = 'TestPassword123!';
      const wrongPassword = 'WrongPassword123!';
      const hashedPassword = await PasswordService.hashPassword(plainPassword);

      const isValid = await PasswordService.verifyPassword(wrongPassword, hashedPassword);
      expect(isValid).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should accept valid password', () => {
      const validPassword = 'TestPassword123!';
      const result = PasswordService.validatePassword(validPassword);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject password without lowercase', () => {
      const invalidPassword = 'TESTPASSWORD123!';
      const result = PasswordService.validatePassword(invalidPassword);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should reject password without uppercase', () => {
      const invalidPassword = 'testpassword123!';
      const result = PasswordService.validatePassword(invalidPassword);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject password without number', () => {
      const invalidPassword = 'TestPassword!';
      const result = PasswordService.validatePassword(invalidPassword);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should reject password without special character', () => {
      const invalidPassword = 'TestPassword123';
      const result = PasswordService.validatePassword(invalidPassword);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character (@$!%*?&)');
    });

    it('should reject password too short', () => {
      const shortPassword = 'Test1!';
      const result = PasswordService.validatePassword(shortPassword);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should reject empty password', () => {
      const emptyPassword = '';
      const result = PasswordService.validatePassword(emptyPassword);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password is required');
    });
  });
});
