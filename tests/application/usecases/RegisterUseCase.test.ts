import { RegisterUseCase } from '../../../src/application/usecases/RegisterUseCase';
import { IUserRepository } from '../../../src/domain/repositories/IUserRepository';
import { User, CreateUserRequest } from '../../../src/types';
import { PasswordService } from '../../../src/utils/password';

// Mock the password service
jest.mock('../../../src/utils/password');
const mockPasswordService = PasswordService as jest.Mocked<typeof PasswordService>;

describe('RegisterUseCase', () => {
  let registerUseCase: RegisterUseCase;
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

    // Mock PasswordService.validatePassword to return valid by default
    mockPasswordService.validatePassword = jest.fn().mockReturnValue({
      isValid: true,
      errors: []
    });

    registerUseCase = new RegisterUseCase(mockUserRepository);
  });

  describe('execute', () => {
    const validUserData: CreateUserRequest = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123',
      insuredId: '12345',
      countryISO: 'PE'
    };

    const mockUser: User = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      insuredId: '12345',
      countryISO: 'PE',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    it('should register user successfully with valid data', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.findByInsuredId.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockUser);

      // Act
      const result = await registerUseCase.execute(validUserData);

      // Assert
      expect(result.statusCode).toBe(201);
      expect(result.body.success).toBe(true);
      expect(result.body.data).toEqual(mockUser);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockUserRepository.findByInsuredId).toHaveBeenCalledWith('12345');
      expect(mockUserRepository.create).toHaveBeenCalledWith(validUserData);
    });

    it('should fail when email already exists', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      // Act
      const result = await registerUseCase.execute(validUserData);

      // Assert
      expect(result.statusCode).toBe(409);
      expect(result.body.success).toBe(false);
      expect(result.body.error).toBe('User with this email already exists');
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('should fail when insuredId already exists', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.findByInsuredId.mockResolvedValue(mockUser);

      // Act
      const result = await registerUseCase.execute(validUserData);

      // Assert
      expect(result.statusCode).toBe(409);
      expect(result.body.success).toBe(false);
      expect(result.body.error).toBe('User with this Insured ID already exists');
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('should fail with invalid email format', async () => {
      // Arrange
      const invalidData: CreateUserRequest = {
        ...validUserData,
        email: 'invalid-email'
      };

      // Act
      const result = await registerUseCase.execute(invalidData);

      // Assert
      expect(result.statusCode).toBe(400);
      expect(result.body.success).toBe(false);
      expect(result.body.error).toBe('Invalid email format');
      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
    });

    it('should fail with missing email', async () => {
      // Arrange
      const invalidData: CreateUserRequest = {
        ...validUserData,
        email: ''
      };

      // Act
      const result = await registerUseCase.execute(invalidData);

      // Assert
      expect(result.statusCode).toBe(400);
      expect(result.body.success).toBe(false);
      expect(result.body.error).toBe('Email is required');
    });

    it('should fail with missing password', async () => {
      // Arrange
      const invalidData: CreateUserRequest = {
        ...validUserData,
        password: ''
      };

      // Act
      const result = await registerUseCase.execute(invalidData);

      // Assert
      expect(result.statusCode).toBe(400);
      expect(result.body.success).toBe(false);
      expect(result.body.error).toBe('Password is required');
    });

    it('should fail with invalid country ISO', async () => {
      // Arrange
      const invalidData: CreateUserRequest = {
        ...validUserData,
        countryISO: 'xyz'
      };

      // Act
      const result = await registerUseCase.execute(invalidData);

      // Assert
      expect(result.statusCode).toBe(400);
      expect(result.body.success).toBe(false);
      expect(result.body.error).toBe('Country ISO must be exactly 2 uppercase letters (e.g., PE, CL)');
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await registerUseCase.execute(validUserData);

      // Assert
      expect(result.statusCode).toBe(500);
      expect(result.body.success).toBe(false);
      expect(result.body.error).toBe('Internal server error');
    });
  });
});
