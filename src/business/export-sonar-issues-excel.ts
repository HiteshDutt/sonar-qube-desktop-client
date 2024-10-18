import { ExcelUtility } from '../lib/excel/excel-utility';
import { appsettings } from '../config/appsettings';
import { SonarReadInfo } from '../lib/sonar/read-info';
import { Utility } from '../lib/utility/utility';
import fs from 'fs';
import { autoInjectable } from 'tsyringe';

@autoInjectable()
export class ExportSonarIssuesExcel {
    constructor(
        private readonly sonarReadInfo: SonarReadInfo
    ) {
    }

    async export() {
        console.time('ExportSonarIssuesExcel');

        if (!fs.existsSync(appsettings.outputDirectory)) {
            fs.mkdirSync(appsettings.outputDirectory);
        }

        const workbookPath = `${appsettings.outputDirectory}/${Utility.getExcelFileNameFromBranch(appsettings.branch)}`;
        const sheetDetails = this.getIntoSheetDetails();
        ExcelUtility.generate(sheetDetails, 'Information', workbookPath);
        let profilesByLang = await this.sonarReadInfo.getProfilesByLangugae('cs');
        const profiles = profilesByLang.profiles;
        let rules = await this.getRulesByQualityProfile([...profiles].map((profile: any) => profile.key));
        this.setCountFromSheetFormulaForData(rules);
        ExcelUtility.generate(rules, 'Rules', workbookPath, true, 'sheetIdentifier');
        for (let i = 0; i < rules.length; i++) {
            console.log(`Getting Issue for rule ${rules[i].sheetIdentifier} - Rule Count ${i + 1} / ${rules.length}`);
            const issues = await this.getAllIssuesByRule(rules[i].key);
            if (issues.length > 0) {
                const mappedIssues = issues.flat().map((issue: any) => { return { key: issue.key, severity: issue.severity, message: issue.message, line: issue.line, component: issue.component } });
                ExcelUtility.generate(mappedIssues, rules[i].sheetIdentifier, workbookPath);
            }
        }
        console.timeEnd('ExportSonarIssuesExcel');
    }

    private readonly getRulesByQualityProfile = async (profiles: string[]) => {
        const rules = [];
        for (let i = 0; i < profiles.length; i++) {

            let hasNextPageForProfileRules = true;
            let count = 0;
            while (hasNextPageForProfileRules) {
                count++;
                const { rules: rulesPage, hasNextPage } = await this.getRulesByQualityProfilePageNumber(profiles[i], count);
                const rulesArray = [...rulesPage.rules].map((rule: any) => {
                    const sheetName = (rule.key as string).split(':')[1];
                    return { key: rule.key, sheetIdentifier: sheetName, name: rule.name, severity: rule.severity, action: 'noaction' }
                });
                const uniqueRulesArray = this.removeDuplicates(rulesArray, 'key');
                rules.push(...uniqueRulesArray);
                hasNextPageForProfileRules = hasNextPage;
            }
        }

        return rules;

    }

    private readonly getRulesByQualityProfilePageNumber = async (profile: string, pageNumber: number) => {
        const rulesReponse = await this.sonarReadInfo.getRulesByQualityProfile(profile, pageNumber, appsettings.pageSize);
        const total = rulesReponse.total;
        const hasNextPage = total > pageNumber * appsettings.pageSize;
        return { rules: rulesReponse, hasNextPage };
    }

    private readonly getAllIssuesByRule = async (rule: string) => {
        let hasNextPageForRuleIssues = true;
        let count = 0;
        const issues = [];
        while (hasNextPageForRuleIssues) {
            count++;
            const issuesReponse = await this.sonarReadInfo.getIssuesByRuleProfile(rule, count, appsettings.pageSize);
            if (issuesReponse.issues.length === 0) {
                hasNextPageForRuleIssues = false;
            }
            else {
                issues.push(...issuesReponse.issues);
                hasNextPageForRuleIssues = issuesReponse.total > appsettings.pageSize * count;
            }
        }
        return issues;
    }

    private readonly getIntoSheetDetails = () => {
        const information = [];
        information.push({ info: `This is a utility generated report for the branch  ${appsettings.branch}` });
        information.push({ info: `To mark issues as "Accept"/"False Positive"/"Re Open" please use values "accept"/"falsepositive"/"reopen" respectively on rules sheet of same workbook.\nFor any other acceptable action [please refer acitions on sonarqube page web api documentation, look for 'api/issues/bulk_change' api and parameter - dotransition]` });
        information.push({ info: `Once values are marked, please run applcation and select option 2 to update the issues in sonarqube` });

        return information;
    }

    private removeDuplicates(array: any[], key: string) {
        const seen = new Set();
        return array.filter(item => {
            const keyValue = item[key];
            if (seen.has(keyValue)) {
                return false;
            } else {
                seen.add(keyValue);
                return true;
            }
        });
    }

    private setCountFromSheetFormulaForData(data: any[]) {
        for (let i = 0; i < data.length; i++) {
            const formula = `=COUNTA(INDIRECT(B${i+2}&"!A:A")) - 1`;
            data[i].count = formula
        }
    }
}
