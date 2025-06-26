import { Api } from "../api/api";
import { appsettings } from "../../config/appsettings";
import { ISonarBulkIssuesResponse } from "./models/bulk-issues.response.interface";
import { Utility } from "../utility/utility";
import { autoInjectable } from "tsyringe";

@autoInjectable()
export class SonarWriteUpdateInfo{
    constructor(private readonly api: Api) {
    }

    updateBulkIssuesToSonar = async (keysCsv: string, transition: string, assignee: string = 'undefined') => {
        let url = `${appsettings.sonarBaseUrl}api/issues/bulk_change`;
        const formData = new FormData();
        formData.append('issues', keysCsv);
        formData.append('do_transition', transition);
        if (assignee!= 'undefined') {
        formData.append('assign', assignee);
        }
        const response = await this.api.post<ISonarBulkIssuesResponse>(url, formData, Utility.setSonarHeader(appsettings.sonarToken));
        return response;
    }
}