import { XMLObject } from './utils';
import XLSX from '.';
import Col, { ColData } from './col';
import Row, { RowData } from './row';
import Cell, { CellPosition, CellOptions, CellValue } from './cell';
interface CellProps {
    s?: number;
    t: 'inlineStr' | 'n';
    v: CellValue;
}
interface SheetData {
    [key: string]: {
        [key: string]: CellProps;
    };
}
interface SheetStyles {
    rtl?: boolean;
}
export default class Sheet {
    book: XLSX;
    name: string;
    data: SheetData;
    rowsData: {
        [key: string]: RowData;
    };
    colsData: {
        [key: string]: ColData;
    };
    styles: SheetStyles;
    filters: any[];
    constructor(book: XLSX, name: string);
    col(index: number): Col;
    row(index: number): Row;
    cell(row: number, col: number): Cell;
    set(value: CellValue, options: CellPosition & CellOptions): void;
    get(position: CellPosition): CellValue;
    style(styles: SheetStyles): void;
    addFilter(range: any): void;
    export(): string;
    exportStyles(): XMLObject;
    exportData(): XMLObject;
    exportFilters(): XMLObject[];
    exportColumns(): XMLObject | null;
}
export {};
