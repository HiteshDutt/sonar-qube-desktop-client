// import { ExportSonarIssuesExcel } from '../../../src/business/export-sonar-issues-excel';
// import { SonarReadInfo } from '../../../src/lib/sonar/read-info';
// import { ExcelUtility } from '../../../src/lib/excel/excel-utility';
// import { appsettings } from '../../../src/config/appsettings';
// import { Api } from "../../../src/lib/api/api";
// import { Utility } from '../../../src/lib/utility/utility';
// import fs from 'fs';

// jest.mock('fs');
// jest.mock('../../../src/lib/excel/excel-utility');
// jest.mock('../../../src/lib/sonar/read-info');
// jest.mock('../../../src/lib/utility/utility');
// jest.mock('"../../../src/lib/api/api"');

// describe('ExportSonarIssuesExcel', () => {
//     let exportSonarIssuesExcel: ExportSonarIssuesExcel;
//     let sonarReadInfoMock: jest.Mocked<SonarReadInfo>;

//     beforeEach(() => {
//         sonarReadInfoMock = new SonarReadInfo(new Api()) as jest.Mocked<SonarReadInfo>;
//         exportSonarIssuesExcel = new ExportSonarIssuesExcel(sonarReadInfoMock);
//     });

//     afterEach(() => {
//         jest.clearAllMocks();
//     });

//     it('should create output directory if it does not exist', async () => {
//         (fs.existsSync as jest.Mock).mockReturnValue(false);
//         (fs.mkdirSync as jest.Mock).mockImplementation(() => {});

//         await exportSonarIssuesExcel.export();

//         expect(fs.existsSync).toHaveBeenCalledWith(appsettings.outputDirectory);
//         expect(fs.mkdirSync).toHaveBeenCalledWith(appsettings.outputDirectory);
//     });

//     it('should not create output directory if it already exists', async () => {
//         (fs.existsSync as jest.Mock).mockReturnValue(true);

//         await exportSonarIssuesExcel.export();

//         expect(fs.existsSync).toHaveBeenCalledWith(appsettings.outputDirectory);
//         expect(fs.mkdirSync).not.toHaveBeenCalled();
//     });

//     it('should generate excel sheets with correct data', async () => {
//         const mockProfiles = { profiles: [{ key: 'profile1' }, { key: 'profile2' }] };
//         const mockRules = [{ key: 'rule1', sheetIdentifier: 'rule1' }, { key: 'rule2', sheetIdentifier: 'rule2' }];
//         const mockIssues = [{ key: 'issue1', severity: 'high', message: 'message1', line: 1, component: 'component1' }];

//         sonarReadInfoMock.getProfilesByLangugae.mockResolvedValue(mockProfiles);
//         exportSonarIssuesExcel.getRulesByQualityProfile = jest.fn().mockResolvedValue(mockRules);
//         exportSonarIssuesExcel.getAllIssuesByRule = jest.fn().mockResolvedValue(mockIssues);

//         await exportSonarIssuesExcel.export();

//         expect(ExcelUtility.generate).toHaveBeenCalledWith(expect.any(Array), 'Information', expect.any(String));
//         expect(ExcelUtility.generate).toHaveBeenCalledWith(mockRules, 'Rules', expect.any(String));
//         expect(ExcelUtility.generate).toHaveBeenCalledWith(expect.any(Array), 'rule1', expect.any(String));
//     });

//     it('should log the correct messages', async () => {
//         const mockProfiles = { profiles: [{ key: 'profile1' }, { key: 'profile2' }] };
//         const mockRules = [{ key: 'rule1', sheetIdentifier: 'rule1' }, { key: 'rule2', sheetIdentifier: 'rule2' }];
//         const mockIssues = [{ key: 'issue1', severity: 'high', message: 'message1', line: 1, component: 'component1' }];

//         sonarReadInfoMock.getProfilesByLangugae.mockResolvedValue(mockProfiles);
//         exportSonarIssuesExcel.getRulesByQualityProfile = jest.fn().mockResolvedValue(mockRules);
//         exportSonarIssuesExcel.getAllIssuesByRule = jest.fn().mockResolvedValue(mockIssues);

//         console.log = jest.fn();

//         await exportSonarIssuesExcel.export();

//         expect(console.log).toHaveBeenCalledWith('Getting Issue for rule rule1 - Rule Count 1 / 2');
//         expect(console.log).toHaveBeenCalledWith('Getting Issue for rule rule2 - Rule Count 2 / 2');
//     });

//     it('should handle no issues for a rule', async () => {
//         const mockProfiles = { profiles: [{ key: 'profile1' }, { key: 'profile2' }] };
//         const mockRules = [{ key: 'rule1', sheetIdentifier: 'rule1' }, { key: 'rule2', sheetIdentifier: 'rule2' }];
//         const mockIssues = [];

//         sonarReadInfoMock.getProfilesByLangugae.mockResolvedValue(mockProfiles);
//         exportSonarIssuesExcel.getRulesByQualityProfile = jest.fn().mockResolvedValue(mockRules);
//         exportSonarIssuesExcel.getAllIssuesByRule = jest.fn().mockResolvedValue(mockIssues);

//         await exportSonarIssuesExcel.export();

//         expect(ExcelUtility.generate).not.toHaveBeenCalledWith(mockIssues, 'rule1', expect.any(String));
//     });
// });