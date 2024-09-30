import { ISonarIssue } from "./issue.interfact";
import { ISonarCommonResponse } from "./response.common.interface";

export interface ISonarIssuesRead extends ISonarCommonResponse {
    issues: ISonarIssue[];
}