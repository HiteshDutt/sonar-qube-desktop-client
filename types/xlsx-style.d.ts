declare module 'xlsx-style' {
    import * as XLSX from 'xlsx';

    export interface CellStyle {
        fill?: {
            fgColor?: { rgb: string };
        };
    }

    export interface CellObject extends XLSX.CellObject {
        s?: CellStyle;
    }

    export interface WorkSheet extends XLSX.WorkSheet {
        [cell: string]: CellObject | any;
    }

    export interface WorkBook extends XLSX.WorkBook {}

    export function writeFile(workbook: WorkBook, filename: string, opts?:XLSX.WritingOptions): any;
    export function utils(): typeof XLSX.utils;
    export function readFile(filename: string, opts?:XLSX.ParsingOptions): WorkBook;
}