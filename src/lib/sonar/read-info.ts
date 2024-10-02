import { Api } from "../api/api";
import { appsettings } from "../../config/appsettings";
import { ISonarProfileRead } from "./models/profiles.read.interface";
import { ISonarRulesRead } from "./models/rules.read.interface";
import { ISonarIssuesRead } from "./models/issues.read.interface";
import { Utility } from "../utility/utility";
import { autoInjectable } from "tsyringe";

@autoInjectable()
export class SonarReadInfo {
    constructor(private readonly api: Api) {
    }

    async getProfilesByLangugae(language: string) : Promise<ISonarProfileRead> {
        let url = `${appsettings.sonarBaseUrl}/api/qualityprofiles/search`;
        const response =  await this.api.get<ISonarProfileRead>(url, { 'project': appsettings.sonarProjectKey , 'language': language } ,Utility.setSonarHeader(appsettings.sonarToken));
        return response;
    }

    async getRulesByQualityProfile(qualityProfile: string, pageNumber: number, pageSize: number) : Promise<ISonarRulesRead> {
        let url = `${appsettings.sonarBaseUrl}/api/rules/search`;
        const response = await this.api.get<ISonarRulesRead>(url, { 'qprofile': qualityProfile , p: pageNumber, ps: pageSize } ,Utility.setSonarHeader(appsettings.sonarToken));
        return response;
    }

    async getIssuesByRuleProfile(ruleKey: string, pageNumber: number, pageSize: number) : Promise<ISonarIssuesRead> {
        let url = `${appsettings.sonarBaseUrl}/api/issues/search`;
        const response = await  this.api.get<ISonarIssuesRead>(url, { 'componentKeys': appsettings.sonarProjectKey, 'branch': appsettings.branch, 'rules': ruleKey, 'issueStatuses': 'OPEN,ACCEPTED', p: pageNumber, ps: pageSize } ,Utility.setSonarHeader(appsettings.sonarToken));
        return response;
    }
}