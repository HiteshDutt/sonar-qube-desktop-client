import { injectable } from "tsyringe";
import { Api } from "../api/api";
import { appsettings } from "../../config/appsettings";
import { ISonarBulkIssuesResponse } from "./models/bulk-issues.response.interface";
import { Utility } from "../utility/utility";

@injectable()
export class SonarWriteUpdateInfo{
    constructor(private api: Api) {
    }

    updateBulkIssuesToSonar = async (keysCsv: string, transition: string) => {
        let url = `${appsettings.sonarBaseUrl}api/issues/bulk_change`;
        const formData = new FormData();
        formData.append('issues', keysCsv);
        formData.append('do_transition', transition);
        const response = await this.api.post<ISonarBulkIssuesResponse>(url, formData ,Utility.setSonarHeader(appsettings.sonarToken));
        return response;
    }
}