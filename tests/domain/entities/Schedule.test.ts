import { Schedule } from '../../../src/domain/entities/Schedule';

describe('Schedule', () => {
  const validScheduleData = {
    scheduleId: 1,
    centerId: 101,
    specialtyId: 201,
    medicId: 301,
    date: new Date('2024-12-31T10:00:00Z')
  };

  describe('constructor', () => {
    it('should create a schedule with valid data', () => {
      const schedule = new Schedule(
        validScheduleData.scheduleId,
        validScheduleData.centerId,
        validScheduleData.specialtyId,
        validScheduleData.medicId,
        validScheduleData.date
      );

      expect(schedule.scheduleId).toBe(validScheduleData.scheduleId);
      expect(schedule.centerId).toBe(validScheduleData.centerId);
      expect(schedule.specialtyId).toBe(validScheduleData.specialtyId);
      expect(schedule.medicId).toBe(validScheduleData.medicId);
      expect(schedule.date).toBe(validScheduleData.date);
    });
  });

  describe('isValid', () => {
    it('should validate a correct schedule with future date', () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
      const schedule = new Schedule(
        validScheduleData.scheduleId,
        validScheduleData.centerId,
        validScheduleData.specialtyId,
        validScheduleData.medicId,
        futureDate
      );

      expect(schedule.isValid()).toBe(true);
    });

    it('should reject schedule with past date', () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday
      const schedule = new Schedule(
        validScheduleData.scheduleId,
        validScheduleData.centerId,
        validScheduleData.specialtyId,
        validScheduleData.medicId,
        pastDate
      );

      expect(schedule.isValid()).toBe(false);
    });

    it('should reject schedule with zero scheduleId', () => {
      const schedule = new Schedule(
        0,
        validScheduleData.centerId,
        validScheduleData.specialtyId,
        validScheduleData.medicId,
        validScheduleData.date
      );

      expect(schedule.isValid()).toBe(false);
    });

    it('should reject schedule with negative centerId', () => {
      const schedule = new Schedule(
        validScheduleData.scheduleId,
        -1,
        validScheduleData.specialtyId,
        validScheduleData.medicId,
        validScheduleData.date
      );

      expect(schedule.isValid()).toBe(false);
    });

    it('should reject schedule with zero specialtyId', () => {
      const schedule = new Schedule(
        validScheduleData.scheduleId,
        validScheduleData.centerId,
        0,
        validScheduleData.medicId,
        validScheduleData.date
      );

      expect(schedule.isValid()).toBe(false);
    });

    it('should reject schedule with negative medicId', () => {
      const schedule = new Schedule(
        validScheduleData.scheduleId,
        validScheduleData.centerId,
        validScheduleData.specialtyId,
        -1,
        validScheduleData.date
      );

      expect(schedule.isValid()).toBe(false);
    });
  });

  describe('toJSON', () => {
    it('should serialize schedule to JSON correctly', () => {
      const schedule = new Schedule(
        validScheduleData.scheduleId,
        validScheduleData.centerId,
        validScheduleData.specialtyId,
        validScheduleData.medicId,
        validScheduleData.date
      );

      const json = schedule.toJSON();

      expect(json.scheduleId).toBe(validScheduleData.scheduleId);
      expect(json.centerId).toBe(validScheduleData.centerId);
      expect(json.specialtyId).toBe(validScheduleData.specialtyId);
      expect(json.medicId).toBe(validScheduleData.medicId);
      expect(json.date).toBe(validScheduleData.date.toISOString());
    });

    it('should serialize with valid ISO string format for date', () => {
      const testDate = new Date('2024-06-15T14:30:00Z');
      const schedule = new Schedule(1, 2, 3, 4, testDate);

      const json = schedule.toJSON();

      expect(json.date).toBe('2024-06-15T14:30:00.000Z');
      expect(typeof json.date).toBe('string');
    });
  });
});
