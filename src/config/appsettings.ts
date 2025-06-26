export const appsettings = {
    sonarBaseUrl: 'https://servicessonar.microsoft.com/',
    sonarToken: 'squ_39524963f37a259500206e2a1f6f770cfb9deb4a',
    sonarProjectKey: 'GlobalIT_R3C_DEV_NewProfile',
    langugage: ['cs','ts','web','tsql'], //cs,ts,web,plsql,tsql
    issueStatues:"ACCEPTED,OPEN",
    branch: 'features/features-APT/feature-server-api-TB',
    compareBranch: 'releases/release-5.2.1/release-5.2.1',
    pageSize: 500,
    maxRecordsToBeUpdaate: 500,
    outputDirectory: './output',
    parallelReadCalls: 100,
    requireParallelRuleRead: false
}