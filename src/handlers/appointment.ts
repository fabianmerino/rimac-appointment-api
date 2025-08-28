import { APIGatewayProxyEventV2, APIGatewayProxyResultV2, SQSEvent } from 'aws-lambda';
import { CreateAppointmentUseCase } from '@/application/usecases/CreateAppointmentUseCase';
import { GetAppointmentsByInsuredIdUseCase } from '@/application/usecases/GetAppointmentsByInsuredIdUseCase';
import { CompleteAppointmentUseCase } from '@/application/usecases/CompleteAppointmentUseCase';
import { AppointmentDomainService } from '@/domain/services/AppointmentDomainService';
import { DynamoDBAppointmentRepository } from '@/infrastructure/repositories/DynamoDBAppointmentRepository';
import { AWSMessagingService } from '@/infrastructure/services/AWSMessagingService';
import { MockScheduleService } from '@/infrastructure/services/MockScheduleService';
import { AppointmentRequest } from '@/types';

// Interface for authorizer context
interface AuthorizerContext {
  lambda?: {
    userId: string;
    email: string;
    insuredId: string; // Add insuredId to context
  };
}

// Extended event type that includes authorizer context
interface EventWithAuthorizer extends APIGatewayProxyEventV2 {
  requestContext: APIGatewayProxyEventV2['requestContext'] & {
    authorizer?: AuthorizerContext;
  };
}

// Dependency injection setup
const appointmentRepository = new DynamoDBAppointmentRepository();
const messagingService = new AWSMessagingService();
const scheduleService = new MockScheduleService();

const appointmentDomainService = new AppointmentDomainService(
  appointmentRepository,
  messagingService,
  scheduleService
);

const createAppointmentUseCase = new CreateAppointmentUseCase(appointmentDomainService);
const getAppointmentsByInsuredIdUseCase = new GetAppointmentsByInsuredIdUseCase(
  appointmentDomainService
);
const completeAppointmentUseCase = new CompleteAppointmentUseCase(appointmentDomainService);

export const handler = async (
  event: APIGatewayProxyEventV2 | SQSEvent
): Promise<APIGatewayProxyResultV2 | void> => {
  // Handle SQS events (appointment completion)
  if ('Records' in event && event.Records[0]?.eventSource === 'aws:sqs') {
    return handleSQSEvent(event as SQSEvent);
  }

  // Handle HTTP events
  const httpEvent = event as APIGatewayProxyEventV2;
  const { method: httpMethod, path } = httpEvent.requestContext.http;

  try {
    // POST /appointment - Create new appointment
    if (httpMethod === 'POST' && path === '/appointment') {
      return await createAppointment(httpEvent);
    }

    // GET /appointment/{insuredId} - Get appointments by insured ID
    if (httpMethod === 'GET' && path.startsWith('/appointment/')) {
      return await getAppointmentsByInsuredId(httpEvent);
    }

    return {
      statusCode: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        error: 'Route not found',
      }),
    };
  } catch (error) {
    console.error('Error in appointment handler:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        error: 'Internal server error',
      }),
    };
  }
};

async function createAppointment(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  try {
    // User info is now available from the authorizer context
    // The Lambda Authorizer already validated the JWT and provides user context
    const eventWithAuth = event as EventWithAuthorizer;
    const authContext = eventWithAuth.requestContext.authorizer?.lambda;
    const authenticatedInsuredId = authContext?.insuredId; // Use insuredId instead of userId

    const body = JSON.parse(event.body || '{}') as AppointmentRequest;

    // Verify that the authenticated user matches the insuredId in the request
    if (authenticatedInsuredId && authenticatedInsuredId !== body.insuredId) {
      return {
        statusCode: 403,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          success: false,
          error: 'Forbidden: Cannot create appointment for different user',
        }),
      };
    }

    const result = await createAppointmentUseCase.execute(body);

    return {
      statusCode: result.statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(result.body),
    };
  } catch {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        error: 'Invalid request body',
      }),
    };
  }
}

async function getAppointmentsByInsuredId(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  // User info is now available from the authorizer context
  // The Lambda Authorizer already validated the JWT and provides user context
  const eventWithAuth = event as EventWithAuthorizer;
  const authContext = eventWithAuth.requestContext.authorizer?.lambda;
  const authenticatedInsuredId = authContext?.insuredId; // Use insuredId instead of userId

  const { insuredId } = event.pathParameters || {};

  if (!insuredId) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        error: 'insuredId parameter is required',
      }),
    };
  }

  // Verify that the authenticated user can access the requested insuredId
  if (authenticatedInsuredId && authenticatedInsuredId !== insuredId) {
    return {
      statusCode: 403,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        error: 'Forbidden: Cannot access appointments for different user',
      }),
    };
  }

  const result = await getAppointmentsByInsuredIdUseCase.execute(insuredId);

  return {
    statusCode: result.statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(result.body),
  };
}

async function handleSQSEvent(event: SQSEvent): Promise<void> {
  for (const record of event.Records) {
    try {
      const messageBody = JSON.parse(record.body);

      // Handle EventBridge messages that come through SQS
      if (messageBody.detail && messageBody.detail.appointmentId) {
        await completeAppointmentUseCase.execute(messageBody.detail.appointmentId);
        console.log(`Appointment ${messageBody.detail.appointmentId} marked as completed`);
      }
    } catch (error) {
      console.error('Error processing SQS record:', error);
      // In production, you might want to send this to a DLQ
    }
  }
}
