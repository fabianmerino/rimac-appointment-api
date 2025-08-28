import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import type { IMessagingService, SNSMessage, EventBridgeEvent } from '@/types';

export class AWSMessagingService implements IMessagingService {
  private snsClient: SNSClient;
  private eventBridgeClient: EventBridgeClient;
  private snsTopicArn: string;
  private eventBusName: string;

  constructor() {
    this.snsClient = new SNSClient({ region: process.env.REGION });
    this.eventBridgeClient = new EventBridgeClient({ region: process.env.REGION });
    this.snsTopicArn = process.env.SNS_TOPIC_ARN || '';
    this.eventBusName = process.env.EVENT_BUS_NAME || '';
  }

  async publishToSNS(message: SNSMessage): Promise<void> {
    const command = new PublishCommand({
      TopicArn: this.snsTopicArn,
      Message: JSON.stringify(message),
      MessageAttributes: {
        countryISO: {
          DataType: 'String',
          StringValue: message.countryISO,
        },
      },
    });

    await this.snsClient.send(command);
  }

  async sendToEventBridge(event: EventBridgeEvent): Promise<void> {
    const command = new PutEventsCommand({
      Entries: [
        {
          Source: event.source,
          DetailType: event['detail-type'],
          Detail: JSON.stringify(event.detail),
          EventBusName: this.eventBusName,
        },
      ],
    });

    await this.eventBridgeClient.send(command);
  }
}
