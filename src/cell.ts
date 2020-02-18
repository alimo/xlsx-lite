import Sheet from './sheet';
import Style, { StyleConfig } from './style';

export type CellValue = number | string;

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

  constructor(sheet: Sheet, row: number, col: number) {
    this.sheet = sheet;
    this.row = row;
    this.col = col;
  }

  set(
    value: CellValue | CellValue[] | CellValue[][],
    options?: CellOptions
  ): void {
    this.sheet.set(value, {
      row: this.row,
      col: this.col,
      ...options,
    });
  }

  get(): CellValue {
    return this.sheet.get({
      row: this.row,
      col: this.col,
    });
  }
}
