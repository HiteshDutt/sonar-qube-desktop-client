import "reflect-metadata";
import container from "./di/container.di";
import { CompareSonarIssuesExcel } from "./business/compare-sonar-issue-excel";

function main() {
    const exportSonarIssuesExcel = container.resolve(CompareSonarIssuesExcel);
    exportSonarIssuesExcel.compare();
    console.log("Service Execution Completed")
}

main();