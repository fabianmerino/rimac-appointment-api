import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { User, ApiResponse } from '@/types';

export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Login user use case - Application layer
 * Contains the business logic for user authentication
 */
export class LoginUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(loginData: LoginRequest): Promise<ApiResponse<User>> {
    try {
      // Validate required fields
      if (!loginData.email) {
        return {
          statusCode: 400,
          body: {
            success: false,
            error: 'Email is required'
          }
        };
      }

      if (!loginData.password) {
        return {
          statusCode: 400,
          body: {
            success: false,
            error: 'Password is required'
          }
        };
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(loginData.email)) {
        return {
          statusCode: 400,
          body: {
            success: false,
            error: 'Invalid email format'
          }
        };
      }

      // Authenticate user
      const user = await this.userRepository.authenticate(loginData.email, loginData.password);

      if (!user) {
        return {
          statusCode: 401,
          body: {
            success: false,
            error: 'Invalid credentials'
          }
        };
      }

      return {
        statusCode: 200,
        body: {
          success: true,
          data: user,
          message: 'Login successful'
        }
      };

    } catch (error) {
      console.error('Error in LoginUseCase:', error);
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
