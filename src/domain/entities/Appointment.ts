import { ValidationResult, ValidationError } from '@/types';

export class Appointment {
  constructor(
    public readonly id: string,
    public readonly insuredId: string,
    public readonly scheduleId: number,
    public readonly countryISO: string,
    public status: 'pending' | 'completed' | 'failed',
    public readonly createdAt: Date,
    public updatedAt: Date,
    public processingStartedAt?: Date,
    public completedAt?: Date,
    public errorMessage?: string
  ) {}

  static create(
    id: string,
    insuredId: string,
    scheduleId: number,
    countryISO: string
  ): Appointment {
    const now = new Date();
    return new Appointment(id, insuredId, scheduleId, countryISO, 'pending', now, now);
  }

  markAsCompleted(): void {
    this.status = 'completed';
    this.completedAt = new Date();
    this.updatedAt = new Date();
  }

  markAsFailed(errorMessage: string): void {
    this.status = 'failed';
    this.errorMessage = errorMessage;
    this.updatedAt = new Date();
  }

  startProcessing(): void {
    this.processingStartedAt = new Date();
    this.updatedAt = new Date();
  }

  validate(): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate insuredId (5 digits)
    if (!this.insuredId || !/^\d{1,5}$/.test(this.insuredId)) {
      errors.push({
        field: 'insuredId',
        message: 'insuredId must be a valid 5-digit number (can have leading zeros)',
      });
    }

    // Validate scheduleId
    if (!this.scheduleId || this.scheduleId <= 0) {
      errors.push({
        field: 'scheduleId',
        message: 'scheduleId must be a positive number',
      });
    }

    // Validate countryISO
    if (!this.countryISO || !['PE', 'CL'].includes(this.countryISO)) {
      errors.push({
        field: 'countryISO',
        message: 'countryISO must be either "PE" or "CL"',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  toJSON() {
    return {
      id: this.id,
      insuredId: this.insuredId,
      scheduleId: this.scheduleId,
      countryISO: this.countryISO,
      status: this.status,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      processingStartedAt: this.processingStartedAt?.toISOString(),
      completedAt: this.completedAt?.toISOString(),
      errorMessage: this.errorMessage,
    };
  }
}
