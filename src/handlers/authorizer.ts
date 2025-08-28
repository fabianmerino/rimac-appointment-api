import {
  APIGatewayRequestAuthorizerEventV2,
  APIGatewayAuthorizerResult,
  Context
} from 'aws-lambda';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JWTPayload {
  userId: string;
  email: string;
  insuredId: string; // Add insuredId to JWT payload
  iat?: number;
  exp?: number;
}

interface AuthorizerContext {
  [key: string]: string | number | boolean;
  userId: string;
  email: string;
  insuredId: string; // Add insuredId to authorizer context
}

/**
 * Lambda Authorizer for HTTP API
 * This function is called by AWS HTTP API before any protected route
 */
export const handler = async (
  event: APIGatewayRequestAuthorizerEventV2,
  _context: Context
): Promise<APIGatewayAuthorizerResult> => {
  console.log('Authorizer event:', JSON.stringify(event, null, 2));

  try {
    // Extract token from Authorization header
    const token = extractTokenFromEvent(event);

    if (!token) {
      console.log('No token provided');
      return generatePolicy('user', 'Deny', event.routeArn);
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    console.log('Token verified for user:', decoded.userId);

    // Generate allow policy with user context (including insuredId)
    return generatePolicy(decoded.userId, 'Allow', event.routeArn, {
      userId: decoded.userId,
      email: decoded.email,
      insuredId: decoded.insuredId, // Include insuredId in context
    });

  } catch (error) {
    console.error('Authorization failed:', error);

    // Handle specific JWT errors
    if (error instanceof jwt.TokenExpiredError) {
      console.log('Token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.log('Invalid token');
    }

    return generatePolicy('user', 'Deny', event.routeArn);
  }
};

/**
 * Extracts JWT token from the Authorization header
 */
function extractTokenFromEvent(event: APIGatewayRequestAuthorizerEventV2): string | null {
  const authHeader = event.headers?.authorization || event.headers?.Authorization;

  if (!authHeader) {
    return null;
  }

  // Check if it's Bearer token
  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }

  // Extract token (remove 'Bearer ' prefix)
  return authHeader.substring(7);
}

/**
 * Generates IAM policy for API Gateway
 */
function generatePolicy(
  principalId: string,
  effect: 'Allow' | 'Deny',
  resource: string,
  context?: AuthorizerContext
): APIGatewayAuthorizerResult {
  const authResponse: APIGatewayAuthorizerResult = {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  };

  // Add user context that will be available in the lambda
  if (context && effect === 'Allow') {
    authResponse.context = context;
  }

  return authResponse;
}