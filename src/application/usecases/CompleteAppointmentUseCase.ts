import { AppointmentDomainService } from '@/domain/services/AppointmentDomainService';

export class CompleteAppointmentUseCase {
  constructor(private appointmentDomainService: AppointmentDomainService) {}

  async execute(appointmentId: string): Promise<void> {
    await this.appointmentDomainService.completeAppointment(appointmentId);
  }
}
