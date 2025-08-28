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
import { DynamoDBUser, User, CreateUserRequest, UpdateUserRequest } from '@/types';
import { PasswordService } from './password';

const client = new DynamoDBClient({ region: process.env.REGION });
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.USERS_TABLE || 'rimac-backend-serverless-dev';

export class UserService {
  static async createUser(userData: CreateUserRequest): Promise<User> {
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
      password: hashedPassword, // Now properly hashed
      createdAt: now,
      updatedAt: now,
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: user,
      })
    );

    // Retornar sin la contraseña
    const { password: _password, ...userResponse } = user;
    return userResponse;
  }

  static async getUserById(id: string): Promise<User | null> {
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { id },
      })
    );

    if (!result.Item) {
      return null;
    }

    const { password: _password, ...user } = result.Item as DynamoDBUser;
    return user;
  }

  static async getAllUsers(): Promise<User[]> {
    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
      })
    );

    return (result.Items || []).map(item => {
      const { password: _password, ...user } = item as DynamoDBUser;
      return user;
    });
  }

  static async updateUser(id: string, updates: UpdateUserRequest): Promise<User | null> {
    const existingUser = await this.getUserById(id);
    if (!existingUser) {
      return null;
    }

    const now = new Date().toISOString();
    const updateExpression = [];
    const expressionAttributeNames: { [key: string]: string } = {};
    const expressionAttributeValues: Record<string, string> = {};

    if (updates.name) {
      updateExpression.push('#name = :name');
      expressionAttributeNames['#name'] = 'name';
      expressionAttributeValues[':name'] = updates.name;
    }

    if (updates.email) {
      updateExpression.push('#email = :email');
      expressionAttributeNames['#email'] = 'email';
      expressionAttributeValues[':email'] = updates.email;
    }

    updateExpression.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = now;

    await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id },
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
      })
    );

    return this.getUserById(id);
  }

  static async deleteUser(id: string): Promise<boolean> {
    const existingUser = await this.getUserById(id);
    if (!existingUser) {
      return false;
    }

    await docClient.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { id },
      })
    );

    return true;
  }

  static async getUserByEmail(email: string): Promise<DynamoDBUser | null> {
    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: '#email = :email',
        ExpressionAttributeNames: { '#email': 'email' },
        ExpressionAttributeValues: { ':email': email },
      })
    );

    return (result.Items?.[0] as DynamoDBUser) || null;
  }

  static async getUserByInsuredId(insuredId: string): Promise<DynamoDBUser | null> {
    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: '#insuredId = :insuredId',
        ExpressionAttributeNames: { '#insuredId': 'insuredId' },
        ExpressionAttributeValues: { ':insuredId': insuredId },
      })
    );

    return (result.Items?.[0] as DynamoDBUser) || null;
  }

  /**
   * Authenticate user by email and password
   * @param email - User's email
   * @param password - Plain text password
   * @returns Promise<User | null> - User data without password if authentication successful, null otherwise
   */
  static async authenticateUser(email: string, password: string): Promise<User | null> {
    const userWithPassword = await this.getUserByEmail(email);

    if (!userWithPassword) {
      return null;
    }

    const isPasswordValid = await PasswordService.verifyPassword(password, userWithPassword.password);

    if (!isPasswordValid) {
      return null;
    }

    // Return user without password
    const { password: _password, ...user } = userWithPassword;
    return user;
  }

  /**
   * Update user password
   * @param id - User ID
   * @param newPassword - New plain text password
   * @returns Promise<boolean> - True if password updated successfully
   */
  static async updatePassword(id: string, newPassword: string): Promise<boolean> {
    const existingUser = await this.getUserById(id);
    if (!existingUser) {
      return false;
    }

    const hashedPassword = await PasswordService.hashPassword(newPassword);
    const now = new Date().toISOString();

    await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id },
        UpdateExpression: 'SET #password = :password, #updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#password': 'password',
          '#updatedAt': 'updatedAt',
        },
        ExpressionAttributeValues: {
          ':password': hashedPassword,
          ':updatedAt': now,
        },
      })
    );

    return true;
  }
}
