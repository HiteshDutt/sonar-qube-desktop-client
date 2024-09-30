import { Utility } from '../../../../src/lib/utility/utility';

describe('Utility', () => {
    describe('getIssuesInBlockOfNumber', () => {
        it('should return an empty array when issuesKeys is empty', () => {
            const issuesKeys: any[] = [];
            const count = 2;
            const result = Utility.getIssuesInBlockOfNumber(issuesKeys, count);
            expect(result).toEqual([]);
        });

        it('should return issues in blocks of given count', () => {
            const issuesKeys = [{ key: 'ISSUE-1' }, { key: 'ISSUE-2' }, { key: 'ISSUE-3' }, { key: 'ISSUE-4' }];
            const count = 2;
            const expectedOutput = ['ISSUE-1,ISSUE-2', 'ISSUE-3,ISSUE-4'];
            const result = Utility.getIssuesInBlockOfNumber(issuesKeys, count);
            expect(result).toEqual(expectedOutput);
        });

        it('should handle count larger than issuesKeys length', () => {
            const issuesKeys = [{ key: 'ISSUE-1' }, { key: 'ISSUE-2' }];
            const count = 5;
            const expectedOutput = ['ISSUE-1,ISSUE-2'];
            const result = Utility.getIssuesInBlockOfNumber(issuesKeys, count);
            expect(result).toEqual(expectedOutput);
        });

        it('should handle count of 1', () => {
            const issuesKeys = [{ key: 'ISSUE-1' }, { key: 'ISSUE-2' }, { key: 'ISSUE-3' }];
            const count = 1;
            const expectedOutput = ['ISSUE-1', 'ISSUE-2', 'ISSUE-3'];
            const result = Utility.getIssuesInBlockOfNumber(issuesKeys, count);
            expect(result).toEqual(expectedOutput);
        });

        it('should handle count equal to issuesKeys length', () => {
            const issuesKeys = [{ key: 'ISSUE-1' }, { key: 'ISSUE-2' }, { key: 'ISSUE-3' }];
            const count = 3;
            const expectedOutput = ['ISSUE-1,ISSUE-2,ISSUE-3'];
            const result = Utility.getIssuesInBlockOfNumber(issuesKeys, count);
            expect(result).toEqual(expectedOutput);
        });
    });

    describe('getExcelFileNameFromBranch', () => {
        it('should return the correct Excel file name for a branch with a single slash', () => {
            const branch = 'feature/branch-name';
            const expectedFileName = 'branch-name.xlsx';
            const result = Utility.getExcelFileNameFromBranch(branch);
            expect(result).toBe(expectedFileName);
        });

        it('should return the correct Excel file name for a branch with multiple slashes', () => {
            const branch = 'feature/subfeature/branch-name';
            const expectedFileName = 'branch-name.xlsx';
            const result = Utility.getExcelFileNameFromBranch(branch);
            expect(result).toBe(expectedFileName);
        });

        it('should return the correct Excel file name for a branch without slashes', () => {
            const branch = 'branch-name';
            const expectedFileName = 'branch-name.xlsx';
            const result = Utility.getExcelFileNameFromBranch(branch);
            expect(result).toBe(expectedFileName);
        });

        it('should return ".xlsx" for an empty branch name', () => {
            const branch = '';
            const expectedFileName = '.xlsx';
            const result = Utility.getExcelFileNameFromBranch(branch);
            expect(result).toBe(expectedFileName);
        });
    });

    describe('chunkArray', () => {
        it('should return an empty array when input array is empty', () => {
            const array: any[] = [];
            const chunkSize = 2;
            const result = Utility.chunkArray(array, chunkSize);
            expect(result).toEqual([]);
        });

        it('should chunk array into smaller arrays of given size', () => {
            const array = [1, 2, 3, 4, 5];
            const chunkSize = 2;
            const expectedChunks = [[1, 2], [3, 4], [5]];
            const result = Utility.chunkArray(array, chunkSize);
            expect(result).toEqual(expectedChunks);
        });

        it('should handle chunk size larger than array length', () => {
            const array = [1, 2, 3];
            const chunkSize = 5;
            const expectedChunks = [[1, 2, 3]];
            const result = Utility.chunkArray(array, chunkSize);
            expect(result).toEqual(expectedChunks);
        });

        it('should handle chunk size of 1', () => {
            const array = [1, 2, 3];
            const chunkSize = 1;
            const expectedChunks = [[1], [2], [3]];
            const result = Utility.chunkArray(array, chunkSize);
            expect(result).toEqual(expectedChunks);
        });

        it('should handle chunk size equal to array length', () => {
            const array = [1, 2, 3];
            const chunkSize = 3;
            const expectedChunks = [[1, 2, 3]];
            const result = Utility.chunkArray(array, chunkSize);
            expect(result).toEqual(expectedChunks);
        });
    });

    describe('setSonarHeader', () => {
        it('should return the correct header with the given token', () => {
            const token = 'test-token';
            const expectedHeader = { 'Authorization': `Bearer ${token}` };
            const result = Utility.setSonarHeader(token);
            expect(result).toEqual(expectedHeader);
        });
    });
});