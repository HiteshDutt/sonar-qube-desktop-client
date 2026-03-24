import {
  ServiceBusClient,
  ServiceBusSender as AzureServiceBusSender,
} from "@azure/service-bus";
import { appsettings } from "../../config/appsettings";
import { autoInjectable } from "tsyringe";
import * as path from "node:path";

export interface FileDetectedMessage {
  FileChanged: string;
}

@autoInjectable()
export class ServiceBusSender {
  private serviceBusClient: ServiceBusClient;
  private sender: AzureServiceBusSender;

  constructor() {
    this.serviceBusClient = new ServiceBusClient(
      appsettings.serviceBus.connectionString
    );
    this.sender = this.serviceBusClient.createSender(
      appsettings.serviceBus.queueName
    );
  }

  /**
   * Sends a message to the Service Bus queue when a file is detected
   */
  async sendFileDetectedMessage(filePath: string): Promise<void> {
    try {
      const fileName = path.basename(filePath);
      const message: FileDetectedMessage = {
        FileChanged: "yes",
      };

      console.log(`Sending Service Bus message for file: ${fileName}`);

      await this.sender.sendMessages({
        body: message,
        messageId: `file-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        contentType: "application/json",
      });

      console.log(`Message sent successfully for file: ${fileName}`);
    } catch (error) {
      console.error(
        `Failed to send Service Bus message for file ${filePath}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Sends a custom message to the Service Bus queue
   */
  async sendCustomMessage(messageBody: any, label?: string): Promise<void> {
    try {
      const message = {
        body: messageBody,
        messageId: `custom-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        contentType: "application/json",
      };

      console.log(`Sending custom Service Bus message with label: ${label}`);

      await this.sender.sendMessages(message);

      console.log(`Custom message sent successfully`);
    } catch (error) {
      console.error(`Failed to send custom Service Bus message:`, error);
      throw error;
    }
  }

  /**
   * Closes the Service Bus connections
   */
  async close(): Promise<void> {
    try {
      console.log("Closing Service Bus sender connections...");
      await this.sender.close();
      await this.serviceBusClient.close();
      console.log("Service Bus sender closed successfully");
    } catch (error) {
      console.error("Error closing Service Bus sender:", error);
      throw error;
    }
  }

  /**
   * Tests the Service Bus connection by sending a test message
   */
  async testConnection(): Promise<boolean> {
    try {
      const testMessage = {
        FileChanged: "test",
      };

      await this.sendCustomMessage(testMessage, "connection-test");
      console.log("Service Bus connection test successful");
      return true;
    } catch (error) {
      console.error("Service Bus connection test failed:", error);
      return false;
    }
  }
}
