import { successResponse, errorResponse, validateEmail, validateRequired, parseJSON } from '@/utils/helpers';

describe('Helpers', () => {
  describe('successResponse', () => {
    it('should create success response with data', () => {
      // Arrange
      const testData = { id: 1, name: 'Test' };

      // Act
      const response = successResponse(testData);

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(testData);
      expect(response.body.message).toBeUndefined();
    });

    it('should create success response with data and message', () => {
      // Arrange
      const testData = { id: 1, name: 'Test' };
      const message = 'Operation successful';

      // Act
      const response = successResponse(testData, message);

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(testData);
      expect(response.body.message).toBe(message);
    });

    it('should handle null data', () => {
      // Act
      const response = successResponse(null);

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeNull();
    });

    it('should handle array data', () => {
      // Arrange
      const testData = [1, 2, 3];

      // Act
      const response = successResponse(testData);

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(testData);
    });
  });

  describe('errorResponse', () => {
    it('should create error response with status code and message', () => {
      // Arrange
      const statusCode = 400;
      const errorMessage = 'Bad Request';

      // Act
      const response = errorResponse(statusCode, errorMessage);

      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe(errorMessage);
    });

    it('should handle different status codes', () => {
      // Act
      const response404 = errorResponse(404, 'Not Found');
      const response500 = errorResponse(500, 'Internal Server Error');

      // Assert
      expect(response404.statusCode).toBe(404);
      expect(response404.body.error).toBe('Not Found');
      expect(response500.statusCode).toBe(500);
      expect(response500.body.error).toBe('Internal Server Error');
    });

    it('should handle empty error message', () => {
      // Act
      const response = errorResponse(400, '');

      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('');
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email formats', () => {
      // Arrange
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'firstname.lastname@company.com'
      ];

      // Act & Assert
      validEmails.forEach(email => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    it('should reject invalid email formats', () => {
      // Arrange
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test.example.com',
        'test @example.com',
        'test@example',
        ''
      ];

      // Act & Assert
      invalidEmails.forEach(email => {
        expect(validateEmail(email)).toBe(false);
      });
    });

    it('should handle special cases', () => {
      // Act & Assert
      expect(validateEmail('a@b.c')).toBe(true); // Minimum valid format
      expect(validateEmail('test@sub.domain.com')).toBe(true); // Subdomain
      expect(validateEmail('test+label@example.com')).toBe(true); // Plus addressing
    });
  });

  describe('validateRequired', () => {
    it('should not throw for valid values', () => {
      // Act & Assert
      expect(() => validateRequired('valid string', 'test')).not.toThrow();
      expect(() => validateRequired(123, 'number')).not.toThrow();
      expect(() => validateRequired(true, 'boolean')).not.toThrow();
      expect(() => validateRequired([], 'array')).not.toThrow();
      expect(() => validateRequired({}, 'object')).not.toThrow();
    });

    it('should throw for empty or null values', () => {
      // Act & Assert
      expect(() => validateRequired(null, 'testField')).toThrow('testField is required');
      expect(() => validateRequired(undefined, 'testField')).toThrow('testField is required');
      expect(() => validateRequired('', 'testField')).toThrow('testField is required');
      expect(() => validateRequired(0, 'testField')).toThrow('testField is required');
      expect(() => validateRequired(false, 'testField')).toThrow('testField is required');
    });

    it('should include field name in error message', () => {
      // Act & Assert
      expect(() => validateRequired(null, 'email')).toThrow('email is required');
      expect(() => validateRequired(undefined, 'password')).toThrow('password is required');
    });
  });

  describe('parseJSON', () => {
    it('should parse valid JSON strings', () => {
      // Arrange & Act
      const parsedObject = parseJSON('{"name": "test", "value": 123}');
      const parsedArray = parseJSON('[1, 2, 3]');
      const parsedString = parseJSON('"hello"');
      const parsedNumber = parseJSON('42');
      const parsedBoolean = parseJSON('true');

      // Assert
      expect(parsedObject).toEqual({ name: 'test', value: 123 });
      expect(parsedArray).toEqual([1, 2, 3]);
      expect(parsedString).toBe('hello');
      expect(parsedNumber).toBe(42);
      expect(parsedBoolean).toBe(true);
    });

    it('should throw error for invalid JSON', () => {
      // Arrange
      const invalidJSONs = [
        'invalid json',
        '{"unclosed": object',
        '[1, 2, 3,]',
        'undefined',
        '{key: value}' // unquoted keys
      ];

      // Act & Assert
      invalidJSONs.forEach(json => {
        expect(() => parseJSON(json)).toThrow('Invalid JSON format');
      });
    });

    it('should handle empty strings', () => {
      // Act & Assert
      expect(() => parseJSON('')).toThrow('Invalid JSON format');
    });

    it('should handle null and undefined strings', () => {
      // Act
      const nullResult = parseJSON('null');

      // Assert
      expect(nullResult).toBeNull();
    });
  });
});
