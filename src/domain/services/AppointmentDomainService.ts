import { v4 as uuidv4 } from 'uuid';
import { Appointment } from '@/domain/entities/Appointment';
import type { IAppointmentRepository, IMessagingService, IScheduleService } from '@/types';

export class AppointmentDomainService {
  constructor(
    private appointmentRepository: IAppointmentRepository,
    private messagingService: IMessagingService,
    private scheduleService: IScheduleService
  ) {}

  async createAppointment(
    insuredId: string,
    scheduleId: number,
    countryISO: string
  ): Promise<Appointment> {
    // Generate UUID for appointment
    const appointmentId = uuidv4();

    // Create appointment entity
    const appointment = Appointment.create(appointmentId, insuredId, scheduleId, countryISO);

    // Validate appointment
    const validation = appointment.validate();
    if (!validation.isValid) {
      throw new Error(`Invalid appointment: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // Verify schedule exists (business rule)
    const schedule = await this.scheduleService.getScheduleById(scheduleId);
    if (!schedule) {
      throw new Error(`Schedule with ID ${scheduleId} not found`);
    }

    // Save to repository
    const savedAppointment = await this.appointmentRepository.create({
      id: appointment.id,
      insuredId: appointment.insuredId,
      scheduleId: appointment.scheduleId,
      countryISO: appointment.countryISO,
      status: appointment.status,
      createdAt: appointment.createdAt.toISOString(),
      updatedAt: appointment.updatedAt.toISOString(),
    });

    // Publish to SNS for country-specific processing
    await this.messagingService.publishToSNS({
      appointmentId: savedAppointment.id,
      insuredId: savedAppointment.insuredId,
      scheduleId: savedAppointment.scheduleId,
      countryISO: savedAppointment.countryISO,
      timestamp: savedAppointment.createdAt,
    });

    return appointment;
  }

  async completeAppointment(appointmentId: string): Promise<void> {
    const appointmentRecord = await this.appointmentRepository.findById(appointmentId);
    if (!appointmentRecord) {
      throw new Error(`Appointment with ID ${appointmentId} not found`);
    }

    // Update status to completed
    await this.appointmentRepository.updateStatus(
      appointmentId,
      'completed',
      new Date().toISOString()
    );
  }

  async getAppointmentsByInsuredId(insuredId: string): Promise<Appointment[]> {
    const records = await this.appointmentRepository.findByInsuredId(insuredId);

    return records.map(
      record =>
        new Appointment(
          record.id,
          record.insuredId,
          record.scheduleId,
          record.countryISO,
          record.status as 'pending' | 'completed' | 'failed',
          new Date(record.createdAt),
          new Date(record.updatedAt),
          record.processingStartedAt ? new Date(record.processingStartedAt) : undefined,
          record.completedAt ? new Date(record.completedAt) : undefined,
          record.errorMessage
        )
    );
  }
}
