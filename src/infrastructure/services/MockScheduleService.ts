import { IScheduleService, Schedule } from '@/types';

export class MockScheduleService implements IScheduleService {
  private schedules: Map<number, Schedule> = new Map();

  constructor() {
    // Mock data for demonstration
    this.schedules.set(100, {
      scheduleId: 100,
      centerId: 4,
      specialtyId: 3,
      medicId: 4,
      date: '2024-09-30T12:30:00Z',
    });

    this.schedules.set(101, {
      scheduleId: 101,
      centerId: 1,
      specialtyId: 2,
      medicId: 3,
      date: '2024-10-01T14:00:00Z',
    });
  }

  async getScheduleById(scheduleId: number): Promise<Schedule | null> {
    return this.schedules.get(scheduleId) || null;
  }

  // Method to add more schedules for testing
  addSchedule(schedule: Schedule): void {
    this.schedules.set(schedule.scheduleId, schedule);
  }
}
