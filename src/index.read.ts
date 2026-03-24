import "reflect-metadata";
import container from "./di/container.di";
import { ExportSonarIssuesExcel } from "./business/export-sonar-issues-excel";
import { parseCliArgs, ReadCliArgs } from "./config/cli-args";
import { appsettings } from "./config/appsettings";

function applyCliOverrides(args: Record<string, string | boolean>): void {
  const cli = args as unknown as ReadCliArgs;

  if (cli.sonarBaseUrl) appsettings.sonarBaseUrl = cli.sonarBaseUrl;
  if (cli.sonarToken) appsettings.sonarToken = cli.sonarToken;
  if (cli.sonarProjectKey) appsettings.sonarProjectKey = cli.sonarProjectKey;
  if (cli.branch) appsettings.branch = cli.branch;
  if (cli.languages) appsettings.langugage = cli.languages.split(",");
  if (cli.issueStatuses) appsettings.issueStatues = cli.issueStatuses;
  if (cli.outputDirectory) appsettings.outputDirectory = cli.outputDirectory;
  if (cli.pageSize) appsettings.pageSize = parseInt(cli.pageSize, 10);
  if (cli.parallelReadCalls)
    appsettings.parallelReadCalls = parseInt(cli.parallelReadCalls, 10);
  if ("requireParallelRuleRead" in args)
    appsettings.requireParallelRuleRead =
      cli.requireParallelRuleRead === true ||
      cli.requireParallelRuleRead === "true";
}

async function main() {
  const args = parseCliArgs();

  if (Object.keys(args).length > 0) {
    console.log("CLI arguments detected — overriding appsettings:", args);
  }

  applyCliOverrides(args);

  const exportSonarIssuesExcel = container.resolve(ExportSonarIssuesExcel);
  await exportSonarIssuesExcel.export();
}
