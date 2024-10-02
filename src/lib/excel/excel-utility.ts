import * as XLSX from 'xlsx';
import { WorkBook, WorkSheet } from 'xlsx-style';
import * as XLSXStyle from 'xlsx-style';
import fs from 'fs';

export class ExcelUtility {

    public static generate(data: any[], sheetName: string, filePath: string) {
        const workbook: WorkBook = this.createOrOpneExistingWOrkbook(filePath);
        let worksheet: WorkSheet;
        
        // Convert the dataset to a worksheet
        worksheet = XLSX.utils.json_to_sheet(data);

        const rows = data.length;
        const columns = Object.keys(data[0]).length;

        for (let i = 0; i <= rows; i++) {
            for (let j = 0; j < columns; j++) {
                if (i === 0) {
                    worksheet = this.applyColorToCell(worksheet, i, j, "E2E663"); // Yellow background
                }
                else {
                    worksheet = this.applyColorToCell(worksheet, i, j, "FFFFFF");
                }
            }
        }

        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

        // Write the workbook to a file
        XLSXStyle.writeFile(workbook, filePath);
    }

    public static read(filePath: string, sheetName: string) {
        const workbook = this.readExistingFile(filePath);
        const worksheet = workbook.Sheets[sheetName];
        if (!worksheet) {
            return [];
        }

        const data = XLSX.utils.sheet_to_json(worksheet);
        return data;
    }

    public static generateSheetWithColors(data: any[], sheetName: string, filePath: string, hexColor: string) {
        const workbook: WorkBook = this.createOrOpneExistingWOrkbook(filePath);
        let worksheet: WorkSheet = XLSX.utils.json_to_sheet(data);

        // itrate over the data and set the color
        const rows = data.length;
        const columns = Object.keys(data[0]).length;

        for (let i = 0; i <= rows; i++) {
            for (let j = 0; j < columns; j++) {
                if (i === 0) {
                    worksheet = this.applyColorToCell(worksheet, i, j, "E2E663"); // Yellow background
                }
                else {
                    worksheet = this.applyColorToCell(worksheet, i, j, hexColor);
                }
            }
        }

        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

        // Write the workbook to a file
        XLSXStyle.writeFile(workbook, filePath);
    }

    public static generateSheetWithRowWiseColors(data: any[], sheetName: string, filePath: string) {
        const workbook: WorkBook = this.createOrOpneExistingWOrkbook(filePath);
        const dataForSheet = JSON.parse(JSON.stringify(data)).map((item: any) => {
            delete item.color;
            return item;
        });
        let worksheet = XLSX.utils.json_to_sheet(dataForSheet);
        const rows = data.length;
        const columns = Object.keys(dataForSheet[0]).length;

        for (let i = 0; i <= rows; i++) {
            for (let j = 0; j < columns; j++) {
                if (i === 0) {
                    worksheet = this.applyColorToCell(worksheet, i, j, "E2E663"); // Yellow background
                }
                else {
                    worksheet = this.applyColorToCell(worksheet, i, j, data[i-1].color);
                }
            }
        }          

        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        // Write the workbook to a file
        XLSXStyle.writeFile(workbook, filePath);
    }

    private static createOrOpneExistingWOrkbook(filePath: string): WorkBook {
        return fs.existsSync(filePath) ? this.readExistingFile(filePath) : XLSX.utils.book_new();
    }

    private static readExistingFile(filePath: string): WorkBook {
        return XLSXStyle.readFile(filePath, { cellStyles: true });
    }


    private static applyColorToCell(worksheet: WorkSheet, row: number, col: number, hexColor: string) : WorkSheet {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        worksheet[cellAddress].s = {
            fill: {
                fgColor: { rgb: hexColor }
            }
        };

        return worksheet;
    }
}