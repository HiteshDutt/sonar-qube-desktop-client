import { Api } from '../lib/api/api';
import { UpdateSonarIssuesExcel } from '../business/update-sonar-issues-excel';
import { container } from 'tsyringe';
import { SonarReadInfo } from '../lib/sonar/read-info';
import { SonarWriteUpdateInfo } from '../lib/sonar/write-update-info';
import { ExportSonarIssuesExcel } from '../business/export-sonar-issues-excel';
import { CompareSonarIssuesExcel } from '../business/compare-sonar-issue-excel';
import { ServiceBusListener } from '../lib/servicebus/servicebus-listener';
import { ServiceBusSender } from '../lib/servicebus/servicebus-sender';
import { FileWatcher } from '../lib/filewatcher/file-watcher';
import { FileUtility } from '../lib/utility/file-utility';

container.register('Api', { useClass: Api });
container.register('SonarReadInfo', { useClass: SonarReadInfo });
container.register('SonarWriteUpdateInfo',{useClass: SonarWriteUpdateInfo});
container.register('UpdateSonarIssuesExcel', { useClass: UpdateSonarIssuesExcel });
container.register('ExportSonarIssuesExcel',{useClass: ExportSonarIssuesExcel});
container.register('CompareSonarIssuesExcel',{useClass: CompareSonarIssuesExcel});
container.register('ServiceBusListener', { useClass: ServiceBusListener });
container.register('ServiceBusSender', { useClass: ServiceBusSender });
container.register('FileWatcher', { useClass: FileWatcher });
container.register('FileUtility', { useClass: FileUtility });
container.register('ServiceBusSender', { useClass: ServiceBusSender });
container.register('FileWatcher', { useClass: FileWatcher });

export default container;
