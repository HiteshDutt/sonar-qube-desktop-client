# Service Bus Integration Guide

This document explains how to use the new Azure Service Bus integration for triggering Sonar issues updates.

## Overview

The Service Bus integration allows you to trigger the Update/Write Mode (`UpdateSonarIssuesExcel.upload()`) automatically when messages are received on an Azure Service Bus queue. This enables event-driven processing of Sonar issue updates.

## Configuration

### 1. Azure Service Bus Setup

First, configure your Azure Service Bus settings in `src/config/appsettings.ts`:

```typescript
serviceBus: {
    connectionString: 'Endpoint=sb://your-namespace.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=your-key',
    queueName: 'sonar-update-queue', // Your queue name
    maxConcurrentCalls: 1 // Number of concurrent message processing
}
```

### 2. Required Settings

Make sure these settings are also configured:
- `sonarBaseUrl`: Your SonarQube server URL
- `sonarToken`: Your SonarQube authentication token
- `sonarProjectKey`: Default project key (can be overridden by messages)
- `branch`: Default branch (can be overridden by messages)

## Running the Service Bus Listener

### Development Mode
```bash
npm run dev:servicebus
```
This runs with nodemon for development, automatically restarting when code changes.

### Production Mode
```bash
npm run start:servicebus
```
This runs the service directly without file watching.

## Message Format

Send JSON messages to your Service Bus queue with this optional structure:

```json
{
    "projectKey": "my-sonar-project",
    "branch": "main",
    "action": "update",
    "timestamp": "2025-10-20T12:00:00Z"
}
```

### Message Properties

- **projectKey** (optional): Overrides the default `appsettings.sonarProjectKey`
- **branch** (optional): Overrides the default `appsettings.branch`
- **action** (optional): Currently not used, reserved for future functionality
- **timestamp** (optional): Message timestamp for tracking

If `projectKey` or `branch` are not provided in the message, the service will use the default values from `appsettings.ts`.

### File Watcher Messages

The File Watcher service sends simplified messages when Excel files are detected in the `complete` folder:

```json
{
    "FileChanged": "yes"
}
```

These messages trigger the same update process using the default `projectKey` and `branch` from `appsettings.ts`.

## How It Works

1. **Listener Startup**: The service connects to your Service Bus queue and starts listening
2. **Message Reception**: When a message arrives, it's parsed and validated
3. **Settings Override**: Any `projectKey` or `branch` in the message temporarily overrides the default settings
4. **Update Execution**: The existing `UpdateSonarIssuesExcel.upload()` method is called
5. **File Movement**: After successful update, Excel files are moved from `output` to `complete` directory with timestamp
6. **Message Completion**: If successful, the message is marked as completed and removed from the queue
7. **Error Handling**: If processing fails, the message is moved to the dead letter queue

## File Processing Workflow

### Automatic File Movement

After a successful Sonar update process, the system automatically:

1. **Scans Output Directory**: Looks for Excel files in `./output` folder
2. **Generates Timestamp**: Creates timestamp in format `YYYYMMDD_HHMMSS`
3. **Moves Files**: Cuts files from `output` and pastes them to `complete` folder
4. **Renames Files**: Adds timestamp to filename (e.g., `report.xlsx` → `report_20251022_143025.xlsx`)

### File Naming Convention

Original files are renamed with timestamps:
- `sonar-results.xlsx` → `sonar-results_20251022_143025.xlsx`
- `project-issues.xlsm` → `project-issues_20251022_143025.xlsm`

### Supported File Types

The system processes these Excel formats:
- `.xlsx` - Excel Workbook
- `.xls` - Excel 97-2003 Workbook  
- `.xlsm` - Excel Macro-Enabled Workbook
- `.xlsb` - Excel Binary Workbook

## Error Handling

- **Invalid Messages**: Malformed messages are completed and skipped
- **Processing Errors**: Failed processing moves messages to the dead letter queue
- **File Movement Errors**: If file movement fails, the error is logged but the message is still completed (since the update was successful)
- **Connection Errors**: Service Bus connection errors are logged and the service attempts to reconnect

## Monitoring

The service provides console logging for:
- Service startup and shutdown
- Message reception and processing
- Configuration overrides
- Errors and warnings

## Graceful Shutdown

The service handles `SIGINT` (Ctrl+C) and `SIGTERM` signals for graceful shutdown:
- Stops accepting new messages
- Completes processing of current messages
- Closes Service Bus connections
- Exits cleanly

## Example Usage Scenarios

### Scenario 1: Automated CI/CD Integration
Trigger Sonar issue updates automatically when builds complete:
```json
{
    "projectKey": "my-web-app",
    "branch": "release/v2.1",
    "action": "post-build-update"
}
```

### Scenario 2: Scheduled Updates
Use Azure Logic Apps or Functions to send periodic update messages:
```json
{
    "action": "scheduled-update"
}
```

### Scenario 3: Multi-Project Updates
Send different messages for different projects:
```json
{
    "projectKey": "frontend-app",
    "branch": "main"
}
```

## Troubleshooting

### Common Issues

1. **Connection String Error**
   - Verify your Service Bus connection string is correct
   - Ensure the namespace and access keys are valid

2. **Queue Not Found**
   - Check that the queue exists in your Service Bus namespace
   - Verify the queue name spelling in appsettings

3. **Permission Errors**
   - Ensure your connection string has send/receive permissions
   - Check that the queue allows the required operations

4. **Message Processing Failures**
   - Check the dead letter queue for failed messages
   - Review console logs for detailed error information

### Debugging Tips

- Run in development mode (`npm run dev:servicebus`) for detailed logging
- Use Azure Service Bus Explorer to monitor queue activity
- Check the `./output` directory for generated Excel files
- Verify that the required Excel files exist for the update process

## Integration with Existing Workflows

The Service Bus integration works alongside existing functionality:
- **Manual Updates**: You can still run `npm run dev:update` manually
- **Read Operations**: `npm run dev:read` continues to work for exporting issues
- **Compare Operations**: `npm run dev:compare` remains available for branch comparisons

The Service Bus listener is an additional trigger mechanism that doesn't replace existing functionality.