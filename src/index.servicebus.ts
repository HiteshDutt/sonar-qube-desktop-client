import "reflect-metadata";
import container from "./di/container.di";
import { ServiceBusListener } from "./lib/servicebus/servicebus-listener";
import { appsettings } from "./config/appsettings";

async function main() {
  console.log(" Starting Sonar Service Bus Update Listener...");

  // Validate Service Bus configuration
  if (!appsettings.serviceBus.connectionString) {
    console.error(
      " Service Bus connection string is not configured in appsettings.ts"
    );
    console.error(
      "Please set appsettings.serviceBus.connectionString before running this service"
    );
    process.exit(1);
  }

  if (!appsettings.serviceBus.queueName) {
    console.error(
      " Service Bus queue name is not configured in appsettings.ts"
    );
    console.error(
      "Please set appsettings.serviceBus.queueName before running this service"
    );
    process.exit(1);
  }

  console.log(
    ` Connecting to Service Bus queue: ${appsettings.serviceBus.queueName}`
  );

  const serviceBusListener = container.resolve(ServiceBusListener);

  // Handle graceful shutdown
  process.on("SIGINT", async () => {
    console.log("\n Received SIGINT, shutting down gracefully...");
    try {
      await serviceBusListener.stopListening();
      console.log(" Service stopped successfully");
      process.exit(0);
    } catch (error) {
      console.error(" Error during shutdown:", error);
      process.exit(1);
    }
  });

  process.on("SIGTERM", async () => {
    console.log("\n Received SIGTERM, shutting down gracefully...");
    try {
      await serviceBusListener.stopListening();
      console.log(" Service stopped successfully");
      process.exit(0);
    } catch (error) {
      console.error(" Error during shutdown:", error);
      process.exit(1);
    }
  });

  try {
    await serviceBusListener.startListening();
    console.log(
      " Service Bus listener is now active and waiting for messages..."
    );
    console.log("Press Ctrl+C to stop the service");

    // Keep the process running
    await new Promise(() => {}); // This will never resolve, keeping the process alive
  } catch (error) {
    console.error(" Failed to start Service Bus listener:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(" Fatal error:", error);
  process.exit(1);
});
