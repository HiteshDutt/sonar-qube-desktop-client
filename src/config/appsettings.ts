export const appsettings = {
    sonarBaseUrl: process.env.SONAR_BASE_URL ?? 'http://localhost:900010',
    sonarToken: process.env.SONAR_TOKEN ?? 'sqp_f998d2aa043a0bc0adbe53d03f4c9a86b9857ffa',
    sonarProjectKey: process.env.SONAR_PROJECT_KEY ?? 'DOTNET_PROJECT',
    langugage: process.env.SONAR_LANGUAGES ? process.env.SONAR_LANGUAGES.split(',') : ['TS'], //cs,ts,web,plsql,tsql
    issueStatues: process.env.SONAR_ISSUE_STATUSES ?? 'OPEN',
    branch: process.env.SONAR_BRANCH ?? 'dev',
    compareBranch: [],
    pageSize: process.env.PAGE_SIZE ? Number.parseInt(process.env.PAGE_SIZE, 10) : 500,
    maxRecordsToBeUpdaate: process.env.MAX_RECORDS_TO_BE_UPDATED ? Number.parseInt(process.env.MAX_RECORDS_TO_BE_UPDATED, 10) : 500,
    outputDirectory: process.env.OUTPUT_DIRECTORY ?? './output',
    parallelReadCalls: 100,
    requireParallelRuleRead: false
}