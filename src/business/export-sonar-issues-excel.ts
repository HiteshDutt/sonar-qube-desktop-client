import { ExcelUtility } from '../lib/excel/excel-utility';
import { appsettings } from '../config/appsettings';
import { SonarReadInfo } from '../lib/sonar/read-info';
import { Utility } from '../lib/utility/utility';
import fs from 'fs';
import { autoInjectable } from 'tsyringe';
import { ISonarIssuesWithSheet } from '../lib/sonar/models/issue.interfact';

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
        let rules: any[] = [];
        for (let lang of appsettings.langugage) {
            let profilesByLang = await this.sonarReadInfo.getProfilesByLangugae(lang);
            const profiles = profilesByLang.profiles;
            rules.push(... await this.getRulesByQualityProfile([...profiles].map((profile: any) => profile.key), lang));
        }
        this.setCountFromSheetFormulaForData(rules);
        ExcelUtility.generate(rules, 'Rules', workbookPath, true, 'sheetIdentifier');
        if(appsettings.requireParallelRuleRead){
            await this.performParallelReadForRules(rules, workbookPath);
        }
        else{
            await this.performSequentialReadForRules(rules, workbookPath);
        }
        
        console.timeEnd('ExportSonarIssuesExcel');
    }

    private readonly getRulesByQualityProfile = async (profiles: string[], lang: string) => {
        const rules = [];
        for (const profile of profiles) {
            let hasNextPageForProfileRules = true;
            let count = 0;
            while (hasNextPageForProfileRules) {
                count++;
                const { rules: rulesPage, hasNextPage } = await this.getRulesByQualityProfilePageNumber(profile, count);
                const rulesArray = [...rulesPage.rules].map((rule: any) => {
                    const sheetName = (rule.key as string).split(':')[1];
                    return { key: rule.key, sheetIdentifier: this.getValidSheetName(sheetName, lang), name: rule.name, severity: rule.severity, language: lang, action: 'noaction' }
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

    private readonly getAllIssuesByRule = async (rule: string, sheetIdentifier: string): Promise<ISonarIssuesWithSheet> => {
        let hasNextPageForRuleIssues = true;
        let count = 0;
        const sonarIssuesWithSheet : ISonarIssuesWithSheet = { issues:[], sheetIdentifier: sheetIdentifier }
        //const issues = [];
        while (hasNextPageForRuleIssues) {
            count++;
            const issuesReponse = await this.sonarReadInfo.getIssuesByRuleProfile(rule, count, appsettings.pageSize);
            if (issuesReponse.issues.length === 0) {
                hasNextPageForRuleIssues = false;
            }
            else {
                sonarIssuesWithSheet.issues.push(...issuesReponse.issues);
                hasNextPageForRuleIssues = issuesReponse.total > appsettings.pageSize * count;
            }
        }
        return sonarIssuesWithSheet;
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
            const formula = `=COUNTA(INDIRECT("'"&B${i + 2}&"'!A:A")) - 1`
            data[i].count = formula
        }
    }

    private getValidSheetName(sheetName: string, lang: string) {
        const usableLangName = lang.length >= 10 ? lang.substring(0, 10) : lang;

        //get 1st 30 characters if sheet name is more than 30 characters
        const totalLength = (sheetName.length + usableLangName.length);
        const sheetNameendOfTrim = totalLength > 30 ?
            totalLength - usableLangName.length - 20
            :
            totalLength;
        const name = totalLength > 30 ? sheetName.substring(0, sheetName.length - sheetNameendOfTrim) : sheetName;
        return `${lang}-${name}`
    }

    private async performParallelReadForRules(rules: any[], workbookPath: string){
        let promises: Promise<ISonarIssuesWithSheet>[] = [];
        for (const {index, rule}  of rules.map((rule, index) => ({rule, index}))) {
            console.log(`Getting Issue for rule ${rule.sheetIdentifier} - Rule Count ${index + 1} / ${rules.length}`);
            promises.push(this.getAllIssuesByRule(rule.key, rule.sheetIdentifier));

            if (index % appsettings.parallelReadCalls === 0) {
                const promiseResolve = await Promise.all(promises)

                for (let issues of promiseResolve){
                    if (issues.issues.length > 0) {
                        const mappedIssues = issues.issues.flat().map((issue: any) => { return { key: issue.key, severity: issue.severity, message: issue.message, line: issue.line, component: issue.component } });
                        ExcelUtility.generate(mappedIssues, issues.sheetIdentifier, workbookPath);
                    }
                }

                promises = [];
            }
        }
    }

    private async performSequentialReadForRules(rules: any[], workbookPath: string){
        for (let i = 0; i < rules.length; i++) {
            console.log(`Getting Issue for rule ${rules[i].sheetIdentifier} - Rule Count ${i + 1} / ${rules.length}`);
            const issues = await this.getAllIssuesByRule(rules[i].key, rules[i].sheetIdentifier);
            if (issues.issues.length > 0) {
                const mappedIssues = issues.issues.flat().map((issue: any) => { return { key: issue.key, severity: issue.severity, message: issue.message, line: issue.line, component: issue.component } });
                ExcelUtility.generate(mappedIssues, rules[i].sheetIdentifier, workbookPath);
            }
        }
    }
}
