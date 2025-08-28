// Domain Types for Medical Appointment System

export interface AppointmentRequest {
  insuredId: string; // 5 digits, can have leading zeros
  scheduleId: number; // identifier for the appointment slot
  countryISO: string; // "PE" or "CL"
}

export interface Schedule {
  scheduleId: number;
  centerId: number;
  specialtyId: number;
  medicId: number;
  date: string; // ISO date string like "2024-09-30T12:30:00Z"
}

export interface AppointmentRecord {
  id: string; // UUID
  insuredId: string;
  scheduleId: number;
  countryISO: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  processingStartedAt?: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface RDSAppointmentRecord {
  id: string;
  insuredId: string;
  scheduleId: number;
  centerId: number;
  specialtyId: number;
  medicId: number;
  appointmentDate: string;
  countryISO: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface SNSMessage {
  appointmentId: string;
  insuredId: string;
  scheduleId: number;
  countryISO: string;
  timestamp: string;
}

export interface SQSEventRecord {
  appointmentId: string;
  insuredId: string;
  scheduleId: number;
  countryISO: string;
  timestamp: string;
}

export interface EventBridgeEvent {
  source: string;
  'detail-type': string;
  detail: {
    appointmentId: string;
    insuredId: string;
    scheduleId: number;
    countryISO: string;
    status: string;
    timestamp: string;
  };
}

export interface ApiResponse<T = unknown> {
  statusCode: number;
  body: {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
  };
}

// Validation interfaces
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Service interfaces for dependency injection (SOLID principles)
export interface IAppointmentRepository {
  create(appointment: AppointmentRecord): Promise<AppointmentRecord>;
  findById(id: string): Promise<AppointmentRecord | null>;
  findByInsuredId(insuredId: string): Promise<AppointmentRecord[]>;
  updateStatus(id: string, status: string, timestamp?: string): Promise<void>;
}

export interface IRDSRepository {
  saveAppointment(appointment: RDSAppointmentRecord): Promise<void>;
  findAppointmentsByInsuredId(insuredId: string): Promise<RDSAppointmentRecord[]>;
}

export interface IMessagingService {
  publishToSNS(message: SNSMessage): Promise<void>;
  sendToEventBridge(event: EventBridgeEvent): Promise<void>;
}

export interface IScheduleService {
  getScheduleById(scheduleId: number): Promise<Schedule | null>;
}

// Auth interfaces
export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    insuredId: string;
  };
}

export interface User {
  id: string;
  insuredId: string;
  email: string;
  name: string;
  countryISO: string;
  createdAt: string;
  updatedAt: string;
}

export interface DynamoDBUser {
  id: string;
  insuredId: string;
  email: string;
  name: string;
  countryISO: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  insuredId: string;
  email: string;
  name: string;
  password: string;
  countryISO: string;
}

export interface UpdateUserRequest {
  email?: string;
  name?: string;
  password?: string;
}

export interface AuthorizerContext {
  userId: string;
  email: string;
  insuredId: string;
}
