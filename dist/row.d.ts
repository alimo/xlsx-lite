import Sheet from './sheet';
import Cell from './cell';
export interface RowData {
    height?: number;
}
export default class Row {
    sheet: Sheet;
    index: number;
    data: RowData;
    constructor(sheet: Sheet, index: number, data: RowData);
    col(index: number): Cell;
    height(value?: number): number | void;
}
