import { LoginUseCase, LoginRequest } from '../../../src/application/usecases/LoginUseCase';
import { IUserRepository } from '../../../src/domain/repositories/IUserRepository';
import { User } from '../../../src/types';

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockUserRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByInsuredId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
      authenticate: jest.fn(),
    };

    loginUseCase = new LoginUseCase(mockUserRepository);
  });

  describe('execute', () => {
    const mockUser: User = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      insuredId: '12345',
      countryISO: 'PE',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    const validLoginRequest: LoginRequest = {
      email: 'test@example.com',
      password: 'password123'
    };

    it('should login user successfully with valid credentials', async () => {
      // Arrange
      mockUserRepository.authenticate.mockResolvedValue(mockUser);

      // Act
      const result = await loginUseCase.execute(validLoginRequest);

      // Assert
      expect(result.statusCode).toBe(200);
      expect(result.body.success).toBe(true);
      expect(result.body.data).toEqual(mockUser);
      expect(mockUserRepository.authenticate).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('should fail login with invalid credentials', async () => {
      // Arrange
      mockUserRepository.authenticate.mockResolvedValue(null);

      // Act
      const result = await loginUseCase.execute(validLoginRequest);

      // Assert
      expect(result.statusCode).toBe(401);
      expect(result.body.success).toBe(false);
      expect(result.body.error).toBe('Invalid credentials');
    });

    it('should fail login with invalid email format', async () => {
      // Arrange
      const invalidRequest: LoginRequest = {
        email: 'invalid-email',
        password: 'password123'
      };

      // Act
      const result = await loginUseCase.execute(invalidRequest);

      // Assert
      expect(result.statusCode).toBe(400);
      expect(result.body.success).toBe(false);
      expect(result.body.error).toBe('Invalid email format');
      expect(mockUserRepository.authenticate).not.toHaveBeenCalled();
    });

    it('should fail login with empty email', async () => {
      // Arrange
      const invalidRequest: LoginRequest = {
        email: '',
        password: 'password123'
      };

      // Act
      const result = await loginUseCase.execute(invalidRequest);

      // Assert
      expect(result.statusCode).toBe(400);
      expect(result.body.success).toBe(false);
      expect(result.body.error).toBe('Email is required');
      expect(mockUserRepository.authenticate).not.toHaveBeenCalled();
    });

    it('should fail login with empty password', async () => {
      // Arrange
      const invalidRequest: LoginRequest = {
        email: 'test@example.com',
        password: ''
      };

      // Act
      const result = await loginUseCase.execute(invalidRequest);

      // Assert
      expect(result.statusCode).toBe(400);
      expect(result.body.success).toBe(false);
      expect(result.body.error).toBe('Password is required');
      expect(mockUserRepository.authenticate).not.toHaveBeenCalled();
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      mockUserRepository.authenticate.mockRejectedValue(new Error('Database connection failed'));

      // Act
      const result = await loginUseCase.execute(validLoginRequest);

      // Assert
      expect(result.statusCode).toBe(500);
      expect(result.body.success).toBe(false);
      expect(result.body.error).toBe('Internal server error');
    });
  });
});
