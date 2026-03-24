/**
 * Parses CLI arguments of the form:
 *   --key=value
 *   --key value
 *   --flag          (treated as boolean true)
 *
 * Returns a plain object with camelCase keys.
 */
export function parseCliArgs(argv: string[] = process.argv.slice(2)): Record<string, string | boolean> {
    const result: Record<string, string | boolean> = {};

    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];

        if (!arg.startsWith('--')) continue;

        const stripped = arg.slice(2);

        if (stripped.includes('=')) {
            // --key=value
            const [key, ...rest] = stripped.split('=');
            result[key] = rest.join('=');
        } else {
            // --key value  or  --flag
            const next = argv[i + 1];
            if (next !== undefined && !next.startsWith('--')) {
                result[stripped] = next;
                i++;
            } else {
                result[stripped] = true;
            }
        }
    }

    return result;
}

/**
 * Supported CLI arguments for the read operation.
 *
 * Usage example:
 *   ts-node src/index.read.ts \
 *     --sonarBaseUrl=http://mysonar:9000 \
 *     --sonarToken=mytoken \
 *     --sonarProjectKey=MY_PROJECT \
 *     --branch=develop \
 *     --languages=cs,ts \
 *     --issueStatuses=OPEN \
 *     --outputDirectory=./out \
 *     --pageSize=200 \
 *     --parallelReadCalls=50 \
 *     --requireParallelRuleRead
 */
export interface ReadCliArgs {
    sonarBaseUrl?: string;
    sonarToken?: string;
    sonarProjectKey?: string;
    branch?: string;
    languages?: string;
    issueStatuses?: string;
    outputDirectory?: string;
    pageSize?: string;
    parallelReadCalls?: string;
    requireParallelRuleRead?: boolean | string;
}
