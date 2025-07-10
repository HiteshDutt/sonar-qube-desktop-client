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
        const workbookPath = `${appsettings.outputDirectory}/${Utility.getExcelFileNameFromBranch(appsettings.sonarProjectKey,appsettings.branch)}`;
        const rulesSheet = ExcelUtility.read(workbookPath, 'Rules') as any[];
        for (let i = 0; i < rulesSheet.length; i++) {
        const rule = rulesSheet[i];
          console.log(`Processing Rule ${rule.sheetIdentifier} - Rule Count ${i + 1} / ${rulesSheet.length}`);
        if (rule.action === 'noaction') continue;
        else if (rule.action != 'action' && rule.action != ''){
            const validTransitions = new Set([
            'confirm', 'unconfirm', 'reopen', 'resolve',
            'falsepositive', 'wontfix', 'resolveasreviewed',
            'resetastoreview', 'accept'
        ]);
        switch (rule.action.toLowerCase()) {
                case 'open':
                    rule.action = 'reopen';
                    break;
                case 'resolved':
                    rule.action = 'resolve';
                    break;
                case 'confirmed':
                    rule.action = 'confirm';
                    break;
                case 'false-positive':
                    rule.action = 'falsepositive';
                    break;
                case 'wont-fix':
                    rule.action = 'wontfix';
                    break;
            }

            if (!validTransitions.has(rule.action)) {
                console.warn(`Skipping UPDATE due to invalid action '${rule.action}'`);
                continue;
            }

        const issuesKeys = ExcelUtility.read(workbookPath, rule.sheetIdentifier) as any[];
        const issuesKeysCsv = Utility.getIssuesInBlockOfNumber(issuesKeys, appsettings.maxRecordsToBeUpdaate);
        for(let element of issuesKeysCsv){
                const response = await this.sonarWriteUpdateInfo.updateBulkIssuesToSonar(element, rule.action);
                console.log(`Response From Sonar : ${JSON.stringify(response)}`);
            }
        }
        else {
        const issuesSheet = ExcelUtility.read(workbookPath, rule.sheetIdentifier) as any[];
        if (!issuesSheet || issuesSheet.length === 0) {
            console.log(`No issues found for sheet ${rule.sheetIdentifier}`);
            continue;
        }

        // Group issues by status and assignee
        const grouped = new Map<string, string[]>();
        // valid transitions for bulk API
        const validTransitions = new Set([
            'confirm', 'unconfirm', 'reopen', 'resolve',
            'falsepositive', 'wontfix', 'resolveasreviewed',
            'resetastoreview', 'accept'
        ]);

        // Group issue(status and assignee)
        for (const issue of issuesSheet) {
            let action = issue.status?.toLowerCase() || 'noaction';
            const assignee = issue.assignee || '';

            switch (action) {
                case 'open':
                    action = 'reopen';
                    break;
                case 'resolved':
                    action = 'resolve';
                    break;
                case 'confirmed':
                    action = 'confirm';
                    break;
                case 'false-positive':
                    action = 'falsepositive';
                    break;
                case 'wont-fix':
                    action = 'wontfix';
                    break;
            }

            if (!validTransitions.has(action)) {
                console.warn(`Skipping issue ${issue.key} due to invalid action '${action}'`);
                continue;
            }

            const key = `${action}::${assignee}`;
            if (!grouped.has(key)) {
                grouped.set(key, []);
            }
            grouped.get(key)!.push(issue.key);
        }

        // Perform bulk updates per group
        for (const [groupKey, issueKeys] of grouped.entries()) {
            const [action, assignee] = groupKey.split('::');
            const issuesKeysCsv = Utility.getIssuesInBlockOfNumber(issueKeys.map(k => ({ key: k })), appsettings.maxRecordsToBeUpdaate);
            for (let chunk of issuesKeysCsv) {
                try {
                    const response = await this.sonarWriteUpdateInfo.updateBulkIssuesToSonar(chunk, action, assignee);
                    console.log(`Response From Sonar : ${JSON.stringify(response)}`);
                } catch (ex: unknown) {
                        if (ex instanceof Error) {
                            console.error(`Failed to update issues for action '${action}' and assignee '${assignee}': ${ex.message}`);
                        } else {
                            console.error(`Unknown error occurred while updating issues for action '${action}' and assignee '${assignee}':`, ex);
                        }
                    }

                                }
            }
        }
    }
        console.timeEnd('UpdateSonarIssuesExcel');
    }
}