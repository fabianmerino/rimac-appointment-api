import { CreateAppointmentUseCase } from '../../../src/application/usecases/CreateAppointmentUseCase';
import { AppointmentDomainService } from '../../../src/domain/services/AppointmentDomainService';
import { IAppointmentRepository, IMessagingService, IScheduleService } from '../../../src/types';

// Mock implementations
const mockAppointmentRepository: jest.Mocked<IAppointmentRepository> = {
  create: jest.fn(),
  findById: jest.fn(),
  findByInsuredId: jest.fn(),
  updateStatus: jest.fn(),
};

const mockMessagingService: jest.Mocked<IMessagingService> = {
  publishToSNS: jest.fn(),
  sendToEventBridge: jest.fn(),
};

const mockScheduleService: jest.Mocked<IScheduleService> = {
  getScheduleById: jest.fn(),
};

describe('CreateAppointmentUseCase', () => {
  let useCase: CreateAppointmentUseCase;
  let domainService: AppointmentDomainService;

  beforeEach(() => {
    jest.clearAllMocks();

    domainService = new AppointmentDomainService(
      mockAppointmentRepository,
      mockMessagingService,
      mockScheduleService
    );

    useCase = new CreateAppointmentUseCase(domainService);
  });

  describe('execute', () => {
    const validRequest = {
      insuredId: '12345',
      scheduleId: 100,
      countryISO: 'PE'
    };

    it('should create appointment successfully', async () => {
      // Arrange
      const mockSchedule = {
        scheduleId: 100,
        centerId: 4,
        specialtyId: 3,
        medicId: 4,
        date: "2024-09-30T12:30:00Z"
      };

      const mockAppointment = {
        id: 'mock-id',
        insuredId: '12345',
        scheduleId: 100,
        countryISO: 'PE',
        status: 'pending' as const,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };

      mockScheduleService.getScheduleById.mockResolvedValue(mockSchedule);
      mockAppointmentRepository.create.mockResolvedValue(mockAppointment);

      // Act
      const result = await useCase.execute(validRequest);

      // Assert
      expect(result.statusCode).toBe(201);
      expect(result.body.success).toBe(true);
      expect(result.body.message).toContain('Processing in progress');
      expect(mockScheduleService.getScheduleById).toHaveBeenCalledWith(100);
      expect(mockAppointmentRepository.create).toHaveBeenCalled();
      expect(mockMessagingService.publishToSNS).toHaveBeenCalled();
    });

    it('should return error for invalid schedule', async () => {
      // Arrange
      mockScheduleService.getScheduleById.mockResolvedValue(null);

      // Act
      const result = await useCase.execute(validRequest);

      // Assert
      expect(result.statusCode).toBe(400);
      expect(result.body.success).toBe(false);
      expect(result.body.error).toContain('Schedule with ID 100 not found');
    });

    it('should return error for invalid country ISO', async () => {
      // Arrange
      const invalidRequest = {
        ...validRequest,
        countryISO: 'INVALID'
      };

      // Act
      const result = await useCase.execute(invalidRequest);

      // Assert
      expect(result.statusCode).toBe(400);
      expect(result.body.success).toBe(false);
      expect(result.body.error).toContain('countryISO must be either "PE" or "CL"');
    });

    it('should pad insuredId with leading zeros', async () => {
      // Arrange
      const requestWithShortId = {
        ...validRequest,
        insuredId: '123'
      };

      const mockSchedule = {
        scheduleId: 100,
        centerId: 4,
        specialtyId: 3,
        medicId: 4,
        date: "2024-09-30T12:30:00Z"
      };

      mockScheduleService.getScheduleById.mockResolvedValue(mockSchedule);
      mockAppointmentRepository.create.mockResolvedValue({
        id: 'mock-id',
        insuredId: '00123',
        scheduleId: 100,
        countryISO: 'PE',
        status: 'pending' as const,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      });

      // Act
      await useCase.execute(requestWithShortId);

      // Assert
      expect(mockAppointmentRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          insuredId: '00123'
        })
      );
    });
  });
});
