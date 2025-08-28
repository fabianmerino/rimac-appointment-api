import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { User, CreateUserRequest, ApiResponse } from '@/types';
import { PasswordService } from '@/utils/password';

/**
 * Register user use case - Application layer
 * Contains the business logic for user registration
 */
export class RegisterUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userData: CreateUserRequest): Promise<ApiResponse<User>> {
    try {
      // Validate required fields
      if (!userData.email) {
        return {
          statusCode: 400,
          body: {
            success: false,
            error: 'Email is required'
          }
        };
      }

      if (!userData.password) {
        return {
          statusCode: 400,
          body: {
            success: false,
            error: 'Password is required'
          }
        };
      }

      if (!userData.name) {
        return {
          statusCode: 400,
          body: {
            success: false,
            error: 'Name is required'
          }
        };
      }

      if (!userData.insuredId) {
        return {
          statusCode: 400,
          body: {
            success: false,
            error: 'Insured ID is required'
          }
        };
      }

      if (!userData.countryISO) {
        return {
          statusCode: 400,
          body: {
            success: false,
            error: 'Country ISO is required'
          }
        };
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        return {
          statusCode: 400,
          body: {
            success: false,
            error: 'Invalid email format'
          }
        };
      }

      // Validate insured ID format (exactly 5 digits)
      const insuredIdRegex = /^\d{5}$/;
      if (!insuredIdRegex.test(userData.insuredId)) {
        return {
          statusCode: 400,
          body: {
            success: false,
            error: 'Insured ID must be exactly 5 digits'
          }
        };
      }

      // Validate country ISO format (exactly 2 uppercase letters)
      const countryISORegex = /^[A-Z]{2}$/;
      if (!countryISORegex.test(userData.countryISO)) {
        return {
          statusCode: 400,
          body: {
            success: false,
            error: 'Country ISO must be exactly 2 uppercase letters (e.g., PE, CL)'
          }
        };
      }

      // Validate password strength
      const passwordValidation = PasswordService.validatePassword(userData.password);
      if (!passwordValidation.isValid) {
        return {
          statusCode: 400,
          body: {
            success: false,
            error: `Password validation failed: ${passwordValidation.errors.join(', ')}`
          }
        };
      }

      // Check if user already exists by email
      const existingUserByEmail = await this.userRepository.findByEmail(userData.email);
      if (existingUserByEmail) {
        return {
          statusCode: 409,
          body: {
            success: false,
            error: 'User with this email already exists'
          }
        };
      }

      // Check if user already exists by insured ID
      const existingUserByInsuredId = await this.userRepository.findByInsuredId(userData.insuredId);
      if (existingUserByInsuredId) {
        return {
          statusCode: 409,
          body: {
            success: false,
            error: 'User with this Insured ID already exists'
          }
        };
      }

      // Create user
      const user = await this.userRepository.create(userData);

      return {
        statusCode: 201,
        body: {
          success: true,
          data: user,
          message: 'User registered successfully'
        }
      };

    } catch (error) {
      console.error('Error in RegisterUseCase:', error);
      return {
        statusCode: 500,
        body: {
          success: false,
          error: 'Internal server error'
        }
      };
    }
  }
}
