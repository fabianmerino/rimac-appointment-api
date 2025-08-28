import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { parseJSON } from '@/utils/helpers';
import { CreateUserRequest } from '@/types';
import { RegisterUseCase } from '@/application/usecases/RegisterUseCase';
import { LoginUseCase, LoginRequest } from '@/application/usecases/LoginUseCase';
import { DynamoDBUserRepository } from '@/infrastructure/repositories/DynamoDBUserRepository';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Initialize repository and use cases
const userRepository = new DynamoDBUserRepository();
const registerUseCase = new RegisterUseCase(userRepository);
const loginUseCase = new LoginUseCase(userRepository);

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const { path, method: httpMethod } = event.requestContext.http;

  try {
    if (path === '/auth/login' && httpMethod === 'POST') {
      return await login(event);
    }

    if (path === '/auth/register' && httpMethod === 'POST') {
      return await register(event);
    }

    return {
      statusCode: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        error: 'Route not found'
      }),
    };
  } catch (error) {
    console.error('Error in auth handler:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        error: 'Internal server error'
      }),
    };
  }
};

const login = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const body = parseJSON(event.body || '{}') as LoginRequest;

  // Execute login use case
  const result = await loginUseCase.execute(body);

  // If login successful, generate JWT token
  if (result.statusCode === 200 && result.body.success && result.body.data) {
    const token = jwt.sign(
      {
        userId: result.body.data.id,
        email: result.body.data.email,
        insuredId: result.body.data.insuredId
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      statusCode: result.statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        ...result.body,
        data: {
          token,
          user: result.body.data
        }
      }),
    };
  }

  // Return error response
  return {
    statusCode: result.statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(result.body),
  };
};

const register = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const body = parseJSON(event.body || '{}') as CreateUserRequest;

  // Execute register use case
  const result = await registerUseCase.execute(body);

  // If registration successful, generate JWT token
  if (result.statusCode === 201 && result.body.success && result.body.data) {
    const token = jwt.sign(
      {
        userId: result.body.data.id,
        email: result.body.data.email,
        insuredId: result.body.data.insuredId
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      statusCode: result.statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        ...result.body,
        data: {
          token,
          user: result.body.data
        }
      }),
    };
  }

  // Return error response
  return {
    statusCode: result.statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(result.body),
  };
};
