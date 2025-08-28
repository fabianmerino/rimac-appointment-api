import { CompleteAppointmentUseCase } from '../../../src/application/usecases/CompleteAppointmentUseCase';
import { AppointmentDomainService } from '../../../src/domain/services/AppointmentDomainService';

describe('CompleteAppointmentUseCase', () => {
  let useCase: CompleteAppointmentUseCase;
  let mockAppointmentDomainService: jest.Mocked<AppointmentDomainService>;

  beforeEach(() => {
    mockAppointmentDomainService = {
      completeAppointment: jest.fn(),
      createAppointment: jest.fn(),
      getAppointmentsByInsuredId: jest.fn(),
    } as any;

    useCase = new CompleteAppointmentUseCase(mockAppointmentDomainService);
  });

  describe('execute', () => {
    it('should complete appointment successfully', async () => {
      // Arrange
      const appointmentId = 'appt-123';
      mockAppointmentDomainService.completeAppointment.mockResolvedValue(undefined);

      // Act
      await useCase.execute(appointmentId);

      // Assert
      expect(mockAppointmentDomainService.completeAppointment).toHaveBeenCalledWith(appointmentId);
      expect(mockAppointmentDomainService.completeAppointment).toHaveBeenCalledTimes(1);
    });

    it('should handle domain service errors', async () => {
      // Arrange
      const appointmentId = 'appt-123';
      const errorMessage = 'Appointment not found';
      mockAppointmentDomainService.completeAppointment.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(useCase.execute(appointmentId)).rejects.toThrow(errorMessage);
      expect(mockAppointmentDomainService.completeAppointment).toHaveBeenCalledWith(appointmentId);
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      const appointmentId = 'appt-123';
      mockAppointmentDomainService.completeAppointment.mockRejectedValue(new Error('Database connection failed'));

      // Act & Assert
      await expect(useCase.execute(appointmentId)).rejects.toThrow('Database connection failed');
    });

    it('should handle empty appointment ID', async () => {
      // Arrange
      const appointmentId = '';
      mockAppointmentDomainService.completeAppointment.mockRejectedValue(new Error('Invalid appointment ID'));

      // Act & Assert
      await expect(useCase.execute(appointmentId)).rejects.toThrow('Invalid appointment ID');
    });
  });
});
