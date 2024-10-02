import { Api } from '../lib/api/api';
import { UpdateSonarIssuesExcel } from '../business/update-sonar-issues-excel';
import { container } from 'tsyringe';
import { SonarReadInfo } from '../lib/sonar/read-info';
import { SonarWriteUpdateInfo } from '../lib/sonar/write-update-info';
import { ExportSonarIssuesExcel } from '../business/export-sonar-issues-excel';
import { CompareSonarIssuesExcel } from '../business/compare-sonar-issue-excel';

container.register('Api', { useClass: Api });
container.register('SonarReadInfo', { useClass: SonarReadInfo });
container.register('SonarWriteUpdateInfo',{useClass: SonarWriteUpdateInfo});
container.register('UpdateSonarIssuesExcel', { useClass: UpdateSonarIssuesExcel });
container.register('ExportSonarIssuesExcel',{useClass: ExportSonarIssuesExcel});
container.register('CompareSonarIssuesExcel',{useClass: CompareSonarIssuesExcel});

export default container;
