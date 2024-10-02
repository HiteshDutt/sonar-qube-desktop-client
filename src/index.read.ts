import "reflect-metadata";
import container from "./di/container.di";
import { ExportSonarIssuesExcel } from "./business/export-sonar-issues-excel";

async function main() {
    const exportSonarIssuesExcel = container.resolve(ExportSonarIssuesExcel);
    await exportSonarIssuesExcel.export();
}

main().then(() => console.log("Service Execution Completed")).catch((ex) => console.log(ex.message));