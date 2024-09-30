import "reflect-metadata"
import { SonarWriteUpdateInfo } from "../../../../src/lib/sonar/write-update-info";
import { Api } from "../../../../src/lib/api/api";
import { appsettings } from "../../../../src/config/appsettings";
import { Utility } from "../../../../src/lib/utility/utility";
import { ISonarBulkIssuesResponse } from "../../../../src/lib/sonar/models/bulk-issues.response.interface";

jest.mock("../../../../src/lib/api/api");
jest.mock("../../../../src/config/appsettings");
jest.mock("../../../../src/lib/utility/utility");

describe("SonarWriteUpdateInfo", () => {
    let api: Api;
    let sonarWriteUpdateInfo: SonarWriteUpdateInfo;

    beforeEach(() => {
        api = new Api();
        sonarWriteUpdateInfo = new SonarWriteUpdateInfo(api);
    });

    it("should call api.post with correct parameters", async () => {
        const keysCsv = "key1,key2,key3";
        const transition = "transition";
        const mockResponse: ISonarBulkIssuesResponse = { total: 3, success: 3, ignored: 0, failures: 0 };
        const postSpy = jest.spyOn(api, "post").mockResolvedValue(mockResponse);
        const setSonarHeaderSpy = jest.spyOn(Utility, "setSonarHeader").mockReturnValue({ Authorization: "Bearer token" });

        appsettings.sonarBaseUrl = "http://example.com/";
        appsettings.sonarToken = "token";

        const response = await sonarWriteUpdateInfo.updateBulkIssuesToSonar(keysCsv, transition);

        expect(postSpy).toHaveBeenCalledWith(
            "http://example.com/api/issues/bulk_change",
            expect.any(FormData),
            { Authorization: "Bearer token" }
        );
        expect(setSonarHeaderSpy).toHaveBeenCalledWith("token");
        expect(response).toBe(mockResponse);
    });

    it("should append correct data to FormData", async () => {
        const keysCsv = "key1,key2,key3";
        const transition = "transition";
        const mockResponse: ISonarBulkIssuesResponse = { total: 3, success: 3, ignored: 0, failures: 0 };
        jest.spyOn(api, "post").mockResolvedValue(mockResponse);
        jest.spyOn(Utility, "setSonarHeader").mockReturnValue({ Authorization: "Bearer token" });

        appsettings.sonarBaseUrl = "http://example.com/";
        appsettings.sonarToken = "token";

        const formDataAppendSpy = jest.spyOn(FormData.prototype, "append");

        await sonarWriteUpdateInfo.updateBulkIssuesToSonar(keysCsv, transition);

        expect(formDataAppendSpy).toHaveBeenCalledWith("issues", keysCsv);
        expect(formDataAppendSpy).toHaveBeenCalledWith("do_transition", transition);
    });
});