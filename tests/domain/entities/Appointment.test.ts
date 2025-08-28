import { Appointment } from '../../../src/domain/entities/Appointment';

describe('Appointment Entity', () => {
  const validAppointmentData = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    insuredId: '12345',
    scheduleId: 100,
    countryISO: 'PE'
  };

  describe('create', () => {
    it('should create a valid appointment with pending status', () => {
      const appointment = Appointment.create(
        validAppointmentData.id,
        validAppointmentData.insuredId,
        validAppointmentData.scheduleId,
        validAppointmentData.countryISO
      );

      expect(appointment.id).toBe(validAppointmentData.id);
      expect(appointment.insuredId).toBe(validAppointmentData.insuredId);
      expect(appointment.scheduleId).toBe(validAppointmentData.scheduleId);
      expect(appointment.countryISO).toBe(validAppointmentData.countryISO);
      expect(appointment.status).toBe('pending');
      expect(appointment.createdAt).toBeInstanceOf(Date);
      expect(appointment.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('validate', () => {
    it('should validate a correct appointment', () => {
      const appointment = Appointment.create(
        validAppointmentData.id,
        validAppointmentData.insuredId,
        validAppointmentData.scheduleId,
        validAppointmentData.countryISO
      );

      const validation = appointment.validate();
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject invalid insuredId', () => {
      const appointment = Appointment.create(
        validAppointmentData.id,
        'invalid',
        validAppointmentData.scheduleId,
        validAppointmentData.countryISO
      );

      const validation = appointment.validate();
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toHaveLength(1);
      expect(validation.errors[0].field).toBe('insuredId');
    });

    it('should reject invalid countryISO', () => {
      const appointment = Appointment.create(
        validAppointmentData.id,
        validAppointmentData.insuredId,
        validAppointmentData.scheduleId,
        'INVALID'
      );

      const validation = appointment.validate();
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toHaveLength(1);
      expect(validation.errors[0].field).toBe('countryISO');
    });

    it('should reject invalid scheduleId', () => {
      const appointment = Appointment.create(
        validAppointmentData.id,
        validAppointmentData.insuredId,
        -1,
        validAppointmentData.countryISO
      );

      const validation = appointment.validate();
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toHaveLength(1);
      expect(validation.errors[0].field).toBe('scheduleId');
    });
  });

  describe('status changes', () => {
    let appointment: Appointment;

    beforeEach(() => {
      appointment = Appointment.create(
        validAppointmentData.id,
        validAppointmentData.insuredId,
        validAppointmentData.scheduleId,
        validAppointmentData.countryISO
      );
    });

    it('should mark appointment as completed', () => {
      appointment.markAsCompleted();

      expect(appointment.status).toBe('completed');
      expect(appointment.completedAt).toBeInstanceOf(Date);
      expect(appointment.updatedAt).toBeInstanceOf(Date);
    });

    it('should mark appointment as failed with error message', () => {
      const errorMessage = 'Schedule no longer available';
      appointment.markAsFailed(errorMessage);

      expect(appointment.status).toBe('failed');
      expect(appointment.errorMessage).toBe(errorMessage);
      expect(appointment.updatedAt).toBeInstanceOf(Date);
    });

    it('should start processing', () => {
      appointment.startProcessing();

      expect(appointment.processingStartedAt).toBeInstanceOf(Date);
      expect(appointment.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('toJSON', () => {
    it('should serialize appointment to JSON correctly', () => {
      const appointment = Appointment.create(
        validAppointmentData.id,
        validAppointmentData.insuredId,
        validAppointmentData.scheduleId,
        validAppointmentData.countryISO
      );

      const json = appointment.toJSON();

      expect(json.id).toBe(validAppointmentData.id);
      expect(json.insuredId).toBe(validAppointmentData.insuredId);
      expect(json.scheduleId).toBe(validAppointmentData.scheduleId);
      expect(json.countryISO).toBe(validAppointmentData.countryISO);
      expect(json.status).toBe('pending');
      expect(typeof json.createdAt).toBe('string');
      expect(typeof json.updatedAt).toBe('string');
    });
  });
});
