# Complete File Processing Workflow

This document describes the end-to-end file processing workflow in the Sonar Desktop Client with Azure Service Bus integration.

## Workflow Overview

```
Excel File → Complete Folder → Service Bus Message → Update Process → File Movement
    ↓              ↓                    ↓                  ↓              ↓
  Manual        File Watcher        Service Bus        Sonar Update   Complete with
  Copy/Paste    Detects File       Listener Processes   Excel Files   Timestamp
                                     Message
```

## Step-by-Step Process

### Step 1: File Detection
- **Action**: User copies Excel file to `./complete` folder
- **Detection**: File Watcher service detects the new Excel file
- **Message**: Sends `{"FileChanged":"yes"}` to Service Bus queue
- **Log Output**: 
  ```
  📥 Excel file detected: sonar-results.xlsx
  📤 Sending Service Bus message for file: sonar-results.xlsx
  ✅ Message sent successfully
  ```

### Step 2: Message Processing
- **Reception**: Service Bus Listener receives the message
- **Validation**: Message is validated and processed
- **Trigger**: Update process is initiated
- **Log Output**:
  ```
  📡 Received Service Bus message with ID: abc123
  Starting Sonar issues update process...
  ```

### Step 3: Sonar Update Process
- **Execution**: `UpdateSonarIssuesExcel.upload()` is called
- **Processing**: Reads Excel files from `./output` directory
- **Updates**: Sends issue updates to SonarQube server
- **Log Output**:
  ```
  Processing Rule xyz - Rule Count 1 / 10
  Sonar issues update completed successfully
  ```

### Step 4: File Movement
- **Scan**: FileUtility scans `./output` directory for Excel files
- **Timestamp**: Generates current timestamp (e.g., `20251022_143025`)
- **Move**: Cuts files from `./output` and pastes to `./complete`
- **Rename**: Adds timestamp to filename
- **Log Output**:
  ```
  📁 Starting file movement from output to complete directory...
  📦 Moving: sonar-results.xlsx → sonar-results_20251022_143025.xlsx
  ✅ Successfully moved 1/1 Excel file(s)
  ```

### Step 5: Completion
- **Message Complete**: Service Bus message is marked as completed
- **Cleanup**: Message is removed from the queue
- **Ready**: System is ready for next file
- **Log Output**:
  ```
  ✅ Message processing completed successfully
  File movement completed successfully
  ```

## Directory Structure During Processing

### Before Processing
```
./output/
├── sonar-results.xlsx      ← Files to be processed
├── project-issues.xlsm
└── ...

./complete/
├── old-file_20251020_100000.xlsx  ← Previously processed files
└── ...
```

### After Processing
```
./output/
└── (empty - files moved)

./complete/
├── old-file_20251020_100000.xlsx
├── sonar-results_20251022_143025.xlsx      ← Newly moved files
├── project-issues_20251022_143025.xlsm
└── ...
```

## File Naming Convention

Files are automatically renamed with timestamps when moved:

| Original Name | Moved Name | Pattern |
|---------------|------------|---------|
| `report.xlsx` | `report_20251022_143025.xlsx` | `{name}_{YYYYMMDD_HHMMSS}.{ext}` |
| `sonar-issues.xlsm` | `sonar-issues_20251022_143025.xlsm` | `{name}_{YYYYMMDD_HHMMSS}.{ext}` |
| `project-data.xls` | `project-data_20251022_143025.xls` | `{name}_{YYYYMMDD_HHMMSS}.{ext}` |

## Supported Workflows

### Workflow 1: Manual File Processing
1. Start Service Bus Listener: `npm run dev:servicebus`
2. Start File Watcher: `npm run dev:filewatcher`  
3. Copy Excel file to `./complete` folder
4. System automatically processes and moves files

### Workflow 2: Direct Service Bus Trigger
1. Start Service Bus Listener: `npm run dev:servicebus`
2. Send manual message: `{"FileChanged":"yes"}`
3. System processes files in `./output` and moves them

### Workflow 3: Batch Processing
1. Place multiple Excel files in `./output`
2. Trigger processing via Service Bus message
3. All Excel files are processed and moved with same timestamp

## Error Scenarios and Handling

### File Movement Failures
**Scenario**: File cannot be moved (locked, permissions, etc.)
```
❌ Failed to move file report.xlsx: EACCES: permission denied
✅ Successfully moved 2/3 Excel file(s) to complete directory
```
**Result**: Other files continue processing, message is still completed

### No Files to Move
**Scenario**: No Excel files in output directory
```
📄 No Excel files found in output directory
✅ Message processing completed successfully
```
**Result**: Message is completed normally

### Directory Creation
**Scenario**: Complete directory doesn't exist
```
📁 Creating complete directory: C:\...\complete
📁 Found 1 Excel file(s) to move
```
**Result**: Directory is created automatically

## Best Practices

### File Management
1. **Monitor Output Directory**: Regularly check for files that need processing
2. **Clean Complete Directory**: Periodically remove old timestamped files
3. **File Permissions**: Ensure proper read/write access to both directories
4. **Unique Names**: Use descriptive filenames to avoid confusion after timestamping

### Error Monitoring
1. **Watch Logs**: Monitor console output for error messages
2. **Check Directories**: Verify files are moving correctly
3. **Service Bus Health**: Monitor for dead letter queue messages
4. **File Sizes**: Ensure files are completely written before processing

### Performance Optimization
1. **File Sizes**: Keep Excel files reasonably sized for faster processing
2. **Concurrent Processing**: Service Bus processes one message at a time by default
3. **Batch Operations**: Group related files for processing together
4. **Directory Cleanup**: Use the cleanup utility for old files

## Console Output Examples

### Successful Processing
```
🚀 Starting Sonar Service Bus Update Listener...
✅ Service Bus listener is now active and waiting for messages...

📡 Received Service Bus message with ID: message123
Starting Sonar issues update process...
Processing Rule ABC123 - Rule Count 1 / 5
...
Sonar issues update completed successfully

📁 Starting file movement from output to complete directory...
📋 Found 2 Excel file(s) to move
📦 Moving: report.xlsx → report_20251022_143025.xlsx
📦 Moving: issues.xlsm → issues_20251022_143025.xlsm
✅ Successfully moved 2/2 Excel file(s) to complete directory
✅ Message processing completed successfully
```

### Error Handling
```
📡 Received Service Bus message with ID: message124
Starting Sonar issues update process...
Sonar issues update completed successfully

📁 Starting file movement from output to complete directory...
❌ Failed to move file locked-file.xlsx: EBUSY: resource busy
✅ Successfully moved 1/2 Excel file(s) to complete directory
❌ File movement failed, but update was successful: File operation error
✅ Message processing completed successfully
```

## Integration with Existing Tools

This workflow integrates seamlessly with:
- **Manual Updates**: `npm run dev:update` still works independently
- **Read Operations**: `npm run dev:read` for exporting issues
- **Compare Operations**: `npm run dev:compare` for branch comparisons
- **File Watcher**: Automatically triggers the complete workflow

The file movement feature enhances the existing functionality without replacing any current capabilities.