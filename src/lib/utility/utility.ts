export class Utility {

    public static getIssuesInBlockOfNumber(issuesKeys: any[], count: number): string[] {
        const listOfIssues = Utility.chunkArray(issuesKeys, count);
        const returnValue = listOfIssues.map((issues) => issues.map(issue => issue.key).join(','));
        return returnValue;
    }

    public static chunkArray(array: any[], chunkSize: number): any[][] {
        if (array.length === 0) {
            return [];
        }
        const chunk = array.slice(0, chunkSize);
        const remainingChunks = this.chunkArray(array.slice(chunkSize), chunkSize);
        return [chunk, ...remainingChunks];
    }

    public static getExcelFileNameFromBranch(branch: string): string {
        const branchName = `${branch.split('/').pop()}.xlsx`;
        return branchName;
    }

    public static readonly setSonarHeader = (token: string) => {
        return {'Authorization' : `Bearer ${token}`};
    }
}