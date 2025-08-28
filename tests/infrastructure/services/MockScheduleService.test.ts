import { MockScheduleService } from '../../../src/infrastructure/services/MockScheduleService';
import { Schedule } from '../../../src/types';

describe('MockScheduleService', () => {
  let mockScheduleService: MockScheduleService;

  beforeEach(() => {
    mockScheduleService = new MockScheduleService();
  });

  describe('constructor', () => {
    it('should initialize with default mock schedules', async () => {
      // Test that it has pre-loaded schedules
      const schedule100 = await mockScheduleService.getScheduleById(100);
      const schedule101 = await mockScheduleService.getScheduleById(101);

      expect(schedule100).toBeDefined();
      expect(schedule100?.scheduleId).toBe(100);
      expect(schedule100?.centerId).toBe(4);
      expect(schedule100?.specialtyId).toBe(3);
      expect(schedule100?.medicId).toBe(4);

      expect(schedule101).toBeDefined();
      expect(schedule101?.scheduleId).toBe(101);
      expect(schedule101?.centerId).toBe(1);
      expect(schedule101?.specialtyId).toBe(2);
      expect(schedule101?.medicId).toBe(3);
    });
  });

  describe('getScheduleById', () => {
    it('should return existing schedule', async () => {
      // Act
      const schedule = await mockScheduleService.getScheduleById(100);

      // Assert
      expect(schedule).toBeDefined();
      expect(schedule?.scheduleId).toBe(100);
      expect(schedule?.date).toBe('2024-09-30T12:30:00Z');
    });

    it('should return null for non-existing schedule', async () => {
      // Act
      const schedule = await mockScheduleService.getScheduleById(999);

      // Assert
      expect(schedule).toBeNull();
    });

    it('should return different schedules for different IDs', async () => {
      // Act
      const schedule100 = await mockScheduleService.getScheduleById(100);
      const schedule101 = await mockScheduleService.getScheduleById(101);

      // Assert
      expect(schedule100?.scheduleId).toBe(100);
      expect(schedule101?.scheduleId).toBe(101);
      expect(schedule100?.centerId).not.toBe(schedule101?.centerId);
    });
  });

  describe('addSchedule', () => {
    it('should add new schedule and make it retrievable', async () => {
      // Arrange
      const newSchedule: Schedule = {
        scheduleId: 500,
        centerId: 5,
        specialtyId: 6,
        medicId: 7,
        date: '2024-12-01T16:00:00Z',
      };

      // Act
      mockScheduleService.addSchedule(newSchedule);
      const retrievedSchedule = await mockScheduleService.getScheduleById(500);

      // Assert
      expect(retrievedSchedule).toBeDefined();
      expect(retrievedSchedule?.scheduleId).toBe(500);
      expect(retrievedSchedule?.centerId).toBe(5);
      expect(retrievedSchedule?.specialtyId).toBe(6);
      expect(retrievedSchedule?.medicId).toBe(7);
      expect(retrievedSchedule?.date).toBe('2024-12-01T16:00:00Z');
    });

    it('should overwrite existing schedule with same ID', async () => {
      // Arrange
      const updatedSchedule: Schedule = {
        scheduleId: 100,
        centerId: 999,
        specialtyId: 888,
        medicId: 777,
        date: '2025-01-01T09:00:00Z',
      };

      // Act
      mockScheduleService.addSchedule(updatedSchedule);
      const retrievedSchedule = await mockScheduleService.getScheduleById(100);

      // Assert
      expect(retrievedSchedule?.centerId).toBe(999);
      expect(retrievedSchedule?.specialtyId).toBe(888);
      expect(retrievedSchedule?.medicId).toBe(777);
      expect(retrievedSchedule?.date).toBe('2025-01-01T09:00:00Z');
    });

    it('should allow adding multiple new schedules', async () => {
      // Arrange
      const schedule1: Schedule = {
        scheduleId: 200,
        centerId: 2,
        specialtyId: 3,
        medicId: 4,
        date: '2024-11-15T10:00:00Z',
      };

      const schedule2: Schedule = {
        scheduleId: 300,
        centerId: 3,
        specialtyId: 4,
        medicId: 5,
        date: '2024-11-16T11:00:00Z',
      };

      // Act
      mockScheduleService.addSchedule(schedule1);
      mockScheduleService.addSchedule(schedule2);

      // Assert
      const retrieved1 = await mockScheduleService.getScheduleById(200);
      const retrieved2 = await mockScheduleService.getScheduleById(300);

      expect(retrieved1).toBeDefined();
      expect(retrieved2).toBeDefined();
      expect(retrieved1?.scheduleId).toBe(200);
      expect(retrieved2?.scheduleId).toBe(300);
    });
  });
});
