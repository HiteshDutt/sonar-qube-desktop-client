import { ISonarImpact } from "./impact.interface";
import { ISonarRange } from "./range.interface";

export interface ISonarIssue {
    key: string;
    rule: string;
    severity: string;
    component: string;
    project: string;
    line: number;
    hash: string;
    textRange: ISonarRange;
    flows: string[];
    status: string;
    message: string;
    effort: string;
    debt: string;
    author: string;
    tags: string[];
    creationDate: Date;
    updateDate: Date;
    type: string;
    branch: string;
    scope: string;
    quickFixAvailable: boolean;
    messageFormattings: string[];
    codeVariants: string[];
    cleanCodeAttribute: string;
    cleanCodeAttributeCategory: string;
    impacts: ISonarImpact[];
    issueStatus: string;
    prioritizedRule: boolean;
  }