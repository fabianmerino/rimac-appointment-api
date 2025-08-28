import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthResult {
  isAuthenticated: boolean;
  userId?: string;
  email?: string;
  error?: APIGatewayProxyResultV2;
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * Extracts and validates JWT token from Authorization header
 */
export const authenticateRequest = (event: APIGatewayProxyEventV2): AuthResult => {
  try {
    // Get Authorization header
    const authHeader = event.headers?.authorization || event.headers?.Authorization;

    if (!authHeader) {
      return {
        isAuthenticated: false,
        error: {
          statusCode: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({
            success: false,
            error: 'Authorization header is required',
          }),
        },
      };
    }

    // Check if it's Bearer token
    if (!authHeader.startsWith('Bearer ')) {
      return {
        isAuthenticated: false,
        error: {
          statusCode: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({
            success: false,
            error: 'Authorization header must be Bearer token',
          }),
        },
      };
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return {
        isAuthenticated: false,
        error: {
          statusCode: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({
            success: false,
            error: 'Token is required',
          }),
        },
      };
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    return {
      isAuthenticated: true,
      userId: decoded.userId,
      email: decoded.email,
    };
  } catch (error) {
    let errorMessage = 'Invalid token';

    if (error instanceof jwt.TokenExpiredError) {
      errorMessage = 'Token has expired';
    } else if (error instanceof jwt.JsonWebTokenError) {
      errorMessage = 'Invalid token format';
    }

    return {
      isAuthenticated: false,
      error: {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          success: false,
          error: errorMessage,
        }),
      },
    };
  }
};

/**
 * Validates that the authenticated user can access the requested resource
 */
export const authorizeInsuredAccess = (
  authenticatedUserId: string,
  requestedInsuredId: string
): boolean => {
  // For now, we assume userId === insuredId
  // In a real system, you might have a more complex relationship
  return authenticatedUserId === requestedInsuredId;
};
