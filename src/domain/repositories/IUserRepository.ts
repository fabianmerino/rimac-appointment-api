import { User, CreateUserRequest } from '@/types';

/**
 * User repository interface - Domain layer
 * Defines the contract for user data access
 */
export interface IUserRepository {
  create(userData: CreateUserRequest): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByInsuredId(insuredId: string): Promise<User | null>;
  update(id: string, updates: Partial<User>): Promise<User | null>;
  delete(id: string): Promise<boolean>;
  findAll(): Promise<User[]>;
  authenticate(email: string, password: string): Promise<User | null>;
}
