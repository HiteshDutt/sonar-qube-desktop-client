import { ISonarDescription } from "./description.interface";
import { ISonarImpact } from "./impact.interface";

export interface ISonarRule {
    key: string;
    repo: string;
    name: string;
    createdAt: Date;
    htmlDesc: string;
    mdDesc: string;
    severity: string;
    status: string;
    isTemplate: boolean;
    tags: string[];
    sysTags: string[];
    lang: string;
    langName: string;
    params: string[];
    defaultDebtRemFnType: string;
    debtRemFnType: string;
    type: string;
    defaultRemFnType: string;
    defaultRemFnBaseEffort: string;
    remFnType: string;
    remFnBaseEffort: string;
    remFnOverloaded: boolean;
    scope: string;
    isExternal: boolean;
    descriptionSections: ISonarDescription[];
    educationPrinciples: string[];
    updatedAt: Date;
    cleanCodeAttribute: string;
    cleanCodeAttributeCategory: string;
    impacts: ISonarImpact[];
  }