import {
  ServiceBusClient,
  ServiceBusReceiver,
  ServiceBusReceivedMessage,
  ProcessErrorArgs,
} from "@azure/service-bus";
import { appsettings } from "../../config/appsettings";
import { autoInjectable } from "tsyringe";
import { UpdateSonarIssuesExcel } from "../../business/update-sonar-issues-excel";
import { FileUtility } from "../utility/file-utility";

export interface ServiceBusMessage {
  projectKey?: string;
  branch?: string;
  action?: string;
  timestamp?: string;
}

@autoInjectable()
export class ServiceBusListener {
  private readonly serviceBusClient: ServiceBusClient;
  private readonly receiver: ServiceBusReceiver;
  private isListening: boolean = false;

  constructor(
    private readonly updateSonarIssuesExcel: UpdateSonarIssuesExcel,
    private readonly fileUtility: FileUtility
  ) {
    this.serviceBusClient = new ServiceBusClient(
      appsettings.serviceBus.connectionString
    );
    this.receiver = this.serviceBusClient.createReceiver(
      appsettings.serviceBus.queueName
    );
  }

  /**
   * Starts listening for messages on the Service Bus queue
   */
  async startListening(): Promise<void> {
    if (this.isListening) {
      console.log("Service Bus listener is already running");
      return;
    }

    console.log(
      `Starting Service Bus listener for queue: ${appsettings.serviceBus.queueName}`
    );
    this.isListening = true;

    try {
      // Set up message handler
      this.receiver.subscribe(
        {
          processMessage: this.processMessage.bind(this),
          processError: this.processError.bind(this),
        },
        {
          maxConcurrentCalls: appsettings.serviceBus.maxConcurrentCalls,
        }
      );

      console.log("Service Bus listener started successfully");
    } catch (error) {
      console.error("Failed to start Service Bus listener:", error);
      this.isListening = false;
      throw error;
    }
  }

  /**
   * Stops the Service Bus listener
   */
  async stopListening(): Promise<void> {
    if (!this.isListening) {
      console.log("Service Bus listener is not running");
      return;
    }

    console.log("Stopping Service Bus listener...");
    this.isListening = false;

    try {
      await this.receiver.close();
      await this.serviceBusClient.close();
      console.log("Service Bus listener stopped successfully");
    } catch (error) {
      console.error("Error stopping Service Bus listener:", error);
      throw error;
    }
  }

  /**
   * Processes incoming Service Bus messages
   */
  private async processMessage(
    message: ServiceBusReceivedMessage
  ): Promise<void> {
    try {
      console.log(`Received Service Bus message with ID: ${message.messageId}`);
      console.log(`Message body: ${JSON.stringify(message.body)}`);

      const action = message.body["FileChanged"];

      // Parse the message body
      const messageData: ServiceBusMessage = this.parseMessage(message);

      // Validate the message
      if (!this.validateMessage(messageData)) {
        console.warn("Invalid message format, skipping processing");
        await this.receiver.completeMessage(message);
        return;
      }

      // Override appsettings with message data if provided
      // this.updateAppSettings(messageData);

      console.log("Starting Sonar issues update process...");

      // Trigger the update process
      if (action === "yes") {
        await this.updateSonarIssuesExcel.upload();

        console.log("Sonar issues update completed successfully");

        // Move files from output to complete directory with timestamp
        try {
          console.log("Starting file movement process...");
          await this.fileUtility.moveFilesToCompleteDirectory();
          console.log("File movement completed successfully");
        } catch (fileError) {
          console.error(
            "File movement failed, but update was successful:",
            fileError
          );
          // Don't throw here - we still want to complete the message since the update was successful
        }
      }

      console.log("Message processing completed successfully");

      // Complete the message to remove it from the queue
      await this.receiver.completeMessage(message);
    } catch (error) {
      console.error("Error processing Service Bus message:", error);

      // Dead letter the message if processing fails
      try {
        await this.receiver.deadLetterMessage(message, {
          deadLetterReason: "ProcessingError",
          deadLetterErrorDescription:
            error instanceof Error ? error.message : "Unknown error",
        });
      } catch (dlqError) {
        console.error("Failed to dead letter message:", dlqError);
      }
    }
  }

  /**
   * Handles Service Bus errors
   */
  private async processError(args: ProcessErrorArgs): Promise<void> {
    console.error("Service Bus error:", args.error);
    console.error("Error source:", args.errorSource);
    console.error("Entity path:", args.entityPath);
  }

  /**
   * Parses the Service Bus message body
   */
  private parseMessage(message: ServiceBusReceivedMessage): ServiceBusMessage {
    try {
      if (typeof message.body === "string") {
        return JSON.parse(message.body);
      }
      return message.body as ServiceBusMessage;
    } catch (parseError) {
      console.warn(
        "Failed to parse message body as JSON:",
        parseError instanceof Error ? parseError.message : "Unknown error"
      );
      return {};
    }
  }

  /**
   * Validates the message structure
   */
  private validateMessage(messageData: ServiceBusMessage): boolean {
    // Basic validation - you can extend this based on your requirements
    return messageData !== null && typeof messageData === "object";
  }

  /**
   * Updates appsettings with message data
   */
  private updateAppSettings(messageData: ServiceBusMessage): void {
    if (messageData.projectKey) {
      console.log(`Overriding project key: ${messageData.projectKey}`);
      appsettings.sonarProjectKey = messageData.projectKey;
    }

    if (messageData.branch) {
      console.log(`Overriding branch: ${messageData.branch}`);
      appsettings.branch = messageData.branch;
    }

    console.log(
      `Processing update for project: ${appsettings.sonarProjectKey}, branch: ${appsettings.branch}`
    );
  }

  /**
   * Gets the current listening status
   */
  public get isActive(): boolean {
    return this.isListening;
  }
}
