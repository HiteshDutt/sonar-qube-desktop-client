import { appsettings } from "../config/appsettings";
import { ExcelUtility } from "../lib/excel/excel-utility";
import { autoInjectable } from "tsyringe";
import { exit } from "process";
import fs from 'fs';
import { Utility } from "../lib/utility/utility";

@autoInjectable()
export class CompareSonarIssuesExcel {
    readonly greenColour: string = "32CD32";
    readonly redColour: string = "CD5C5C";
    readonly blueColour: string = "4CA3E6";
    readonly pinkColour: string = "AD1138";
    compare() {
        console.time('CompareSonarIssuesExcel');
        if (!fs.existsSync(appsettings.outputDirectory)) {
            exit(1);
        }

        const finalWorkbookPath = `${appsettings.outputDirectory}/${Utility.getExcelFileNameFromBranch(appsettings.compareBranch[0])}_${Utility.getExcelFileNameFromBranch(appsettings.compareBranch[1])}`;
        const workbook1Path = `${appsettings.outputDirectory}/${Utility.getExcelFileNameFromBranch(appsettings.compareBranch[0])}`;
        const workbook2Path = `${appsettings.outputDirectory}/${Utility.getExcelFileNameFromBranch(appsettings.compareBranch[1])}`;

        const informationData = [
            {info: `This script will compare the issues from the two branches and generate an excel file with the differences.`, color: this.pinkColour},
            {info: `The excel file will be generated in the output directory.`, color: this.pinkColour},
            {info: `In any event where any modification done on source code, due to which the line number of impacted (sonar issue) code has changed, it would appear that issue is resolved from ${appsettings.compareBranch[0]} & has been introduced in ${appsettings.compareBranch[1]}`, color: this.pinkColour},
            {info: `Indicates that issue is resolved since ${appsettings.compareBranch[0]}`, color: this.greenColour},
            {info: `Indicates that issue is introduced since ${appsettings.compareBranch[0]}`, color: this.redColour},
            {info: `Indicates that issue exists since ${appsettings.compareBranch[0]}`, color: this.blueColour}
        ];

        ExcelUtility.generateSheetWithRowWiseColors(informationData, 'Information', finalWorkbookPath);

        const workbook1Rules = ExcelUtility.read(workbook1Path, 'Rules');
        let count = 0;
        workbook1Rules.forEach((rule: any) => {
            count++;
            console.log(`Processing rule ${rule.sheetIdentifier} ${count}/${workbook1Rules.length}`);
            const issuesSheetWB1 = ExcelUtility.read(workbook1Path, rule.sheetIdentifier);
            const issuesSheetWB2 = ExcelUtility.read(workbook2Path, rule.sheetIdentifier);
            let dataFoundInSheet1 = issuesSheetWB1.length !== 0;
            let dataFoundInSheet2 = issuesSheetWB2.length !== 0;
            let dataForSheet: any[] = [];
            if (dataFoundInSheet1) {
                if (dataFoundInSheet2) {
                    issuesSheetWB1.forEach((issue: any) => {
                        const matchingIssue = issuesSheetWB2.find((i: any) => i.line === issue.line && i.component === issue.component);
                        if (matchingIssue) {
                            issue.color = this.blueColour;
                        }
                        else{
                            issue.color = this.greenColour;
                        }

                        dataForSheet.push(issue);
                    });

                    issuesSheetWB2.forEach((issue: any) => {
                        const matchingIssue = dataForSheet.find((i: any) => i.line === issue.line && i.component === issue.component);
                        if (!matchingIssue) {
                            issue.color = this.redColour;
                            dataForSheet.push(issue);
                        }
                    });

                    ExcelUtility.generateSheetWithRowWiseColors(dataForSheet, rule.sheetIdentifier, finalWorkbookPath);
                }
                else {
                    // Add the sheet to the final workbook
                    ExcelUtility.generateSheetWithColors(issuesSheetWB1, rule.sheetIdentifier, finalWorkbookPath, this.greenColour);
                }
            }
            else if (dataFoundInSheet2) {
                // Add the sheet to the final workbook
                ExcelUtility.generateSheetWithColors(issuesSheetWB2, rule.sheetIdentifier, finalWorkbookPath, this.redColour);
            }
            else {
                console.log(`No data found for rule ${rule.sheetIdentifier}`);
            }
        });

        console.timeEnd('CompareSonarIssuesExcel');
    }
}