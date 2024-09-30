import "reflect-metadata";
import { container } from "tsyringe";
import { ExportSonarIssuesExcel } from "./business/export-sonar-issues-excel";

async function main() {
    const exportSonarIssuesExcel = container.resolve(ExportSonarIssuesExcel);
    await exportSonarIssuesExcel.export();
}

main().then(() => console.log("Service Executed Completed")).catch((ex) => console.log(ex.message));