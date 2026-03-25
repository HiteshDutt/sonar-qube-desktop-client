# File Watcher Service Guide

This document explains the new File Watcher functionality that automatically monitors the `complete` folder and sends Service Bus messages when Excel files are added.

## Overview

The File Watcher Service monitors the `complete` directory for Excel file additions and automatically sends messages to Azure Service Bus. This creates an automated workflow where dropping Excel files into a folder triggers processing.

## How It Works

1. **📁 Directory Monitoring**: Watches the `completeDirectory` path from appsettings
2. **📋 Excel Detection**: Identifies Excel files (`.xlsx`, `.xls`, `.xlsm`, `.xlsb`)
3. **📤 Message Sending**: Sends Service Bus messages when files are detected
4. **🔄 Automatic Processing**: The Service Bus listener can then process these messages

## Configuration

### File Watcher Settings

In `src/config/appsettings.ts`, ensure you have:

```typescript
{
    completeDirectory: "./complete",  // Directory to monitor
    serviceBus: {
        connectionString: "your-connection-string",
        queueName: "sonar-ip"
    }
}
```

## Running the File Watcher

### Development Mode (with auto-restart)
```bash
npm run dev:filewatcher
```

### Production Mode
```bash
npm run start:filewatcher
```

## Supported Excel Formats

The service monitors for these Excel file extensions:
- `.xlsx` - Excel Workbook (modern format)
- `.xls` - Excel 97-2003 Workbook (legacy format)
- `.xlsm` - Excel Macro-Enabled Workbook
- `.xlsb` - Excel Binary Workbook

## Message Format

When an Excel file is detected, the service sends a simple JSON message like this:

```json
{
    "FileChanged": "yes"
}
```

### Message Properties

- **FileChanged**: Always "yes" when a file is detected in the complete folder

## File Detection Logic

### File Readiness Check
The service ensures files are completely written before processing:
- ✅ File exists and has content (size > 0)
- ✅ File is not locked (can be opened for reading)
- ✅ File has been stable for 2 seconds (configurable)

### Ignored Files
- Hidden files (starting with `.`)
- Non-Excel files
- Empty files
- Files currently being written

## Complete Workflow Example

Here's a typical workflow combining File Watcher with Service Bus processing:

### Step 1: Start Both Services

**Terminal 1 - Start Service Bus Listener:**
```bash
npm run dev:servicebus
```

**Terminal 2 - Start File Watcher:**
```bash
npm run dev:filewatcher
```

### Step 2: Add Excel File

Copy an Excel file to the `./complete` directory:
```
./complete/
├── sonar-results-main.xlsx  ← Copy this file here
```

### Step 3: Automatic Processing

1. **File Watcher** detects the Excel file
2. **Service Bus message** is sent automatically
3. **Service Bus Listener** receives the message
4. **Update process** executes (if configured)

## Console Output Examples

### File Watcher Starting
```
🚀 Starting Sonar File Watcher Service...
📁 Watch directory: C:\OfficeWork\Sonar_Ip\sonar-qube-desktop-client\complete
📡 Service Bus queue: sonar-ip
🔌 Testing Service Bus connection...
✅ Service Bus connection test successful
👀 Starting file watcher for directory: C:\...\complete
📋 Watching for Excel files: .xlsx, .xls, .xlsm, .xlsb
✅ File watcher is ready and watching for changes
✅ File watcher is now active and monitoring for Excel files...
💡 Copy Excel files to the 'complete' folder to trigger Service Bus messages
```

### File Detection
```
📥 Excel file detected: sonar-results.xlsx
✅ File is ready for processing: sonar-results.xlsx
📊 Processing Excel file: sonar-results.xlsx (15340 bytes)
📤 Sending Service Bus message for file: sonar-results.xlsx
✅ Message sent successfully for file: sonar-results.xlsx
🎉 Successfully processed Excel file: sonar-results.xlsx
```

## Error Handling

### Common Scenarios

**File Not Ready:**
```
⏳ File not ready: temp-file.xlsx - EACCES: permission denied
```

**Service Bus Connection Issues:**
```
❌ Failed to send Service Bus message for file: ENOTFOUND connection error
```

**Invalid File Format:**
```
⏭️ Ignoring non-Excel file: document.pdf
```

## Integration Patterns

### Pattern 1: Manual File Drop
1. User manually copies Excel files to `./complete`
2. File watcher detects and sends messages
3. Service Bus processes updates automatically

### Pattern 2: Automated CI/CD
1. Build process copies results to `./complete`
2. File watcher triggers Service Bus messages
3. Automated Sonar issue processing

### Pattern 3: Scheduled Processing
1. Scheduled job copies files to `./complete`
2. File watcher sends messages with timestamps
3. Service Bus processes in order

## Monitoring and Debugging

### Service Status
The file watcher provides real-time status information:
- Active monitoring status
- Directory being watched
- Supported file extensions
- List of existing Excel files

### Debugging Tips

1. **Check Directory Path**: Verify the `completeDirectory` exists
2. **Test Service Bus**: Use the connection test feature
3. **File Permissions**: Ensure files are not locked
4. **File Extensions**: Verify Excel files have supported extensions

### Log Analysis
Monitor console output for:
- `📥` File detection events
- `✅` Successful processing
- `❌` Error conditions
- `⏳` File readiness checks

## Troubleshooting

### File Not Detected
- Check file extension is supported (`.xlsx`, `.xls`, `.xlsm`, `.xlsb`)
- Verify file is in the correct directory
- Ensure file is not empty or locked

### Messages Not Sent
- Verify Service Bus connection string
- Check queue name configuration
- Test Service Bus connectivity

### Permission Errors
- Ensure read/write access to the complete directory
- Check file is not opened in Excel or other applications

## Best Practices

1. **File Naming**: Use descriptive names for Excel files
2. **File Size**: Keep Excel files reasonably sized for faster processing
3. **Directory Management**: Periodically clean up processed files
4. **Error Monitoring**: Monitor logs for processing issues
5. **Testing**: Test with small Excel files first

## Security Considerations

- Files are processed locally before sending messages
- No file content is sent to Service Bus (only metadata)
- Ensure proper access controls on the complete directory
- Monitor for unauthorized file additions