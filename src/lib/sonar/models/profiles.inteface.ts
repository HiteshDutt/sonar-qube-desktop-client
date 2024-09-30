import { ISonarAction } from "./action.interface";

export interface ISonarProfile{
        key: string;
        name: string;
        language: string;
        languageName: string;
        isInherited: boolean;
        isDefault: boolean;
        activeRuleCount: number;
        activeDeprecatedRuleCount: number;
        projectCount: number;
        rulesUpdatedAt: Date;
        lastUsed: Date;
        userUpdatedAt: Date;
        isBuiltIn: boolean;
        actions: ISonarAction
}