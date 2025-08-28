import { SQSEvent } from 'aws-lambda';
import { MySQLRDSRepository } from '@/infrastructure/repositories/MySQLRDSRepository';
import { AWSMessagingService } from '@/infrastructure/services/AWSMessagingService';
import { MockScheduleService } from '@/infrastructure/services/MockScheduleService';
import { RDSAppointmentRecord, SQSEventRecord } from '@/types';

const rdsRepository = new MySQLRDSRepository();
const messagingService = new AWSMessagingService();
const scheduleService = new MockScheduleService();

export const handler = async (event: SQSEvent): Promise<void> => {
  console.log('Processing appointments for Peru (PE)');

  for (const record of event.Records) {
    try {
      const messageBody: SQSEventRecord = JSON.parse(record.body);
      console.log('Processing appointment:', messageBody);

      // Get schedule details
      const schedule = await scheduleService.getScheduleById(messageBody.scheduleId);
      if (!schedule) {
        throw new Error(`Schedule ${messageBody.scheduleId} not found`);
      }

      // Create RDS record
      const rdsRecord: RDSAppointmentRecord = {
        id: messageBody.appointmentId,
        insuredId: messageBody.insuredId,
        scheduleId: messageBody.scheduleId,
        centerId: schedule.centerId,
        specialtyId: schedule.specialtyId,
        medicId: schedule.medicId,
        appointmentDate: schedule.date,
        countryISO: messageBody.countryISO,
        status: 'confirmed',
        createdAt: messageBody.timestamp,
        updatedAt: new Date().toISOString(),
      };

      // Save to RDS (MySQL)
      await rdsRepository.saveAppointment(rdsRecord);
      console.log(`Appointment ${messageBody.appointmentId} saved to PE database`);

      // Send completion event to EventBridge
      await messagingService.sendToEventBridge({
        source: 'appointment.service',
        'detail-type': 'Appointment Completed',
        detail: {
          appointmentId: messageBody.appointmentId,
          insuredId: messageBody.insuredId,
          scheduleId: messageBody.scheduleId,
          countryISO: messageBody.countryISO,
          status: 'completed',
          timestamp: new Date().toISOString(),
        },
      });

      console.log(`Completion event sent for appointment ${messageBody.appointmentId}`);
    } catch (error) {
      console.error('Error processing appointment for PE:', error);
      // TODO: In production, implement proper error handling and DLQ
    }
  }

  // Close RDS connection
  await rdsRepository.closeConnection();
};
