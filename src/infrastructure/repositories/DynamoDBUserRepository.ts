import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { DynamoDBUser, User, CreateUserRequest } from '@/types';
import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { PasswordService } from '@/utils/password';

/**
 * DynamoDB implementation of user repository - Infrastructure layer
 */
export class DynamoDBUserRepository implements IUserRepository {
  private docClient: DynamoDBDocumentClient;
  private tableName: string;

  constructor() {
    const client = new DynamoDBClient({ region: process.env.REGION });
    this.docClient = DynamoDBDocumentClient.from(client);
    this.tableName = process.env.USERS_TABLE || 'rimac-backend-serverless-dev';
  }

  async create(userData: CreateUserRequest): Promise<User> {
    const id = uuidv4();
    const now = new Date().toISOString();

    // Hash the password before storing
    const hashedPassword = await PasswordService.hashPassword(userData.password);

    const user: DynamoDBUser = {
      id,
      insuredId: userData.insuredId,
      email: userData.email,
      name: userData.name,
      countryISO: userData.countryISO,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    };

    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: user,
      })
    );

    // Return without password
    const { password: _password, ...userResponse } = user;
    return userResponse;
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { id },
      })
    );

    if (!result.Item) {
      return null;
    }

    const { password: _password, ...user } = result.Item as DynamoDBUser;
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.docClient.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: 'email = :email',
        ExpressionAttributeValues: {
          ':email': email,
        },
      })
    );

    if (!result.Items || result.Items.length === 0) {
      return null;
    }

    const { password: _password, ...user } = result.Items[0] as DynamoDBUser;
    return user;
  }

  async findByInsuredId(insuredId: string): Promise<User | null> {
    const result = await this.docClient.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: 'insuredId = :insuredId',
        ExpressionAttributeValues: {
          ':insuredId': insuredId,
        },
      })
    );

    if (!result.Items || result.Items.length === 0) {
      return null;
    }

    const { password: _password, ...user } = result.Items[0] as DynamoDBUser;
    return user;
  }

  async update(id: string, updates: Partial<User>): Promise<User | null> {
    const existingUser = await this.findById(id);
    if (!existingUser) {
      return null;
    }

    const updateExpressions: string[] = [];
    const expressionAttributeValues: Record<string, unknown> = {};
    const expressionAttributeNames: Record<string, string> = {};

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        updateExpressions.push(`#${key} = :${key}`);
        expressionAttributeValues[`:${key}`] = value;
        expressionAttributeNames[`#${key}`] = key;
      }
    });

    if (updateExpressions.length === 0) {
      return existingUser;
    }

    // Always update the updatedAt timestamp
    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();
    expressionAttributeNames['#updatedAt'] = 'updatedAt';

    await this.docClient.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { id },
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeValues: expressionAttributeValues,
        ExpressionAttributeNames: expressionAttributeNames,
      })
    );

    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.docClient.send(
        new DeleteCommand({
          TableName: this.tableName,
          Key: { id },
        })
      );
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  async findAll(): Promise<User[]> {
    const result = await this.docClient.send(
      new ScanCommand({
        TableName: this.tableName,
      })
    );

    return (result.Items || []).map(item => {
      const { password: _password, ...user } = item as DynamoDBUser;
      return user;
    });
  }

  async authenticate(email: string, password: string): Promise<User | null> {
    // Get user with password for authentication
    const result = await this.docClient.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: 'email = :email',
        ExpressionAttributeValues: {
          ':email': email,
        },
      })
    );

    if (!result.Items || result.Items.length === 0) {
      return null;
    }

    const userWithPassword = result.Items[0] as DynamoDBUser;

    // Verify password
    const isPasswordValid = await PasswordService.verifyPassword(password, userWithPassword.password);

    if (!isPasswordValid) {
      return null;
    }

    // Return user without password
    const { password: _password, ...user } = userWithPassword;
    return user;
  }
}
