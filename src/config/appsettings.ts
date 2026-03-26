export const appsettings = {
    sonarBaseUrl: process.env.SONAR_BASE_URL ?? 'http://localhost:9000',
    sonarToken: process.env.SONAR_TOKEN ?? 'squ_4103d06a1be0db51ea28606046ee235af8055d53',
    sonarProjectKey: process.env.SONAR_PROJECT_KEY ?? 'sonar-issues',
    langugage: process.env.SONAR_LANGUAGES ? process.env.SONAR_LANGUAGES.split(',') : ['CS'], //cs,ts,web,plsql,tsql
    issueStatues: process.env.SONAR_ISSUE_STATUSES ?? 'ACCEPTED,OPEN',
    branch: process.env.SONAR_BRANCH ?? 'main',
    compareBranch: [],
    pageSize: process.env.PAGE_SIZE ? Number.parseInt(process.env.PAGE_SIZE, 10) : 500,
    maxRecordsToBeUpdaate: process.env.MAX_RECORDS_TO_BE_UPDATED ? Number.parseInt(process.env.MAX_RECORDS_TO_BE_UPDATED, 10) : 500,
    readDirectory: process.env.OUTPUT_DIRECTORY ?? './read',
    completeDirectory: process.env.OUTPUT_DIRECTORY ?? './complete',
    outputDirectory: process.env.OUTPUT_DIRECTORY ?? './output',
    parallelReadCalls: 100,
    requireParallelRuleRead: false,
    serviceBus: {
    connectionString: "", // Azure Service Bus connection string
    queueName: "sonar-ip", // Queue name for update triggers
    maxConcurrentCalls: 1, // Number of concurrent message processing
    maxWaitTimeInMs: 60000, // Max wait time for messages (60 seconds)
  },
};

