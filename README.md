# Sonar Desktop Client

A Node.js/TypeScript utility to export SonarQube issues into Excel, bulk-update issue statuses back to SonarQube, and compare issue reports across branches.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
  - [appsettings.ts](#appsettingsts)
  - [Environment Variables](#environment-variables)
  - [CLI Arguments (Read mode)](#cli-arguments-read-mode)
- [Usage](#usage)
  - [Read — Export Issues to Excel](#read--export-issues-to-excel)
  - [Update — Push Changes back to SonarQube](#update--push-changes-back-to-sonarqube)
  - [Compare — Diff Two Branch Reports](#compare--diff-two-branch-reports)
  - [Run Tests](#run-tests)
- [Output](#output)
- [Docker](#docker)
- [GitHub Actions — Automated Read & Upload to Azure Blob](#github-actions--automated-read--upload-to-azure-blob)
  - [Workflow Inputs](#workflow-inputs)
  - [Required Secrets](#required-secrets)
  - [Azure Federated Identity Setup](#azure-federated-identity-setup)
- [Valid Issue Actions (Update mode)](#valid-issue-actions-update-mode)

---

## Overview

| Mode | Entry Point | What it does |
|------|-------------|--------------|
| **Read** | `src/index.read.ts` | Connects to SonarQube, pulls all issues by rule/quality-profile for the configured branch and languages, and writes them into a structured Excel workbook. |
| **Update** | `src/index.write.ts` | Reads a previously generated Excel workbook, finds rules where an action has been set, and performs a bulk status transition on the matching issues in SonarQube. |
| **Compare** | `src/index.compare.ts` | Reads two Excel exports (from two different branches) and produces a diff workbook colour-coded by status: resolved, introduced, or persisting. |

---

## Architecture

```
src/
├── index.read.ts           # Entry point — Read mode
├── index.write.ts          # Entry point — Update mode
├── index.compare.ts        # Entry point — Compare mode
├── business/
│   ├── export-sonar-issues-excel.ts    # Read orchestration
│   ├── update-sonar-issues-excel.ts    # Update orchestration
│   └── compare-sonar-issue-excel.ts    # Compare orchestration
├── config/
│   ├── appsettings.ts      # Central configuration (env vars + defaults)
│   └── cli-args.ts         # CLI argument parser for Read mode
├── di/
│   └── container.di.ts     # Dependency injection (tsyringe)
└── lib/
    ├── api/api.ts           # Axios HTTP wrapper
    ├── excel/
    │   └── excel-utility.ts # Excel read/write helpers (xlsx-style)
    ├── sonar/
    │   ├── read-info.ts     # SonarQube read API calls
    │   ├── write-update-info.ts  # SonarQube write/bulk-change API calls
    │   └── models/          # TypeScript interfaces for API responses
    └── utility/utility.ts   # Shared helpers (filename generation, etc.)
```

---

## Prerequisites

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) v18 or above
- A running SonarQube instance with a valid user token

---

## Installation

```bash
git clone https://github.com/HiteshDutt/sonar-qube-desktop-client.git
cd sonar-qube-desktop-client
npm install
```

---

## Configuration

### appsettings.ts

Located at [`src/config/appsettings.ts`](src/config/appsettings.ts). All values can be overridden by environment variables or (for Read mode) CLI arguments — see sections below.

| Setting | Description |
|---------|-------------|
| `sonarBaseUrl` | Base URL of your SonarQube server (e.g. `http://localhost:9000`) |
| `sonarToken` | User token from SonarQube ([how to generate](https://docs.sonarsource.com/sonarqube/9.8/user-guide/user-account/generating-and-using-tokens/)) |
| `sonarProjectKey` | Project key as shown in SonarQube |
| `branch` | Branch to export issues from (must already have been analysed in SonarQube) |
| `compareBranch` | Array of two branch names used in Compare mode |
| `langugage` | Array of language codes to scan (e.g. `['cs', 'ts']`) |
| `issueStatues` | Issue status filter — e.g. `OPEN` |
| `pageSize` | Records per API request (max `500`) |
| `maxRecordsToBeUpdaate` | Max issues to update in a single Update run |
| `outputDirectory` | Directory where Excel files are written/read |
| `parallelReadCalls` | Number of concurrent API calls in parallel read mode |
| `requireParallelRuleRead` | `true` to fetch rule issues in parallel batches |

### Environment Variables

All sensitive or deployment-specific values can be set via environment variables, which take precedence over the hardcoded defaults in `appsettings.ts`.

| Environment Variable | Maps to |
|----------------------|---------|
| `SONAR_BASE_URL` | `sonarBaseUrl` |
| `SONAR_TOKEN` | `sonarToken` |
| `SONAR_PROJECT_KEY` | `sonarProjectKey` |
| `SONAR_BRANCH` | `branch` |
| `SONAR_LANGUAGES` | `langugage` (comma-separated, e.g. `cs,ts`) |
| `SONAR_ISSUE_STATUSES` | `issueStatues` |
| `OUTPUT_DIRECTORY` | `outputDirectory` |
| `PAGE_SIZE` | `pageSize` |
| `MAX_RECORDS_TO_BE_UPDATED` | `maxRecordsToBeUpdaate` |

### CLI Arguments (Read mode)

When running Read mode directly, you can override any setting via CLI arguments. **CLI arguments take the highest precedence** (CLI > env var > appsettings default).

| Argument | Description |
|----------|-------------|
| `--sonarBaseUrl=<url>` | SonarQube base URL |
| `--sonarToken=<token>` | SonarQube user token |
| `--sonarProjectKey=<key>` | SonarQube project key |
| `--branch=<branch>` | Branch name |
| `--languages=<cs,ts>` | Comma-separated language codes |
| `--issueStatuses=<OPEN>` | Issue status filter |
| `--outputDirectory=<path>` | Output directory |
| `--pageSize=<number>` | Page size |
| `--parallelReadCalls=<number>` | Parallel call count |
| `--requireParallelRuleRead` | Flag — enables parallel rule reading |

**Example:**
```bash
npx ts-node ./src/index.read.ts \
  --branch=develop \
  --languages=cs,ts \
  --issueStatuses=OPEN \
  --outputDirectory=./output \
  --pageSize=200
```

---

## Usage

### Read — Export Issues to Excel

Exports all SonarQube issues for the configured project/branch/languages into an Excel workbook.

```bash
npm run dev:read
```

Or with CLI overrides:
```bash
npx ts-node ./src/index.read.ts --branch=develop --languages=cs,ts
```

The output workbook will have:
- An **Information** sheet describing the report
- A **Rules** sheet listing all rules with issue counts
- One **sheet per rule** containing the individual issues

### Update — Push Changes back to SonarQube

After reviewing the generated Excel:

1. Open the workbook from the `output` directory
2. On the **Rules** sheet, set the `action` column to one of the [valid actions](#valid-issue-actions-update-mode) for the rules you want to update
3. Run:

```bash
npm run dev:update
```

### Compare — Diff Two Branch Reports

Generates a colour-coded comparison workbook between two branch exports.

| Colour | Meaning |
|--------|---------|
| 🟢 Green | Issue resolved since first branch |
| 🔴 Red | Issue introduced in second branch |
| 🔵 Blue | Issue persists across both branches |

**Prerequisites:**
1. Run **Read** mode for both branches (results must exist in the output directory)
2. Set `compareBranch` in `appsettings.ts` to `['branch-one', 'branch-two']`

```bash
npm run dev:compare
```

### Run Tests

```bash
npm test
```

---

## Output

Excel files are written to `./output` by default (configurable via `outputDirectory`). File names are derived from the project key and branch name, e.g.:

```
./output/MY_PROJECT_develop.xlsx
```

---

## Docker

A Docker image is available on [Docker Hub](https://hub.docker.com/r/hiteshdutt/sonar-server-excel-extractor).

The image defaults to running **Read** mode (`dist/index.read.js`).

**Build locally:**
```bash
docker build -t sonar-desktop-client .
```

**Run:**
```bash
docker run \
  -e SONAR_BASE_URL=http://your-sonar:9000 \
  -e SONAR_TOKEN=your_token \
  -e SONAR_PROJECT_KEY=YOUR_PROJECT \
  -e SONAR_BRANCH=main \
  -e SONAR_LANGUAGES=cs \
  -v $(pwd)/output:/app/output \
  sonar-desktop-client
```

---

## GitHub Actions — Automated Read & Upload to Azure Blob

The workflow [`.github/workflows/sonar-read.yml`](.github/workflows/sonar-read.yml) automates the Read mode on a schedule or on demand, and uploads the generated Excel output to **Azure Blob Storage** using **OIDC Federated Credentials** (no long-lived secrets).

**Triggers:**
- **Manual** (`workflow_dispatch`) — with runtime inputs
- **Scheduled** — daily at midnight UTC using input defaults

### Workflow Inputs

Provided at run time when triggering manually via the GitHub UI:

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `branch` | Yes | `main` | SonarQube branch to read |
| `languages` | Yes | `cs` | Comma-separated language codes |
| `issueStatuses` | No | `OPEN` | Issue status filter |
| `outputDirectory` | No | `./output` | Local output path |
| `pageSize` | No | `500` | API page size |
| `parallelReadCalls` | No | `100` | Parallel API calls |
| `requireParallelRuleRead` | No | `false` | Enable parallel rule reading |

### Required Secrets

Configure these in **Settings → Secrets and variables → Actions** of your repository:

| Secret | Description |
|--------|-------------|
| `SONAR_BASE_URL` | SonarQube server base URL |
| `SONAR_TOKEN` | SonarQube user token |
| `SONAR_PROJECT_KEY` | SonarQube project key |
| `AZURE_CLIENT_ID` | App Registration client ID |
| `AZURE_TENANT_ID` | Azure AD tenant ID |
| `AZURE_SUBSCRIPTION_ID` | Azure subscription ID |
| `AZ_STORAGE_ACCOUNT_NAME` | Azure Storage account name |
| `AZ_STORAGE_CONTAINER_NAME` | Blob container name |

### Azure Federated Identity Setup

To use OIDC (no client secret required):

1. In **Azure AD → App Registrations**, open your app registration
2. Go to **Certificates & secrets → Federated credentials → Add credential**
3. Select **GitHub Actions deploying Azure resources**
4. Set:
   - **Organisation:** `HiteshDutt`
   - **Repository:** `sonar-qube-desktop-client`
   - **Entity:** `Branch` → `main` (or `*` for all branches/triggers)
5. Assign the app registration the **Storage Blob Data Contributor** role on the target storage account

---

## Valid Issue Actions (Update mode)

Set these in the `action` column of the **Rules** sheet before running Update mode:

| Value in Excel | SonarQube Transition |
|----------------|----------------------|
| `accept` | Accept as known issue |
| `falsepositive` / `false-positive` | Mark as false positive |
| `reopen` / `open` | Re-open the issue |
| `resolve` / `resolved` | Resolve the issue |
| `confirm` / `confirmed` | Confirm the issue |
| `wontfix` / `wont-fix` | Won't fix |
| `noaction` | *(skip — no change made)* |

