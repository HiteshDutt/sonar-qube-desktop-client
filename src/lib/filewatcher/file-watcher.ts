import * as chokidar from "chokidar";
import * as path from "node:path";
import * as fs from "node:fs";
import { appsettings } from "../../config/appsettings";
import { ServiceBusSender } from "../servicebus/servicebus-sender";
import { autoInjectable } from "tsyringe";

@autoInjectable()
export class FileWatcher {
  private watcher: chokidar.FSWatcher | null = null;
  private isWatching: boolean = false;
  private readonly watchPath: string;
  private readonly excelExtensions = [".xlsx", ".xls", ".xlsm", ".xlsb"];

  constructor(private readonly serviceBusSender: ServiceBusSender) {
    this.watchPath = path.resolve(appsettings.outputDirectory);
  }

  /**
   * Starts watching the complete directory for Excel files
   */
  async startWatching(): Promise<void> {
    if (this.isWatching) {
      console.log("File watcher is already running");
      return;
    }

    try {
      // Ensure the directory exists
      if (!fs.existsSync(this.watchPath)) {
        console.log(`Creating watch directory: ${this.watchPath}`);
        fs.mkdirSync(this.watchPath, { recursive: true });
      }

      console.log(`Starting file watcher for directory: ${this.watchPath}`);
      console.log(
        `Watching for Excel files: ${this.excelExtensions.join(", ")}`
      );

      this.watcher = chokidar.watch(this.watchPath, {
        ignored: /(^|[/\\])\../, // ignore dotfiles
        persistent: true,
        ignoreInitial: false, // Process existing files on startup
        awaitWriteFinish: {
          stabilityThreshold: 2000, // Wait 2 seconds after last change
          pollInterval: 100, // Poll every 100ms
        },
        depth: 0, // Only watch the immediate directory, not subdirectories
      });

      // Set up event handlers
      this.watcher
        .on("add", (filePath) => this.onFileAdded(filePath))
        .on("change", (filePath) => this.onFileChanged(filePath))
        .on("ready", () => {
          console.log("File watcher is ready and watching for changes");
          this.isWatching = true;
        })
        .on("error", (error) => {
          console.error("File watcher error:", error);
        });

      console.log("File watcher started successfully");
    } catch (error) {
      console.error("Failed to start file watcher:", error);
      this.isWatching = false;
      throw error;
    }
  }

  /**
   * Stops the file watcher
   */
  async stopWatching(): Promise<void> {
    if (!this.isWatching || !this.watcher) {
      console.log("File watcher is not running");
      return;
    }

    console.log("Stopping file watcher...");
    this.isWatching = false;

    try {
      await this.watcher.close();
      this.watcher = null;
      console.log("File watcher stopped successfully");
    } catch (error) {
      console.error(" Error stopping file watcher:", error);
      throw error;
    }
  }

  /**
   * Handles file addition events
   */
  private async onFileAdded(filePath: string): Promise<void> {
    try {
      const fileName = path.basename(filePath);

      if (!this.isExcelFile(fileName)) {
        console.log(`Ignoring non-Excel file: ${fileName}`);
        return;
      }

      console.log(`Excel file detected: ${fileName}`);

      // Verify the file is completely written and accessible
      if (await this.isFileReady(filePath)) {
        console.log(`File is ready for processing: ${fileName}`);
        await this.processExcelFile(filePath);
      } else {
        console.log(`File is not ready yet: ${fileName}`);
      }
    } catch (error) {
      console.error(`Error processing added file ${filePath}:`, error);
    }
  }

  /**
   * Handles file change events
   */
  private async onFileChanged(filePath: string): Promise<void> {
    try {
      const fileName = path.basename(filePath);

      if (!this.isExcelFile(fileName)) {
        return;
      }

      console.log(`Excel file changed: ${fileName}`);

      // Verify the file is completely written and accessible
      if (await this.isFileReady(filePath)) {
        console.log(`Changed file is ready for processing: ${fileName}`);
        await this.processExcelFile(filePath);
      }
    } catch (error) {
      console.error(`Error processing changed file ${filePath}:`, error);
    }
  }

  /**
   * Processes an Excel file by sending a Service Bus message
   */
  private async processExcelFile(filePath: string): Promise<void> {
    try {
      const fileName = path.basename(filePath);
      const fileStats = fs.statSync(filePath);

      console.log(
        `Processing Excel file: ${fileName} (${fileStats.size} bytes)`
      );

      await this.serviceBusSender.sendFileDetectedMessage(filePath);

      console.log(`Successfully processed Excel file: ${fileName}`);
    } catch (error) {
      console.error(`Failed to process Excel file ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Checks if a file is an Excel file based on its extension
   */
  private isExcelFile(fileName: string): boolean {
    const fileExtension = path.extname(fileName).toLowerCase();
    return this.excelExtensions.includes(fileExtension);
  }

  /**
   * Checks if a file is ready for processing (fully written and accessible)
   */
  private async isFileReady(filePath: string): Promise<boolean> {
    try {
      // Check if file exists and is accessible
      const stats = fs.statSync(filePath);

      // Check if file has some content
      if (stats.size === 0) {
        return false;
      }

      // Try to open the file to ensure it's not locked
      const fileHandle = fs.openSync(filePath, "r");
      fs.closeSync(fileHandle);

      return true;
    } catch (error) {
      console.log(
        `File not ready: ${path.basename(filePath)} - ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      return false;
    }
  }

  /**
   * Gets the current watching status
   */
  public get isActive(): boolean {
    return this.isWatching;
  }

  /**
   * Gets the directory being watched
   */
  public get watchDirectory(): string {
    return this.watchPath;
  }

  /**
   * Gets the supported Excel file extensions
   */
  public get supportedExtensions(): string[] {
    return [...this.excelExtensions];
  }

  /**
   * Lists all Excel files currently in the watch directory
   */
  public listExcelFiles(): string[] {
    try {
      if (!fs.existsSync(this.watchPath)) {
        return [];
      }

      const files = fs.readdirSync(this.watchPath);
      return files.filter((file) => this.isExcelFile(file));
    } catch (error) {
      console.error("Error listing Excel files:", error);
      return [];
    }
  }
}
