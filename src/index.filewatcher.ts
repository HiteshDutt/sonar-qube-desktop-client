import "reflect-metadata";
import container from "./di/container.di";
import { FileWatcher } from "./lib/filewatcher/file-watcher";
import { ServiceBusSender } from "./lib/servicebus/servicebus-sender";
import { appsettings } from "./config/appsettings";
import * as path from "node:path";

async function main() {
  console.log("Starting Sonar File Watcher Service...");

  // Validate Service Bus configuration
  if (!appsettings.serviceBus.connectionString) {
    console.error(
      "Service Bus connection string is not configured in appsettings.ts"
    );
    console.error(
      "Please set appsettings.serviceBus.connectionString before running this service"
    );
    process.exit(1);
  }

  if (!appsettings.serviceBus.queueName) {
    console.error("Service Bus queue name is not configured in appsettings.ts");
    console.error(
      "Please set appsettings.serviceBus.queueName before running this service"
    );
    process.exit(1);
  }

  const watchDirectory = path.resolve(appsettings.outputDirectory);
  console.log(`Watch directory: ${watchDirectory}`);
  console.log(`Service Bus queue: ${appsettings.serviceBus.queueName}`);

  const fileWatcher = container.resolve(FileWatcher);
  const serviceBusSender = container.resolve(ServiceBusSender);

  // Handle graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n Received ${signal}, shutting down gracefully...`);
    try {
      await fileWatcher.stopWatching();
      await serviceBusSender.close();
      console.log("File watcher service stopped successfully");
      process.exit(0);
    } catch (error) {
      console.error("Error during shutdown:", error);
      process.exit(1);
    }
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  try {
    // Test Service Bus connection first
    console.log(" Testing Service Bus connection...");
    const connectionTest = await serviceBusSender.testConnection();
    if (!connectionTest) {
      console.error(
        "Service Bus connection test failed. Please check your configuration."
      );
      process.exit(1);
    }

    // Start the file watcher
    await fileWatcher.startWatching();

    // Display current status
    console.log("\n File Watcher Status:");
    console.log(`    Watching: ${fileWatcher.watchDirectory}`);
    console.log(
      `    Supported extensions: ${fileWatcher.supportedExtensions.join(", ")}`
    );
    console.log(`    Active: ${fileWatcher.isActive}`);

    // List existing Excel files
    const existingFiles = fileWatcher.listExcelFiles();
    if (existingFiles.length > 0) {
      console.log(`    Existing Excel files: ${existingFiles.length}`);
      for (const file of existingFiles) {
        console.log(`      - ${file}`);
      }
    } else {
      console.log("    No existing Excel files found");
    }

    console.log(
      "\n File watcher is now active and monitoring for Excel files..."
    );
    console.log(
      " Copy Excel files to the 'complete' folder to trigger Service Bus messages"
    );
    console.log("Press Ctrl+C to stop the service");

    // Keep the process running
    await new Promise(() => {}); // This will never resolve, keeping the process alive
  } catch (error) {
    console.error(" Failed to start file watcher service:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(" Fatal error:", error);
  process.exit(1);
});
