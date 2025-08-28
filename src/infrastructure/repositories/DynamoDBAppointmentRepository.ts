import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { IAppointmentRepository, AppointmentRecord } from '@/types';

export class DynamoDBAppointmentRepository implements IAppointmentRepository {
  private docClient: DynamoDBDocumentClient;
  private tableName: string;

  constructor() {
    const client = new DynamoDBClient({ region: process.env.REGION });
    this.docClient = DynamoDBDocumentClient.from(client);
    this.tableName = process.env.APPOINTMENTS_TABLE || 'rimac-appointment-backend-appointments-dev';
  }

  async create(appointment: AppointmentRecord): Promise<AppointmentRecord> {
    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: appointment,
      })
    );

    return appointment;
  }

  async findById(id: string): Promise<AppointmentRecord | null> {
    const result = await this.docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { id },
      })
    );

    return (result.Item as AppointmentRecord) || null;
  }

  async findByInsuredId(insuredId: string): Promise<AppointmentRecord[]> {
    const result = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: 'InsuredIdIndex',
        KeyConditionExpression: 'insuredId = :insuredId',
        ExpressionAttributeValues: {
          ':insuredId': insuredId,
        },
        ScanIndexForward: false, // Sort by createdAt descending
      })
    );

    return (result.Items || []) as AppointmentRecord[];
  }

  async updateStatus(id: string, status: string, timestamp?: string): Promise<void> {
    const updateExpression = ['#status = :status', '#updatedAt = :updatedAt'];
    const expressionAttributeNames: { [key: string]: string } = {
      '#status': 'status',
      '#updatedAt': 'updatedAt',
    };
    const expressionAttributeValues: { [key: string]: unknown } = {
      ':status': status,
      ':updatedAt': timestamp || new Date().toISOString(),
    };

    if (status === 'completed' && timestamp) {
      updateExpression.push('#completedAt = :completedAt');
      expressionAttributeNames['#completedAt'] = 'completedAt';
      expressionAttributeValues[':completedAt'] = timestamp;
    }

    await this.docClient.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { id },
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
      })
    );
  }
}
