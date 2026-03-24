import * as fs from "node:fs";
import * as path from "node:path";
import { appsettings } from "../../config/appsettings";
import { autoInjectable } from "tsyringe";

@autoInjectable()
export class FileUtility {
  /**
   * Moves Excel files from output directory to complete directory with timestamp
   */
  async moveFilesToCompleteDirectory(): Promise<void> {
    try {
      console.log(
        "Starting file movement from output to complete directory..."
      );

      const outputDir = path.resolve(appsettings.outputDirectory);
      const completeDir = path.resolve(appsettings.completeDirectory);

      // Ensure complete directory exists
      if (!fs.existsSync(completeDir)) {
        console.log(`Creating complete directory: ${completeDir}`);
        fs.mkdirSync(completeDir, { recursive: true });
      }

      // Check if output directory exists
      if (!fs.existsSync(outputDir)) {
        console.log(`Output directory does not exist: ${outputDir}`);
        return;
      }

      // Get all Excel files from output directory
      const files = fs.readdirSync(outputDir);
      const excelFiles = files.filter((file) => this.isExcelFile(file));

      if (excelFiles.length === 0) {
        console.log("No Excel files found in output directory");
        return;
      }

      console.log(`Found ${excelFiles.length} Excel file(s) to move`);

      const timestamp = this.getCurrentTimestamp();
      let movedCount = 0;

      for (const file of excelFiles) {
        try {
          await this.moveFileWithTimestamp(
            outputDir,
            completeDir,
            file,
            timestamp
          );
          movedCount++;
        } catch (error) {
          console.error(`Failed to move file ${file}:`, error);
          // Continue with other files even if one fails
        }
      }

      console.log(
        `Successfully moved ${movedCount}/${excelFiles.length} Excel file(s) to complete directory`
      );
    } catch (error) {
      console.error("Error during file movement process:", error);
      throw error;
    }
  }

  /**
   * Moves a single file from source to destination with timestamp
   */
  private async moveFileWithTimestamp(
    sourceDir: string,
    destDir: string,
    fileName: string,
    timestamp: string
  ): Promise<void> {
    const sourcePath = path.join(sourceDir, fileName);

    // Create new filename with timestamp
    const fileExtension = path.extname(fileName);
    const baseName = path.basename(fileName, fileExtension);
    const newFileName = `${baseName}_${timestamp}${fileExtension}`;
    const destPath = path.join(destDir, newFileName);

    console.log(`Moving: ${fileName} → ${newFileName}`);

    // Check if source file exists
    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Source file does not exist: ${sourcePath}`);
    }

    // Check if destination already exists
    if (fs.existsSync(destPath)) {
      console.warn(
        `Destination file already exists, will overwrite: ${destPath}`
      );
    }

    // Move the file (cut and paste)
    fs.renameSync(sourcePath, destPath);

    console.log(`Successfully moved: ${fileName} → ${newFileName}`);
  }

  /**
   * Checks if a file is an Excel file based on extension
   */
  private isExcelFile(fileName: string): boolean {
    const excelExtensions = [".xlsx", ".xls", ".xlsm", ".xlsb"];
    const fileExtension = path.extname(fileName).toLowerCase();
    return excelExtensions.includes(fileExtension);
  }

  /**
   * Generates a timestamp string for file naming
   */
  private getCurrentTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    return `${year}${month}${day}_${hours}${minutes}${seconds}`;
  }

  /**
   * Lists all Excel files in the output directory
   */
  getOutputDirectoryFiles(): string[] {
    try {
      const outputDir = path.resolve(appsettings.outputDirectory);

      if (!fs.existsSync(outputDir)) {
        return [];
      }

      const files = fs.readdirSync(outputDir);
      return files.filter((file) => this.isExcelFile(file));
    } catch (error) {
      console.error("Error listing output directory files:", error);
      return [];
    }
  }

  /**
   * Lists all files in the complete directory
   */
  getCompleteDirectoryFiles(): string[] {
    try {
      const completeDir = path.resolve(appsettings.completeDirectory);

      if (!fs.existsSync(completeDir)) {
        return [];
      }

      const files = fs.readdirSync(completeDir);
      return files.filter((file) => this.isExcelFile(file));
    } catch (error) {
      console.error("Error listing complete directory files:", error);
      return [];
    }
  }

  /**
   * Gets file statistics for a given file path
   */
  getFileStats(filePath: string): fs.Stats | null {
    try {
      if (fs.existsSync(filePath)) {
        return fs.statSync(filePath);
      }
      return null;
    } catch (error) {
      console.error(`Error getting file stats for ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Cleans up old files in the complete directory (optional utility)
   */
  async cleanupOldFiles(daysOld: number = 30): Promise<void> {
    try {
      const completeDir = path.resolve(appsettings.completeDirectory);

      if (!fs.existsSync(completeDir)) {
        return;
      }

      const files = fs.readdirSync(completeDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      let deletedCount = 0;

      for (const file of files) {
        if (!this.isExcelFile(file)) continue;

        const filePath = path.join(completeDir, file);
        const stats = this.getFileStats(filePath);

        if (stats && stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
          console.log(`🗑️ Deleted old file: ${file}`);
          deletedCount++;
        }
      }

      if (deletedCount > 0) {
        console.log(
          `Cleaned up ${deletedCount} old file(s) from complete directory`
        );
      } else {
        console.log("No old files to clean up in complete directory");
      }
    } catch (error) {
      console.error("Error during cleanup:", error);
      throw error;
    }
  }
}
