import { PasswordService } from '../../../src/infrastructure/services/PasswordService';

describe('PasswordService', () => {
  describe('hash', () => {
    it('should hash a password successfully', async () => {
      // Arrange
      const plainPassword = 'TestPassword123';

      // Act
      const hashedPassword = await PasswordService.hash(plainPassword);

      // Assert
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(plainPassword);
      expect(hashedPassword.length).toBeGreaterThan(50); // bcrypt hashes are typically ~60 chars
      expect(hashedPassword.startsWith('$2')).toBe(true); // bcrypt format (can be $2a$, $2b$, $2y$)
    });

    it('should generate different hashes for same password', async () => {
      // Arrange
      const plainPassword = 'SamePassword123';

      // Act
      const hash1 = await PasswordService.hash(plainPassword);
      const hash2 = await PasswordService.hash(plainPassword);

      // Assert
      expect(hash1).not.toBe(hash2); // Salt makes each hash unique
    });

    it('should handle empty password', async () => {
      // Arrange
      const emptyPassword = '';

      // Act
      const hashedPassword = await PasswordService.hash(emptyPassword);

      // Assert
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe('');
    });
  });

  describe('compare', () => {
    it('should return true for correct password', async () => {
      // Arrange
      const plainPassword = 'CorrectPassword123';
      const hashedPassword = await PasswordService.hash(plainPassword);

      // Act
      const isValid = await PasswordService.compare(plainPassword, hashedPassword);

      // Assert
      expect(isValid).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      // Arrange
      const plainPassword = 'CorrectPassword123';
      const wrongPassword = 'WrongPassword456';
      const hashedPassword = await PasswordService.hash(plainPassword);

      // Act
      const isValid = await PasswordService.compare(wrongPassword, hashedPassword);

      // Assert
      expect(isValid).toBe(false);
    });

    it('should return false for empty password against hash', async () => {
      // Arrange
      const plainPassword = 'ValidPassword123';
      const hashedPassword = await PasswordService.hash(plainPassword);

      // Act
      const isValid = await PasswordService.compare('', hashedPassword);

      // Assert
      expect(isValid).toBe(false);
    });

    it('should return false for malformed hash', async () => {
      // Arrange
      const plainPassword = 'TestPassword123';
      const malformedHash = 'not-a-valid-hash';

      // Act
      const isValid = await PasswordService.compare(plainPassword, malformedHash);

      // Assert
      expect(isValid).toBe(false);
    });
  });

  describe('validate', () => {
    it('should accept valid password with letters and numbers', () => {
      // Arrange
      const validPassword = 'Password123';

      // Act
      const isValid = PasswordService.validate(validPassword);

      // Assert
      expect(isValid).toBe(true);
    });

    it('should reject password shorter than 8 characters', () => {
      // Arrange
      const shortPassword = 'Pass1';

      // Act
      const isValid = PasswordService.validate(shortPassword);

      // Assert
      expect(isValid).toBe(false);
    });

    it('should reject password without letters', () => {
      // Arrange
      const numbersOnlyPassword = '12345678';

      // Act
      const isValid = PasswordService.validate(numbersOnlyPassword);

      // Assert
      expect(isValid).toBe(false);
    });

    it('should reject password without numbers', () => {
      // Arrange
      const lettersOnlyPassword = 'PasswordOnly';

      // Act
      const isValid = PasswordService.validate(lettersOnlyPassword);

      // Assert
      expect(isValid).toBe(false);
    });

    it('should accept password with mixed case and numbers', () => {
      // Arrange
      const mixedPassword = 'MyPassword123';

      // Act
      const isValid = PasswordService.validate(mixedPassword);

      // Assert
      expect(isValid).toBe(true);
    });

    it('should accept longer valid passwords', () => {
      // Arrange
      const longPassword = 'ThisIsAVeryLongPassword123WithManyCharacters';

      // Act
      const isValid = PasswordService.validate(longPassword);

      // Assert
      expect(isValid).toBe(true);
    });

    it('should reject empty password', () => {
      // Arrange
      const emptyPassword = '';

      // Act
      const isValid = PasswordService.validate(emptyPassword);

      // Assert
      expect(isValid).toBe(false);
    });

    it('should accept password with special characters', () => {
      // Arrange
      const passwordWithSpecialChars = 'Password123!@#';

      // Act
      const isValid = PasswordService.validate(passwordWithSpecialChars);

      // Assert
      expect(isValid).toBe(true);
    });
  });
});
