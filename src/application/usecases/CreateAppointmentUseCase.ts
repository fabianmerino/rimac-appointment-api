import { AppointmentDomainService } from '@/domain/services/AppointmentDomainService';
import { AppointmentRequest, ApiResponse } from '@/types';
import { Appointment } from '@/domain/entities/Appointment';

export class CreateAppointmentUseCase {
  constructor(private appointmentDomainService: AppointmentDomainService) {}

  async execute(request: AppointmentRequest): Promise<ApiResponse<Appointment>> {
    try {
      const appointment = await this.appointmentDomainService.createAppointment(
        request.insuredId.padStart(5, '0'), // Ensure 5 digits with leading zeros
        request.scheduleId,
        request.countryISO
      );

      return {
        statusCode: 201,
        body: {
          success: true,
          data: appointment,
          message: 'Appointment request created successfully. Processing in progress.',
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      return {
        statusCode: 400,
        body: {
          success: false,
          error: errorMessage,
        },
      };
    }
  }
}
