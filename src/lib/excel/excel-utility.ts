import * as XLSX from 'xlsx';
import {WorkBook, WorkSheet} from 'xlsx';
import fs from 'fs';

export class ExcelUtility {
    constructor() {
    }

    public static generate(data: any[], sheetName: string , filePath: string) {
        let workbook : WorkBook;
        let worksheet : WorkSheet;

        if(fs.existsSync(filePath)) {
            workbook = XLSX.readFile(filePath);
        } else {
            workbook = XLSX.utils.book_new();
        }

        if(workbook.SheetNames.includes(sheetName)) {
            sheetName = sheetName + '_1';
        }
        // Convert the dataset to a worksheet
        worksheet = XLSX.utils.json_to_sheet(data);

        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

        // Write the workbook to a file
        XLSX.writeFile(workbook, filePath);
    }

    public static read(filePath: string, sheetName: string) {
        const workbook = XLSX.readFile(filePath);
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        return data;
    }
}