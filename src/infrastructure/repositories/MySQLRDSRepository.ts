import mysql from 'mysql2/promise';
import { IRDSRepository, RDSAppointmentRecord } from '@/types';

export class MySQLRDSRepository implements IRDSRepository {
  private connection: mysql.Connection | null = null;

  private async getConnection(): Promise<mysql.Connection> {
    if (!this.connection) {
      this.connection = await mysql.createConnection({
        host: process.env.RDS_HOST || 'localhost',
        port: parseInt(process.env.RDS_PORT || '3306'),
        user: process.env.RDS_USERNAME || 'admin',
        password: process.env.RDS_PASSWORD || 'password',
        database: process.env.RDS_DATABASE || 'appointments',
      });
    }
    return this.connection;
  }

  async saveAppointment(appointment: RDSAppointmentRecord): Promise<void> {
    const connection = await this.getConnection();

    const query = `
      INSERT INTO appointments (
        id, insuredId, scheduleId, centerId, specialtyId, medicId,
        appointmentDate, countryISO, status, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        status = VALUES(status),
        updatedAt = VALUES(updatedAt)
    `;

    await connection.execute(query, [
      appointment.id,
      appointment.insuredId,
      appointment.scheduleId,
      appointment.centerId,
      appointment.specialtyId,
      appointment.medicId,
      appointment.appointmentDate,
      appointment.countryISO,
      appointment.status,
      appointment.createdAt,
      appointment.updatedAt,
    ]);
  }

  async findAppointmentsByInsuredId(insuredId: string): Promise<RDSAppointmentRecord[]> {
    const connection = await this.getConnection();

    const query = `
      SELECT * FROM appointments
      WHERE insuredId = ?
      ORDER BY createdAt DESC
    `;

    const [rows] = await connection.execute(query, [insuredId]);
    return rows as RDSAppointmentRecord[];
  }

  async closeConnection(): Promise<void> {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
    }
  }
}
