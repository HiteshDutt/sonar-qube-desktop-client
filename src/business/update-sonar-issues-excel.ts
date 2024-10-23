import { ExcelUtility } from "../lib/excel/excel-utility";
import { appsettings } from "../config/appsettings";
import { SonarWriteUpdateInfo } from "../lib/sonar/write-update-info";
import { Utility } from "../lib/utility/utility";
import { autoInjectable } from "tsyringe";

@autoInjectable()
export class UpdateSonarIssuesExcel {

    constructor(private readonly sonarWriteUpdateInfo: SonarWriteUpdateInfo
    ) {
    }


    async upload(): Promise<void> {
        console.time('UpdateSonarIssuesExcel');
        const workbookPath = `${appsettings.outputDirectory}/${Utility.getExcelFileNameFromBranch(appsettings.branch)}`;
        const values = ExcelUtility.read(workbookPath, 'Rules') as any[];
        for (let i = 0; i < values.length; i++) {
            console.log(`Updating Rule ${values[i].sheetIdentifier} - Rule Count ${i + 1} / ${values.length}`);
            if (values[i].action === 'noaction') {
                continue;
            }
            const issuesKeys = ExcelUtility.read(workbookPath, values[i].sheetIdentifier) as any[];
            const issuesKeysCsv = Utility.getIssuesInBlockOfNumber(issuesKeys, appsettings.maxRecordsToBeUpdaate);
            for(let element of issuesKeysCsv){
                const response = await this.sonarWriteUpdateInfo.updateBulkIssuesToSonar(element, values[i].action);
                console.log(`Response From Sonar : ${JSON.stringify(response)}`);
            }
        }
        console.timeEnd('UpdateSonarIssuesExcel');
    }
}