import "reflect-metadata"
import { SonarReadInfo } from "../../../../src/lib/sonar/read-info";
import { Api } from "../../../../src/lib/api/api";
import { appsettings } from "../../../../src/config/appsettings";
import { ISonarProfileRead } from "../../../../src/lib/sonar/models/profiles.read.interface";
import { ISonarRulesRead } from "../../../../src/lib/sonar/models/rules.read.interface";
import { ISonarIssuesRead } from "../../../../src/lib/sonar/models/issues.read.interface";

jest.mock("../../../../src/lib/api/api");

describe("SonarReadInfo", () => {
    let sonarReadInfo: SonarReadInfo;
    let apiMock: jest.Mocked<Api>;

    beforeEach(() => {
        apiMock = new Api() as jest.Mocked<Api>;
        sonarReadInfo = new SonarReadInfo(apiMock);
    });

    it("should fetch profiles by language", async () => {
        const language = "typescript";
        const mockResponse: ISonarProfileRead = {
            profiles: [
                {
                    key: "profile1",
                    name: "Profile 1",
                    actions: { associateProjects: false, copy: false, delete: false, edit: false, setAsDefault: false },
                    activeDeprecatedRuleCount: 0,
                    activeRuleCount: 0,
                    isDefault: false,
                    isInherited: false,
                    isBuiltIn: false,
                    language: "typescript",
                    languageName: "TypeScript",
                    lastUsed: new Date(),
                    projectCount: 0,
                    rulesUpdatedAt: new Date(),
                    userUpdatedAt: new Date()
                }
            ]
        };
        apiMock.get.mockResolvedValue(mockResponse);

        const result = await sonarReadInfo.getProfilesByLangugae(language);

        expect(apiMock.get).toHaveBeenCalledWith(
            `${appsettings.sonarBaseUrl}/api/qualityprofiles/search`,
            { 'project': appsettings.sonarProjectKey, 'language': language },
            { 'Authorization': `Bearer ${appsettings.sonarToken}` }
        );
        expect(result).toBe(mockResponse);
    });

    it("should handle errors when fetching profiles by language", async () => {
        const language = "typescript";
        const mockError = new Error("Network error");
        apiMock.get.mockRejectedValue(mockError);

        await expect(sonarReadInfo.getProfilesByLangugae(language)).rejects.toThrow("Network error");
    });

    it("should fetch rules by quality profile", async () => {
        const qualityProfile = "profile1";
        const pageNumber = 1;
        const pageSize = 10;
        const total = 1;
        const mockResponse: ISonarRulesRead = {
            total: total,
            p: pageNumber,
            ps: pageSize,
            rules: [
                {
                    key: "rule1",
                    name: "Rule 1",
                    htmlDesc: "Description",
                    mdDesc: "Description",
                    severity: "MAJOR",
                    status: "READY",
                    isTemplate: false,
                    tags: ["tag1"],
                    sysTags: ["tag2"],
                    lang: "typescript",
                    langName: "TypeScript",
                    params: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    debtRemFnType: "CONSTANT_ISSUE",
                    cleanCodeAttribute: "",
                    isExternal: false,
                    cleanCodeAttributeCategory: "",
                    defaultDebtRemFnType: "CONSTANT_ISSUE",
                    defaultRemFnBaseEffort: "0",
                    defaultRemFnType: "CONSTANT_ISSUE",
                    descriptionSections: [],
                    educationPrinciples: [],
                    impacts: [],
                    remFnBaseEffort: "0",
                    remFnOverloaded: false,
                    remFnType: "CONSTANT_ISSUE",
                    repo: "sonarqube",
                    scope: "MAIN",
                    type: "CODE_SMELL",
                }
            ],
            paging: { pageIndex: pageNumber, pageSize: pageSize, total: total }
        };
        apiMock.get.mockResolvedValue(mockResponse);

        const result = await sonarReadInfo.getRulesByQualityProfile(qualityProfile, pageNumber, pageSize);

        expect(apiMock.get).toHaveBeenCalledWith(
            `${appsettings.sonarBaseUrl}/api/rules/search`,
            { 'qprofile': qualityProfile, p: pageNumber, ps: pageSize },
            { 'Authorization': `Bearer ${appsettings.sonarToken}` }
        );
        expect(result).toBe(mockResponse);
    });

    it("should handle errors when fetching rules by quality profile", async () => {
        const qualityProfile = "profile1";
        const pageNumber = 1;
        const pageSize = 10;
        const mockError = new Error("Network error");
        apiMock.get.mockRejectedValue(mockError);

        await expect(sonarReadInfo.getRulesByQualityProfile(qualityProfile, pageNumber, pageSize)).rejects.toThrow("Network error");
    });

    it("should fetch issues by rule profile", async () => {
        const ruleKey = "rule1";
        const pageNumber = 1;
        const pageSize = 10;
        const total = 1;
        const mockResponse: ISonarIssuesRead = {
            total: total,
            p: pageNumber,
            ps: pageSize,
            issues: [
                {
                    key: "issue1",
                    rule: "rule1",
                    severity: "MAJOR",
                    component: "component1",
                    project: "project1",
                    line: 1,
                    hash: "hash1",
                    textRange: { startLine: 1, endLine: 1, startOffset: 0, endOffset: 10 },
                    flows: [],
                    status: "OPEN",
                    message: "Issue message",
                    effort: "10min",
                    debt: "10min",
                    author: "author1",
                    tags: ["tag1"],
                    type: "CODE_SMELL",
                    scope: "MAIN",
                    quickFixAvailable: false,
                    creationDate: new Date(),
                    branch: "branch1",
                    cleanCodeAttribute: "",
                    cleanCodeAttributeCategory: "",
                    codeVariants: [],
                    impacts: [],
                    issueStatus: "OPEN",
                    messageFormattings: [],
                    prioritizedRule: false,
                    updateDate: new Date(),
                }
            ],
            paging: { pageIndex: pageNumber, pageSize: pageSize, total: total }
        };
        apiMock.get.mockResolvedValue(mockResponse);

        const result = await sonarReadInfo.getIssuesByRuleProfile(ruleKey, pageNumber, pageSize);

        expect(apiMock.get).toHaveBeenCalledWith(
            `${appsettings.sonarBaseUrl}/api/issues/search`,
            { 'componentKeys': appsettings.sonarProjectKey, 'branch': appsettings.branch, 'rules': ruleKey, 'issueStatuses': 'OPEN,ACCEPTED', p: pageNumber, ps: pageSize },
            { 'Authorization': `Bearer ${appsettings.sonarToken}` }
        );
        expect(result).toBe(mockResponse);
    });

    it("should handle errors when fetching issues by rule profile", async () => {
        const ruleKey = "rule1";
        const pageNumber = 1;
        const pageSize = 10;
        const mockError = new Error("Network error");
        apiMock.get.mockRejectedValue(mockError);

        await expect(sonarReadInfo.getIssuesByRuleProfile(ruleKey, pageNumber, pageSize)).rejects.toThrow("Network error");
    });
});