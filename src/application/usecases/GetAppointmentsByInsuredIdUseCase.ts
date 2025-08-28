import { AppointmentDomainService } from '@/domain/services/AppointmentDomainService';
import { ApiResponse } from '@/types';
import { Appointment } from '@/domain/entities/Appointment';

export class GetAppointmentsByInsuredIdUseCase {
  constructor(private appointmentDomainService: AppointmentDomainService) {}

  async execute(insuredId: string): Promise<ApiResponse<Appointment[]>> {
    try {
      // Validate insuredId format
      if (!insuredId || !/^\d{1,5}$/.test(insuredId)) {
        return {
          statusCode: 400,
          body: {
            success: false,
            error: 'insuredId must be a valid 5-digit number',
          },
        };
      }

      const paddedInsuredId = insuredId.padStart(5, '0');
      const appointments =
        await this.appointmentDomainService.getAppointmentsByInsuredId(paddedInsuredId);

      return {
        statusCode: 200,
        body: {
          success: true,
          data: appointments,
          message: `Found ${appointments.length} appointments for insured ID ${paddedInsuredId}`,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      return {
        statusCode: 500,
        body: {
          success: false,
          error: errorMessage,
        },
      };
    }
  }
}
