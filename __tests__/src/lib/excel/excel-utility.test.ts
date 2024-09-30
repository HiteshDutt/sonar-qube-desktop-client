import { ExcelUtility } from '../../../../src/lib/excel/excel-utility';
import * as XLSX from 'xlsx';
import fs from 'fs';

jest.mock('fs');
jest.mock('xlsx');

describe('ExcelUtility', () => {
    const mockData = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 }
    ];
    const mockSheetName = 'Sheet1';
    const mockFilePath = 'test.xlsx';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('generate', () => {
        it('should create a new workbook and write data to a new sheet', () => {
            (fs.existsSync as jest.Mock).mockReturnValue(false);
            const mockWorkbook = { SheetNames: [], Sheets: {} };
            (XLSX.utils.book_new as jest.Mock).mockReturnValue(mockWorkbook);
            const mockWorksheet = {};
            (XLSX.utils.json_to_sheet as jest.Mock).mockReturnValue(mockWorksheet);

            ExcelUtility.generate(mockData, mockSheetName, mockFilePath);

            expect(XLSX.utils.book_new).toHaveBeenCalled();
            expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith(mockData);
            expect(XLSX.utils.book_append_sheet).toHaveBeenCalledWith(mockWorkbook, mockWorksheet, mockSheetName);
            expect(XLSX.writeFile).toHaveBeenCalledWith(mockWorkbook, mockFilePath);
        });

        it('should append data to an existing workbook and create a new sheet if sheet name exists', () => {
            const mockWorkbook = { SheetNames: [mockSheetName], Sheets: {} };
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (XLSX.readFile as jest.Mock).mockReturnValue(mockWorkbook);
            const mockWorksheet = {};
            (XLSX.utils.json_to_sheet as jest.Mock).mockReturnValue(mockWorksheet);

            ExcelUtility.generate(mockData, mockSheetName, mockFilePath);

            expect(XLSX.readFile).toHaveBeenCalledWith(mockFilePath);
            expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith(mockData);
            expect(XLSX.utils.book_append_sheet).toHaveBeenCalledWith(mockWorkbook, mockWorksheet, `${mockSheetName}_1`);
            expect(XLSX.writeFile).toHaveBeenCalledWith(mockWorkbook, mockFilePath);
        });
    });

    describe('read', () => {
        it('should read data from an existing sheet', () => {
            const mockWorkbook = { Sheets: { [mockSheetName]: {} } };
            const mockData = [{ name: 'John', age: 30 }];
            (XLSX.readFile as jest.Mock).mockReturnValue(mockWorkbook);
            (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockData);

            const result = ExcelUtility.read(mockFilePath, mockSheetName);

            expect(XLSX.readFile).toHaveBeenCalledWith(mockFilePath);
            expect(XLSX.utils.sheet_to_json).toHaveBeenCalledWith(mockWorkbook.Sheets[mockSheetName]);
            expect(result).toEqual(mockData);
        });
    });
});