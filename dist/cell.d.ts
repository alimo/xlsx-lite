import Sheet from './sheet';
import Style, { StyleConfig } from './style';
export declare type CellValue = number | string;
export interface CellPosition {
    row: number;
    col: number;
}
export interface CellOptions {
    type?: 'number' | 'string';
    style?: Style | StyleConfig;
}
export default class Cell {
    sheet: Sheet;
    row: number;
    col: number;
    constructor(sheet: Sheet, row: number, col: number);
    set(value: CellValue, options?: CellOptions): void;
    get(): CellValue;
}
