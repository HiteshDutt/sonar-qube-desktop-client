import { injectable } from "tsyringe";
import { Api } from "../api/api";
import { appsettings } from "../../config/appsettings";
import { ISonarProfileRead } from "./models/profiles.read.interface";
import { ISonarRulesRead } from "./models/rules.read.interface";
import { ISonarIssuesRead } from "./models/issues.read.interface";

@injectable()
export class SonarReadInfo {
    constructor(private api: Api) {
    }

    async getProfilesByLangugae(language: string) : Promise<ISonarProfileRead> {
        let url = `${appsettings.sonarBaseUrl}/api/qualityprofiles/search`;
        const response =  await this.api.get<ISonarProfileRead>(url, { 'project': appsettings.sonarProjectKey , 'language': language } ,this.setSonarHeader());
        return response;
    }

    async getRulesByQualityProfile(qualityProfile: string, pageNumber: number, pageSize: number) : Promise<ISonarRulesRead> {
        let url = `${appsettings.sonarBaseUrl}/api/rules/search`;
        const response = await this.api.get<ISonarRulesRead>(url, { 'qprofile': qualityProfile , p: pageNumber, ps: pageSize } ,this.setSonarHeader());
        return response;
    }

    async getIssuesByRuleProfile(ruleKey: string, pageNumber: number, pageSize: number) : Promise<ISonarIssuesRead> {
        let url = `${appsettings.sonarBaseUrl}/api/issues/search`;
        const response = await  this.api.get<ISonarIssuesRead>(url, { 'componentKeys': appsettings.sonarProjectKey, 'branch': appsettings.branch, 'rules': ruleKey, 'resolved': false, p: pageNumber, ps: pageSize } ,this.setSonarHeader());
        return response;
    }

    private setSonarHeader = () => {
        return {'Authorization' : `Bearer ${appsettings.sonarToken}`};
    }
}