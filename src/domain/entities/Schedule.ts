export class Schedule {
  constructor(
    public readonly scheduleId: number,
    public readonly centerId: number,
    public readonly specialtyId: number,
    public readonly medicId: number,
    public readonly date: Date
  ) {}

  isValid(): boolean {
    return (
      this.scheduleId > 0 &&
      this.centerId > 0 &&
      this.specialtyId > 0 &&
      this.medicId > 0 &&
      this.date > new Date()
    );
  }

  toJSON() {
    return {
      scheduleId: this.scheduleId,
      centerId: this.centerId,
      specialtyId: this.specialtyId,
      medicId: this.medicId,
      date: this.date.toISOString(),
    };
  }
}
