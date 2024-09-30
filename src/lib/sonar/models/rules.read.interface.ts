import { ISonarCommonResponse } from "./response.common.interface";
import { ISonarRule } from "./rule.interface";

export interface ISonarRulesRead extends ISonarCommonResponse{
    rules: ISonarRule[];
}