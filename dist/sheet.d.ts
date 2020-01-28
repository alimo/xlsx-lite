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
    filters: any[];
    constructor(book: XLSX, name: string);
    col(index: number): Col;
    row(index: number): Row;
    cell(row: number, col: number): Cell;
    set(value: CellValue, options: CellPosition & CellOptions): void;
    get(position: CellPosition): CellValue;
    addFilter(range: any): void;
    sheetContent(): XMLObject[];
    filterTags(): XMLObject[];
    exportColumns(): XMLObject | null;
}
export {};
