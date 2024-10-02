import "reflect-metadata";
import container from "./di/container.di";
import { UpdateSonarIssuesExcel } from "./business/update-sonar-issues-excel";

async function main() {
    const exportSonarIssuesExcel = container.resolve(UpdateSonarIssuesExcel);
    await exportSonarIssuesExcel.upload();
}

main().then(() => console.log("Service Execution Completed")).catch((ex) => console.log(ex.message));