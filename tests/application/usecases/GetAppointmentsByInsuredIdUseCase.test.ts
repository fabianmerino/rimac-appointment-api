import { GetAppointmentsByInsuredIdUseCase } from '../../../src/application/usecases/GetAppointmentsByInsuredIdUseCase';
import { AppointmentDomainService } from '../../../src/domain/services/AppointmentDomainService';
import { Appointment } from '../../../src/domain/entities/Appointment';

describe('GetAppointmentsByInsuredIdUseCase', () => {
  let useCase: GetAppointmentsByInsuredIdUseCase;
  let mockAppointmentDomainService: jest.Mocked<AppointmentDomainService>;

  beforeEach(() => {
    // Create a partial mock focusing on the public methods we're testing
    mockAppointmentDomainService = {
      getAppointmentsByInsuredId: jest.fn(),
      createAppointment: jest.fn(),
      completeAppointment: jest.fn(),
    } as any;

    useCase = new GetAppointmentsByInsuredIdUseCase(mockAppointmentDomainService);
  });

  describe('execute', () => {
    const mockAppointments = [
      new Appointment(
        'appt-1',
        '12345',
        100,
        'PE',
        'pending',
        new Date('2024-01-01T00:00:00Z'),
        new Date('2024-01-01T00:00:00Z')
      ),
      new Appointment(
        'appt-2',
        '12345',
        101,
        'PE',
        'completed',
        new Date('2024-01-02T00:00:00Z'),
        new Date('2024-01-02T00:00:00Z'),
        new Date('2024-01-02T10:00:00Z'),
        new Date('2024-01-02T11:00:00Z')
      )
    ];

    it('should return appointments successfully for valid insuredId', async () => {
      // Arrange
      mockAppointmentDomainService.getAppointmentsByInsuredId.mockResolvedValue(mockAppointments);

      // Act
      const result = await useCase.execute('12345');

      // Assert
      expect(result.statusCode).toBe(200);
      expect(result.body.success).toBe(true);
      expect(result.body.data).toEqual(mockAppointments);
      expect(result.body.message).toBe('Found 2 appointments for insured ID 12345');
      expect(mockAppointmentDomainService.getAppointmentsByInsuredId).toHaveBeenCalledWith('12345');
    });

    it('should pad insuredId with leading zeros', async () => {
      // Arrange
      mockAppointmentDomainService.getAppointmentsByInsuredId.mockResolvedValue([]);

      // Act
      const result = await useCase.execute('123');

      // Assert
      expect(result.statusCode).toBe(200);
      expect(result.body.success).toBe(true);
      expect(result.body.message).toBe('Found 0 appointments for insured ID 00123');
      expect(mockAppointmentDomainService.getAppointmentsByInsuredId).toHaveBeenCalledWith('00123');
    });

    it('should return empty array when no appointments found', async () => {
      // Arrange
      mockAppointmentDomainService.getAppointmentsByInsuredId.mockResolvedValue([]);

      // Act
      const result = await useCase.execute('99999');

      // Assert
      expect(result.statusCode).toBe(200);
      expect(result.body.success).toBe(true);
      expect(result.body.data).toEqual([]);
      expect(result.body.message).toBe('Found 0 appointments for insured ID 99999');
    });

    it('should fail with invalid insuredId format - empty string', async () => {
      // Act
      const result = await useCase.execute('');

      // Assert
      expect(result.statusCode).toBe(400);
      expect(result.body.success).toBe(false);
      expect(result.body.error).toBe('insuredId must be a valid 5-digit number');
      expect(mockAppointmentDomainService.getAppointmentsByInsuredId).not.toHaveBeenCalled();
    });

    it('should fail with invalid insuredId format - non-numeric', async () => {
      // Act
      const result = await useCase.execute('abc12');

      // Assert
      expect(result.statusCode).toBe(400);
      expect(result.body.success).toBe(false);
      expect(result.body.error).toBe('insuredId must be a valid 5-digit number');
      expect(mockAppointmentDomainService.getAppointmentsByInsuredId).not.toHaveBeenCalled();
    });

    it('should fail with invalid insuredId format - too long', async () => {
      // Act
      const result = await useCase.execute('123456');

      // Assert
      expect(result.statusCode).toBe(400);
      expect(result.body.success).toBe(false);
      expect(result.body.error).toBe('insuredId must be a valid 5-digit number');
      expect(mockAppointmentDomainService.getAppointmentsByInsuredId).not.toHaveBeenCalled();
    });

    it('should handle domain service errors gracefully', async () => {
      // Arrange
      mockAppointmentDomainService.getAppointmentsByInsuredId.mockRejectedValue(
        new Error('Database connection failed')
      );

      // Act
      const result = await useCase.execute('12345');

      // Assert
      expect(result.statusCode).toBe(500);
      expect(result.body.success).toBe(false);
      expect(result.body.error).toBe('Database connection failed');
    });

    it('should handle unknown errors gracefully', async () => {
      // Arrange
      mockAppointmentDomainService.getAppointmentsByInsuredId.mockRejectedValue('Unknown error');

      // Act
      const result = await useCase.execute('12345');

      // Assert
      expect(result.statusCode).toBe(500);
      expect(result.body.success).toBe(false);
      expect(result.body.error).toBe('Unknown error occurred');
    });
  });
});
